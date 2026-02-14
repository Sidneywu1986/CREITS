// lib/services/data-sync-service.ts
/**
 * 金融数据同步服务
 * 支持多种数据源：Tushare、东方财富、爬虫等
 */

import axios from 'axios';
import { Redis } from 'ioredis';

// 数据接口定义
export interface Product {
  id: string;
  code: string;
  name: string;
  type: 'REITs' | 'ABS';
  status: string;
  issueDate: string;
  issuePrice: number;
  currentPrice: number;
  changePercent: number;
}

export interface Quote {
  code: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
  timestamp: Date;
}

export interface FinancialData {
  code: string;
  period: string;
  totalRevenue: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  operatingIncome: number;
  timestamp: Date;
}

export class DataSyncService {
  private redis: Redis;
  private tushareToken: string;
  private eastmoneyKey?: string;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.tushareToken = process.env.TUSHARE_TOKEN || '';
    this.eastmoneyKey = process.env.EASTMONEY_API_KEY;
  }

  /**
   * 获取REITs产品列表
   * 数据源：Tushare API
   */
  async getREITsProducts(): Promise<Product[]> {
    try {
      // 先尝试从Redis缓存获取
      const cached = await this.redis.get('reits:products:list');
      if (cached) {
        return JSON.parse(cached);
      }

      // 调用Tushare API
      const response = await axios.get('https://api.tushare.pro', {
        params: {
          api_name: 'daily',
          token: this.tushareToken,
          params: JSON.stringify({
            ts_code: '',
            trade_date: '',
            start_date: '',
            end_date: ''
          }),
          fields: 'ts_code,trade_date,open,high,low,close,pre_close,chg,pct_chg,vol,amount'
        }
      });

      const data = response.data.data;
      const products = data.items.map((item: any[]) => ({
        id: item[0],
        code: item[0],
        name: this.getREITsName(item[0]),
        type: 'REITs' as const,
        status: '交易中',
        issueDate: item[1],
        issuePrice: 0,
        currentPrice: item[5],
        changePercent: item[7],
      }));

      // 缓存1小时
      await this.redis.setex('reits:products:list', 3600, JSON.stringify(products));

      return products;
    } catch (error) {
      console.error('获取REITs产品列表失败:', error);
      return [];
    }
  }

  /**
   * 获取实时行情数据
   * 数据源：新浪财经API（免费）
   */
  async getRealtimeQuotes(codes: string[]): Promise<Quote[]> {
    try {
      // 新浪财经实时行情接口
      const response = await axios.get('http://hq.sinajs.cn/list=' + codes.join(','));
      const quotes: Quote[] = [];

      const data = response.data.split('\n').filter((line: string) => line.trim());
      
      for (const line of data) {
        const match = line.match(/var hq_str_(.+?)="(.+?)";/);
        if (match) {
          const code = match[1];
          const values = match[2].split(',');
          
          quotes.push({
            code,
            name: values[0],
            currentPrice: parseFloat(values[3]) || 0,
            change: parseFloat(values[3]) - parseFloat(values[2]) || 0,
            changePercent: ((parseFloat(values[3]) - parseFloat(values[2])) / parseFloat(values[2])) * 100 || 0,
            volume: parseInt(values[8]) || 0,
            amount: parseInt(values[9]) || 0,
            timestamp: new Date(),
          });
        }
      }

      // 缓存5秒
      await this.redis.setex('quotes:realtime', 5, JSON.stringify(quotes));

      return quotes;
    } catch (error) {
      console.error('获取实时行情失败:', error);
      return [];
    }
  }

  /**
   * 获取财务数据
   * 数据源：东方财富API
   */
  async getFinancialData(code: string, period: string = '2024'): Promise<FinancialData | null> {
    try {
      // 先尝试从Redis缓存获取
      const cacheKey = `financial:${code}:${period}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // 调用东方财富API
      const response = await axios.get('https://emdata.eastmoney.com/data/EM_DataCenter/JS/Data/data', {
        params: {
          type: 'RPTA_LICO_FN_CPA',
          sty: 'ALL',
          filter: `(SECURITY_CODE="${code}")(REPORT_DATE='${period}1231')`,
          p: 1,
          ps: 50,
          sr: 1,
          st: 'REPORT_DATE',
          mark: 'reportData'
        }
      });

      const data = response.data;
      const financialData: FinancialData = {
        code,
        period,
        totalRevenue: data.OPERATE_INCOME || 0,
        netProfit: data.PARENT_NETPROFIT || 0,
        totalAssets: data.TOTAL_ASSETS || 0,
        totalLiabilities: data.TOTAL_LIABILITY || 0,
        operatingIncome: data.OPERATE_INCOME || 0,
        timestamp: new Date(),
      };

      // 缓存1天
      await this.redis.setex(cacheKey, 86400, JSON.stringify(financialData));

      return financialData;
    } catch (error) {
      console.error('获取财务数据失败:', error);
      return null;
    }
  }

  /**
   * 获取新闻资讯
   * 数据源：东方财富网
   */
  async getNewsData(limit: number = 20): Promise<any[]> {
    try {
      const response = await axios.get('https://np-anotice-stock.eastmoney.com/api/security/ann', {
        params: {
          sr: '-1',
          page_size: limit,
          page_index: 1,
          ann_type: 'A',
          client_source: 'web',
          f_node: '0',
          s_node: '0'
        }
      });

      return response.data.data.list;
    } catch (error) {
      console.error('获取新闻数据失败:', error);
      return [];
    }
  }

  /**
   * 辅助方法：根据代码获取REITs名称
   */
  private getREITsName(code: string): string {
    const nameMap: Record<string, string> = {
      '508000': '沪杭甬高速REIT',
      '508001': '普洛斯REIT',
      '508002': '首钢绿能REIT',
      '508003': '越秀租赁REIT',
      '508005': '张江REIT',
      '508006': '首创水务REIT',
      '508007': '苏州产业园REIT',
      '508008': '中关村REIT',
      '508009': '安徽交控REIT',
      '508010': '广州产业园REIT',
    };
    return nameMap[code] || `REITs-${code}`;
  }

  /**
   * 检查数据更新状态
   */
  async checkUpdateStatus(): Promise<{ lastSync: Date; nextSync: Date; status: 'ok' | 'delayed' }> {
    const lastSyncStr = await this.redis.get('sync:last_time');
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : new Date(0);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSync.getTime()) / 1000 / 60;

    return {
      lastSync,
      nextSync: new Date(now.getTime() + 5 * 60 * 1000), // 5分钟后
      status: diffMinutes < 10 ? 'ok' : 'delayed',
    };
  }
}

// 导出单例
export const dataSyncService = new DataSyncService();
