import { NextRequest, NextResponse } from 'next/server';
import { createFeishuDocument, addTextBlock } from '@/services/feishu/document';

// 文件上传处理
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '请选择要上传的文件' },
        { status: 400 }
      );
    }

    // 检查文件类型
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx', 'txt', 'md'];

    if (!validExtensions.includes(fileExt || '')) {
      return NextResponse.json(
        { error: '不支持的文件格式，请上传 PDF、Word、TXT 或 MD 文件' },
        { status: 400 }
      );
    }

    // 检查文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过10MB' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 根据文件类型提取文本
    let textContent = '';

    if (fileExt === 'pdf') {
      // 需要安装 pdf-parse
      textContent = await extractTextFromPDF(buffer);
    } else if (fileExt === 'doc' || fileExt === 'docx') {
      // 需要安装 mammoth
      textContent = await extractTextFromWord(buffer);
    } else if (fileExt === 'txt' || fileExt === 'md') {
      textContent = buffer.toString('utf-8');
    }

    // 创建飞书文档
    const documentTitle = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
    const document = await createFeishuDocument(documentTitle);

    // 将内容写入文档（分段写入，避免单次写入过长）
    const chunkSize = 2000; // 每段2000字符
    for (let i = 0; i < textContent.length; i += chunkSize) {
      const chunk = textContent.slice(i, i + chunkSize);
      await addTextBlock(document.documentId, chunk);
    }

    return NextResponse.json({
      success: true,
      documentId: document.documentId,
      documentUrl: document.url,
      fileName: file.name,
      contentLength: textContent.length,
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '文件上传失败' },
      { status: 500 }
    );
  }
}

// 提取PDF文本
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // 动态导入 pdf-parse
    const pdfParse = await import('pdf-parse');
    const data = await (pdfParse as any)(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF解析失败:', error);
    throw new Error('PDF文件解析失败，请确保文件格式正确');
  }
}

// 提取Word文本
async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    // 动态导入 mammoth
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Word文档解析失败:', error);
    throw new Error('Word文档解析失败，请确保文件格式正确');
  }
}
