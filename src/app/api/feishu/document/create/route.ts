import { NextRequest, NextResponse } from 'next/server';
import { createFeishuDocument, addTextBlock } from '@/services/feishu/document';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }

    // 创建文档
    const document = await createFeishuDocument(title);

    // 添加内容
    if (content) {
      await addTextBlock(document.documentId, content);
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('创建文档失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建文档失败' },
      { status: 500 }
    );
  }
}
