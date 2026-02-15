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
  // 模拟数据（当数据库没有数据时使用）
  private mockProducts: REITProduct[] = [
    {
      fund_code: '508000',
      fund_name: '华安张江光大园封闭式基础设施证券投资基金',
      fund_short_name: '张江REIT',
      fund_type: '产权类',
      asset_type: '产业园',
      manager_name: '华安基金管理有限公司',
      custodian_name: '招商银行股份有限公司',
      operating_manager: '上海张江高科技园区开发股份有限公司',
      issue_date: '2021-06-21',
      listing_date: '2021-06-21',
      issue_price: 3.000,
      issue_amount: 15.0000,
      fund_shares: 5.0000,
      management_fee_rate: 0.0045,
      custody_fee_rate: 0.0001,
      investment_scope: '基础设施项目支持证券投资',
    },
    {
      fund_code: '508001',
      fund_name: '浙江杭徽高速公路封闭式基础设施证券投资基金',
      fund_short_name: '杭徽高速REIT',
      fund_type: '经营权类',
      asset_type: '高速公路',
      manager_name: '鹏华基金管理有限公司',
      custodian_name: '中国工商银行股份有限公司',
      operating_manager: '浙江杭徽高速公路有限公司',
      issue_date: '2021-06-21',
      listing_date: '2021-06-21',
      issue_price: 5.000,
      issue_amount: 30.0000,
      fund_shares: 6.0000,
      management_fee_rate: 0.0040,
      custody_fee_rate: 0.0001,
      investment_scope: '高速公路基础设施项目投资',
    },
    {
      fund_code: '508002',
      fund_name: '东吴苏州工业园区产业园封闭式基础设施证券投资基金',
      fund_short_name: '苏州工业园REIT',
      fund_type: '产权类',
      asset_type: '产业园',
      manager_name: '东吴基金管理有限公司',
      custodian_name: '中国建设银行股份有限公司',
      operating_manager: '苏州工业园区国有资产控股发展有限公司',
      issue_date: '2021-12-30',
      listing_date: '2021-12-30',
      issue_price: 3.000,
      issue_amount: 34.9200,
      fund_shares: 9.0000,
      management_fee_rate: 0.0050,
      custody_fee_rate: 0.0001,
      investment_scope: '产业园基础设施项目投资',
    },
    {
      fund_code: '508003',
      fund_name: '富国首创水务封闭式基础设施证券投资基金',
      fund_short_name: '首创水务REIT',
      fund_type: '经营权类',
      asset_type: '污水处理',
      manager_name: '富国基金管理有限公司',
      custodian_name: '中国农业银行股份有限公司',
      operating_manager: '北京首创生态环保集团股份有限公司',
      issue_date: '2021-06-21',
      listing_date: '2021-06-21',
      issue_price: 3.700,
      issue_amount: 18.5000,
      fund_shares: 5.0000,
      management_fee_rate: 0.0038,
      custody_fee_rate: 0.0001,
      investment_scope: '水务基础设施项目投资',
    },
    {
      fund_code: '508004',
      fund_name: '红土创新盐田港仓储物流封闭式基础设施证券投资基金',
      fund_short_name: '盐田港REIT',
      fund_type: '产权类',
      asset_type: '仓储物流',
      manager_name: '红土创新基金管理有限公司',
      custodian_name: '上海浦东发展银行股份有限公司',
      operating_manager: '深圳市盐田港集团有限公司',
      issue_date: '2021-06-07',
      listing_date: '2021-06-07',
      issue_price: 2.300,
      issue_amount: 18.4000,
      fund_shares: 8.0000,
      management_fee_rate: 0.0042,
      custody_fee_rate: 0.0001,
      investment_scope: '仓储物流基础设施项目投资',
    },
    {
      fund_code: '508005',
      fund_name: '博时招商蛇口产业园封闭式基础设施证券投资基金',
      fund_short_name: '蛇口产园REIT',
      fund_type: '产权类',
      asset_type: '产业园',
      manager_name: '博时基金管理有限公司',
      custodian_name: '中国银行股份有限公司',
      operating_manager: '招商局蛇口工业区控股股份有限公司',
      issue_date: '2021-06-21',
      listing_date: '2021-06-21',
      issue_price: 2.310,
      issue_amount: 20.0000,
      fund_shares: 9.0000,
      management_fee_rate: 0.0048,
      custody_fee_rate: 0.0001,
      investment_scope: '产业园基础设施项目投资',
    },
    {
      fund_code: '508006',
      fund_name: '平安广州交投广河高速公路封闭式基础设施证券投资基金',
      fund_short_name: '广河高速REIT',
      fund_type: '经营权类',
      asset_type: '高速公路',
      manager_name: '平安基金管理有限公司',
      custodian_name: '中国建设银行股份有限公司',
      operating_manager: '广州交通投资集团有限公司',
      issue_date: '2021-12-14',
      listing_date: '2021-12-14',
      issue_price: 13.020,
      issue_amount: 91.1400,
      fund_shares: 7.0000,
      management_fee_rate: 0.0043,
      custody_fee_rate: 0.0001,
      investment_scope: '高速公路基础设施项目投资',
    },
    {
      fund_code: '508007',
      fund_name: '中金普洛斯仓储物流封闭式基础设施证券投资基金',
      fund_short_name: '普洛斯REIT',
      fund_type: '产权类',
      asset_type: '仓储物流',
      manager_name: '中金基金管理有限公司',
      custodian_name: '中国工商银行股份有限公司',
      operating_manager: '普洛斯（中国）投资有限公司',
      issue_date: '2021-06-21',
      listing_date: '2021-06-21',
      issue_price: 3.890,
      issue_amount: 58.3500,
      fund_shares: 15.0000,
      management_fee_rate: 0.0055,
      custody_fee_rate: 0.0001,
      investment_scope: '仓储物流基础设施项目投资',
    },
  ];

  private useMockData: boolean = false;

  /**
   * 获取所有REITs产品
   */
  async getAllProducts(): Promise<REITProduct[]> {
    try {
      const { data, error } = await supabase
        .from('reit_product_info')
        .select('*')
        .order('listing_date', { ascending: false });

      if (error) {
        console.warn('无法从数据库获取REITs产品，使用模拟数据:', error.message);
        this.useMockData = true;
        return this.mockProducts;
      }

      if (!data || data.length === 0) {
        console.warn('数据库中没有REITs产品数据，使用模拟数据');
        this.useMockData = true;
        return this.mockProducts;
      }

      this.useMockData = false;
      return data || [];
    } catch (error) {
      console.warn('获取REITs产品失败，使用模拟数据:', error);
      this.useMockData = true;
      return this.mockProducts;
    }
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
