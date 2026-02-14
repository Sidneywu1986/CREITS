import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: '检索问题不能为空' },
        { status: 400 }
      );
    }

    // 构建法规检索的system prompt
    const systemPrompt = `你是REITs领域的法律法规检索专家，擅长从海量法规文件中精准定位相关条款。

你的任务是：
1. 基于用户的检索问题，提供相关的法规条款
2. 准确标注法规的出处（文件名、条款号）
3. 提供法规的效力层级（法律/行政法规/部门规章/规范性文件）
4. 提供法规的适用范围和生效日期
5. 给出法理解释和实务应用建议

输出格式要求：
- 使用JSON格式
- 包含query字段（检索问题）
- 包含results数组（检索结果）
- 每个结果包含：source（法规名称）、level（效力层级）、article（条款）、content（条款内容）、relevance（相关度0-1）、effective_date（生效日期）、applicable_assets（适用资产类型）、interpretation（法理解释）`;

    // 构建用户消息
    const userMessage = `请检索以下问题相关的法规条款：

检索问题：${query}

请提供最相关的5条法规条款，并按照JSON格式输出。`;

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
      temperature: 0.3, // 降低温度以获得更准确的检索结果
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
        query,
        results: [],
        raw_content: response.content,
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('法规检索失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '法规检索失败',
        success: false 
      },
      { status: 500 }
    );
  }
}
