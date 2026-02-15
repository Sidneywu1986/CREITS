/**
 * 简化的数据库服务 - 用于API路由
 * 避免路径别名问题
 */

import { supabase } from '../../../src/lib/services/supabase';

export class SimpleREITsService {
  /**
   * 获取所有REITs产品
   */
  async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('reit_product_info')
        .select('*')
        .order('listing_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('获取产品列表失败:', error);
        throw new Error(`获取产品列表失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getAllProducts error:', error);
      throw error;
    }
  }

  /**
   * 按代码获取产品
   */
  async getProductByCode(reitCode: string) {
    try {
      const { data, error } = await supabase
        .from('reit_product_info')
        .select('*')
        .eq('reit_code', reitCode)
        .single();

      if (error) {
        console.error('获取产品详情失败:', error);
        throw new Error(`获取产品详情失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('getProductByCode error:', error);
      throw error;
    }
  }

  /**
   * 获取所有资产
   */
  async getAllProperties() {
    try {
      const { data, error } = await supabase
        .from('reit_property_base')
        .select('*')
        .order('effective_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('获取资产列表失败:', error);
        throw new Error(`获取资产列表失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getAllProperties error:', error);
      throw error;
    }
  }

  /**
   * 按产品代码获取资产
   */
  async getPropertiesByReitCode(reitCode: string) {
    try {
      const { data, error } = await supabase
        .from('reit_property_base')
        .select('*')
        .eq('reit_code', reitCode)
        .order('effective_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('获取产品资产失败:', error);
        throw new Error(`获取产品资产失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getPropertiesByReitCode error:', error);
      throw error;
    }
  }

  /**
   * 获取财务指标
   */
  async getFinancialMetrics(reitCode: string) {
    try {
      const { data, error } = await supabase
        .from('reit_financial_metrics')
        .select('*')
        .eq('reit_code', reitCode)
        .order('report_date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('获取财务指标失败:', error);
        throw new Error(`获取财务指标失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getFinancialMetrics error:', error);
      throw error;
    }
  }

  /**
   * 获取市场表现
   */
  async getMarketStats(reitCode: string) {
    try {
      const { data, error } = await supabase
        .from('reit_market_stats')
        .select('*')
        .eq('reit_code', reitCode)
        .order('trade_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('获取市场数据失败:', error);
        throw new Error(`获取市场数据失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getMarketStats error:', error);
      throw error;
    }
  }
}

// 导出单例
export const simpleREITsService = new SimpleREITsService();
