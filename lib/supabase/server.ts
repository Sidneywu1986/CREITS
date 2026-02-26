import { createServerClient, type CookieOptions } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 在 Server Components 中可能无法设置 cookie
            console.warn('Failed to set cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 在 Server Components 中可能无法删除 cookie
            console.warn('Failed to remove cookie:', error);
          }
        },
      },
    }
  );
};

// 获取管理员权限的客户端
export const createAdminClient = async () => {
  return createServerClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      cookies: {
        get(name: string) {
          return null;
        },
        set(name: string, value: string, options: CookieOptions) {
          // 不设置 cookie
        },
        remove(name: string, options: CookieOptions) {
          // 不删除 cookie
        },
      },
    }
  );
};
