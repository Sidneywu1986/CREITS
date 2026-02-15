/**
 * 飞书消息服务
 *
 * 提供发送文本、富文本、卡片等消息的功能
 * 文档: https://open.feishu.cn/document/server-docs/im/message-v1/
 */

import { getFeishuClient } from './client';

/**
 * 消息接收者类型
 */
export type ReceiveIdType = 'open_id' | 'user_id' | 'union_id' | 'email' | 'chat_id';

/**
 * 发送文本消息
 *
 * @param receiveId 接收者ID
 * @param idType ID类型
 * @param content 消息内容
 */
export async function sendTextMessage(
  receiveId: string,
  idType: ReceiveIdType,
  content: string
): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.post('/im/v1/messages', {
      receive_id: receiveId,
      msg_type: 'text',
      content: JSON.stringify({ text: content }),
      receive_id_type: idType,
    });
    return true;
  } catch (error) {
    console.error('发送文本消息失败:', error);
    return false;
  }
}

/**
 * 发送富文本消息
 *
 * @param receiveId 接收者ID
 * @param idType ID类型
 * @param content 富文本内容
 */
export async function sendPostMessage(
  receiveId: string,
  idType: ReceiveIdType,
  content: any[]
): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.post('/im/v1/messages', {
      receive_id: receiveId,
      msg_type: 'post',
      content: JSON.stringify({ post: { zh_cn: content } }),
      receive_id_type: idType,
    });
    return true;
  } catch (error) {
    console.error('发送富文本消息失败:', error);
    return false;
  }
}

/**
 * 发送交互式卡片消息
 *
 * @param receiveId 接收者ID
 * @param idType ID类型
 * @param card 卡片内容
 */
export async function sendCardMessage(
  receiveId: string,
  idType: ReceiveIdType,
  card: any
): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.post('/im/v1/messages', {
      receive_id: receiveId,
      msg_type: 'interactive',
      content: JSON.stringify(card),
      receive_id_type: idType,
    });
    return true;
  } catch (error) {
    console.error('发送卡片消息失败:', error);
    return false;
  }
}

/**
 * 发送文件消息
 *
 * @param receiveId 接收者ID
 * @param idType ID类型
 * @param fileKey 文件key
 * @param fileName 文件名
 */
export async function sendFileMessage(
  receiveId: string,
  idType: ReceiveIdType,
  fileKey: string,
  fileName: string
): Promise<boolean> {
  const client = getFeishuClient();

  try {
    await client.post('/im/v1/messages', {
      receive_id: receiveId,
      msg_type: 'file',
      content: JSON.stringify({ file_key: fileKey }),
      receive_id_type: idType,
    });
    return true;
  } catch (error) {
    console.error('发送文件消息失败:', error);
    return false;
  }
}

/**
 * 发送审批通知消息
 *
 * @param receiveId 接收者ID
 * @param idType ID类型
 * @param approvalInfo 审批信息
 */
export async function sendApprovalNotification({
  receiveId,
  idType,
  approvalTitle,
  approvalCode,
  reitName,
  fundManager,
  status,
}: {
  receiveId: string;
  idType: ReceiveIdType;
  approvalTitle: string;
  approvalCode: string;
  reitName: string;
  fundManager: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}): Promise<boolean> {
  const statusColors = {
    PENDING: '#FFB937',
    APPROVED: '#00C853',
    REJECTED: '#FF3B30',
  };

  const statusLabels = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
  };

  const card = {
    config: {
      wide_screen_mode: true,
    },
    header: {
      title: {
        tag: 'plain_text',
        content: 'REITs发行审批通知',
      },
      template: status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'yellow',
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**审批标题**：${approvalTitle}`,
        },
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**REITs名称**：${reitName}`,
        },
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**基金管理人**：${fundManager}`,
        },
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**审批状态**：<font color="${statusColors[status]}">${statusLabels[status]}</font>`,
        },
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: '查看详情',
            },
            type: 'primary',
            url: `https://open.feishu.cn/approval/${approvalCode}`,
          },
        ],
      },
    ],
  };

  return sendCardMessage(receiveId, idType, card);
}

/**
 * 发送风险预警消息
 *
 * @param receiveId 接收者ID
 * @param idType ID类型
 * @param riskInfo 风险信息
 */
export async function sendRiskAlert({
  receiveId,
  idType,
  reitCode,
  reitName,
  riskType,
  riskLevel,
  description,
  recommendation = '',
}: {
  receiveId: string;
  idType: ReceiveIdType;
  reitCode: string;
  reitName: string;
  riskType: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation?: string;
}): Promise<boolean> {
  const levelColors = {
    LOW: '#00C853',
    MEDIUM: '#FFB937',
    HIGH: '#FF5722',
    CRITICAL: '#FF3B30',
  };

  const levelLabels = {
    LOW: '低风险',
    MEDIUM: '中风险',
    HIGH: '高风险',
    CRITICAL: '严重风险',
  };

  const card = {
    config: {
      wide_screen_mode: true,
    },
    header: {
      title: {
        tag: 'plain_text',
        content: '⚠️ REITs风险预警',
      },
      template: riskLevel === 'CRITICAL' ? 'red' : riskLevel === 'HIGH' ? 'orange' : 'yellow',
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**REITs代码**：${reitCode}`,
        },
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**REITs名称**：${reitName}`,
        },
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**风险类型**：${riskType}`,
        },
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**风险等级**：<font color="${levelColors[riskLevel]}">${levelLabels[riskLevel]}</font>`,
        },
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**风险描述**：\n${description}`,
        },
      },
      ...(recommendation
        ? [
            {
              tag: 'div',
              text: {
                tag: 'lark_md',
                content: `**处理建议**：\n${recommendation}`,
              },
            } as const,
          ]
        : []),
      {
        tag: 'hr',
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: '查看详情',
            },
            type: 'primary',
            url: `http://localhost:5000/issued-reits`,
          },
        ],
      },
    ],
  };

  return sendCardMessage(receiveId, idType, card);
}

/**
 * 批量发送消息
 *
 * @param receivers 接收者列表
 * @param idType ID类型
 * @param messageType 消息类型
 * @param content 消息内容
 */
export async function sendBatchMessages({
  receivers,
  idType,
  messageType,
  content,
}: {
  receivers: string[];
  idType: ReceiveIdType;
  messageType: 'text' | 'post' | 'interactive';
  content: any;
}): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const receiver of receivers) {
    try {
      const result = await sendCardMessage(receiver, idType, content);
      if (result) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  return { success, failed };
}
