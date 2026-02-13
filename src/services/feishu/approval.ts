/**
 * 飞书审批服务
 * 提供创建审批、查询审批状态的功能
 */

import { createFeishuClient, FeishuApprovalInstance } from '@/config/feishu';

// 审批表单项类型
export interface ApprovalFormItem {
  key: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'member' | 'department' | 'textarea';
  value: any;
  required?: boolean;
}

// 审批实例
export interface ApprovalInstance {
  instanceId: string;
  status: string;
  approvalCode: string;
  title: string;
  url: string;
}

// 获取审批模板列表
export async function getApprovalTemplates(): Promise<any[]> {
  const client = createFeishuClient();

  try {
    const response = await (client.approval as any).template.list({
      params: {
        page_size: 50,
      },
    });

    return response.data?.approval_template_list || [];
  } catch (error) {
    console.error('获取审批模板失败:', error);
    throw new Error(`获取审批模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 创建审批实例
export async function createApprovalInstance(
  approvalCode: string,
  title: string,
  formData: Record<string, any>,
  options?: {
    openId?: string; // 发起人
    nodeList?: any[]; // 审批节点配置
  }
): Promise<ApprovalInstance> {
  const client = createFeishuClient();

  try {
    // 获取用户ID（如果未提供）
    const userOpenId = options?.openId;

    // 构建表单数据
    const form: Record<string, any> = {};
    Object.keys(formData).forEach((key) => {
      form[key] = {
        value: formData[key],
      };
    });

    // 创建审批实例
    const response = await client.approval.instance.create({
      data: {
        approval_code: approvalCode,
        user_id: userOpenId,
        title: title,
        form: JSON.stringify(form),
      },
    });

    const instance = response.data;
    const instanceCode = instance?.instance_code;

    if (!instanceCode) {
      throw new Error('创建审批实例失败：未返回实例ID');
    }

    // 构建审批链接
    const url = `https://feishu.cn/approval/approval/view/${instanceCode}`;

    return {
      instanceId: instanceCode,
      status: 'RUNNING',
      approvalCode,
      title,
      url,
    };
  } catch (error) {
    console.error('创建审批实例失败:', error);
    throw new Error(`创建审批实例失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 查询审批实例状态
export async function getApprovalInstanceStatus(
  instanceId: string
): Promise<FeishuApprovalInstance | null> {
  const client = createFeishuClient();

  try {
    const response = await client.approval.instance.get({
      path: {
        instance_id: instanceId,
      },
    });

    const instance = response.data;

    if (!instance) {
      return null;
    }

    // 状态映射
    const statusMap: Record<string, string> = {
      'APPROVED': 'APPROVED',
      'REJECTED': 'REJECTED',
      'CANCELED': 'CANCELED',
      'PENDING': 'RUNNING',
      'DELETED': 'CANCELED',
      'RUNNING': 'RUNNING',
      'DRAFT': 'DRAFT',
    };

    const rawStatus = instance.status || 'UNKNOWN';
    const mappedStatus = statusMap[rawStatus] || 'UNKNOWN';

    return {
      instanceId: instance.instance_code || instanceId,
      status: mappedStatus as any,
      approvalCode: instance.approval_code || '',
    };
  } catch (error) {
    console.error('查询审批状态失败:', error);
    throw new Error(`查询审批状态失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 获取审批详情
export async function getApprovalDetail(instanceId: string): Promise<any> {
  const client = createFeishuClient();

  try {
    const response = await client.approval.instance.get({
      path: {
        instance_id: instanceId,
      },
    });

    return response.data;
  } catch (error) {
    console.error('获取审批详情失败:', error);
    throw new Error(`获取审批详情失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 创建REITs项目审批
export async function createREITsApproval(
  projectName: string,
  projectType: string,
  projectAmount: number,
  projectManager: string,
  description: string
): Promise<ApprovalInstance> {
  // 审批模板代码（需要在飞书中配置）
  const approvalCode = process.env.FEISHU_REITS_APPROVAL_CODE || '';

  if (!approvalCode) {
    throw new Error('未配置REITs审批模板代码');
  }

  // 构建表单数据
  const formData = {
    project_name: projectName,
    project_type: projectType,
    project_amount: projectAmount,
    project_manager: projectManager,
    description: description,
  };

  // 创建审批
  return await createApprovalInstance(
    approvalCode,
    `REITs项目审批：${projectName}`,
    formData
  );
}

// 批量查询审批状态
export async function getApprovalInstancesStatus(
  instanceIds: string[]
): Promise<Record<string, FeishuApprovalInstance>> {
  const results: Record<string, FeishuApprovalInstance> = {};

  for (const instanceId of instanceIds) {
    try {
      const status = await getApprovalInstanceStatus(instanceId);
      if (status) {
        results[instanceId] = status;
      }
    } catch (error) {
      console.error(`查询审批 ${instanceId} 状态失败:`, error);
    }
  }

  return results;
}
