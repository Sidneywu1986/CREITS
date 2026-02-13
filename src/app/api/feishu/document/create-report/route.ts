import { NextRequest, NextResponse } from 'next/server';
import { createReportDocument } from '@/services/feishu/document';

export async function POST(request: NextRequest) {
  try {
    const { title, sections } = await request.json();

    if (!title || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: '标题和章节内容不能为空' },
        { status: 400 }
      );
    }

    // 创建报告文档
    const document = await createReportDocument(title, sections);

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('创建报告文档失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建报告文档失败' },
      { status: 500 }
    );
  }
}
