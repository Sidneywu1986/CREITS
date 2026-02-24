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
let industryCache: CacheData | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存（毫秒）

// Mock数据 - 行业公司资讯
const MOCK_INDUSTRY_NEWS: NewsItem[] = [
  {
    id: 'industry-001',
    title: '首单消费基础设施REITs成功发行，市场反响热烈',
    summary: '首单消费基础设施REITs产品成功发行，首日涨幅超过10%，市场认购倍数达到35倍，显示出投资者对REITs产品的强烈需求。',
    source: '每经新闻',
    sourceType: 'media',
    publishTime: '2024-01-18 14:00:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['公募REITs', '消费基础设施', '发行', '市场'],
    readCount: 38760,
  },
  {
    id: 'industry-002',
    title: '2023年ABS市场总结：发行规模再创新高，突破5000亿元',
    summary: '2023年ABS市场发行规模达到5023亿元，同比增长23%，创历史新高。企业ABS、信贷ABS、ABN等品种均实现较快增长。',
    source: '每经财讯',
    sourceType: 'media',
    publishTime: '2024-01-17 16:45:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['ABS', '市场总结', '发行规模', '年度'],
    readCount: 29500,
  },
  {
    id: 'industry-003',
    title: '多家公募基金加速布局REITs产品，竞争日趋激烈',
    summary: '截至2024年初，已有30家公募基金获得REITs管理人资格，产品布局呈现加速态势，市场竞争日趋激烈。',
    source: '基金业协会',
    sourceType: 'media',
    publishTime: '2024-01-16 11:30:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['公募REITs', '产品布局', '竞争', '基金'],
    readCount: 24200,
  },
  {
    id: 'industry-004',
    title: '绿色ABS发行规模快速增长，碳中和目标驱动绿色金融',
    summary: '2023年绿色ABS发行规模达到850亿元，同比增长65%，碳中和目标推动绿色金融快速发展，ESG理念深入人心。',
    source: '每经ESG',
    sourceType: 'media',
    publishTime: '2024-01-15 09:15:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['绿色ABS', '碳中和', '绿色金融', 'ESG'],
    readCount: 21940,
  },
  {
    id: 'industry-005',
    title: 'REITs市场投资价值凸显，机构投资者持续加仓',
    summary: '随着REITs市场不断成熟，投资价值逐渐凸显，机构投资者持续加仓，REITs成为大类资产配置的重要选择。',
    source: '证券时报',
    sourceType: 'media',
    publishTime: '2024-01-14 14:20:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['REITs', '投资', '机构', '配置'],
    readCount: 26850,
  },
  {
    id: 'industry-006',
    title: '消费基础设施REITs成市场新热点，多家企业积极筹备',
    summary: '随着首单消费基础设施REITs成功发行，市场热情高涨，多家企业积极筹备相关项目，消费基础设施REITs有望成为市场新热点。',
    source: '每经新闻',
    sourceType: 'media',
    publishTime: '2024-01-13 10:00:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['消费基础设施', 'REITs', '筹备', '热点'],
    readCount: 23180,
  },
  {
    id: 'industry-007',
    title: '保障性租赁住房REITs市场空间广阔，政策持续发力',
    summary: '保障性租赁住房REITs市场空间广阔，政策持续发力，多只产品成功发行，为解决新市民、青年人住房问题提供新路径。',
    source: '中国房地产报',
    sourceType: 'media',
    publishTime: '2024-01-12 15:30:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['保障性住房', 'REITs', '政策', '市场'],
    readCount: 25420,
  },
  {
    id: 'industry-008',
    title: 'REITs二级市场表现亮眼，投资者信心持续增强',
    summary: '2024年以来，REITs二级市场表现亮眼，多数产品实现正收益，投资者信心持续增强，市场活跃度显著提升。',
    source: '每经财讯',
    sourceType: 'media',
    publishTime: '2024-01-11 09:45:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['REITs', '二级市场', '表现', '信心'],
    readCount: 28930,
  },
  {
    id: 'industry-009',
    title: '公募REITs产品数量突破50只，市场规模不断扩大',
    summary: '随着新产品的不断发行，公募REITs产品数量已突破50只，市场规模持续扩大，REITs市场进入快速发展期。',
    source: '中国证券报',
    sourceType: 'media',
    publishTime: '2024-01-10 11:15:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['公募REITs', '产品数量', '市场规模', '发展'],
    readCount: 24670,
  },
  {
    id: 'industry-010',
    title: 'ABS市场创新不断，首单碳中和ABS成功发行',
    summary: 'ABS市场创新不断，首单碳中和ABS成功发行，标志着绿色金融产品体系进一步完善，为碳中和目标提供金融支持。',
    source: '每经ESG',
    sourceType: 'media',
    publishTime: '2024-01-09 14:00:00',
    url: 'https://www.nbd.com.cn/xxx',
    tags: ['ABS', '碳中和', '创新', '发行'],
    readCount: 21560,
  },
];

// 获取行业公司资讯
async function fetchIndustryNews(): Promise<NewsItem[]> {
  try {
    // TODO: 接入每经数智API
    // 开发阶段使用Mock数据
    return MOCK_INDUSTRY_NEWS;
  } catch (error) {
    console.error('Failed to fetch industry news:', error);
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
    if (industryCache && (now - industryCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached industry news data');
      return res.status(200).json({
        success: true,
        data: industryCache.data,
        cached: true,
        timestamp: new Date(industryCache.timestamp).toISOString(),
      } as ApiResponse);
    }

    // 获取行业公司资讯
    const data = await fetchIndustryNews();

    // 更新缓存
    industryCache = {
      data,
      timestamp: now,
    };

    console.log(`Fetched ${data.length} industry news items`);

    return res.status(200).json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Industry News API Error:', error);

    // 如果出错，尝试返回缓存数据（如果有）
    if (industryCache) {
      console.log('Returning cached data due to error');
      return res.status(200).json({
        success: true,
        data: industryCache.data,
        cached: true,
        timestamp: new Date(industryCache.timestamp).toISOString(),
        warning: 'Using cached data due to API error',
      } as ApiResponse);
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch industry news',
      data: [],
    } as ApiResponse);
  }
}
