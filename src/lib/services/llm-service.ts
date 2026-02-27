/**
 * LLM服务 - 使用coze-coding-dev-sdk实现流式对话
 */

import { LLMClient, LLMConfig, Config, Message } from 'coze-coding-dev-sdk';
import { AIMessageChunk } from '@langchain/core/messages';

// LLM配置
const config = new Config({
  apiKey: process.env.COZE_API_KEY || '',
  baseUrl: process.env.COZE_API_BASE_URL || ''
});

// 初始化LLM实例
let llmInstance: LLMClient | null = null;

/**
 * 获取LLM实例
 */
function getLLMInstance(): LLMClient {
  if (!llmInstance) {
    llmInstance = new LLMClient(config);
  }
  return llmInstance;
}

/**
 * 流式对话接口
 */
export interface StreamChatOptions {
  temperature?: number;
  model?: string;
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

  const llmConfig: LLMConfig = {
    temperature: options?.temperature ?? 0.7,
    model: options?.model ?? process.env.COZE_MODEL ?? 'gpt-4o',
    streaming: true
  };

  try {
    const stream = llm.stream(messages as Message[], llmConfig);

    // 转换 AsyncGenerator<AIMessageChunk> 到 AsyncIterable<StreamChatResponse>
    async function* transformStream() {
      for await (const chunk of stream) {
        yield {
          content: chunk.content as string || '',
          done: false
        };
      }
      yield { content: '', done: true };
    }

    return transformStream();
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

  const llmConfig: LLMConfig = {
    temperature: options?.temperature ?? 0.7,
    model: options?.model ?? process.env.COZE_MODEL ?? 'gpt-4o',
    streaming: false
  };

  try {
    const response = await llm.invoke(messages as Message[], llmConfig);

    return {
      content: response.content || '',
      usage: undefined
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
  options?: StreamChatOptions
): Promise<{ content: string; usage?: any }> {
  return chat(
    [
      {
        role: 'user',
        content: userMessage
      }
    ],
    options
  );
}

/**
 * 流式单轮对话（便捷方法）
 */
export async function simpleStreamChat(
  userMessage: string,
  options?: StreamChatOptions
): Promise<AsyncIterable<StreamChatResponse>> {
  return streamChat(
    [
      {
        role: 'user',
        content: userMessage
      }
    ],
    options
  );
}
