import { NextRequest, NextResponse } from 'next/server';
import { AGENTS } from '@/types';

export async function POST(
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

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 PDF、Word、TXT、Markdown' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一的文档ID
    const documentId = `${agentId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 将文件保存到临时目录
    const fs = require('fs');
    const path = require('path');
    const tmpDir = path.join('/tmp', 'knowledge');
    
    // 确保临时目录存在
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const filePath = path.join(tmpDir, `${documentId}_${file.name}`);
    fs.writeFileSync(filePath, buffer);

    // TODO: 使用knowledge技能将文档向量化存储
    // 这里需要调用knowledge技能的API
    // 暂时返回成功，实际使用时需要集成知识库技能

    return NextResponse.json({
      success: true,
      agentId,
      agentName: agent.name,
      documentId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadTime: new Date().toISOString(),
      // 暂时保存文件路径，后续需要上传到对象存储并调用知识库API
      filePath,
    });
  } catch (error) {
    console.error('上传文档失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '上传文档失败' },
      { status: 500 }
    );
  }
}
