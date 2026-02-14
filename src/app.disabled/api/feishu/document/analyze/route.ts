import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getDocumentText, addTextBlock } from '@/services/feishu/document';
import { AGENTS } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { documentId, agentId, documentText: providedText, writeBack = false } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: '文档ID不能为空' },
        { status: 400 }
      );
    }

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID不能为空' },
        { status: 400 }
      );
    }

    // 查找Agent
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent不存在' },
        { status: 404 }
      );
    }

    // 1. 获取文档内容（优先使用提供的文本，否则从飞书文档读取）
    let documentText = providedText;
    
    if (!documentText) {
      try {
        documentText = await getDocumentText(documentId);
      } catch (readError) {
        console.error('从飞书文档读取内容失败:', readError);
        return NextResponse.json(
          { error: '无法获取文档内容，请确保文档已上传并包含内容' },
          { status: 400 }
        );
      }
    }

    if (!documentText || documentText.length === 0) {
      return NextResponse.json(
        { error: '文档内容为空，请检查上传的文件' },
        { status: 400 }
      );
    }

    // 2. 构建分析提示
    const analysisPrompt = `请分析以下文档内容，并提供专业的反馈和建议：

文档内容：
---
${documentText}
---

请按照以下格式进行分析：

## 分析摘要
（简要总结文档的主要内容）

## 关键发现
（列出文档中的关键信息和要点）

## 优势分析
（分析文档的优点和亮点）

## 风险提示
（指出潜在的问题和风险）

## 改进建议
（提供具体的改进建议）

## 结论
（总结分析结果并给出专业建议）`;

    // 3. 调用Agent进行分析
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
        content: analysisPrompt,
      },
    ];

    const response = await llmClient.invoke(messages, {
      temperature: 0.7,
    });

    const analysisResult = response.content;

    // 4. 可选：将分析结果写回文档
    let analysisBlockId = '';
    if (writeBack) {
      // 添加分隔线
      await addTextBlock(documentId, '---');
      await addTextBlock(documentId, '');

      // 添加分析标题
      await addTextBlock(documentId, 'AI分析结果', { paragraphType: 'h2' });

      // 添加分析内容
      analysisBlockId = await addTextBlock(documentId, analysisResult);

      await addTextBlock(documentId, '');
      await addTextBlock(documentId, '---');
    }

    return NextResponse.json({
      success: true,
      documentId,
      agentId,
      agentName: agent.name,
      documentTextLength: documentText.length,
      documentText: documentText, // 返回文档内容供后续使用
      analysisResult,
      writeBack,
      analysisBlockId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('文档分析失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '文档分析失败' },
      { status: 500 }
    );
  }
}
