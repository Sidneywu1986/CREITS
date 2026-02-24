import type { NextApiRequest, NextApiResponse } from 'next';

// 定义新闻数据接口
interface TiingoNewsItem {
  title: string;
  description: string;
  publishedDate: string;
  source: string;
  tags: string[];
  url: string;
  tickers?: string[];
}

interface NewsResponse {
  id: number;
  title: string;
  source: string;
  category: 'national' | 'exchange' | 'industry';
  date: string;
  views: number;
  summary: string;
  tags: string[];
  url: string;
}

// 缓存接口
interface CacheData {
  data: NewsResponse[];
  timestamp: number;
}

// 内存缓存
let newsCache: CacheData | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存（毫秒）

// Tiingo API 配置
const TIINGO_API_KEY = process.env.TIINGO_API_KEY || '';
const TIINGO_API_URL = 'https://api.tiingo.com/tiingo/news';

// 获取 Tiingo API 数据
async function fetchTiingoNews(): Promise<TiingoNewsItem[]> {
  try {
    const tags = ['reits', 'abs', 'realestate', 'infrastructure', 'mortgage'];
    const params = new URLSearchParams({
      tags: tags.join(','),
      limit: '50',
      sortBy: 'publishedDate',
      sortOrder: 'desc',
    });

    const response = await fetch(`${TIINGO_API_URL}?${params}`, {
      headers: {
        'Authorization': `Token ${TIINGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Next.js 缓存 5 分钟
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tiingo API Error:', response.status, errorText);
      throw new Error(`Tiingo API error: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Failed to fetch Tiingo news:', error);
    throw error;
  }
}

// 转换数据格式
function transformNewsItem(item: TiingoNewsItem, index: number): NewsResponse {
  // 根据来源判断分类
  let category: 'national' | 'exchange' | 'industry' = 'industry';

  const source = item.source.toLowerCase();
  if (source.includes('sec') || source.includes('commission') || source.includes('government') ||
      source.includes('treasury') || source.includes('congress') || source.includes('senate')) {
    category = 'national';
  } else if (source.includes('exchange') || source.includes('nasdaq') || source.includes('nyse')) {
    category = 'exchange';
  } else {
    category = 'industry';
  }

  // 格式化日期
  const publishedDate = new Date(item.publishedDate);
  const date = publishedDate.toISOString().replace('T', ' ').substring(0, 16);

  return {
    id: index,
    title: item.title,
    source: item.source,
    category,
    date,
    views: Math.floor(Math.random() * 10000) + 1000, // 模拟阅读量
    summary: item.description || item.title,
    tags: item.tags || [],
    url: item.url,
  };
}

// 主处理函数
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 检查缓存
    const now = Date.now();
    if (newsCache && (now - newsCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached news data');
      return res.status(200).json({
        success: true,
        data: newsCache.data,
        cached: true,
        timestamp: new Date(newsCache.timestamp).toISOString(),
      });
    }

    // 检查 API Key
    if (!TIINGO_API_KEY) {
      console.error('Tiingo API Key not configured');
      return res.status(500).json({
        success: false,
        error: 'Tiingo API Key not configured. Please set TIINGO_API_KEY environment variable.',
        data: [],
      });
    }

    // 获取新闻数据
    const tiingoData = await fetchTiingoNews();

    // 转换数据格式
    const transformedData = tiingoData.map((item, index) => transformNewsItem(item, index));

    // 更新缓存
    newsCache = {
      data: transformedData,
      timestamp: now,
    };

    console.log(`Fetched ${transformedData.length} news items from Tiingo`);

    return res.status(200).json({
      success: true,
      data: transformedData,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('News API Error:', error);

    // 如果出错，尝试返回缓存数据（如果有）
    if (newsCache) {
      console.log('Returning cached data due to error');
      return res.status(200).json({
        success: true,
        data: newsCache.data,
        cached: true,
        timestamp: new Date(newsCache.timestamp).toISOString(),
        warning: 'Using cached data due to API error',
      });
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch news',
      data: [],
    });
  }
}
