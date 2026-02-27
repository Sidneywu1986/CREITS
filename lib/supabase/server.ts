import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 创建 Supabase 客户端（Pages Router 兼容）
export const createSupabaseClientFn = () => {
  // 在构建过程中，如果没有必需的环境变量，返回一个模拟客户端
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase environment variables are missing, returning mock client');
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
};

// 获取管理员权限的客户端
export const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase environment variables are missing, returning mock client');
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
};

// 导出默认客户端（用于直接导入）
export const supabase = createSupabaseClientFn();

// 导出 createClient 别名（兼容现有导入）
export const createClient = createSupabaseClientFn;
