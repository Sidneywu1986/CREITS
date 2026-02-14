/**
 * 简化版真实数据获取服务
 * 使用免费API获取实时行情，每30秒自动刷新
 */

import { REAL_REITS_PRODUCTS, getAllREITsCodes } from '@/lib/data/real-reits-products';
import { REAL_ABS_PRODUCTS, getAllABSCodes } from '@/lib/data/real-abs-products';
import { REAL_ISSUANCE_PROJECTS } from '@/lib/data/real-issuance-projects';

export interface Quote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  updateTime: string;
}

export interface REITsWithQuote {
  id: string;
  code: string;
  name: string;
  issuer: string;
  assetType: string;
  location: string;
  issueDate: string;
  listingDate: string;
  issuePrice: number;
  issueScale: number;
  assets: string[];
  description: string;
  quote?: Quote;
}

export interface ABSWithQuote {
  id: string;
  code: string;
  name: string;
  issuer: string;
  planManager: string;
  issueDate: string;
  issueScale: number;
  underlyingAssets: string[];
  rating: string;
  couponRate: number;
  term: string;
  description: string;
  quote?: Quote;
}

/**
 * 从新浪财经获取实时行情（免费API）
 * 接口说明：http://vip.stock.finance.sina.com.cn/corp/go.php/vCB_AllStock/stockid/600588.phtml
 * 数据格式：s_code,open,preclose,close,high,low,volume,amount,date
 */
async function fetchSinaQuote(code: string): Promise<Quote | null> {
  try {
    // 新浪财经API（免费，无需认证）
    // 上海：sh+code, 深圳：sz+code
    const prefix = code.startsWith('508') || code.startsWith('588') ? 'sh' : 'sz';
    const url = `https://hq.sinajs.cn/list=${prefix}${code}`;

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: controller.signal,
      next: { revalidate: 60 }, // 60秒缓存
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    // 解析数据: var hq_str_sh508000="沪杭甬REIT,8.50,8.60,8.55,8.65,8.45,1234567,12345678,2024-01-01";
    const match = text.match(/="([^"]+)"/);
    if (!match) {
      console.warn(`无法解析 ${code} 的行情数据`);
      return null;
    }

    const data = match[1].split(',');
    if (data.length < 9) {
      console.warn(`${code} 数据格式不正确`);
      return null;
    }

    const name = data[0];
    const open = parseFloat(data[1]);
    const preClose = parseFloat(data[2]);
    const close = parseFloat(data[3]);
    const high = parseFloat(data[4]);
    const low = parseFloat(data[5]);
    const volume = parseFloat(data[6]);
    const amount = parseFloat(data[7]);
    const date = data[8];

    const change = close - preClose;
    const changePercent = (change / preClose) * 100;

    return {
      code,
      name,
      price: close,
      change,
      changePercent,
      open,
      high,
      low,
      volume,
      updateTime: date,
    };
  } catch (error) {
    console.error(`获取 ${code} 行情数据失败:`, error);
    return null;
  }
}

/**
 * 获取REITs产品列表（含行情）
 */
export async function getREITsWithQuotes(): Promise<REITsWithQuote[]> {
  // 获取所有产品基本信息
  const products = [...REAL_REITS_PRODUCTS];

  // 并发获取行情数据
  const quotesPromises = products.map(async (product) => {
    const quote = await fetchSinaQuote(product.code);
    return { product, quote };
  });

  const results = await Promise.all(quotesPromises);

  // 组合数据
  return results.map(({ product, quote }) => ({
    ...product,
    quote: quote || undefined,
  }));
}

/**
 * 获取单个REITs产品详情（含行情）
 */
export async function getREITsDetail(code: string): Promise<REITsWithQuote | null> {
  const product = REAL_REITS_PRODUCTS.find(p => p.code === code);
  if (!product) return null;

  const quote = await fetchSinaQuote(code);

  return {
    ...product,
    quote: quote || undefined,
  };
}

/**
 * 获取ABS产品列表（使用模拟行情，因为ABS通常没有实时行情）
 */
export async function getABSServices(): Promise<ABSWithQuote[]> {
  return REAL_ABS_PRODUCTS.map(product => ({
    ...product,
    // ABS使用固定利率，不计算实时行情
    quote: {
      code: product.code,
      name: product.name,
      price: 100.00, // 债券通常按面值100元交易
      change: 0,
      changePercent: 0,
      open: 100.00,
      high: 100.00,
      low: 100.00,
      volume: 0,
      updateTime: new Date().toISOString().split('T')[0],
    },
  }));
}

/**
 * 获取单个ABS产品详情
 */
export async function getABSDetail(code: string): Promise<ABSWithQuote | null> {
  const product = REAL_ABS_PRODUCTS.find(p => p.code === code);
  if (!product) return null;

  return {
    ...product,
    quote: {
      code: product.code,
      name: product.name,
      price: 100.00,
      change: 0,
      changePercent: 0,
      open: 100.00,
      high: 100.00,
      low: 100.00,
      volume: 0,
      updateTime: new Date().toISOString().split('T')[0],
    },
  };
}

/**
 * 获取发行项目列表
 */
export async function getIssuanceProjects() {
  return REAL_ISSUANCE_PROJECTS;
}

/**
 * 获取发行项目详情
 */
export async function getIssuanceProjectDetail(id: string) {
  return REAL_ISSUANCE_PROJECTS.find(p => p.id === id);
}

/**
 * 获取市场行情概览
 */
export async function getMarketOverview() {
  // 获取所有REITs的行情
  const reitsWithQuotes = await getREITsWithQuotes();
  const validQuotes = reitsWithQuotes.filter(r => r.quote).map(r => r.quote!);

  if (validQuotes.length === 0) {
    return {
      reitsCount: REAL_REITS_PRODUCTS.length,
      absCount: REAL_ABS_PRODUCTS.length,
      issuingCount: REAL_ISSUANCE_PROJECTS.filter(p => p.status !== '上市/挂牌').length,
      reitsIndex: 1000.00,
      reitsChange: 0,
      reitsChangePercent: 0,
      updateTime: new Date().toISOString().split('T')[0],
    };
  }

  // 计算REITs指数（简单平均）
  const avgChangePercent = validQuotes.reduce((sum, q) => sum + q.changePercent, 0) / validQuotes.length;
  const baseIndex = 1000.00;
  const reitsIndex = baseIndex * (1 + avgChangePercent / 100);

  return {
    reitsCount: REAL_REITS_PRODUCTS.length,
    absCount: REAL_ABS_PRODUCTS.length,
    issuingCount: REAL_ISSUANCE_PROJECTS.filter(p => p.status !== '上市/挂牌').length,
    reitsIndex: Number(reitsIndex.toFixed(2)),
    reitsChange: Number(reitsIndex - baseIndex),
    reitsChangePercent: Number(avgChangePercent.toFixed(2)),
    updateTime: new Date().toISOString().split('T')[0],
  };
}

/**
 * 根据ID获取REITs产品详情
 */
export async function getREITsProductById(id: string): Promise<REITsWithQuote | null> {
  const product = REAL_REITS_PRODUCTS.find(p => p.id === id);
  if (!product) return null;

  const quote = await fetchSinaQuote(product.code);

  return {
    ...product,
    quote: quote || undefined,
  };
}
