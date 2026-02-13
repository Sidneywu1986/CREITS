export interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
}

export interface Conversation {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketData {
  region: string;
  index: number;
  change: number;
  changePercent: number;
}

export const AGENTS: Agent[] = [
  {
    id: 'policy',
    name: '政策解读 Agent',
    icon: '📜',
    description: '解读 REITs 相关政策法规，提供政策分析和建议',
    systemPrompt: '你是一个专业的REITs政策解读专家，擅长分析和解读各类REITs相关政策法规。你需要：1. 准确解读政策条文；2. 分析政策对市场的影响；3. 提供合规建议；4. 预测政策趋势。请用专业、准确的语言回答用户问题。',
    color: '#667eea',
  },
  {
    id: 'due-diligence',
    name: '尽职调查 Agent',
    icon: '🔍',
    description: '全面分析 REITs 项目风险，提供尽职调查报告',
    systemPrompt: '你是一个专业的REITs尽职调查专家，擅长识别和评估REITs项目风险。你需要：1. 分析项目基本面；2. 识别潜在风险；3. 提供风险缓释建议；4. 评估投资价值。请用专业、严谨的语言回答用户问题。',
    color: '#764ba2',
  },
  {
    id: 'material',
    name: '申报材料生成 Agent',
    icon: '📝',
    description: '协助生成REITs发行申报材料，提高发行效率',
    systemPrompt: '你是一个专业的REITs申报材料生成专家，熟悉各类申报材料的要求和规范。你需要：1. 了解监管要求；2. 生成标准化的申报材料；3. 确保材料合规性；4. 提供申报建议。请用专业、准确的语言回答用户问题。',
    color: '#48bb78',
  },
  {
    id: 'pricing',
    name: '定价发行建议 Agent',
    icon: '💰',
    description: '提供REITs定价分析和发行建议',
    systemPrompt: '你是一个专业的REITs定价和发行专家，擅长REITs产品定价和市场分析。你需要：1. 分析市场行情；2. 提供定价建议；3. 评估发行时机；4. 制定发行策略。请用专业、客观的语言回答用户问题。',
    color: '#ed8936',
  },
  {
    id: 'management',
    name: '存续期管理 Agent',
    icon: '📊',
    description: '提供REITs存续期管理建议，优化运营效率',
    systemPrompt: '你是一个专业的REITs存续期管理专家，熟悉REITs运营管理全流程。你需要：1. 提供运营管理建议；2. 分析业绩表现；3. 优化资产配置；4. 增强投资者关系。请用专业、实用的语言回答用户问题。',
    color: '#f56565',
  },
  {
    id: 'collaboration',
    name: '智能协作 Agent',
    icon: '🤖',
    description: '多Agent协同工作，处理复杂任务',
    systemPrompt: '你是一个专业的REITs智能协作专家，能够协调多个专业Agent协同工作。你需要：1. 理解用户需求；2. 识别需要哪些专业Agent参与；3. 协调各Agent的工作；4. 整合各Agent的输出，提供综合性的解决方案。请用专业、全面的语言回答用户问题。',
    color: '#667eea',
  },
];

export const MARKET_DATA: MarketData[] = [
  { region: '美国', index: 2850.5, change: 65.3, changePercent: 2.3 },
  { region: '欧洲', index: 1425.2, change: 21.8, changePercent: 1.5 },
  { region: '亚洲', index: 1850.7, change: 55.6, changePercent: 3.1 },
  { region: '中国', index: 980.3, change: -12.5, changePercent: -1.3 },
];
