/**
 * CozeWebSearchService - 基于Coze Web Search的数据采集服务
 *
 * 用于采集政策和新闻数据
 */

import { SearchClient, Config, APIError } from "coze-coding-dev-sdk";

/**
 * 搜索类型
 */
export enum SearchType {
  POLICY = 'policy',
  NEWS = 'news'
}

/**
 * 搜索配置
 */
export interface SearchConfig {
  query: string;
  count?: number;
  timeRange?: string;  // "1d", "1w", "1m"
  sites?: string;      // 逗号分隔的网站列表
  needSummary?: boolean;
  needContent?: boolean;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  summary?: string;
  content?: string;
  siteName?: string;
  publishTime?: string;
  authorityLevel?: number;
  authorityDesc?: string;
  rankScore?: number;
}

/**
 * 搜索响应
 */
export interface SearchResponse {
  summary?: string;
  results: SearchResult[];
  total: number;
}

/**
 * CozeWebSearchService类
 */
export class CozeWebSearchService {
  private static instance: CozeWebSearchService;
  private client: SearchClient;

  private constructor() {
    const config = new Config();
    this.client = new SearchClient(config);
  }

  static getInstance(): CozeWebSearchService {
    if (!CozeWebSearchService.instance) {
      CozeWebSearchService.instance = new CozeWebSearchService();
    }
    return CozeWebSearchService.instance;
  }

  /**
   * 执行基本搜索
   */
  async basicSearch(query: string, count: number = 10, needSummary: boolean = true): Promise<SearchResponse> {
    console.log(`[CozeWebSearch] 执行基本搜索: ${query}`);

    try {
      const response = await this.client.webSearch(query, count, needSummary);

      return {
        summary: response.summary,
        results: response.web_items?.map(item => this.mapToSearchResult(item)) || [],
        total: response.web_items?.length || 0
      };
    } catch (error) {
      console.error('[CozeWebSearch] 基本搜索失败:', error);
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (Status: ${error.statusCode})`);
      }
      throw error;
    }
  }

  /**
   * 执行高级搜索（带筛选）
   */
  async advancedSearch(config: SearchConfig): Promise<SearchResponse> {
    console.log(`[CozeWebSearch] 执行高级搜索: ${config.query}`);

    try {
      const response = await this.client.advancedSearch(config.query, {
        count: config.count || 10,
        timeRange: config.timeRange,
        sites: config.sites,
        needSummary: config.needSummary ?? true,
        needContent: config.needContent ?? false,
        searchType: 'web'
      });

      return {
        summary: response.summary,
        results: response.web_items?.map(item => this.mapToSearchResult(item)) || [],
        total: response.web_items?.length || 0
      };
    } catch (error) {
      console.error('[CozeWebSearch] 高级搜索失败:', error);
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (Status: ${error.statusCode})`);
      }
      throw error;
    }
  }

  /**
   * 搜索政策数据
   */
  async searchPolicies(options: {
    keywords?: string[];
    timeRange?: string;
    count?: number;
  } = {}): Promise<SearchResponse> {
    const keywords = options.keywords || ['REITs', '公募REITs', '基础设施REITs'];
    const query = keywords.join(' ');

    console.log(`[CozeWebSearch] 搜索政策: ${query}`);

    return await this.advancedSearch({
      query,
      count: options.count || 10,
      timeRange: options.timeRange || '1m',
      sites: 'www.ndrc.gov.cn,www.csrc.gov.cn,www.szse.cn,www.sse.com.cn',
      needSummary: true,
      needContent: true
    });
  }

  /**
   * 搜索新闻数据
   */
  async searchNews(options: {
    keywords?: string[];
    timeRange?: string;
    count?: number;
  } = {}): Promise<SearchResponse> {
    const keywords = options.keywords || ['REITs', '公募REITs', 'REITs基金'];
    const query = keywords.join(' ');

    console.log(`[CozeWebSearch] 搜索新闻: ${query}`);

    return await this.advancedSearch({
      query,
      count: options.count || 10,
      timeRange: options.timeRange || '1d',
      needSummary: true,
      needContent: true
    });
  }

  /**
   * 搜索REITs相关数据（综合）
   */
  async searchREITs(options: {
    timeRange?: string;
    count?: number;
  } = {}): Promise<{
    policies: SearchResponse;
    news: SearchResponse;
  }> {
    console.log('[CozeWebSearch] 搜索REITs相关数据');

    // 并行搜索政策和新闻
    const [policies, news] = await Promise.all([
      this.searchPolicies({
        timeRange: options.timeRange || '1m',
        count: options.count || 10
      }),
      this.searchNews({
        timeRange: options.timeRange || '1d',
        count: options.count || 10
      })
    ]);

    return {
      policies,
      news
    };
  }

  /**
   * 实时搜索（最近24小时）
   */
  async realtimeSearch(query: string, count: number = 10): Promise<SearchResponse> {
    console.log(`[CozeWebSearch] 实时搜索: ${query}`);

    return await this.advancedSearch({
      query,
      count,
      timeRange: '1d',
      needSummary: true,
      needContent: true
    });
  }

  /**
   * 站点内搜索
   */
  async siteSearch(sites: string, query: string, count: number = 10): Promise<SearchResponse> {
    console.log(`[CozeWebSearch] 站点搜索: ${sites} - ${query}`);

    return await this.advancedSearch({
      query,
      count,
      sites,
      needSummary: true,
      needContent: true
    });
  }

  /**
   * 映射到SearchResult格式
   */
  private mapToSearchResult(item: any): SearchResult {
    return {
      id: item.id,
      title: item.title,
      url: item.url,
      snippet: item.snippet,
      summary: item.summary,
      content: item.content,
      siteName: item.site_name,
      publishTime: item.publish_time,
      authorityLevel: item.auth_info_level,
      authorityDesc: item.auth_info_des,
      rankScore: item.rank_score
    };
  }

  /**
   * 过滤结果（基于权威度）
   */
  filterByAuthority(results: SearchResult[], minLevel: number = 3): SearchResult[] {
    return results.filter(result =>
      result.authorityLevel && result.authorityLevel >= minLevel
    );
  }

  /**
   * 按时间排序
   */
  sortByTime(results: SearchResult[], order: 'asc' | 'desc' = 'desc'): SearchResult[] {
    return [...results].sort((a, b) => {
      const timeA = a.publishTime ? new Date(a.publishTime).getTime() : 0;
      const timeB = b.publishTime ? new Date(b.publishTime).getTime() : 0;

      return order === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }

  /**
   * 按相关度排序
   */
  sortByRank(results: SearchResult[], order: 'asc' | 'desc' = 'desc'): SearchResult[] {
    return [...results].sort((a, b) => {
      const rankA = a.rankScore || 0;
      const rankB = b.rankScore || 0;

      return order === 'asc' ? rankA - rankB : rankB - rankA;
    });
  }

  /**
   * 提取关键词
   */
  extractKeywords(results: SearchResult[]): string[] {
    const keywordMap = new Map<string, number>();

    results.forEach(result => {
      // 从标题和摘要中提取关键词
      const text = `${result.title} ${result.summary || ''} ${result.snippet}`;

      // 简单的关键词提取（可以改进）
      const words = text.split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          const count = keywordMap.get(word) || 0;
          keywordMap.set(word, count + 1);
        }
      });
    });

    // 返回前10个关键词
    return Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * 去重
   */
  deduplicate(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();

    return results.filter(result => {
      const key = result.url || result.title;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// 导出单例
export const cozeWebSearchService = CozeWebSearchService.getInstance();
