import type { NextApiRequest, NextApiResponse } from 'next';

// 定义新闻数据接口
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceType: 'gov' | 'exchange' | 'media' | 'international';
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
let internationalCache: CacheData | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存（毫秒）

// Mock数据 - 国际资讯
const MOCK_INTERNATIONAL_NEWS: NewsItem[] = [
  {
    id: 'international-001',
    title: '全球REITs市场2024年展望：美国市场领跑，亚太地区快速增长',
    summary: '2024年全球REITs市场呈现分化态势，美国市场继续领跑，亚太地区特别是日本、新加坡市场增长迅速，欧洲市场保持稳健。',
    source: 'Bloomberg',
    sourceType: 'international',
    publishTime: '2024-01-18 10:00:00',
    url: 'https://www.bloomberg.com/xxx',
    tags: ['全球REITs', '美国', '亚太', '市场展望'],
    readCount: 32450,
  },
  {
    id: 'international-002',
    title: '美国REITs市场2023年回报率达8.5%，超预期表现',
    summary: '2023年美国REITs市场表现优异，总回报率达到8.5%，超出市场预期，其中数据中心、物流仓储、医疗健康等板块表现突出。',
    source: 'Reuters',
    sourceType: 'international',
    publishTime: '2024-01-17 14:30:00',
    url: 'https://www.reuters.com/xxx',
    tags: ['美国REITs', '回报率', '市场表现', '超预期'],
    readCount: 28930,
  },
  {
    id: 'international-003',
    title: '日本REITs市场创新高，海外投资者持续加仓',
    summary: '日本REITs市场在2023年创下历史新高，海外投资者持续加仓，受益于日元贬值和稳定的股息收益率，市场吸引力不断增强。',
    source: 'Nikkei Asia',
    sourceType: 'international',
    publishTime: '2024-01-16 09:15:00',
    url: 'https://asia.nikkei.com/xxx',
    tags: ['日本REITs', '海外投资', '创新高', '收益率'],
    readCount: 21450,
  },
  {
    id: 'international-004',
    title: '新加坡REITs市场迎来新机遇，绿色REITs成投资热点',
    summary: '新加坡REITs市场在绿色金融政策推动下，绿色REITs成为投资热点，ESG因素成为投资者决策的重要考量，市场结构持续优化。',
    source: 'Straits Times',
    sourceType: 'international',
    publishTime: '2024-01-15 11:00:00',
    url: 'https://www.straitstimes.com/xxx',
    tags: ['新加坡REITs', '绿色REITs', 'ESG', '投资热点'],
    readCount: 19560,
  },
  {
    id: 'international-005',
    title: '欧洲REITs市场2023年总结：通胀压力下展现韧性',
    summary: '2023年欧洲REITs市场在高通胀环境下展现韧性，办公和零售板块面临挑战，但工业物流、数据中心等板块表现强劲，市场分化明显。',
    source: 'Financial Times',
    sourceType: 'international',
    publishTime: '2024-01-14 16:45:00',
    url: 'https://www.ft.com/xxx',
    tags: ['欧洲REITs', '通胀', '韧性', '市场分化'],
    readCount: 23480,
  },
  {
    id: 'international-006',
    title: '澳洲REITs市场稳步增长，基础设施REITs受追捧',
    summary: '澳洲REITs市场在2023年实现稳步增长，基础设施REITs受到投资者追捧，受益于稳定的现金流和良好的长期增长前景。',
    source: 'Australian Financial Review',
    sourceType: 'international',
    publishTime: '2024-01-13 08:30:00',
    url: 'https://www.afr.com/xxx',
    tags: ['澳洲REITs', '基础设施', '稳定增长', '现金流'],
    readCount: 18230,
  },
  {
    id: 'international-007',
    title: '全球数据中心REITs需求激增，AI浪潮推动市场扩张',
    summary: '随着AI技术的快速发展，全球数据中心REITs需求激增，云计算、大数据、人工智能等应用推动数据中心投资持续增长，市场前景广阔。',
    source: 'TechCrunch',
    sourceType: 'international',
    publishTime: '2024-01-12 13:20:00',
    url: 'https://techcrunch.com/xxx',
    tags: ['数据中心', 'AI', '需求激增', '市场扩张'],
    readCount: 26780,
  },
  {
    id: 'international-008',
    title: '英国REITs市场2024年展望：政策不确定性下的机遇与挑战',
    summary: '英国REITs市场在2024年面临政策不确定性，但也存在结构性机会，住宅、医疗、基础设施等板块值得关注，市场预期趋于谨慎乐观。',
    source: 'The Guardian',
    sourceType: 'international',
    publishTime: '2024-01-11 10:15:00',
    url: 'https://www.theguardian.com/xxx',
    tags: ['英国REITs', '政策', '机遇挑战', '谨慎乐观'],
    readCount: 20120,
  },
  {
    id: 'international-009',
    title: '加拿大REITs市场表现平稳，多元化资产配置成趋势',
    summary: '加拿大REITs市场在2023年表现平稳，投资者越来越倾向于多元化资产配置，住宅、商业、工业等不同类型REITs的组合投资策略受到青睐。',
    source: 'CBC News',
    sourceType: 'international',
    publishTime: '2024-01-10 14:00:00',
    url: 'https://www.cbc.ca/xxx',
    tags: ['加拿大REITs', '多元化', '资产配置', '投资策略'],
    readCount: 17650,
  },
  {
    id: 'international-010',
    title: '全球绿色REITs市场规模突破5000亿美元，碳中和目标驱动增长',
    summary: '全球绿色REITs市场规模已突破5000亿美元，碳中和目标和ESG投资理念推动市场快速增长，预计未来5年年复合增长率将超过15%。',
    source: 'CNBC',
    sourceType: 'international',
    publishTime: '2024-01-09 09:45:00',
    url: 'https://www.cnbc.com/xxx',
    tags: ['绿色REITs', '碳中和', 'ESG', '市场增长'],
    readCount: 29870,
  },
];

// 获取国际资讯
async function fetchInternationalNews(): Promise<NewsItem[]> {
  try {
    // TODO: 接入国际新闻API（如Bloomberg、Reuters等）
    // 开发阶段使用Mock数据
    return MOCK_INTERNATIONAL_NEWS;
  } catch (error) {
    console.error('Failed to fetch international news:', error);
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
    if (internationalCache && (now - internationalCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached international news data');
      return res.status(200).json({
        success: true,
        data: internationalCache.data,
        cached: true,
        timestamp: new Date(internationalCache.timestamp).toISOString(),
      } as ApiResponse);
    }

    // 获取国际资讯
    const data = await fetchInternationalNews();

    // 更新缓存
    internationalCache = {
      data,
      timestamp: now,
    };

    console.log(`Fetched ${data.length} international news items`);

    return res.status(200).json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('International News API Error:', error);

    // 如果出错，尝试返回缓存数据（如果有）
    if (internationalCache) {
      console.log('Returning cached data due to error');
      return res.status(200).json({
        success: true,
        data: internationalCache.data,
        cached: true,
        timestamp: new Date(internationalCache.timestamp).toISOString(),
        warning: 'Using cached data due to API error',
      } as ApiResponse);
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch international news',
      data: [],
    } as ApiResponse);
  }
}
