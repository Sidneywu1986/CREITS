/**
 * 飞书集成配置
 */

import * as lark from '@larksuiteoapi/node-sdk';

// 飞书应用配置
export interface FeishuConfig {
  appId: string;
  appSecret: string;
  encryptKey?: string;
  verificationToken?: string;
}

// 获取飞书配置
export function getFeishuConfig(): FeishuConfig {
  return {
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
    encryptKey: process.env.FEISHU_ENCRYPT_KEY,
    verificationToken: process.env.FEISHU_VERIFICATION_TOKEN,
  };
}

// 创建飞书客户端
export function createFeishuClient() {
  const config = getFeishuConfig();

  if (!config.appId || !config.appSecret) {
    throw new Error('飞书应用ID和Secret未配置');
  }

  return new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
  });
}

// 文档相关类型
export interface FeishuDocument {
  documentId: string;
  title: string;
  url: string;
}

export interface FeishuDocumentBlock {
  blockId: string;
  type: string;
  content: any;
}

// 审批相关类型
export interface FeishuApproval {
  approvalCode: string;
  name: string;
}

export interface FeishuApprovalInstance {
  instanceId: string;
  status: 'DRAFT' | 'RUNNING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  approvalCode: string;
}

// 导出飞书客户端类型
export type FeishuClient = ReturnType<typeof createFeishuClient>;
