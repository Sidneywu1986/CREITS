import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { AGENTS } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '消息不能为空' },
        { status: 400 }
      );
    }

    // 获取法务风控Agent的system prompt
    const agent = AGENTS.find(a => a.id === 'legal-risk');
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent不存在' },
        { status: 404 }
      );
    }

    // 调用LLM
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const messages = [
      {
        role: 'system' as const,
        content: agent.systemPrompt,
      },
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const response = await llmClient.invoke(messages, {
      temperature: 0.7, // 适中的温度，保持专业性和创造性
    });

    return NextResponse.json({
      success: true,
      data: {
        response: response.content,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('对话请求失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '对话请求失败',
        success: false 
      },
      { status: 500 }
    );
  }
}
