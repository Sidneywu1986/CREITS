/**
 * REITs法规智能问答服务
 * 集成LLM和法规知识库提供智能问答
 */

import { chat, streamChat } from './llm-service';
import { queryRegulations, getRegulationById, RegulationDocument, RegulationAnswer } from '@/lib/data/regulations-knowledge-base';
import { buildRegulationQueryPrompt, identifyQueryType } from '@/lib/prompts/regulation-agent-prompts';

/**
 * 法规问答请求
 */
export interface RegulationQueryRequest {
  question: string;
  issuer?: string[];
  category?: string[];
  stream?: boolean;
}

/**
 * 法规问答响应
 */
export interface RegulationQueryResponse {
  answer: string;
  references: {
    docId: string;
    docTitle: string;
    issuer: string;
    category: string;
    confidence: number;
  }[];
  queryType: string;
  confidence: number;
}

/**
 * 智能检索相关法规
 */
function searchRelevantRegulations(question: string): RegulationDocument[] {
  // 提取关键词
  const keywords = extractKeywords(question);

  // 基于关键词检索法规
  const allDocs = queryRegulations({
    keyword: keywords.join(' ')
  });

  // 如果没有找到相关文档，返回空数组
  if (allDocs.length === 0) {
    return [];
  }

  // 评分排序
  const scoredDocs = allDocs.map(doc => {
    const score = calculateRelevanceScore(question, doc);
    return { ...doc, relevanceScore: score };
  });

  // 按相关性排序并返回前5个
  return scoredDocs
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, 5);
}

/**
 * 提取关键词
 */
function extractKeywords(question: string): string[] {
  // 移除常见疑问词
  const stopWords = ['什么', '如何', '怎么', '为什么', '哪个', '哪些', '是否', '要求', '规定', '需要', '应该', '可以', '能够'];

  const words = question.split(/[\s,，。?!？]/);
  const keywords = words
    .filter(word => word.length >= 2 && !stopWords.includes(word))
    .slice(0, 10);

  return keywords;
}

/**
 * 计算相关性分数
 */
function calculateRelevanceScore(question: string, doc: RegulationDocument): number {
  let score = 0;

  // 标题匹配
  if (doc.title.toLowerCase().includes(question.toLowerCase())) {
    score += 10;
  }

  // 摘要匹配
  if (doc.summary && doc.summary.toLowerCase().includes(question.toLowerCase())) {
    score += 5;
  }

  // 关键词匹配
  const keywords = extractKeywords(question);
  const title = doc.title.toLowerCase();
  const summary = (doc.summary || '').toLowerCase();

  keywords.forEach(keyword => {
    if (title.includes(keyword.toLowerCase())) {
      score += 3;
    }
    if (summary.includes(keyword.toLowerCase())) {
      score += 2;
    }
    if (doc.keyPoints) {
      doc.keyPoints.forEach(point => {
        if (point.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
    }
  });

  return score;
}

/**
 * 法规智能问答（非流式）
 */
export async function queryRegulationQa(
  request: RegulationQueryRequest
): Promise<RegulationQueryResponse> {
  try {
    // 检索相关法规
    let relevantDocs: RegulationDocument[] = [];

    if (request.issuer || request.category) {
      // 如果指定了筛选条件，先筛选再搜索
      const filteredDocs = queryRegulations({
        issuer: request.issuer,
        category: request.category
      });
      const keywords = extractKeywords(request.question);
      relevantDocs = filteredDocs.filter(doc => {
        const title = doc.title.toLowerCase();
        const summary = (doc.summary || '').toLowerCase();
        return keywords.some(kw =>
          title.includes(kw.toLowerCase()) || summary.includes(kw.toLowerCase())
        );
      }).slice(0, 5);
    } else {
      // 智能检索
      relevantDocs = searchRelevantRegulations(request.question);
    }

    // 识别查询类型
    const queryType = identifyQueryType(request.question);

    // 构建提示词
    const prompt = buildRegulationQueryPrompt(request.question, relevantDocs);

    // 调用LLM
    const response = await simpleChat(request.question, prompt);

    // 构建引用
    const references = relevantDocs.map(doc => ({
      docId: doc.id,
      docTitle: doc.title,
      issuer: doc.issuer,
      category: doc.category,
      confidence: calculateRelevanceScore(request.question, doc)
    }));

    // 计算总体置信度
    const confidence = references.length > 0
      ? Math.min(1, 0.6 + (references.length * 0.1))
      : 0.5;

    return {
      answer: response.content,
      references,
      queryType,
      confidence
    };
  } catch (error) {
    console.error('Regulation QA error:', error);
    throw new Error(`Failed to query regulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 法规智能问答（流式）
 */
export async function streamRegulationQa(
  request: RegulationQueryRequest
): Promise<AsyncIterable<{ content: string; done: boolean }>> {
  try {
    // 检索相关法规
    const relevantDocs = searchRelevantRegulations(request.question);

    // 识别查询类型
    const queryType = identifyQueryType(request.question);

    // 构建提示词
    const prompt = buildRegulationQueryPrompt(request.question, relevantDocs);

    // 调用LLM流式对话
    const stream = await streamChat(
      [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: request.question
        }
      ],
      {
        temperature: 0.7,
        maxTokens: 2000
      }
    );

    // 包装流式响应
    async function* wrappedStream() {
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk.content;
        yield {
          content: chunk.content,
          done: chunk.done
        };
      }
    }

    return wrappedStream();
  } catch (error) {
    console.error('Regulation streaming QA error:', error);
    throw new Error(`Failed to stream regulation QA: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 批量问答
 */
export async function batchQueryRegulationQa(
  questions: string[]
): Promise<RegulationQueryResponse[]> {
  const responses: RegulationQueryResponse[] = [];

  for (const question of questions) {
    try {
      const response = await queryRegulationQa({ question });
      responses.push(response);
    } catch (error) {
      console.error(`Failed to answer question: ${question}`, error);
      responses.push({
        answer: '抱歉，无法回答此问题，请稍后重试。',
        references: [],
        queryType: '综合查询',
        confidence: 0
      });
    }
  }

  return responses;
}

/**
 * 获取法规详情
 */
export async function getRegulationDetail(
  docId: string
): Promise<RegulationDocument | null> {
  try {
    const doc = getRegulationById(docId);
    return doc || null;
  } catch (error) {
    console.error(`Failed to get regulation detail: ${docId}`, error);
    return null;
  }
}

/**
 * 法规对比
 */
export async function compareRegulations(
  docIds: string[],
  aspect?: string
): Promise<string> {
  try {
    // 获取法规文档
    const docs = docIds
      .map(id => getRegulationById(id))
      .filter((doc): doc is RegulationDocument => doc !== undefined);

    if (docs.length < 2) {
      return '请至少选择两份法规进行对比。';
    }

    // 构建对比提示词
    const prompt = `
请对比以下REITs法规文档，重点关注${aspect || '发行条件、审核流程、信息披露要求'}等方面：

${docs.map(doc => `
### ${doc.title}
- 发布机构：${doc.issuer}
- 生效日期：${doc.effectiveDate}
- 法规摘要：${doc.summary}
`).join('\n')}

请从以下方面进行对比：
1. 发布机构和时间
2. 适用范围
3. 核心要求
4. 差异点
5. 关联性

请以清晰的表格或结构化文本形式展示对比结果。
`;

    // 调用LLM
    const response = await simpleChat('请对比这些法规', prompt);

    return response.content;
  } catch (error) {
    console.error('Failed to compare regulations:', error);
    throw new Error(`Failed to compare regulations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 获取法规统计信息
 */
export function getRegulationStatistics() {
  const allDocs = queryRegulations({});

  const stats = {
    total: allDocs.length,
    byIssuer: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byType: {} as Record<string, number>
  };

  allDocs.forEach(doc => {
    stats.byIssuer[doc.issuer] = (stats.byIssuer[doc.issuer] || 0) + 1;
    stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
    stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
  });

  return stats;
}
