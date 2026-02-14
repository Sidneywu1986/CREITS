import { NextRequest, NextResponse } from 'next/server';
import { AGENTS } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    // 验证Agent是否存在
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent不存在' },
        { status: 404 }
      );
    }

    // TODO: 从知识库获取该Agent的文档列表
    // 这里需要调用knowledge技能的API
    // 暂时返回空列表，实际使用时需要集成知识库技能

    const documents: any[] = [];

    return NextResponse.json({
      success: true,
      agentId,
      agentName: agent.name,
      documents,
      total: documents.length,
    });
  } catch (error) {
    console.error('获取知识库文档列表失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取知识库文档列表失败' },
      { status: 500 }
    );
  }
}
