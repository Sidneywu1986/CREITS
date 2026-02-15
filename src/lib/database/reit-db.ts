/**
 * REITs数据库服务类
 * 提供REITs八张表的数据库操作功能
 */

import { createClient } from '@supabase/supabase-js';

// 获取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. 产品信息接口
export interface REITProduct {
  fund_code: string;
  fund_name: string;
  fund_short_name: string;
  fund_type: string;
  asset_type: string;
  manager_name: string;
  custodian_name: string;
  operating_manager: string;
  issue_date: string;
  listing_date: string;
  issue_price: number;
  issue_amount: number;
  fund_shares: number;
  management_fee_rate: number;
  custody_fee_rate: number;
  investment_scope: string;
}

// 2. 资产信息接口
export interface REITProperty {
  property_id: number;
  fund_code: string;
  property_name: string;
  city: string;
  district: string;
  address: string;
  property_type: string;
  building_area: number;
  leasable_area: number;
  valuation_date: string;
  appraised_value: number;
  value_per_sqm: number;
  tenant_count: number;
  occupancy_rate: number;
  average_rent: number;
  weighted_lease_term: number;
  expiration_date: string;
}

// 3. 财务指标接口
export interface REITFinancialMetrics {
  id: number;
  fund_code: string;
  report_period: string;
  total_revenue: number;
  operating_revenue: number;
  net_profit: number;
  total_assets: number;
  net_assets: number;
  fund_nav_per_share: number;
  distributeable_amount: number;
  distribution_per_share: number;
}

// 4. 运营数据接口
export interface REITOperationalData {
  id: number;
  fund_code: string;
  report_period: string;
  occupancy_rate: number;
  cap_rate: number;
  average_rent: number;
  rent_growth_rate: number;
  operating_expense: number;
  expense_ratio: number;
  top_ten_tenant_concentration: number;
  tenant_turnover_rate: number;
}

// 5. 市场表现接口
export interface REITMarketPerformance {
  id: number;
  fund_code: string;
  trade_date: string;
  opening_price: number;
  closing_price: number;
  highest_price: number;
  lowest_price: number;
  turnover: number;
  volume: number;
  turnover_rate: number;
  market_cap: number;
  daily_return: number;
  nav_premium_rate: number;
}

// 6. 投资者结构接口
export interface REITInvestorStructure {
  id: number;
  fund_code: string;
  report_period: string;
  investor_type: string;
  holder_count: number;
  holding_shares: number;
  holding_ratio: number;
  avg_holding_per_investor: number;
}

// 7. 分红历史接口
export interface REITDividendHistory {
  id: number;
  fund_code: string;
  dividend_year: number;
  dividend_round: number;
  record_date: string;
  ex_dividend_date: string;
  dividend_payment_date: string;
  dividend_per_share: number;
  total_dividend: number;
  dividend_yield: number;
}

// 8. 风险指标接口
export interface REITRiskMetrics {
  id: number;
  fund_code: string;
  report_period: string;
  debt_ratio: number;
  debt_asset_ratio: number;
  volatility_30d: number;
  volatility_60d: number;
  volatility_90d: number;
  property_concentration: number;
  tenant_concentration: number;
  geographic_concentration: number;
  liquidity_ratio: number;
  credit_rating: string;
}

export class REITDatabaseService {
  /**
   * 获取所有REITs产品
   */
  async getAllProducts(): Promise<REITProduct[]> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .select('*')
      .order('listing_date', { ascending: false });

    if (error) {
      console.error('获取REITs产品失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 根据基金代码获取产品详情
   */
  async getProductByCode(fundCode: string): Promise<REITProduct | null> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .select('*')
      .eq('fund_code', fundCode)
      .single();

    if (error) {
      console.error('获取产品详情失败:', error);
      throw error;
    }

    return data;
  }

  /**
   * 获取产品的资产信息
   */
  async getPropertiesByFundCode(fundCode: string): Promise<REITProperty[]> {
    const { data, error } = await supabase
      .from('reit_property_info')
      .select('*')
      .eq('fund_code', fundCode)
      .eq('expiration_date', '9999-12-12')
      .order('property_id', { ascending: true });

    if (error) {
      console.error('获取资产信息失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 获取产品的财务指标
   */
  async getFinancialMetricsByFundCode(fundCode: string): Promise<REITFinancialMetrics[]> {
    const { data, error } = await supabase
      .from('reit_financial_metrics')
      .select('*')
      .eq('fund_code', fundCode)
      .order('report_period', { ascending: false });

    if (error) {
      console.error('获取财务指标失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 获取产品的运营数据
   */
  async getOperationalDataByFundCode(fundCode: string): Promise<REITOperationalData[]> {
    const { data, error } = await supabase
      .from('reit_operational_data')
      .select('*')
      .eq('fund_code', fundCode)
      .order('report_period', { ascending: false });

    if (error) {
      console.error('获取运营数据失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 获取产品的市场表现数据
   */
  async getMarketPerformanceByFundCode(fundCode: string, limit: number = 30): Promise<REITMarketPerformance[]> {
    const { data, error } = await supabase
      .from('reit_market_performance')
      .select('*')
      .eq('fund_code', fundCode)
      .order('trade_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取市场表现数据失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 获取产品的投资者结构
   */
  async getInvestorStructureByFundCode(fundCode: string): Promise<REITInvestorStructure[]> {
    const { data, error } = await supabase
      .from('reit_investor_structure')
      .select('*')
      .eq('fund_code', fundCode)
      .order('report_period', { ascending: false })
      .limit(4);

    if (error) {
      console.error('获取投资者结构失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 获取产品的分红历史
   */
  async getDividendHistoryByFundCode(fundCode: string): Promise<REITDividendHistory[]> {
    const { data, error } = await supabase
      .from('reit_dividend_history')
      .select('*')
      .eq('fund_code', fundCode)
      .order('dividend_year', { ascending: false })
      .order('dividend_round', { ascending: false });

    if (error) {
      console.error('获取分红历史失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 获取产品的风险指标
   */
  async getRiskMetricsByFundCode(fundCode: string): Promise<REITRiskMetrics[]> {
    const { data, error } = await supabase
      .from('reit_risk_metrics')
      .select('*')
      .eq('fund_code', fundCode)
      .order('report_period', { ascending: false })
      .limit(4);

    if (error) {
      console.error('获取风险指标失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 搜索产品
   */
  async searchProducts(keyword: string): Promise<REITProduct[]> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .select('*')
      .or(`fund_code.ilike.%${keyword}%,fund_short_name.ilike.%${keyword}%,fund_name.ilike.%${keyword}%,manager_name.ilike.%${keyword}%`)
      .order('listing_date', { ascending: false });

    if (error) {
      console.error('搜索产品失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 按产品类型获取产品
   */
  async getProductsByType(fundType: string): Promise<REITProduct[]> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .select('*')
      .eq('fund_type', fundType)
      .order('listing_date', { ascending: false });

    if (error) {
      console.error('按类型获取产品失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 按资产类型获取产品
   */
  async getProductsByAssetType(assetType: string): Promise<REITProduct[]> {
    const { data, error } = await supabase
      .from('reit_product_info')
      .select('*')
      .eq('asset_type', assetType)
      .order('listing_date', { ascending: false });

    if (error) {
      console.error('按资产类型获取产品失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 获取统计数据
   */
  async getStatistics() {
    try {
      // 获取总产品数
      const { count: totalProducts } = await supabase
        .from('reit_product_info')
        .select('*', { count: 'exact', head: true });

      // 获取总规模
      const { data: scaleData } = await supabase
        .from('reit_product_info')
        .select('issue_amount');

      const totalScale = scaleData?.reduce((sum, p) => sum + (p.issue_amount || 0), 0) || 0;

      // 按产品类型统计
      const { data: typeData } = await supabase
        .from('reit_product_info')
        .select('fund_type');

      const typeCounts = typeData?.reduce((acc, p) => {
        acc[p.fund_type] = (acc[p.fund_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 按资产类型统计
      const { data: assetData } = await supabase
        .from('reit_product_info')
        .select('asset_type');

      const assetCounts = assetData?.reduce((acc, p) => {
        acc[p.asset_type] = (acc[p.asset_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalProducts,
        totalScale,
        typeCounts,
        assetCounts,
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const reitDatabase = new REITDatabaseService();
