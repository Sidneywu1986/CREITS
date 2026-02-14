/**
 * REITs法规知识库数据结构
 * 存储证监会、上交所、深交所及相关业务指引的法规文档信息
 */

export interface RegulationDocument {
  id: string; // 文档唯一标识
  code: string; // 法规编号
  title: string; // 法规标题
  issuer: '证监会' | '上交所' | '深交所' | '通用指引' | '沪深交易所'; // 发布机构
  category: '业务办法' | '审核关注事项' | '发售业务' | '扩募' | '审核程序' | '信息披露' | '运营指引' | '尽职调查' | '资产分类' | '主题分类'; // 法规类别
  type: '试行' | '正式' | '通知' | '指引'; // 法规类型
  effectiveDate: string; // 生效日期
  pdfUrl: string; // PDF文档URL
  extractedText?: string; // 提取的文本内容
  summary?: string; // 法规摘要
  keyPoints?: string[]; // 关键要点
  relatedDocs?: string[]; // 相关法规ID
  lastUpdated: string; // 最后更新时间
}

export interface RegulationQuery {
  issuer?: string[]; // 发布机构筛选
  category?: string[]; // 法规类别筛选
  keyword?: string; // 关键词搜索
  dateRange?: {
    start: string;
    end: string;
  }; // 时间范围
}

export interface RegulationAnswer {
  question: string; // 用户问题
  answer: string; // Agent回答
  references: {
    docId: string;
    docTitle: string;
    relevantSection: string;
    confidence: number;
  }[]; // 引用的法规文档
  confidence: number; // 总体置信度
}

/**
 * REITs法规知识库初始化数据
 */
export const regulationsKnowledgeBase: RegulationDocument[] = [
  // 证监会文件
  {
    id: 'REG-CSRC-001',
    code: '无编号',
    title: '中国证监会关于推出商业不动产投资信托基金试点的公告',
    issuer: '证监会',
    category: '业务办法',
    type: '正式',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F01%E8%AF%81%E7%9B%91%E4%BC%9A%E3%80%8A%E4%B8%AD%E5%9B%BD%E8%AF%81%E7%9B%91%E4%BC%9A%E5%85%B3%E4%BA%8E%E6%8E%A8%E5%87%BA%E5%95%86%E4%B8%9A%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E8%AF%95%E7%82%B9%E7%9A%84%E5%85%AC%E5%91%8A%E3%80%8B.pdf',
    summary: '宣布启动商业不动产投资信托基金试点工作，明确试点范围、发行条件、监管要求等关键内容',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-CSRC-002',
    code: '证监发〔2025〕63号',
    title: '关于推动不动产投资信托基金（REITs）市场高质量发展有关工作的通知',
    issuer: '证监会',
    category: '业务办法',
    type: '通知',
    effectiveDate: '2025-01-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F02%E8%AF%81%E7%9B%91%E4%BC%9A%E3%80%8A%E5%85%B3%E4%BA%8E%E6%8E%A8%E5%8A%A8%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E5%B8%82%E5%9C%BA%E9%AB%98%E8%B4%A8%E9%87%8F%E5%8F%91%E5%B1%95%E6%9C%89%E5%85%B3%E5%B7%A5%E4%BD%9C%E7%9A%84%E9%80%9A%E7%9F%A5%E3%80%8B%EF%BC%88%E8%AF%81%E7%9B%91%E5%8F%91%E3%80%942025%E3%80%9563%E5%8F%B7%EF%BC%89.pdf',
    summary: '从市场建设、产品创新、风险防控、投资者保护等方面推动REITs市场高质量发展',
    lastUpdated: '2025-01-01'
  },

  // 上交所文件 (03-10)
  {
    id: 'REG-SSE-001',
    code: '无编号',
    title: '上海证券交易所公开募集不动产投资信托基金（REITs）业务办法（试行）',
    issuer: '上交所',
    category: '业务办法',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F03%E3%80%8A%E4%B8%8A%E6%B5%B7%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E4%B8%9A%E5%8A%A1%E5%8A%9E%E6%B3%95%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '上交所REITs业务基本规则，涵盖发行、上市、交易、信息披露等全流程',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SSE-002',
    code: '规则适用指引第1号',
    title: '上海证券交易所公开募集不动产投资信托基金（REITs）规则适用指引第1号——审核关注事项（试行）',
    issuer: '上交所',
    category: '审核关注事项',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F04%E3%80%8A%E4%B8%8A%E6%B5%B7%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E8%A7%84%E5%88%99%E9%80%82%E7%94%A8%E6%8C%87%E5%BC%95%E7%AC%AC1%E5%8F%B7%E2%80%94%E2%80%94%E5%AE%A1%E6%A0%B8%E5%85%B3%E6%B3%A8%E4%BA%8B%E9%A1%B9%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '明确REITs发行审核中的重点关注事项，包括资产质量、信息披露、合规性等',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SSE-003',
    code: '规则适用指引第2号',
    title: '上海证券交易所公开募集不动产投资信托基金（REITs）规则适用指引第2号——发售业务（试行）',
    issuer: '上交所',
    category: '发售业务',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F05%E3%80%8A%E4%B8%8A%E6%B5%B7%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E8%A7%84%E5%88%99%E9%80%82%E7%94%A8%E6%8C%87%E5%BC%95%E7%AC%AC2%E5%8F%B7%E2%80%94%E2%80%94%E5%8F%91%E5%94%AE%E4%B8%9A%E5%8A%A1%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '规范REITs发售流程，包括询价、定价、配售等环节的具体要求',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SSE-004',
    code: '规则适用指引第3号',
    title: '上海证券交易所公开募集不动产投资信托基金（REITs）规则适用指引第3号——扩募及新购入不动产（试行）',
    issuer: '上交所',
    category: '扩募',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F06%E3%80%8A%E4%B8%8A%E6%B5%B7%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E8%A7%84%E5%88%99%E9%80%82%E7%94%A8%E6%8C%87%E5%BC%95%E7%AC%AC3%E5%8F%B7%E2%80%94%E2%80%94%E6%89%A9%E5%8B%9F%E5%8F%8A%E6%96%B0%E8%B4%AD%E5%85%A5%E4%B8%8D%E5%8A%A8%E4%BA%A7%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '规定REITs扩募条件、程序及新购入不动产的审核要求',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SSE-005',
    code: '规则适用指引第4号',
    title: '上海证券交易所公开募集不动产投资信托基金（REITs）规则适用指引第4号——审核程序（试行）',
    issuer: '上交所',
    category: '审核程序',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F07%E3%80%8A%E4%B8%8A%E6%B5%B7%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E8%A7%84%E5%88%99%E9%80%82%E7%94%A8%E6%8C%87%E5%BC%95%E7%AC%AC4%E5%8F%B7%E2%80%94%E2%80%94%E5%AE%A1%E6%A0%B8%E7%A8%8B%E5%BA%8F%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '明确REITs发行审核的具体流程、时限要求、沟通机制等',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SSE-006',
    code: '规则适用指引第5号',
    title: '上海证券交易所公开募集不动产投资信托基金（REITs）规则适用指引第5号——临时报告（试行）',
    issuer: '上交所',
    category: '信息披露',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F08%E3%80%8A%E4%B8%8A%E6%B5%B7%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E8%A7%84%E5%88%99%E9%80%82%E7%94%A8%E6%8C%87%E5%BC%95%E7%AC%AC5%E5%8F%B7%E2%80%94%E2%80%94%E4%B8%B4%E6%97%B6%E6%8A%A5%E5%91%8A%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '规定REITs临时报告的披露情形、内容要求和时限标准',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SSE-007',
    code: '规则适用指引第6号',
    title: '上海证券交易所公开募集不动产投资信托基金（REITs）规则适用指引第6号——年度报告（试行）',
    issuer: '上交所',
    category: '信息披露',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F09%E3%80%8A%E4%B8%8A%E6%B5%B7%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E8%A7%84%E5%88%99%E9%80%82%E7%94%A8%E6%8C%87%E5%BC%95%E7%AC%AC6%E5%8F%B7%E2%80%94%E2%80%94%E5%B9%B4%E5%BA%A6%E6%8A%A5%E5%91%8A%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '规范REITs年度报告的编制要求、披露内容和审计安排',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SSE-008',
    code: '规则适用指引第7号',
    title: '上海证券交易所公开募集不动产投资信托基金（REITs）规则适用指引第7号——中期报告和季度报告（试行）',
    issuer: '上交所',
    category: '信息披露',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F10%E3%80%8A%E4%B8%8A%E6%B5%B7%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E8%A7%84%E5%88%99%E9%80%82%E7%94%A8%E6%8C%87%E5%BC%95%E7%AC%AC7%E5%8F%B7%E2%80%94%E2%80%94%E4%B8%AD%E6%9C%9F%E6%8A%A5%E5%91%8A%E5%92%8C%E5%AD%A3%E5%BA%A6%E6%8A%A5%E5%91%8A%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '规定REITs中期报告和季度报告的披露要求、内容和格式',
    lastUpdated: '2025-01-01'
  },

  // 深交所文件 (11-18)
  {
    id: 'REG-SZSE-001',
    code: '无编号',
    title: '深圳证券交易所公开募集不动产投资信托基金业务办法（试行）',
    issuer: '深交所',
    category: '业务办法',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F11%E3%80%8A%E6%B7%B1%E5%9C%B3%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E4%B8%9A%E5%8A%A1%E5%8A%9E%E6%B3%95%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '深交所REITs业务基本规则，与上交所规则体系保持一致',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SZSE-002',
    code: '业务指引第1号',
    title: '深圳证券交易所公开募集不动产投资信托基金业务指引第1号——审核关注事项（试行）',
    issuer: '深交所',
    category: '审核关注事项',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F12%E3%80%8A%E6%B7%B1%E5%9C%B3%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E4%B8%9A%E5%8A%A1%E6%8C%87%E5%BC%95%E7%AC%AC1%E5%8F%B7%E2%80%94%E2%80%94%E5%AE%A1%E6%A0%B8%E5%85%B3%E6%B3%A8%E4%BA%8B%E9%A1%B9%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '深交所REITs审核关注事项，与上交所要求保持协同',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SZSE-003',
    code: '业务指引第2号',
    title: '深圳证券交易所公开募集不动产投资信托基金业务指引第2号——发售业务（试行）',
    issuer: '深交所',
    category: '发售业务',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F13%E3%80%8A%E6%B7%B1%E5%9C%B3%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E4%B8%9A%E5%8A%A1%E6%8C%87%E5%BC%95%E7%AC%AC2%E5%8F%B7%E2%80%94%E2%80%94%E5%8F%91%E5%94%AE%E4%B8%9A%E5%8A%A1%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '深交所REITs发售业务指引，规范询价、定价、配售流程',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SZSE-004',
    code: '业务指引第3号',
    title: '深圳证券交易所公开募集不动产投资信托基金业务指引第3号——扩募及新购入不动产（试行）',
    issuer: '深交所',
    category: '扩募',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F14%E3%80%8A%E6%B7%B1%E5%9C%B3%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E4%B8%9A%E5%8A%A1%E6%8C%87%E5%BC%95%E7%AC%AC3%E5%8F%B7%E2%80%94%E2%80%94%E6%89%A9%E5%8B%9F%E5%8F%8A%E6%96%B0%E8%B4%AD%E5%85%A5%E4%B8%8D%E5%8A%A8%E4%BA%A7%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '深交所REITs扩募及新购入不动产指引',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SZSE-005',
    code: '业务指引第4号',
    title: '深圳证券交易所公开募集不动产投资信托基金业务指引第4号——审核程序（试行）',
    issuer: '深交所',
    category: '审核程序',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F15%E3%80%8A%E6%B7%B1%E5%9C%B3%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E4%B8%9A%E5%8A%A1%E6%8C%87%E5%BC%95%E7%AC%AC4%E5%8F%B7%E2%80%94%E2%80%94%E5%AE%A1%E6%A0%B8%E7%A8%8B%E5%BA%8F%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '深交所REITs审核程序指引',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SZSE-006',
    code: '业务指引第5号',
    title: '深圳证券交易所公开募集不动产投资信托基金业务指引第5号——临时报告（试行）',
    issuer: '深交所',
    category: '信息披露',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F16%E3%80%8A%E6%B7%B1%E5%9C%B3%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E4%B8%9A%E5%8A%A1%E6%8C%87%E5%BC%95%E7%AC%AC5%E5%8F%B7%E2%80%94%E2%80%94%E4%B8%B4%E6%97%B6%E6%8A%A5%E5%91%8A%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '深交所REITs临时报告指引',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SZSE-007',
    code: '业务指引第6号',
    title: '深圳证券交易所公开募集不动产投资信托基金业务指引第6号——年度报告（试行）',
    issuer: '深交所',
    category: '信息披露',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F17%E3%80%8A%E6%B7%B1%E5%9C%B3%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E4%B8%9A%E5%8A%A1%E6%8C%87%E5%BC%95%E7%AC%AC6%E5%8F%B7%E2%80%94%E2%80%94%E5%B9%B4%E5%BA%A6%E6%8A%A5%E5%91%8A%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '深交所REITs年度报告指引',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-SZSE-008',
    code: '业务指引第7号',
    title: '深圳证券交易所公开募集不动产投资信托基金业务指引第7号——中期报告和季度报告（试行）',
    issuer: '深交所',
    category: '信息披露',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F18%E3%80%8A%E6%B7%B1%E5%9C%B3%E8%AF%81%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%E4%B8%9A%E5%8A%A1%E6%8C%87%E5%BC%95%E7%AC%AC7%E5%8F%B7%E2%80%94%E2%80%94%E4%B8%AD%E6%9C%9F%E6%8A%A5%E5%91%8A%E5%92%8C%E5%AD%A3%E5%BA%A6%E6%8A%A5%E5%91%8A%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '深交所REITs中期报告和季度报告指引',
    lastUpdated: '2025-01-01'
  },

  // 通用指引 (19-20)
  {
    id: 'REG-GEN-001',
    code: '无编号',
    title: '公开募集不动产投资信托基金（REITs）运营操作指引（试行）',
    issuer: '通用指引',
    category: '运营指引',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F19%E3%80%8A%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E8%BF%90%E8%90%A5%E6%93%8D%E4%BD%9C%E6%8C%87%E5%BC%95%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '规范REITs上市后的运营管理，包括基金管理人职责、信息披露、投资者关系等',
    lastUpdated: '2025-01-01'
  },
  {
    id: 'REG-GEN-002',
    code: '无编号',
    title: '公开募集不动产投资信托基金（REITs）尽职调查工作指引（试行）',
    issuer: '通用指引',
    category: '尽职调查',
    type: '试行',
    effectiveDate: '2024-12-01',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F20%E3%80%8A%E5%85%AC%E5%BC%80%E5%8B%9F%E9%9B%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%95%E8%B5%84%E4%BF%A1%E6%89%98%E5%9F%BA%E9%87%91%EF%BC%88REITs%EF%BC%89%E5%B0%BD%E8%81%8C%E8%B0%83%E6%9F%A5%E5%B7%A5%E4%BD%9C%E6%8C%87%E5%BC%95%EF%BC%88%E8%AF%95%E8%A1%8C%EF%BC%89%E3%80%8B.pdf',
    summary: '指导REITs发行过程中的尽职调查工作，明确调查范围、方法和责任',
    lastUpdated: '2025-01-01'
  },

  // ABS分类知识 (21-22)
  {
    id: 'REG-ABS-001',
    code: '无编号',
    title: '资产支持证券（ABS）基础资产分类指引',
    issuer: '沪深交易所',
    category: '资产分类',
    type: '指引',
    effectiveDate: '2024-01-01',
    pdfUrl: '',
    summary: '根据沪深交易所业务指引，ABS按基础资产类型划分为三大类别：债权类、未来经营收入类、不动产抵押贷款类。各类资产具有不同的核心特征和准入标准。',
    lastUpdated: '2025-02-14',
    keyPoints: [
      '债权类资产：包括应收账款、融资租赁债权、小额贷款债权、企业融资债权、不良债权等基于合同债权的资产',
      '未来经营收入类：包括基础设施收费、PPP项目、其他经营性收费权等基于未来现金流的资产',
      '不动产抵押贷款类：以商业物业（写字楼、商场、长租公寓等）作为抵押担保的贷款债权'
    ],
    extractedText: `# 资产支持证券（ABS）基础资产分类指引

## 按基础资产类型划分的三大类别

### 1. 债权类资产
**核心特征**：企业因销售商品或提供服务形成的债权，或基于合同产生的租金请求权和其他权利及其附属担保权益。

**细分资产类型**：
- **应收账款**：企业因销售商品或提供服务形成的债权
- **融资租赁债权**：融资租赁公司基于租赁合同享有的租金请求权和其他权利及其附属担保权益
- **小额贷款债权**：小额贷款公司发放贷款形成的债权
- **企业融资债权**：指向企业发放的贷款形成的债权
- **不良债权**：包括不良资产重组类项目，以及工程质保金等需要特别核查的债权

### 2. 未来经营收入类
**核心特征**：基于特定基础设施或经营性资产未来产生的收费收益权。

**细分资产类型**：
- **基础设施收费**：基于特定的基础设施（如水务、燃气、公路、PPP项目等）未来产生的收费收益权
- **PPP项目**：政府和社会资本合作项目项下的收益权
- **其他经营性收费权**：如公园门票、物业费收入等持续稳定的经营性现金流

### 3. 不动产抵押贷款类
**核心特征**：以商业物业等不动产作为抵押担保而发放的贷款债权，强调物业的估值和现金流对债务的覆盖能力。

**细分资产类型**：
- **不动产抵押贷款债权**：以商业物业（如写字楼、商场、长租公寓等）等不动产作为抵押担保而发放的贷款债权

## 按特定品种的专项分类（主题分类）

除了上述基于资产特性的分类，监管层还推出了特定品种ABS的专项分类，用于支持国家战略。这些品种在命名和信息披露上有专门要求，可以与上述大类资产分类并行存在。

**专项主题分类**：
1. **科技创新**：支持科创企业发展的资产证券化产品
2. **知识产权**：以专利、商标等知识产权衍生债权为支持
3. **绿色低碳**：募集资金投向绿色产业或基础资产本身具有环境效益
4. **乡村振兴**：服务于乡村振兴战略的项目
5. **"一带一路"**：支持"一带一路"建设的项目
6. **住房租赁**：以住房租赁相关收益为基础资产

## 分类框架总结

目前ABS的分类框架可以概括为：**底层看"资产"（属于三大类中的哪一类），顶层看"主题"（是否符合特定品种支持方向）**。

这个框架既确保了基础资产的质量，也为服务实体经济提供了明确的创新路径。`
  },
  {
    id: 'REG-ABS-002',
    code: '无编号',
    title: '资产支持证券（ABS）专项品种分类说明',
    issuer: '沪深交易所',
    category: '主题分类',
    type: '指引',
    effectiveDate: '2024-01-01',
    pdfUrl: '',
    summary: '监管层推出的ABS专项品种分类，包括科技创新、知识产权、绿色低碳、乡村振兴、"一带一路"、住房租赁等主题，用于支持国家战略和实体经济重点领域。',
    lastUpdated: '2025-02-14',
    keyPoints: [
      '专项品种可以与三大类基础资产分类并行存在',
      '专项品种在命名和信息披露上有专门要求',
      '专项品种用于支持国家战略和实体经济重点领域'
    ],
    extractedText: `# 资产支持证券（ABS）专项品种分类说明

## 特定品种的专项分类（主题分类）

监管层推出的ABS专项品种，用于支持国家战略和实体经济重点领域。这些品种在命名和信息披露上有专门要求，可以与三大类基础资产分类并行存在。

## 专项品种类型

### 1. 科技创新ABS
**支持方向**：支持科创企业发展的资产证券化产品
**特点**：以科创企业的知识产权、应收账款等为基础资产

### 2. 知识产权ABS
**支持方向**：以专利、商标等知识产权衍生债权为支持
**特点**：盘活知识产权资产，促进科技成果转化

### 3. 绿色低碳ABS
**支持方向**：募集资金投向绿色产业或基础资产本身具有环境效益
**特点**：符合绿色金融标准，支持碳达峰碳中和目标

### 4. 乡村振兴ABS
**支持方向**：服务于乡村振兴战略的项目
**特点**：支持农业农村相关基础设施和产业发展

### 5. "一带一路"ABS
**支持方向**：支持"一带一路"建设的项目
**特点**：服务国家对外开放战略，促进国际合作

### 6. 住房租赁ABS
**支持方向**：以住房租赁相关收益为基础资产
**特点**：支持住房租赁市场发展，解决住房问题

## 专项品种的特点

1. **政策导向性强**：每个专项品种都有明确的政策支持方向
2. **信息披露要求高**：在产品命名、信息披露上有专门要求
3. **与基础资产分类并行**：可以与债权类、未来经营收入类、不动产抵押贷款类等基础资产分类同时存在
4. **服务实体经济**：专项品种服务于国家战略和实体经济重点领域

## 分类框架总结

**底层看"资产"**：属于三大类基础资产中的哪一类（债权类、未来经营收入类、不动产抵押贷款类）

**顶层看"主题"**：是否符合特定品种支持方向（科技创新、知识产权、绿色低碳、乡村振兴、"一带一路"、住房租赁）

这个框架既确保了基础资产的质量，也为服务实体经济提供了明确的创新路径。`
  }
];

/**
 * 法规分类统计
 */
export const regulationCategories = [
  '业务办法',
  '审核关注事项',
  '发售业务',
  '扩募',
  '审核程序',
  '信息披露',
  '运营指引',
  '尽职调查',
  '资产分类',
  '主题分类'
] as const;

/**
 * 发布机构列表
 */
export const regulationIssuers = ['证监会', '上交所', '深交所', '通用指引', '沪深交易所'] as const;

/**
 * 获取法规数量统计
 */
export function getRegulationStats() {
  return {
    total: regulationsKnowledgeBase.length,
    byIssuer: regulationIssuers.reduce((acc, issuer) => {
      acc[issuer] = regulationsKnowledgeBase.filter(doc => doc.issuer === issuer).length;
      return acc;
    }, {} as Record<string, number>),
    byCategory: regulationCategories.reduce((acc, category) => {
      acc[category] = regulationsKnowledgeBase.filter(doc => doc.category === category).length;
      return acc;
    }, {} as Record<string, number>)
  };
}

/**
 * 查询法规文档
 */
export function queryRegulations(query: RegulationQuery): RegulationDocument[] {
  let results = [...regulationsKnowledgeBase];

  // 按发布机构筛选
  if (query.issuer && query.issuer.length > 0) {
    results = results.filter(doc => query.issuer!.includes(doc.issuer));
  }

  // 按类别筛选
  if (query.category && query.category.length > 0) {
    results = results.filter(doc => query.category!.includes(doc.category));
  }

  // 关键词搜索
  if (query.keyword) {
    const keyword = query.keyword.toLowerCase();
    results = results.filter(doc =>
      doc.title.toLowerCase().includes(keyword) ||
      doc.summary?.toLowerCase().includes(keyword) ||
      doc.keyPoints?.some(point => point.toLowerCase().includes(keyword))
    );
  }

  // 按时间范围筛选
  if (query.dateRange) {
    results = results.filter(doc => {
      const date = new Date(doc.effectiveDate);
      const start = new Date(query.dateRange!.start);
      const end = new Date(query.dateRange!.end);
      return date >= start && date <= end;
    });
  }

  return results;
}

/**
 * 根据ID获取法规文档
 */
export function getRegulationById(id: string): RegulationDocument | undefined {
  return regulationsKnowledgeBase.find(doc => doc.id === id);
}
