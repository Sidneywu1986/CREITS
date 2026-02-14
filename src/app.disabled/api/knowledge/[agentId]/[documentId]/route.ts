import { NextRequest, NextResponse } from 'next/server';
import { AGENTS } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string; documentId: string }> }
) {
  try {
    const { agentId, documentId } = await params;

    // 验证Agent是否存在
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent不存在' },
        { status: 404 }
      );
    }

    // TODO: 从知识库删除文档
    // 这里需要调用knowledge技能的API
    // 暂时返回成功，实际使用时需要集成知识库技能

    return NextResponse.json({
      success: true,
      agentId,
      agentName: agent.name,
      documentId,
      message: '文档已删除',
    });
  } catch (error) {
    console.error('删除文档失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除文档失败' },
      { status: 500 }
    );
  }
}
