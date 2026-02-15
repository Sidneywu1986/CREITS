/**
 * Supabase 数据库服务
 *
 * 提供Supabase数据库连接和基本操作
 */

import { createClient } from '@supabase/supabase-js';

// 从环境变量中获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 检查Supabase是否已配置
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// 获取Supabase配置状态
export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured(),
  };
};
