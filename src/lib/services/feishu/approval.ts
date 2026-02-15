/**
 * 飞书审批服务
 *
 * 提供审批流程的创建、查询、处理等功能
 * 文档: https://open.feishu.cn/document/server-docs/approval-v4/
 */

import { getFeishuClient } from './client';

/**
 * 审批实例数据
 */
export interface ApprovalInstance {
  approval_code: string;
  instance_code: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'DRAFT';
  title: string;
  approve_node_list: ApprovalNode[];
  create_time: number;
  handle_time?: number;
}

/**
 * 审批节点
 */
export interface ApprovalNode {
  node_id: string;
  node_type: string;
  approve_user_list: ApprovalUser[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  handle_info?: string;
}

/**
 * 审批人信息
 */
export interface ApprovalUser {
  user_id: string;
  name: string;
  avatar?: string;
}

/**
 * 创建审批请求
 */
export interface CreateApprovalRequest {
  approval_code: string; // 审批模板代码
  user_id: string; // 申请人user_id
  node_list: ApprovalNodeData[]; // 审批节点列表
  instance: {
    title: string;
    summary?: string;
    approver_type?: string;
  };
  form_map?: Record<string, any>; // 表单数据
}

/**
 * 审批节点数据
 */
export interface ApprovalNodeData {
  type: 'ROUTE' | 'AND' | 'OR' | 'NONE';
  node_id: string;
  approve_users: {
    approve_type: 'USER' | 'GROUP';
    user_ids: string[];
  }[];
}

/**
 * 创建审批实例
 */
export async function createApproval(
  request: CreateApprovalRequest
): Promise<ApprovalInstance> {
  const client = getFeishuClient();

  const response = await client.post<{ instance: ApprovalInstance }>(
    '/approval/v4/instances',
    {
      approval_code: request.approval_code,
      user_id: request.user_id,
      node_list: request.node_list,
      instance: request.instance,
      form_map: request.form_map || {},
    }
  );

  return response.instance;
}

/**
 * 创建REITs发行审批
 *
 * @param userId 申请人ID
 * @param reitCode REITs代码
 * @param reitName REITs名称
 * @param fundManager 基金管理人
 * @param totalAssets 募集规模（亿元）
 * @param approverIds 审批人ID列表
 */
export async function createREITsApproval({
  userId,
  reitCode,
  reitName,
  fundManager,
  totalAssets,
  approverIds = [],
}: {
  userId: string;
  reitCode: string;
  reitName: string;
  fundManager: string;
  totalAssets: number;
  approverIds?: string[];
}): Promise<ApprovalInstance> {
  const approvalCode = process.env.FEISHU_REITS_APPROVAL_CODE || 'REITS_APPROVAL_DEFAULT';

  // 构建审批节点
  const node_list: ApprovalNodeData[] = [
    {
      type: 'NONE',
      node_id: 'node_1',
      approve_users: [
        {
          approve_type: 'USER',
          user_ids: approverIds,
        },
      ],
    },
  ];

  // 构建表单数据
  const form_map = {
    reit_code: reitCode,
    reit_name: reitName,
    fund_manager: fundManager,
    total_assets: totalAssets,
    approval_type: 'REITs发行',
  };

  const instance = {
    title: `${reitName}(${reitCode})发行审批`,
    summary: `基金管理人：${fundManager}\n募集规模：${totalAssets}亿元`,
  };

  return createApproval({
    approval_code: approvalCode,
    user_id: userId,
    node_list,
    instance,
    form_map,
  });
}

/**
 * 查询审批实例
 *
 * @param instanceCode 审批实例代码
 */
export async function getApprovalInstance(instanceCode: string): Promise<ApprovalInstance | null> {
  const client = getFeishuClient();

  try {
    const response = await client.get<{ instance: ApprovalInstance }>(
      `/approval/v4/instances/${instanceCode}`
    );
    return response.instance;
  } catch (error) {
    console.error('查询审批实例失败:', error);
    return null;
  }
}

/**
 * 查询用户的审批列表
 *
 * @param userId 用户ID
 * @param status 审批状态（可选）
 * @param pageSize 分页大小
 * @param pageToken 分页token
 */
export async function getUserApprovalList({
  userId,
  status,
  pageSize = 20,
  pageToken = '',
}: {
  userId: string;
  status?: string;
  pageSize?: number;
  pageToken?: string;
}): Promise<{ instances: ApprovalInstance[]; pageToken: string }> {
  const client = getFeishuClient();

  const params: any = {
    user_id: userId,
    page_size: pageSize,
    page_token: pageToken,
  };

  if (status) {
    params.status = status;
  }

  const response = await client.get<{
    instances: ApprovalInstance[];
    page_token: string;
  }>('/approval/v4/instances', params);

  return {
    instances: response.instances || [],
    pageToken: response.page_token || '',
  };
}

/**
 * 审批通过
 *
 * @param instanceCode 审批实例代码
 * @param nodeId 节点ID
 * @param userId 审批人ID
 * @param comment 审批意见
 */
export async function approveInstance({
  instanceCode,
  nodeId,
  userId,
  comment = '',
}: {
  instanceCode: string;
  nodeId: string;
  userId: string;
  comment?: string;
}): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.post(`/approval/v4/instances/${instanceCode}/approve`, {
      node_id: nodeId,
      user_id: userId,
      comment,
      lang: 'zh-CN',
    });
    return true;
  } catch (error) {
    console.error('审批通过失败:', error);
    return false;
  }
}

/**
 * 审批拒绝
 *
 * @param instanceCode 审批实例代码
 * @param nodeId 节点ID
 * @param userId 审批人ID
 * @param comment 拒绝理由
 */
export async function rejectInstance({
  instanceCode,
  nodeId,
  userId,
  comment = '',
}: {
  instanceCode: string;
  nodeId: string;
  userId: string;
  comment?: string;
}): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.post(`/approval/v4/instances/${instanceCode}/reject`, {
      node_id: nodeId,
      user_id: userId,
      comment,
      lang: 'zh-CN',
    });
    return true;
  } catch (error) {
    console.error('审批拒绝失败:', error);
    return false;
  }
}

/**
 * 撤回审批
 *
 * @param instanceCode 审批实例代码
 * @param userId 申请人ID
 */
export async function cancelApproval({
  instanceCode,
  userId,
}: {
  instanceCode: string;
  userId: string;
}): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.post(`/approval/v4/instances/${instanceCode}/cancel`, {
      user_id: userId,
      lang: 'zh-CN',
    });
    return true;
  } catch (error) {
    console.error('撤回审批失败:', error);
    return false;
  }
}

/**
 * 转发审批
 *
 * @param instanceCode 审批实例代码
 * @param nodeId 节点ID
 * @param fromUserId 原审批人ID
 * @param toUserId 目标审批人ID
 * @param comment 转发说明
 */
export async function transferApproval({
  instanceCode,
  nodeId,
  fromUserId,
  toUserId,
  comment = '',
}: {
  instanceCode: string;
  nodeId: string;
  fromUserId: string;
  toUserId: string;
  comment?: string;
}): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.post(`/approval/v4/instances/${instanceCode}/transfer`, {
      node_id: nodeId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      comment,
      lang: 'zh-CN',
    });
    return true;
  } catch (error) {
    console.error('转发审批失败:', error);
    return false;
  }
}
