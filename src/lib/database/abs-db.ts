/**
 * ABS数据库服务类
 * 提供ABS产品的数据库操作功能
 */

import { createClient } from '@supabase/supabase-js';

// 获取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ABSProduct {
  product_code: string;
  product_full_name: string;
  product_short_name: string;
  market_type: string;
  product_type: string;
  asset_type_main: string;
  asset_type_sub: string;
  issuer_name: string;
  trustee_name: string;
  total_scale: number;
  issue_date: string;
  total_tranches: number;
  senior_tranches: number;
  subordinate_ratio: number;
  rating_agency?: string;
  lead_underwriter?: string;
  rating_agency?: string;
  expected_maturity_date?: string;
  establishment_date?: string;
}

export interface ABSTranche {
  tranche_code: string;
  product_code: string;
  tranche_name: string;
  tranche_level: string;
  payment_priority: number;
  credit_rating_current: string;
  issue_scale: number;
  current_balance: number;
  coupon_type: string;
  initial_coupon: number | null;
  expected_weighted_life: number;
}

export interface ABSCollateralPool {
  pool_id: string;
  product_code: string;
  report_date: string;
  total_principal_balance: number;
  total_asset_count: number;
  avg_loan_size: number;
  weighted_avg_maturity: number;
  weighted_avg_interest_rate: number;
  delinquency_30plus: number;
  delinquency_90plus: number;
  cumulative_default_rate: number;
  cpr: number;
}

export interface ABSRiskCompliance {
  product_code: string;
  info_date: string;
  regulatory_status: string;
  esg_score: number;
  green_bond_flag: boolean;
  disclosure_quality_rating: string;
}

/**
 * ABS数据库服务类
 */
export class ABSDatabaseService {
  /**
   * 获取所有ABS产品
   */
  async getAllProducts(): Promise<ABSProduct[]> {
    const { data, error } = await supabase
      .from('abs_product_info')
      .select('*')
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('获取ABS产品失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 根据产品代码获取产品详情
   */
  async getProductByCode(code: string): Promise<ABSProduct | null> {
    const { data, error } = await supabase
      .from('abs_product_info')
      .select('*')
      .eq('product_code', code)
      .single();

    if (error) {
      console.error('获取产品详情失败:', error);
      throw error;
    }

    return data;
  }

  /**
   * 获取产品的分层信息
   */
  async getTranchesByProductCode(productCode: string): Promise<ABSTranche[]> {
    const { data, error } = await supabase
      .from('abs_tranche_info')
      .select('*')
      .eq('product_code', productCode)
      .order('payment_priority', { ascending: true });

    if (error) {
      console.error('获取分层信息失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 获取产品的资产池信息
   */
  async getCollateralPoolByProductCode(productCode: string): Promise<ABSCollateralPool | null> {
    const { data, error } = await supabase
      .from('abs_collateral_pool')
      .select('*')
      .eq('product_code', productCode)
      .order('report_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('获取资产池信息失败:', error);
      throw error;
    }

    return data;
  }

  /**
   * 获取产品的风险合规信息
   */
  async getRiskComplianceByProductCode(productCode: string): Promise<ABSRiskCompliance | null> {
    const { data, error } = await supabase
      .from('abs_risk_compliance')
      .select('*')
      .eq('product_code', productCode)
      .order('info_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('获取风险合规信息失败:', error);
      throw error;
    }

    return data;
  }

  /**
   * 获取产品完整信息（包含分层、资产池、风险合规）
   */
  async getProductFullInfo(productCode: string) {
    try {
      const [product, tranches, pool, risk] = await Promise.all([
        this.getProductByCode(productCode),
        this.getTranchesByProductCode(productCode),
        this.getCollateralPoolByProductCode(productCode),
        this.getRiskComplianceByProductCode(productCode),
      ]);

      return {
        product,
        tranches,
        pool,
        risk,
      };
    } catch (error) {
      console.error('获取产品完整信息失败:', error);
      throw error;
    }
  }

  /**
   * 按产品类型筛选产品
   */
  async getProductsByType(productType: string): Promise<ABSProduct[]> {
    const { data, error } = await supabase
      .from('abs_product_info')
      .select('*')
      .eq('product_type', productType)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('按类型获取产品失败:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 按基础资产类型筛选产品
   */
  async getProductsByAssetType(assetType: string): Promise<ABSProduct[]> {
    const { data, error } = await supabase
      .from('abs_product_info')
      .select('*')
      .eq('asset_type_sub', assetType)
      .order('issue_date', { ascending: false });

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
        .from('abs_product_info')
        .select('*', { count: 'exact', head: true });

      // 获取总规模
      const { data: scaleData } = await supabase
        .from('abs_product_info')
        .select('total_scale');

      const totalScale = scaleData?.reduce((sum, p) => sum + (p.total_scale || 0), 0) || 0;

      // 按产品类型统计
      const { data: typeData } = await supabase
        .from('abs_product_info')
        .select('product_type');

      const typeCounts = typeData?.reduce((acc, p) => {
        acc[p.product_type] = (acc[p.product_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 按基础资产类型统计
      const { data: assetData } = await supabase
        .from('abs_product_info')
        .select('asset_type_sub');

      const assetCounts = assetData?.reduce((acc, p) => {
        acc[p.asset_type_sub] = (acc[p.asset_type_sub] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalProducts: totalProducts || 0,
        totalScale,
        typeDistribution: typeCounts || {},
        assetDistribution: assetCounts || {},
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 搜索产品
   */
  async searchProducts(keyword: string): Promise<ABSProduct[]> {
    const { data, error } = await supabase
      .from('abs_product_info')
      .select('*')
      .or(`product_short_name.ilike.%${keyword}%,product_full_name.ilike.%${keyword}%,issuer_name.ilike.%${keyword}%`)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('搜索产品失败:', error);
      throw error;
    }

    return data || [];
  }
}

// 导出单例
export const absDatabase = new ABSDatabaseService();
