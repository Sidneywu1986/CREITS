/**
 * 多Agent协作服务
 * 实现智能问题分析、Agent领域识别、多Agent协作对话功能
 */

import { AGENTS } from '@/types';

/**
 * Agent领域配置
 */
export interface AgentDomain {
  agentId: string;
  domain: string[];
  keywords: string[];
  relatedAgents: string[]; // 相关Agent，用于协作
}

/**
 * 协作会话信息
 */
export interface CollaborationSession {
  sessionId: string;
  mainAgentId: string;
  participatingAgents: string[];
  startTime: number;
  messages: CollaborationMessage[];
}

/**
 * 协作消息
 */
export interface CollaborationMessage {
  id: string;
  agentId: string;
  content: string;
  type: 'response' | 'question' | 'invitation' | 'transition';
  timestamp: number;
  mentionedAgents?: string[];
}

/**
 * 问题分析结果
 */
export interface QuestionAnalysis {
  isMyDomain: boolean;
  confidence: number;
  matchedKeywords: string[];
  suggestedAgents: string[];
  reason: string;
}

/**
 * Agent领域配置
 */
const AGENT_DOMAINS: AgentDomain[] = [
  {
    agentId: 'legal-risk',
    domain: ['法务风控', '法律合规', '风险识别', '法律意见', '法规审查'],
    keywords: [
      '法律', '合规', '法规', '风险', '诉讼', '合同', '纠纷',
      '权属', '知识产权', '刑事责任', '法律意见', '合规审查',
      '法律责任', '法律条款', '监管要求', '法务', '律师', '法院',
      '起诉', '仲裁', '调解', '法律文件', '法律意见书'
    ],
    relatedAgents: ['policy', 'due-diligence']
  },
  {
    agentId: 'policy',
    domain: ['政策解读', '监管分析', '合规指引'],
    keywords: [
      '政策', '监管', '指导意见', '通知', '指引', '规范',
      '发改委', '证监会', '交易所', '试点', '审批', '发行条件',
      '监管趋势', '政策变化', '政策解读', '宏观政策', '监管政策',
      '国家政策', '监管机构', '政策文件'
    ],
    relatedAgents: ['legal-risk', 'material']
  },
  {
    agentId: 'due-diligence',
    domain: ['尽职调查', '风险识别', '资产评估', '财务分析'],
    keywords: [
      '尽调', '尽职调查', '资产评估', '财务分析', '现金流',
      '风险评估', '运营数据', '财务指标', '资产负债', '利润',
      '资产质量', '运营状况', '审计', '评估报告', '财务数据',
      '运营分析', '偿债能力', '盈利能力', '资产状况',
      '分配率', '收益率', '回报率', '趋势', '后期', '前景',
      '经营分析', '经营状况', '经营指标', '经营效率', '经营数据'
    ],
    relatedAgents: ['legal-risk', 'pricing', 'management']
  },
  {
    agentId: 'material',
    domain: ['申报材料', '文书生成', '合规审查'],
    keywords: [
      '申报材料', '申报', '材料', '文书', '文件', '报告',
      '法律意见书', '评估报告', '审计报告', '招募说明书',
      '基金合同', '托管协议', '材料制作', '材料生成',
      '文档', '申报流程', '审核材料', '申报要求'
    ],
    relatedAgents: ['policy', 'legal-risk']
  },
  {
    agentId: 'pricing',
    domain: ['定价分析', '市场估值', '投资建议'],
    keywords: [
      '定价', '估值', '价格', '估值方法', '收益法', '市场法',
      '折现率', '资本化率', '发行价', '投资价值', '投资建议',
      '定价区间', '市场分析', '估值倍数', 'NAV', '现金流折现',
      '资产收益率', '投资回报', '定价策略',
      '分配率', '收益率', '回报率', '趋势', '前景',
      '产品', 'reits', 'REITs', '投资', '收益'
    ],
    relatedAgents: ['due-diligence', 'management']
  },
  {
    agentId: 'management',
    domain: ['运营管理', '价值提升', '风险监控'],
    keywords: [
      '运营', '管理', '存续期', '运营效率', '资产运营',
      '价值提升', '运营管理', '租户管理', '出租率', '租金',
      '运营成本', '信息披露', '投资者关系', '运营优化',
      '运营指标', '资产管理', '基金管理', '定期报告',
      '分配率', '收益率', '回报率', '分红', '派息',
      '趋势', '后期', '前景', '增长', '发展',
      '经营', '经营分析', '经营状况', '经营指标',
      '产品', 'reits', 'REITs', '不动产', '资产包'
    ],
    relatedAgents: ['due-diligence', 'pricing']
  },
  {
    agentId: 'collaboration',
    domain: ['智能协作', '任务协调'],
    keywords: [
      '协作', '多Agent', '协同', '协调', '综合', '整合',
      '复杂任务', '跨领域', '全方位', '综合分析', '多方意见',
      '协作模式', '智能协作', '任务协调', '方案整合'
    ],
    relatedAgents: ['legal-risk', 'policy', 'due-diligence', 'material', 'pricing', 'management']
  }
];

/**
 * Agent领域知识映射表（用于跨领域识别）
 * 记录不同Agent之间的知识重叠和互补关系
 */
const AGENT_KNOWLEDGE_MATRIX: Record<string, {
  overlaps: Record<string, string[]>; // 与其他Agent的知识重叠点
  complementaries: Record<string, string[]>; // 与其他Agent的互补知识
}> = {
  'legal-risk': {
    overlaps: {
      'policy': ['合规要求', '监管条款', '政策文件'],
      'due-diligence': ['法律风险', '合规风险', '权属问题'],
      'material': ['法律意见书', '合规审查', '法规条款']
    },
    complementaries: {
      'policy': ['法律条文解读', '政策法律风险评估'],
      'due-diligence': ['法律尽调', '风险法律评估'],
      'material': ['法律文书制作', '合规材料审核']
    }
  },
  'policy': {
    overlaps: {
      'legal-risk': ['合规要求', '监管条款', '政策文件'],
      'material': ['申报要求', '监管指引', '政策规范']
    },
    complementaries: {
      'legal-risk': ['政策法律解读', '监管趋势分析'],
      'material': ['政策解读材料', '申报政策指引']
    }
  },
  'due-diligence': {
    overlaps: {
      'legal-risk': ['法律风险', '合规风险', '权属问题'],
      'pricing': ['财务数据', '现金流', '资产价值'],
      'management': ['运营数据', '运营状况', '财务指标']
    },
    complementaries: {
      'legal-risk': ['法律尽调', '风险法律评估'],
      'pricing': ['财务尽调', '估值尽调'],
      'management': ['运营尽调', '管理评估']
    }
  },
  'material': {
    overlaps: {
      'legal-risk': ['法律意见书', '合规审查', '法规条款'],
      'policy': ['申报要求', '监管指引', '政策规范']
    },
    complementaries: {
      'legal-risk': ['法律文书制作', '合规材料审核'],
      'policy': ['政策解读材料', '申报政策指引']
    }
  },
  'pricing': {
    overlaps: {
      'due-diligence': ['财务数据', '现金流', '资产价值'],
      'management': ['运营数据', '财务指标', '收益率']
    },
    complementaries: {
      'due-diligence': ['财务尽调', '估值尽调'],
      'management': ['运营定价', '价值评估']
    }
  },
  'management': {
    overlaps: {
      'due-diligence': ['运营数据', '运营状况', '财务指标'],
      'pricing': ['运营数据', '财务指标', '收益率']
    },
    complementaries: {
      'due-diligence': ['运营尽调', '管理评估'],
      'pricing': ['运营定价', '价值评估']
    }
  },
  'collaboration': {
    overlaps: {},
    complementaries: {
      'legal-risk': ['法务协作', '法律问题综合'],
      'policy': ['政策协作', '政策问题综合'],
      'due-diligence': ['尽调协作', '风险问题综合'],
      'material': ['材料协作', '文书问题综合'],
      'pricing': ['定价协作', '估值问题综合'],
      'management': ['管理协作', '运营问题综合']
    }
  }
};

/**
 * 问题分析器类
 */
export class QuestionAnalyzer {
  /**
   * 问候语黑名单（简单问候语不应该触发协作）
   */
  private static readonly GREETING_BLACKLIST = [
    '你好', '您好', 'hello', 'hi', '哈喽', '嗨',
    '早上好', '下午好', '晚上好', '晚安',
    '谢谢', '感谢', '拜拜', '再见',
    '在吗', '在不在', '有人吗'
  ];

  /**
   * 同义词映射（用于关键词匹配）
   */
  private static readonly SYNONYM_MAP: Record<string, string[]> = {
    '经营': ['运营', '管理', '经营分析', '运营分析'],
    '运营': ['经营', '管理', '运营分析', '经营分析'],
    '管理': ['运营', '经营', '管理分析'],
    '分析': ['评估', '判断', '研究', '分析判断'],
    '判断': ['分析', '评估', '判断分析'],
    '趋势': ['走势', '方向', '发展', '前景', '后期趋势'],
    '后期': ['未来', '后续', '后期发展'],
    '产品': ['项目', '基金', '资产', 'REITs', 'reits']
  };

  /**
   * 协作触发的配置参数
   */
  private static readonly COLLABORATION_CONFIG = {
    MIN_QUESTION_LENGTH: 5,          // 最小问题长度（字符数）
    MIN_KEYWORD_MATCH: 3,            // 最小关键词匹配数量
    MIN_CONFIDENCE: 0.5,             // 最小置信度阈值
    MIN_WORDS_FOR_ANALYSIS: 2        // 至少需要多少个词才进行分析
  };

  /**
   * 分析问题是否属于Agent的领域
   */
  static analyze(agentId: string, question: string): QuestionAnalysis {
    const agentDomain = AGENT_DOMAINS.find(d => d.agentId === agentId);
    if (!agentDomain) {
      return {
        isMyDomain: false,
        confidence: 0,
        matchedKeywords: [],
        suggestedAgents: [],
        reason: 'Agent未找到'
      };
    }

    // 1. 检查是否是简单问候语
    if (this.isGreeting(question)) {
      return {
        isMyDomain: true,
        confidence: 1.0,
        matchedKeywords: [],
        suggestedAgents: [],
        reason: '简单问候，无需协作'
      };
    }

    // 2. 检查问题长度是否足够
    if (question.trim().length < this.COLLABORATION_CONFIG.MIN_QUESTION_LENGTH) {
      return {
        isMyDomain: true,
        confidence: 1.0,
        matchedKeywords: [],
        suggestedAgents: [],
        reason: '问题太短，无需协作'
      };
    }

    // 提取问题中的关键词
    const questionKeywords = this.extractKeywords(question);

    // 3. 检查提取的关键词数量是否足够
    if (questionKeywords.length < this.COLLABORATION_CONFIG.MIN_WORDS_FOR_ANALYSIS) {
      return {
        isMyDomain: true,
        confidence: 0.8,
        matchedKeywords: [],
        suggestedAgents: [],
        reason: '问题关键词不足，无需协作'
      };
    }

    // 扩展问题关键词（添加同义词）
    const expandedKeywords = this.expandKeywordsWithSynonyms(questionKeywords);

    // 匹配领域关键词（使用扩展后的关键词）
    const matchedKeywords = agentDomain.keywords.filter(kw =>
      expandedKeywords.some(qk => qk.includes(kw) || kw.includes(qk))
    );

    // 4. 检查匹配的关键词数量是否达到协作门槛
    if (matchedKeywords.length < this.COLLABORATION_CONFIG.MIN_KEYWORD_MATCH) {
      return {
        isMyDomain: true,
        confidence: 0.7,
        matchedKeywords,
        suggestedAgents: [],
        reason: '问题与当前Agent高度相关，无需协作'
      };
    }

    // 计算置信度（优化公式）
    const confidence = this.calculateConfidence(matchedKeywords, questionKeywords);

    // 判断是否属于该领域（使用更高的阈值）
    const isMyDomain = confidence >= this.COLLABORATION_CONFIG.MIN_CONFIDENCE;

    // 如果不是，建议相关Agent
    let suggestedAgents: string[] = [];
    let reason = '';

    if (!isMyDomain) {
      // 分析问题，找到最相关的Agent
      const analysis = this.findRelevantAgents(question, matchedKeywords);
      suggestedAgents = analysis.agentIds;
      reason = analysis.reason;
    } else {
      // 即使是自己的领域，也可能需要协作（更严格的条件）
      const collaborationNeeds = this.assessCollaborationNeed(agentId, question, matchedKeywords);
      if (collaborationNeeds.needsCollaboration) {
        suggestedAgents = collaborationNeeds.suggestedAgents;
        reason = collaborationNeeds.reason;
      }
    }

    return {
      isMyDomain,
      confidence,
      matchedKeywords,
      suggestedAgents,
      reason
    };
  }

  /**
   * 检查是否是问候语
   */
  private static isGreeting(question: string): boolean {
    const trimmed = question.trim().toLowerCase();
    return this.GREETING_BLACKLIST.some(greeting =>
      trimmed === greeting || trimmed.startsWith(greeting)
    );
  }

  /**
   * 计算置信度（优化公式）
   */
  private static calculateConfidence(
    matchedKeywords: string[],
    questionKeywords: string[]
  ): number {
    if (matchedKeywords.length === 0 || questionKeywords.length === 0) {
      return 0;
    }

    // 基础分数：匹配关键词占比
    const baseScore = matchedKeywords.length / questionKeywords.length;

    // 重量分数：匹配关键词越多，置信度越高
    const weightScore = Math.min(matchedKeywords.length / 5, 1);

    // 综合置信度
    const confidence = (baseScore * 0.4) + (weightScore * 0.6);

    return Math.min(confidence, 1.0);
  }

  /**
   * 提取问题中的关键词
   */
  private static extractKeywords(question: string): string[] {
    // 移除标点符号和停用词
    const cleaned = question
      .replace(/[。，！？？、；：""''（）【】《》\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleaned.split(' ').filter(w => w.length >= 2);
    return words;
  }

  /**
   * 扩展关键词（添加同义词）
   */
  private static expandKeywordsWithSynonyms(keywords: string[]): string[] {
    const expanded = [...keywords];

    keywords.forEach(keyword => {
      // 检查该关键词是否有同义词
      for (const [baseWord, synonyms] of Object.entries(this.SYNONYM_MAP)) {
        // 如果关键词是基准词或同义词，添加所有相关词
        if (keyword === baseWord || synonyms.includes(keyword)) {
          expanded.push(baseWord);
          synonyms.forEach(syn => {
            if (!expanded.includes(syn)) {
              expanded.push(syn);
            }
          });
        }
      }
    });

    return expanded;
  }

  /**
   * 找到最相关的Agent
   */
  private static findRelevantAgents(
    question: string,
    matchedKeywords: string[]
  ): {
    agentIds: string[];
    reason: string;
  } {
    const questionKeywords = this.extractKeywords(question);
    // 扩展问题关键词（添加同义词）
    const expandedKeywords = this.expandKeywordsWithSynonyms(questionKeywords);
    const scores: Record<string, number> = {};

    AGENT_DOMAINS.forEach(domain => {
      const matched = domain.keywords.filter(kw =>
        expandedKeywords.some(qk => qk.includes(kw) || kw.includes(qk))
      );
      scores[domain.agentId] = matched.length;
    });

    // 按分数排序，且分数必须大于等于配置的最小值
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score >= this.COLLABORATION_CONFIG.MIN_KEYWORD_MATCH);

    if (sorted.length === 0) {
      return {
        agentIds: [],
        reason: '未找到相关Agent'
      };
    }

    const topAgents = sorted.slice(0, 2).map(([id]) => id);
    const reason = `问题涉及${sorted[0][1]}个专业关键词，建议由相关领域Agent协同解答`;

    return {
      agentIds: topAgents,
      reason
    };
  }

  /**
   * 评估是否需要协作
   */
  private static assessCollaborationNeed(
    agentId: string,
    question: string,
    matchedKeywords: string[]
  ): {
    needsCollaboration: boolean;
    suggestedAgents: string[];
    reason: string;
  } {
    const domain = AGENT_DOMAINS.find(d => d.agentId === agentId);
    if (!domain) {
      return { needsCollaboration: false, suggestedAgents: [], reason: '' };
    }

    // 检查是否涉及相关Agent的关键词
    const questionKeywords = this.extractKeywords(question);
    // 扩展问题关键词（添加同义词）
    const expandedKeywords = this.expandKeywordsWithSynonyms(questionKeywords);
    const collaborationAgents: string[] = [];

    domain.relatedAgents.forEach(relatedId => {
      const relatedDomain = AGENT_DOMAINS.find(d => d.agentId === relatedId);
      if (relatedDomain) {
        const overlaps = AGENT_KNOWLEDGE_MATRIX[agentId]?.overlaps[relatedId] || [];
        const matchedOverlaps = overlaps.filter(overlap =>
          expandedKeywords.some(qk => qk.includes(overlap) || overlap.includes(qk))
        );

        // 至少需要匹配2个重叠点才建议协作
        if (matchedOverlaps.length >= 2) {
          collaborationAgents.push(relatedId);
        }
      }
    });

    // 如果涉及协作领域，建议协作
    if (collaborationAgents.length > 0) {
      const relatedAgentNames = collaborationAgents
        .map(id => AGENTS.find(a => a.id === id)?.name || id)
        .join('和');
      return {
        needsCollaboration: true,
        suggestedAgents: collaborationAgents,
        reason: `问题涉及${relatedAgentNames}的相关知识，建议协同解答`
      };
    }

    return {
      needsCollaboration: false,
      suggestedAgents: [],
      reason: ''
    };
  }
}

/**
 * 协作会话管理器
 */
export class CollaborationManager {
  private static sessions: Map<string, CollaborationSession> = new Map();

  /**
   * 创建协作会话
   */
  static createSession(
    mainAgentId: string,
    participatingAgents: string[]
  ): CollaborationSession {
    const sessionId = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: CollaborationSession = {
      sessionId,
      mainAgentId,
      participatingAgents: [mainAgentId, ...participatingAgents],
      startTime: Date.now(),
      messages: []
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * 获取会话
   */
  static getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 添加消息到会话
   */
  static addMessage(sessionId: string, message: CollaborationMessage): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(message);
    }
  }

  /**
   * 生成Agent邀请消息
   */
  static generateInvitationMessages(
    mainAgentId: string,
    invitedAgents: string[],
    originalQuestion: string
  ): CollaborationMessage[] {
    const messages: CollaborationMessage[] = [];
    const mainAgent = AGENTS.find(a => a.id === mainAgentId);

    // 主Agent邀请其他Agent
    if (mainAgent) {
      invitedAgents.forEach(invitedId => {
        const invitedAgent = AGENTS.find(a => a.id === invitedId);
        if (invitedAgent) {
          messages.push({
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            agentId: mainAgentId,
            content: `@${invitedAgent.name}，用户提出了一个涉及您领域的问题："${originalQuestion}"，能否请您提供专业见解？`,
            type: 'invitation',
            timestamp: Date.now(),
            mentionedAgents: [invitedId]
          });
        }
      });
    }

    return messages;
  }

  /**
   * 生成Agent加入消息
   */
  static generateJoinMessage(agentId: string): CollaborationMessage {
    const agent = AGENTS.find(a => a.id === agentId);
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId: 'system',
      content: agent ? `${agent.icon} ${agent.name} 已加入对话` : '新Agent已加入对话',
      type: 'transition',
      timestamp: Date.now()
    };
  }

  /**
   * 分析问题并建议协作
   */
  static analyzeAndSuggest(
    currentAgentId: string,
    question: string
  ): {
    needsCollaboration: boolean;
    suggestedAgents: string[];
    reason: string;
    invitationMessages: CollaborationMessage[];
  } {
    const analysis = QuestionAnalyzer.analyze(currentAgentId, question);

    if (!analysis.isMyDomain || analysis.suggestedAgents.length > 0) {
      const invitationMessages = analysis.suggestedAgents.length > 0
        ? this.generateInvitationMessages(currentAgentId, analysis.suggestedAgents, question)
        : [];

      return {
        needsCollaboration: true,
        suggestedAgents: analysis.suggestedAgents,
        reason: analysis.reason,
        invitationMessages
      };
    }

    return {
      needsCollaboration: false,
      suggestedAgents: [],
      reason: '',
      invitationMessages: []
    };
  }
}

/**
 * 辅助函数：获取Agent领域配置
 */
export function getAgentDomain(agentId: string): AgentDomain | undefined {
  return AGENT_DOMAINS.find(d => d.agentId === agentId);
}

/**
 * 辅助函数：获取所有Agent领域配置
 */
export function getAllAgentDomains(): AgentDomain[] {
  return AGENT_DOMAINS;
}
