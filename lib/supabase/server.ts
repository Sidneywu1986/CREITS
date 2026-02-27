import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 创建 Supabase 客户端（Pages Router 兼容）
export const createSupabaseClientFn = () => {
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
};

// 获取管理员权限的客户端
export const createAdminClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
};

// 导出默认客户端（用于直接导入）
export const supabase = createSupabaseClientFn();

// 导出 createClient 别名（兼容现有导入）
export const createClient = createSupabaseClientFn;
