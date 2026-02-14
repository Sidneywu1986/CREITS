import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { projectInfo } = await request.json();

    if (!projectInfo || typeof projectInfo !== 'string') {
      return NextResponse.json(
        { error: '项目信息不能为空' },
        { status: 400 }
      );
    }

    // 构建风险识别的system prompt
    const systemPrompt = `你是REITs领域的合规风险识别专家，擅长基于项目信息识别合规风险点。

你的任务是：
1. 基于项目信息，识别所有潜在的合规风险点
2. 对风险进行分类（产权风险、手续风险、运营风险、财务风险、披露风险）
3. 对风险进行分级（严重/中等/轻微）
4. 量化风险发生的概率（0-1）
5. 评估风险的影响程度
6. 提供监管依据
7. 给出整改建议和预计整改时间
8. 计算总体风险评分（0-100）

风险分类说明：
- 产权风险：权属不清、抵押查封、权利限制等
- 手续风险：立项缺失、规划许可、环评验收等
- 运营风险：违规处罚、重大事故、定价违规等
- 财务风险：关联交易未披露、现金流异常、债务风险等
- 披露风险：信息不完整、披露不一致、风险提示不足等

输出格式要求：
- 使用JSON格式
- 包含risk_summary字段（total_risks、severe_risks、medium_risks、minor_risks、risk_score）
- 包含risk_details数组（风险详情）
- 每个风险详情包含：risk_id、category、type、description、severity、probability、impact、regulatory_basis、suggested_actions、estimated_resolution_time
- 包含overall_recommendation字段（总体建议）`;

    // 构建用户消息
    const userMessage = `请识别以下项目的合规风险：

项目信息：
${projectInfo}

请进行全面的风险识别，并按照JSON格式输出。`;

    // 调用LLM
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const response = await llmClient.invoke(messages, {
      temperature: 0.3, // 降低温度以获得更准确的风险识别
    });

    // 解析LLM返回的JSON
    let result;
    try {
      // 尝试提取JSON内容
      const content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法提取JSON内容');
      }
    } catch (error) {
      // 如果JSON解析失败，返回原始内容
      result = {
        risk_summary: {
          total_risks: 0,
          severe_risks: 0,
          medium_risks: 0,
          minor_risks: 0,
          risk_score: 0,
        },
        risk_details: [],
        overall_recommendation: '无法解析风险识别结果',
        raw_content: response.content,
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('风险识别失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '风险识别失败',
        success: false 
      },
      { status: 500 }
    );
  }
}
