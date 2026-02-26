/**
 * Supabase Data Access Service for REITs
 *
 * 提供对 REITs 数据的 CRUD 操作
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * REITs Product Service
 */
export const reitsProductService = {
  /**
   * 获取所有 REITs 产品
   */
  async getAll() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[REITsProduct] 获取产品列表失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 根据 ID 获取 REITs 产品
   */
  async getById(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[REITsProduct] 获取产品失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 根据代码获取 REITs 产品
   */
  async getByCode(code: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_products')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error('[REITsProduct] 获取产品失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 创建 REITs 产品
   */
  async create(product: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_products')
      .insert({
        code: product.code,
        name: product.name,
        issuing_market: product.issuingMarket,
        status: product.status || 'active',
        underlying_asset: product.underlyingAsset,
        fund_size: product.fundSize,
        nav: product.nav,
        nav_date: product.navDate,
        listing_date: product.listingDate,
        manager: product.manager,
        custodian: product.custodian,
        description: product.description,
        metadata: product.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[REITsProduct] 创建产品失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 更新 REITs 产品
   */
  async update(id: string, updates: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_products')
      .update({
        code: updates.code,
        name: updates.name,
        issuing_market: updates.issuingMarket,
        status: updates.status,
        underlying_asset: updates.underlyingAsset,
        fund_size: updates.fundSize,
        nav: updates.nav,
        nav_date: updates.navDate,
        listing_date: updates.listingDate,
        manager: updates.manager,
        custodian: updates.custodian,
        description: updates.description,
        metadata: updates.metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[REITsProduct] 更新产品失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 删除 REITs 产品
   */
  async delete(id: string) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('reits_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[REITsProduct] 删除产品失败:', error);
      throw error;
    }

    return true;
  }
};

/**
 * REITs Policy Service
 */
export const reitsPolicyService = {
  /**
   * 获取所有政策
   */
  async getAll(options?: { limit?: number; orderBy?: string }) {
    const client = getSupabaseClient();
    let query = client
      .from('reits_policies')
      .select('*');

    if (options?.orderBy === 'publish_date') {
      query = query.order('publish_date', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[REITsPolicy] 获取政策列表失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 根据 ID 获取政策
   */
  async getById(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_policies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[REITsPolicy] 获取政策失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 创建政策
   */
  async create(policy: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_policies')
      .insert({
        ...policy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[REITsPolicy] 创建政策失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 批量创建政策
   */
  async batchCreate(policies: any[]) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_policies')
      .insert(policies.map(p => ({
        ...p,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (error) {
      console.error('[REITsPolicy] 批量创建政策失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 更新政策
   */
  async update(id: string, updates: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_policies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[REITsPolicy] 更新政策失败:', error);
      throw error;
    }

    return data;
  }
};

/**
 * REITs News Service
 */
export const reitsNewsService = {
  /**
   * 获取所有新闻
   */
  async getAll(options?: { limit?: number; orderBy?: string }) {
    const client = getSupabaseClient();
    let query = client
      .from('reits_news')
      .select('*');

    if (options?.orderBy === 'publish_time') {
      query = query.order('publish_time', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[REITsNews] 获取新闻列表失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 根据 ID 获取新闻
   */
  async getById(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_news')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[REITsNews] 获取新闻失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 创建新闻
   */
  async create(news: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_news')
      .insert({
        ...news,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[REITsNews] 创建新闻失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 批量创建新闻
   */
  async batchCreate(newsList: any[]) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_news')
      .insert(newsList.map(n => ({
        ...n,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (error) {
      console.error('[REITsNews] 批量创建新闻失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 更新新闻
   */
  async update(id: string, updates: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_news')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[REITsNews] 更新新闻失败:', error);
      throw error;
    }

    return data;
  }
};

/**
 * REITs Announcement Service
 */
export const reitsAnnouncementService = {
  /**
   * 获取所有公告
   */
  async getAll(options?: { limit?: number; productCode?: string }) {
    const client = getSupabaseClient();
    let query = client
      .from('reits_announcements')
      .select('*')
      .order('publish_date', { ascending: false });

    if (options?.productCode) {
      query = query.eq('product_code', options.productCode);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[REITsAnnouncement] 获取公告列表失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 根据 ID 获取公告
   */
  async getById(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[REITsAnnouncement] 获取公告失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 创建公告
   */
  async create(announcement: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_announcements')
      .insert({
        ...announcement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[REITsAnnouncement] 创建公告失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 批量创建公告
   */
  async batchCreate(announcements: any[]) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_announcements')
      .insert(announcements.map(a => ({
        ...a,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (error) {
      console.error('[REITsAnnouncement] 批量创建公告失败:', error);
      throw error;
    }

    return data;
  }
};

/**
 * REITs Valuation History Service
 */
export const reitsValuationHistoryService = {
  /**
   * 获取估值历史
   */
  async getAll(options?: { productCode?: string; limit?: number }) {
    const client = getSupabaseClient();
    let query = client
      .from('reits_valuation_history')
      .select('*')
      .order('valuation_date', { ascending: false });

    if (options?.productCode) {
      query = query.eq('product_code', options.productCode);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[REITsValuation] 获取估值历史失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 创建估值记录
   */
  async create(valuation: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_valuation_history')
      .insert({
        ...valuation,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[REITsValuation] 创建估值记录失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 批量创建估值记录
   */
  async batchCreate(valuations: any[]) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_valuation_history')
      .insert(valuations.map(v => ({
        ...v,
        created_at: new Date().toISOString()
      })))
      .select();

    if (error) {
      console.error('[REITsValuation] 批量创建估值记录失败:', error);
      throw error;
    }

    return data;
  }
};

/**
 * REITs Model Training Service
 */
export const reitsModelTrainingService = {
  /**
   * 获取所有训练记录
   */
  async getAll(options?: { modelType?: string; limit?: number }) {
    const client = getSupabaseClient();
    let query = client
      .from('reits_model_training')
      .select('*')
      .order('training_start_time', { ascending: false });

    if (options?.modelType) {
      query = query.eq('model_type', options.modelType);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[REITsModel] 获取训练记录失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 创建训练记录
   */
  async create(training: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_model_training')
      .insert({
        ...training,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[REITsModel] 创建训练记录失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 更新训练记录
   */
  async update(id: string, updates: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_model_training')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[REITsModel] 更新训练记录失败:', error);
      throw error;
    }

    return data;
  }
};

/**
 * REITs Evolution Task Service
 */
export const reitsEvolutionTaskService = {
  /**
   * 获取所有进化任务
   */
  async getAll(options?: { taskType?: string; limit?: number }) {
    const client = getSupabaseClient();
    let query = client
      .from('reits_evolution_tasks')
      .select('*')
      .order('scheduled_time', { ascending: false });

    if (options?.taskType) {
      query = query.eq('task_type', options.taskType);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[REITsEvolution] 获取进化任务失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 创建进化任务记录
   */
  async create(task: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_evolution_tasks')
      .insert({
        ...task,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[REITsEvolution] 创建进化任务失败:', error);
      throw error;
    }

    return data;
  },

  /**
   * 更新进化任务记录
   */
  async update(id: string, updates: any) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reits_evolution_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[REITsEvolution] 更新进化任务失败:', error);
      throw error;
    }

    return data;
  }
};
