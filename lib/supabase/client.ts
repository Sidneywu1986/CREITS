'use client';

import { createBrowserClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// 单例模式导出
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
};

// 类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          role_id: string;
          department: string | null;
          region: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          role_id: string;
          department?: string;
          region?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          role_id?: string;
          department?: string;
          region?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          role_id: string;
          resource: string;
          action: string;
          conditions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          resource: string;
          action: string;
          conditions?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          resource?: string;
          action?: string;
          conditions?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_value: any;
          new_value: any;
          sensitive_data: any;
          ip_address: string | null;
          user_agent: string | null;
          result: 'success' | 'failure';
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_value?: any;
          new_value?: any;
          sensitive_data?: any;
          ip_address?: string | null;
          user_agent?: string | null;
          result: 'success' | 'failure';
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_value?: any;
          new_value?: any;
          sensitive_data?: any;
          ip_address?: string | null;
          user_agent?: string | null;
          result?: 'success' | 'failure';
          error_message?: string | null;
        };
      };
    };
  };
}
