/**
 * LLM服务 - 使用coze-coding-dev-sdk实现流式对话
 */

import LLM from 'coze-coding-dev-sdk';
import { LLMConfig } from 'coze-coding-dev-sdk/types';

// LLM配置
const llmConfig: LLMConfig = {
  apiKey: process.env.COZE_API_KEY || '',
  baseURL: process.env.COZE_API_BASE_URL || '',
  model: process.env.COZE_MODEL || 'gpt-4o'
};

// 初始化LLM实例
let llmInstance: LLM | null = null;

/**
 * 获取LLM实例
 */
function getLLMInstance(): LLM {
  if (!llmInstance) {
    llmInstance = new LLM(llmConfig);
  }
  return llmInstance;
}

/**
 * 流式对话接口
 */
export interface StreamChatOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface StreamChatResponse {
  content: string;
  done: boolean;
}

/**
 * 流式对话
 */
export async function streamChat(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: StreamChatOptions
): Promise<AsyncIterable<StreamChatResponse>> {
  const llm = getLLMInstance();

  try {
    const stream = await llm.chat({
      messages,
      systemPrompt: options?.systemPrompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 2000,
      topP: options?.topP ?? 0.9,
      stream: true
    });

    return stream as AsyncIterable<StreamChatResponse>;
  } catch (error) {
    console.error('LLM streaming error:', error);
    throw new Error(`LLM streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 非流式对话（用于简单的问答）
 */
export async function chat(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: StreamChatOptions
): Promise<{ content: string; usage?: any }> {
  const llm = getLLMInstance();

  try {
    const response = await llm.chat({
      messages,
      systemPrompt: options?.systemPrompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 2000,
      topP: options?.topP ?? 0.9,
      stream: false
    });

    return {
      content: response.content || '',
      usage: response.usage
    };
  } catch (error) {
    console.error('LLM chat error:', error);
    throw new Error(`LLM chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 单轮对话（便捷方法）
 */
export async function simpleChat(
  userMessage: string,
  systemPrompt?: string,
  options?: Omit<StreamChatOptions, 'systemPrompt'>
): Promise<{ content: string; usage?: any }> {
  return chat(
    [
      {
        role: 'user',
        content: userMessage
      }
    ],
    {
      systemPrompt,
      ...options
    }
  );
}

/**
 * 流式单轮对话（便捷方法）
 */
export async function simpleStreamChat(
  userMessage: string,
  systemPrompt?: string,
  options?: Omit<StreamChatOptions, 'systemPrompt'>
): Promise<AsyncIterable<StreamChatResponse>> {
  return streamChat(
    [
      {
        role: 'user',
        content: userMessage
      }
    ],
    {
      systemPrompt,
      ...options
    }
  );
}
