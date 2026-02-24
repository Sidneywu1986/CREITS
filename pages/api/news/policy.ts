import type { NextApiRequest, NextApiResponse } from 'next';

// 定义新闻数据接口
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceType: 'gov' | 'exchange' | 'media';
  publishTime: string;
  url: string;
  tags: string[];
  readCount: number;
}

interface ApiResponse {
  success: boolean;
  data: NewsItem[];
  cached?: boolean;
  timestamp?: string;
  error?: string;
}

// 缓存接口
interface CacheData {
  data: NewsItem[];
  timestamp: number;
}

// 内存缓存
let policyCache: CacheData | null = null;
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2小时缓存（毫秒）

// Mock数据 - 部委政策资讯
const MOCK_POLICY_NEWS: NewsItem[] = [
  {
    id: 'policy-001',
    title: '国家发改委发布新一批REITs试点项目，市场规模将突破2000亿',
    summary: '国家发改委今日正式发布新一批基础设施领域不动产投资信托基金（REITs）试点项目名单，共计12个项目，涵盖交通、能源、产业园等多个领域，预计市场规模将突破2000亿元。',
    source: '发改委官网',
    sourceType: 'gov',
    publishTime: '2024-01-18 09:30:00',
    url: 'https://www.ndrc.gov.cn/xxx',
    tags: ['REITs', '基础设施', '政策', '试点'],
    readCount: 25680,
  },
  {
    id: 'policy-002',
    title: '证监会发布REITs新规，优化发行流程提升市场效率',
    summary: '证监会发布《公开募集基础设施证券投资基金指引（试行）》修订稿，进一步优化REITs发行审核流程，提升市场运行效率，为投资者提供更多优质资产选择。',
    source: '证监会',
    sourceType: 'gov',
    publishTime: '2024-01-15 14:20:00',
    url: 'https://www.csrc.gov.cn/xxx',
    tags: ['REITs', '政策', '监管', '发行'],
    readCount: 18940,
  },
  {
    id: 'policy-003',
    title: '国务院办公厅印发关于进一步盘活存量资产扩大有效投资的意见',
    summary: '意见明确提出，要积极推动基础设施领域不动产投资信托基金（REITs）健康发展，有效盘活存量资产，形成存量资产和新增投资的良性循环，助力经济高质量发展。',
    source: '国务院办公厅',
    sourceType: 'gov',
    publishTime: '2024-01-12 10:00:00',
    url: 'https://www.gov.cn/xxx',
    tags: ['政策', '存量资产', 'REITs', '投资'],
    readCount: 35620,
  },
  {
    id: 'policy-004',
    title: '证监会公布2024年REITs重点工作安排',
    summary: '证监会新闻发言人表示，2024年将继续稳步推进REITs市场发展，扩大试点范围，完善监管规则，推动REITs市场健康稳定发展。',
    source: '证监会',
    sourceType: 'gov',
    publishTime: '2024-01-10 16:30:00',
    url: 'https://www.csrc.gov.cn/xxx',
    tags: ['REITs', '监管', '年度计划', '市场发展'],
    readCount: 12760,
  },
  {
    id: 'policy-005',
    title: '人民银行：支持REITs市场发展，盘活存量资产',
    summary: '人民银行相关负责人表示，将积极支持REITs市场发展，通过货币政策工具配合，促进存量资产盘活，服务实体经济高质量发展。',
    source: '人民银行',
    sourceType: 'gov',
    publishTime: '2024-01-08 11:00:00',
    url: 'https://www.pbc.gov.cn/xxx',
    tags: ['政策', '货币', 'REITs', '存量资产'],
    readCount: 14520,
  },
  {
    id: 'policy-006',
    title: '财政部明确REITs税收优惠政策',
    summary: '财政部发布通知，明确基础设施REITs项目的税收优惠政策，包括企业所得税、增值税等多个税种的优惠措施，降低REITs项目运营成本。',
    source: '财政部',
    sourceType: 'gov',
    publishTime: '2024-01-05 14:00:00',
    url: 'https://www.mof.gov.cn/xxx',
    tags: ['政策', '税收', 'REITs', '优惠'],
    readCount: 18900,
  },
  {
    id: 'policy-007',
    title: '住建部：推动保障性租赁住房REITs发展',
    summary: '住建部发布指导意见，鼓励各地积极推进保障性租赁住房REITs项目发行，解决新市民、青年人住房困难问题。',
    source: '住建部',
    sourceType: 'gov',
    publishTime: '2024-01-03 09:30:00',
    url: 'https://www.mohurd.gov.cn/xxx',
    tags: ['政策', '保障性住房', 'REITs', '租赁'],
    readCount: 21340,
  },
  {
    id: 'policy-008',
    title: '交通运输部：支持交通基础设施REITs项目发行',
    summary: '交通运输部表示，将积极支持符合条件的交通基础设施REITs项目发行，包括高速公路、港口码头、机场等资产类型。',
    source: '交通运输部',
    sourceType: 'gov',
    publishTime: '2024-01-02 15:20:00',
    url: 'https://www.mot.gov.cn/xxx',
    tags: ['政策', '交通', 'REITs', '基础设施'],
    readCount: 16780,
  },
];

// 获取部委政策资讯
async function fetchPolicyNews(): Promise<NewsItem[]> {
  try {
    // TODO: 接入每经数智API或爬取政府官网
    // 开发阶段使用Mock数据
    return MOCK_POLICY_NEWS;
  } catch (error) {
    console.error('Failed to fetch policy news:', error);
    throw error;
  }
}

// 主处理函数
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      data: []
    } as ApiResponse);
  }

  try {
    // 检查缓存
    const now = Date.now();
    if (policyCache && (now - policyCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached policy news data');
      return res.status(200).json({
        success: true,
        data: policyCache.data,
        cached: true,
        timestamp: new Date(policyCache.timestamp).toISOString(),
      } as ApiResponse);
    }

    // 获取政策资讯
    const data = await fetchPolicyNews();

    // 更新缓存
    policyCache = {
      data,
      timestamp: now,
    };

    console.log(`Fetched ${data.length} policy news items`);

    return res.status(200).json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Policy News API Error:', error);

    // 如果出错，尝试返回缓存数据（如果有）
    if (policyCache) {
      console.log('Returning cached data due to error');
      return res.status(200).json({
        success: true,
        data: policyCache.data,
        cached: true,
        timestamp: new Date(policyCache.timestamp).toISOString(),
        warning: 'Using cached data due to API error',
      } as ApiResponse);
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch policy news',
      data: [],
    } as ApiResponse);
  }
}
