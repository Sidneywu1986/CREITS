import { NextRequest, NextResponse } from 'next/server';

// 文档分析对话接口
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      documentId,
      documentText,
      analysisResult,
      agentId,
      message,
      conversationHistory = [],
    } = body;
    
    // 构建系统提示词
    const systemPrompt = `你是一个专业的REITs文档分析专家助手。你的职责是：

1. 基于已分析的文档内容回答用户的问题
2. 解释分析结果的含义和依据
3. 对特定部分提供更深入的分析
4. 帮助用户理解REITs相关的专业术语
5. 提供专业的投资建议和风险评估

当前文档ID: ${documentId}
分析Agent: ${agentId}

以下是文档分析结果，请基于此回答用户问题：
${analysisResult}

文档内容摘要（前2000字）：
${documentText?.substring(0, 2000) || '无'}

请以专业、友好的方式回答用户的问题。如果问题超出文档范围，请明确告知。`;

    // 构建对话历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];
    
    // 这里应该调用LLM服务获取Agent回复
    // 由于环境限制，这里返回模拟回复
    const agentResponse = generateMockResponse(message, agentId, analysisResult);
    
    return NextResponse.json({
      success: true,
      data: {
        message: agentResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('文档分析对话失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '文档分析对话失败' },
      { status: 500 }
    );
  }
}

// 生成模拟回复（实际应该调用LLM服务）
function generateMockResponse(
  userMessage: string,
  agentId: string,
  analysisResult: string
): string {
  const message = userMessage.toLowerCase();
  
  // 基于关键词生成不同的回复
  if (message.includes('解释') || message.includes('说明')) {
    return `根据我对文档的分析，${analysisResult?.substring(0, 200) || '该文档主要包含REITs相关内容'}。如果您需要更详细的解释，请告诉我您想了解的具体方面。`;
  }
  
  if (message.includes('风险') || message.includes('建议')) {
    return `基于分析结果，我建议您关注以下几个方面：\n\n1. **政策风险**：密切关注REITs相关政策变化\n2. **市场风险**：注意市场波动对估值的影响\n3. **流动性风险**：评估资产的流动性状况\n\n具体风险点还需要结合项目的具体情况进行深入分析。`;
  }
  
  if (message.includes('估值') || message.includes('定价')) {
    return `关于估值方面，从文档中提取的关键信息显示：\n\n• 该项目采用现金流折现法（DCF）进行估值\n• 折现率设定在合理区间\n• 建议使用我们的估值计算器进行更精确的计算\n\n您可以前往"REITs估值计算器"页面进行详细测算。`;
  }
  
  if (message.includes('数据') || message.includes('指标')) {
    return `文档中的关键数据指标包括：\n\n• EBITDA增长率\n• 分派率\n• 市净率（P/NAV）\n• 内部收益率（IRR）\n\n这些指标是评估REITs投资价值的重要依据。`;
  }
  
  // 默认回复
  return `感谢您的问题！作为${agentId}Agent，我可以帮您：\n\n1. 🔍 深入分析文档内容\n2. 📊 解释数据和指标\n3. 💡 提供专业建议\n4. ⚠️ 识别潜在风险\n\n请告诉我您想了解更多具体内容？`;
}
