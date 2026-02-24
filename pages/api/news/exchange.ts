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
let exchangeCache: CacheData | null = null;
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1小时缓存（毫秒）

// Mock数据 - 交易所动态
const MOCK_EXCHANGE_NEWS: NewsItem[] = [
  {
    id: 'exchange-001',
    title: '上交所发布REITs上市审核业务指引（2024年修订）',
    summary: '上交所对REITs上市审核业务指引进行了修订，进一步明确审核标准和流程，提高审核效率，为REITs市场健康发展提供制度保障。',
    source: '上海证券交易所',
    sourceType: 'exchange',
    publishTime: '2024-01-17 11:00:00',
    url: 'https://www.sse.com.cn/xxx',
    tags: ['上交所', 'REITs', '审核', '规则'],
    readCount: 21200,
  },
  {
    id: 'exchange-002',
    title: '深交所REITs产品创新取得新进展，首单消费基础设施REITs获批',
    summary: '深交所首单消费基础设施REITs项目正式获批，标志着REITs产品类型进一步丰富，投资者将拥有更多元化的投资选择。',
    source: '深圳证券交易所',
    sourceType: 'exchange',
    publishTime: '2024-01-16 09:45:00',
    url: 'https://www.szse.cn/xxx',
    tags: ['深交所', '消费基础设施', 'REITs', '创新'],
    readCount: 28450,
  },
  {
    id: 'exchange-003',
    title: '北交所发布基础设施REITs业务规则，助力多层次市场建设',
    summary: '北交所发布基础设施REITs相关业务规则，完善多层次资本市场体系建设，服务实体经济高质量发展。',
    source: '北京证券交易所',
    sourceType: 'exchange',
    publishTime: '2024-01-14 15:20:00',
    url: 'https://www.bse.cn/xxx',
    tags: ['北交所', 'REITs', '规则', '多层次市场'],
    readCount: 14890,
  },
  {
    id: 'exchange-004',
    title: '上交所发布2023年REITs市场运行报告',
    summary: '报告显示，2023年上交所REITs市场运行平稳，市场规模持续扩大，产品类型日益丰富，市场参与主体不断增加。',
    source: '上海证券交易所',
    sourceType: 'exchange',
    publishTime: '2024-01-13 10:30:00',
    url: 'https://www.sse.com.cn/xxx',
    tags: ['上交所', '市场报告', 'REITs', '年度总结'],
    readCount: 18230,
  },
  {
    id: 'exchange-005',
    title: '深交所推出REITs做市商制度，提升市场流动性',
    summary: '深交所宣布推出REITs做市商制度，引入专业机构提供流动性服务，进一步提升REITs市场的流动性和定价效率。',
    source: '深圳证券交易所',
    sourceType: 'exchange',
    publishTime: '2024-01-11 14:15:00',
    url: 'https://www.szse.cn/xxx',
    tags: ['深交所', '做市商', 'REITs', '流动性'],
    readCount: 19560,
  },
  {
    id: 'exchange-006',
    title: '上交所REITs指数正式发布，为市场提供投资参考',
    summary: '上交所REITs指数正式发布，指数样本包含符合条件的REITs产品，为投资者提供直观的市场表现参考。',
    source: '上海证券交易所',
    sourceType: 'exchange',
    publishTime: '2024-01-09 09:00:00',
    url: 'https://www.sse.com.cn/xxx',
    tags: ['上交所', 'REITs指数', '投资', '参考'],
    readCount: 22340,
  },
  {
    id: 'exchange-007',
    title: '深交所REITs市场交易活跃度创历史新高',
    summary: '2024年以来，深交所REITs市场交易活跃度显著提升，日均成交额同比增长50%，投资者参与热情高涨。',
    source: '深圳证券交易所',
    sourceType: 'exchange',
    publishTime: '2024-01-07 16:30:00',
    url: 'https://www.szse.cn/xxx',
    tags: ['深交所', '交易活跃', 'REITs', '市场'],
    readCount: 20120,
  },
  {
    id: 'exchange-008',
    title: '北交所首单产业园区REITs项目发行上市',
    summary: '北交所首单产业园区REITs项目成功发行上市，标志着北交所REITs市场取得重要突破，产品类型进一步丰富。',
    source: '北京证券交易所',
    sourceType: 'exchange',
    publishTime: '2024-01-05 11:45:00',
    url: 'https://www.bse.cn/xxx',
    tags: ['北交所', '产业园区', 'REITs', '上市'],
    readCount: 17890,
  },
];

// 获取交易所动态
async function fetchExchangeNews(): Promise<NewsItem[]> {
  try {
    // TODO: 爬取交易所官网或接入交易所API
    // 开发阶段使用Mock数据
    return MOCK_EXCHANGE_NEWS;
  } catch (error) {
    console.error('Failed to fetch exchange news:', error);
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
    if (exchangeCache && (now - exchangeCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached exchange news data');
      return res.status(200).json({
        success: true,
        data: exchangeCache.data,
        cached: true,
        timestamp: new Date(exchangeCache.timestamp).toISOString(),
      } as ApiResponse);
    }

    // 获取交易所动态
    const data = await fetchExchangeNews();

    // 更新缓存
    exchangeCache = {
      data,
      timestamp: now,
    };

    console.log(`Fetched ${data.length} exchange news items`);

    return res.status(200).json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Exchange News API Error:', error);

    // 如果出错，尝试返回缓存数据（如果有）
    if (exchangeCache) {
      console.log('Returning cached data due to error');
      return res.status(200).json({
        success: true,
        data: exchangeCache.data,
        cached: true,
        timestamp: new Date(exchangeCache.timestamp).toISOString(),
        warning: 'Using cached data due to API error',
      } as ApiResponse);
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch exchange news',
      data: [],
    } as ApiResponse);
  }
}
