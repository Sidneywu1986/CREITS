/**
 * 扣子平台Bot配置
 * 用于调用扣子平台部署的独立智能体
 */

export interface CozeBotConfig {
  botId: string;
  apiToken: string;
  baseURL?: string;
}

// Bot配置示例
export const COZE_BOTS: Record<string, CozeBotConfig> = {
  // 政策解读Bot
  'policy-bot': {
    botId: process.env.COZE_POLICY_BOT_ID || '',
    apiToken: process.env.COZE_POLICY_BOT_TOKEN || '',
    baseURL: 'https://api.coze.com',
  },

  // 尽职调查Bot
  'due-diligence-bot': {
    botId: process.env.COZE_DUE_DILIGENCE_BOT_ID || '',
    apiToken: process.env.COZE_DUE_DILIGENCE_BOT_TOKEN || '',
    baseURL: 'https://api.coze.com',
  },

  // 申报材料生成Bot
  'material-bot': {
    botId: process.env.COZE_MATERIAL_BOT_ID || '',
    apiToken: process.env.COZE_MATERIAL_BOT_TOKEN || '',
    baseURL: 'https://api.coze.com',
  },

  // 定价发行建议Bot
  'pricing-bot': {
    botId: process.env.COZE_PRICING_BOT_ID || '',
    apiToken: process.env.COZE_PRICING_BOT_TOKEN || '',
    baseURL: 'https://api.coze.com',
  },

  // 存续期管理Bot
  'management-bot': {
    botId: process.env.COZE_MANAGEMENT_BOT_ID || '',
    apiToken: process.env.COZE_MANAGEMENT_BOT_TOKEN || '',
    baseURL: 'https://api.coze.com',
  },

  // 智能协作Bot
  'collaboration-bot': {
    botId: process.env.COZE_COLLABORATION_BOT_ID || '',
    apiToken: process.env.COZE_COLLABORATION_BOT_TOKEN || '',
    baseURL: 'https://api.coze.com',
  },
};

/**
 * 调用扣子Bot API
 */
export async function callCozeBot(
  botKey: string,
  message: string,
  conversationId?: string
): Promise<string> {
  const botConfig = COZE_BOTS[botKey];

  if (!botConfig) {
    throw new Error(`Bot configuration not found: ${botKey}`);
  }

  if (!botConfig.botId || !botConfig.apiToken) {
    throw new Error(`Bot ID or API Token not configured for: ${botKey}`);
  }

  const response = await fetch(
    `${botConfig.baseURL}/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botConfig.apiToken}`,
      },
      body: JSON.stringify({
        bot_id: botConfig.botId,
        user: 'web-user',
        query: message,
        conversation_id: conversationId,
        stream: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Coze Bot API error: ${response.status}`);
  }

  const data = await response.json();
  return data.messages?.[0]?.content || '';
}
