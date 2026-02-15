/**
 * REITs数据库服务
 * 使用Supabase作为数据库后端
 */

import { supabase } from '../services/supabase';
import type {
  REITProductInfo,
  REITPropertyBase,
  REITPropertyEquityOps,
  REITPropertyConcessionOps,
  REITFinancialMetrics,
  REITValuation,
  REITRiskCompliance,
  REITMarketStats,
  REITProductFull,
  REITProductQuery,
  FinancialMetricsQuery,
  MarketStatsQuery,
} from './types';

export class REITsDatabaseService {
  // =====================================================
  // 1. 产品基本信息操作
  // =====================================================

  /**
   * 获取所有REITs产品
   */
  async getAllProducts(query?: REITProductQuery): Promise<REITProductInfo[]> {
    try {
      let dbQuery = supabase.from('reit_product_info').select('*');

      // 添加查询条件
      if (query?.reit_code) {
        dbQuery = dbQuery.eq('reit_code', query.reit_code);
      }
      if (query?.asset_type_national) {
        dbQuery = dbQuery.eq('asset_type_national', query.asset_type_national);
      }
      if (query?.asset_type_csrc) {
        dbQuery = dbQuery.eq('asset_type_csrc', query.asset_type_csrc);
      }

      // 分页
      if (query?.limit) {
        dbQuery = dbQuery.limit(query.limit);
      }
      if (query?.offset) {
        dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);
      }

    const { data, error } = await dbQuery.order('listing_date', { ascending: false });

    if (error) {
      console.error('获取产品列表失败:', error);
      throw new Error(`获取产品列表失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 根据代码获取单个产品信息
   */
  async getProductByCode(reitCode: string): Promise<REITProductInfo | null> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .select('*')
      .eq('reit_code', reitCode)
      .single();

    if (error) {
      console.error('获取产品信息失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 创建产品信息
   */
  async createProductInfo(product: REITProductInfo): Promise<REITProductInfo> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('创建产品信息失败:', error);
      throw new Error(`创建产品信息失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新产品信息
   */
  async updateProductInfo(
    reitCode: string,
    updates: Partial<REITProductInfo>
  ): Promise<REITProductInfo> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .update(updates)
      .eq('reit_code', reitCode)
      .select()
      .single();

    if (error) {
      console.error('更新产品信息失败:', error);
      throw new Error(`更新产品信息失败: ${error.message}`);
    }

    return data;
  }

  // =====================================================
  // 2. 底层资产信息操作
  // =====================================================

  /**
   * 获取产品的所有资产
   */
  async getPropertiesByCode(reitCode: string): Promise<REITPropertyBase[]> {
    const { data, error } = await supabase
      .from('reit_property_base')
      .select('*')
      .eq('reit_code', reitCode)
      .order('effective_date', { ascending: false });

    if (error) {
      console.error('获取资产信息失败:', error);
      throw new Error(`获取资产信息失败: ${error.message}`);
    }

    // 过滤出最新的有效记录（去重）
    const uniqueProperties = new Map<string, REITPropertyBase>();
    data?.forEach((property) => {
      if (!uniqueProperties.has(property.property_id)) {
        uniqueProperties.set(property.property_id, property);
      }
    });

    return Array.from(uniqueProperties.values());
  }

  /**
   * 创建资产信息
   */
  async createPropertyInfo(property: REITPropertyBase): Promise<REITPropertyBase> {
    const { data, error } = await supabase
      .from('reit_property_base')
      .insert(property)
      .select()
      .single();

    if (error) {
      console.error('创建资产信息失败:', error);
      throw new Error(`创建资产信息失败: ${error.message}`);
    }

    return data;
  }

  // =====================================================
  // 3. 财务指标操作
  // =====================================================

  /**
   * 获取产品的财务指标
   */
  async getFinancialMetrics(query: FinancialMetricsQuery): Promise<REITFinancialMetrics[]> {
    let dbQuery = supabase
      .from('reit_financial_metrics')
      .select('*')
      .eq('reit_code', query.reit_code);

    if (query.start_date) {
      dbQuery = dbQuery.gte('report_date', query.start_date.toISOString());
    }
    if (query.end_date) {
      dbQuery = dbQuery.lte('report_date', query.end_date.toISOString());
    }
    if (query.report_type) {
      dbQuery = dbQuery.eq('report_type', query.report_type);
    }

    const { data, error } = await dbQuery.order('report_date', { ascending: false });

    if (error) {
      console.error('获取财务指标失败:', error);
      throw new Error(`获取财务指标失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 获取最新的财务指标
   */
  async getLatestFinancialMetrics(reitCode: string): Promise<REITFinancialMetrics | null> {
    const { data, error } = await supabase
      .from('reit_financial_metrics')
      .select('*')
      .eq('reit_code', reitCode)
      .order('report_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('获取最新财务指标失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 创建财务指标
   */
  async createFinancialMetrics(metrics: REITFinancialMetrics): Promise<REITFinancialMetrics> {
    const { data, error } = await supabase
      .from('reit_financial_metrics')
      .insert(metrics)
      .select()
      .single();

    if (error) {
      console.error('创建财务指标失败:', error);
      throw new Error(`创建财务指标失败: ${error.message}`);
    }

    return data;
  }

  // =====================================================
  // 4. 估值信息操作
  // =====================================================

  /**
   * 获取产品的估值信息
   */
  async getValuations(reitCode: string, limit = 10): Promise<REITValuation[]> {
    const { data, error } = await supabase
      .from('reit_valuation')
      .select('*')
      .eq('reit_code', reitCode)
      .order('valuation_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取估值信息失败:', error);
      throw new Error(`获取估值信息失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 获取最新的估值信息
   */
  async getLatestValuation(reitCode: string): Promise<REITValuation | null> {
    const { data, error } = await supabase
      .from('reit_valuation')
      .select('*')
      .eq('reit_code', reitCode)
      .order('valuation_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('获取最新估值信息失败:', error);
      return null;
    }

    return data;
  }

  // =====================================================
  // 5. 市场表现操作
  // =====================================================

  /**
   * 获取市场表现数据
   */
  async getMarketStats(query: MarketStatsQuery): Promise<REITMarketStats[]> {
    let dbQuery = supabase.from('reit_market_stats').select('*');

    if (query.reit_code) {
      dbQuery = dbQuery.eq('reit_code', query.reit_code);
    }
    if (query.start_date) {
      dbQuery = dbQuery.gte('trade_date', query.start_date.toISOString());
    }
    if (query.end_date) {
      dbQuery = dbQuery.lte('trade_date', query.end_date.toISOString());
    }

    // 排序
    const sortColumn = query.sort_by || 'trade_date';
    const ascending = query.order === 'asc';
    dbQuery = dbQuery.order(sortColumn, { ascending });

    const { data, error } = await dbQuery;

    if (error) {
      console.error('获取市场表现数据失败:', error);
      throw new Error(`获取市场表现数据失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 获取最新市场数据
   */
  async getLatestMarketStats(reitCode: string): Promise<REITMarketStats | null> {
    const { data, error } = await supabase
      .from('reit_market_stats')
      .select('*')
      .eq('reit_code', reitCode)
      .order('trade_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('获取最新市场数据失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 获取所有产品的最新市场数据（用于列表页）
   */
  async getAllLatestMarketStats(): Promise<Map<string, REITMarketStats>> {
    const { data, error } = await supabase
      .from('reit_market_stats')
      .select('*')
      .order('trade_date', { ascending: false });

    if (error) {
      console.error('获取所有市场数据失败:', error);
      return new Map();
    }

    // 去重，保留每个产品的最新数据
    const latestStats = new Map<string, REITMarketStats>();
    data?.forEach((stat) => {
      if (!latestStats.has(stat.reit_code)) {
        latestStats.set(stat.reit_code, stat);
      }
    });

    return latestStats;
  }

  // =====================================================
  // 6. 风险合规操作
  // =====================================================

  /**
   * 获取风险合规信息
   */
  async getRiskCompliance(reitCode: string): Promise<REITRiskCompliance | null> {
    const { data, error } = await supabase
      .from('reit_risk_compliance')
      .select('*')
      .eq('reit_code', reitCode)
      .order('info_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('获取风险合规信息失败:', error);
      return null;
    }

    return data;
  }

  // =====================================================
  // 7. 完整产品信息获取
  // =====================================================

  /**
   * 获取产品的完整信息（包含所有相关数据）
   */
  async getFullProductInfo(reitCode: string): Promise<REITProductFull | null> {
    try {
      // 并行获取所有数据
      const [
        productInfo,
        properties,
        financialMetrics,
        valuations,
        riskCompliance,
        marketStats,
      ] = await Promise.all([
        this.getProductByCode(reitCode),
        this.getPropertiesByCode(reitCode),
        this.getFinancialMetrics({ reit_code: reitCode }),
        this.getValuations(reitCode),
        this.getRiskCompliance(reitCode),
        this.getMarketStats({ reit_code: reitCode }),
      ]);

      if (!productInfo) {
        return null;
      }

      return {
        productInfo,
        properties,
        financialMetrics,
        valuations,
        riskCompliance,
        marketStats,
      };
    } catch (error) {
      console.error('获取完整产品信息失败:', error);
      throw new Error('获取完整产品信息失败');
    }
  }

  // =====================================================
  // 8. 批量操作
  // =====================================================

  /**
   * 批量创建产品信息
   */
  async batchCreateProducts(
    products: REITProductInfo[]
  ): Promise<REITProductInfo[]> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .insert(products)
      .select();

    if (error) {
      console.error('批量创建产品信息失败:', error);
      throw new Error(`批量创建产品信息失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 批量创建财务指标
   */
  async batchCreateFinancialMetrics(
    metrics: REITFinancialMetrics[]
  ): Promise<REITFinancialMetrics[]> {
    const { data, error } = await supabase
      .from('reit_financial_metrics')
      .insert(metrics)
      .select();

    if (error) {
      console.error('批量创建财务指标失败:', error);
      throw new Error(`批量创建财务指标失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 批量创建市场数据
   */
  async batchCreateMarketStats(
    stats: REITMarketStats[]
  ): Promise<REITMarketStats[]> {
    const { data, error } = await supabase
      .from('reit_market_stats')
      .insert(stats)
      .select();

    if (error) {
      console.error('批量创建市场数据失败:', error);
      throw new Error(`批量创建市场数据失败: ${error.message}`);
    }

    return data || [];
  }

  // =====================================================
  // 9. 统计查询
  // =====================================================

  /**
   * 获取REITs产品统计
   */
  async getProductStats(): Promise<{
    total: number;
    byAssetType: Record<string, number>;
    byManager: Record<string, number>;
  }> {
    // 获取所有产品
    const products = await this.getAllProducts();

    // 按资产类型统计
    const byAssetType: Record<string, number> = {};
    products.forEach((p) => {
      const type = p.asset_type_national || '未知';
      byAssetType[type] = (byAssetType[type] || 0) + 1;
    });

    // 按管理人统计
    const byManager: Record<string, number> = {};
    products.forEach((p) => {
      const manager = p.fund_manager || '未知';
      byManager[manager] = (byManager[manager] || 0) + 1;
    });

    return {
      total: products.length,
      byAssetType,
      byManager,
    };
  }

  /**
   * 获取市场规模统计
   */
  async getMarketSizeStats(): Promise<{
    totalFundSize: number;
    totalMarketCap: number;
    avgDistributionYield: number;
    totalProducts: number;
  }> {
    // 获取所有产品
    const products = await this.getAllProducts();

    // 获取最新市场数据
    const allMarketStats = await this.getAllLatestMarketStats();

    let totalFundSize = 0;
    let totalMarketCap = 0;
    let totalYield = 0;
    let yieldCount = 0;

    products.forEach((p) => {
      if (p.fund_size) {
        totalFundSize += p.fund_size;
      }

      const marketStat = allMarketStats.get(p.reit_code);
      if (marketStat) {
        if (marketStat.market_cap) {
          totalMarketCap += marketStat.market_cap;
        }
        if (marketStat.turnover_rate) {
          totalYield += marketStat.turnover_rate;
          yieldCount++;
        }
      }
    });

    return {
      totalFundSize,
      totalMarketCap,
      avgDistributionYield: yieldCount > 0 ? totalYield / yieldCount : 0,
      totalProducts: products.length,
    };
  }

  /**
   * 获取市场表现Top 10
   */
  async getTopPerformers(metric: 'market_cap' | 'daily_volume' | 'turnover_rate' | 'distribution_yield') {
    const allMarketStats = await this.getAllLatestMarketStats();

    // 转换为数组并排序
    const sorted = Array.from(allMarketStats.values()).sort((a, b) => {
      const valA = (a as any)[metric] || 0;
      const valB = (b as any)[metric] || 0;
      return valB - valA;
    });

    return sorted.slice(0, 10);
  }

  // =====================================================
  // 10. 搜索功能
  // =====================================================

  /**
   * 搜索产品
   */
  async searchProducts(keyword: string): Promise<REITProductInfo[]> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .select('*')
      .or(`reit_code.ilike.%${keyword}%,reit_short_name.ilike.%${keyword}%,fund_manager.ilike.%${keyword}%`);

    if (error) {
      console.error('搜索产品失败:', error);
      throw new Error(`搜索产品失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 搜索资产
   */
  async searchProperties(keyword: string): Promise<REITPropertyBase[]> {
    const { data, error } = await supabase
      .from('reit_property_base')
      .select('*')
      .or(`property_name.ilike.%${keyword}%,asset_address.ilike.%${keyword}%,location_city.ilike.%${keyword}%`)
      .order('effective_date', { ascending: false });

    if (error) {
      console.error('搜索资产失败:', error);
      throw new Error(`搜索资产失败: ${error.message}`);
    }

    // 去重，保留最新的记录
    const uniqueProperties = new Map<string, REITPropertyBase>();
    data?.forEach((property) => {
      if (!uniqueProperties.has(property.property_id)) {
        uniqueProperties.set(property.property_id, property);
      }
    });

    return Array.from(uniqueProperties.values());
  }

  // =====================================================
  // 11. 数据导出
  // =====================================================

  /**
   * 导出所有产品信息为CSV
   */
  async exportProductsToCSV(): Promise<string> {
    const products = await this.getAllProducts();

    if (products.length === 0) {
      return '';
    }

    // CSV头部
    const headers = Object.keys(products[0]).join(',');

    // CSV数据行
    const rows = products.map((p) =>
      Object.values(p)
        .map((v) => {
          // 转义引号和逗号
          const str = String(v ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * 导出市场数据为CSV
   */
  async exportMarketStatsToCSV(reitCode?: string): Promise<string> {
    let stats: REITMarketStats[];

    if (reitCode) {
      stats = await this.getMarketStats({ reit_code: reitCode });
    } else {
      const allStats = await this.getAllLatestMarketStats();
      stats = Array.from(allStats.values());
    }

    if (stats.length === 0) {
      return '';
    }

    // CSV头部
    const headers = Object.keys(stats[0]).join(',');

    // CSV数据行
    const rows = stats.map((s) =>
      Object.values(s)
        .map((v) => {
          const str = String(v ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    return [headers, ...rows].join('\n');
  }

  // =====================================================
  // 12. 数据清理
  // =====================================================

  /**
   * 删除产品及其相关数据
   */
  async deleteProduct(reitCode: string): Promise<boolean> {
    try {
      // 删除市场数据
      await supabase.from('reit_market_stats').delete().eq('reit_code', reitCode);

      // 删除财务数据
      await supabase.from('reit_financial_metrics').delete().eq('reit_code', reitCode);

      // 删除估值数据
      await supabase.from('reit_valuation').delete().eq('reit_code', reitCode);

      // 删除风险合规数据
      await supabase.from('reit_risk_compliance').delete().eq('reit_code', reitCode);

      // 删除资产数据
      const properties = await this.getPropertiesByCode(reitCode);
      for (const prop of properties) {
        await supabase.from('reit_property_equity_ops').delete().eq('property_id', prop.property_id);
        await supabase.from('reit_property_concession_ops').delete().eq('property_id', prop.property_id);
      }
      await supabase.from('reit_property_base').delete().eq('reit_code', reitCode);

      // 删除产品信息
      await supabase.from('reit_product_info').delete().eq('reit_code', reitCode);

      return true;
    } catch (error) {
      console.error('删除产品失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const reitsDB = new REITsDatabaseService();
