export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          role_id: string;
          is_active: boolean;
          login_attempts: number | null;
          locked_until: string | null;
          last_login_at: string | null;
          department: string | null;
          region: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          password_hash: string;
          role_id: string;
          is_active?: boolean;
          login_attempts?: number | null;
          locked_until?: string | null;
          last_login_at?: string | null;
          department?: string | null;
          region?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          password_hash?: string;
          role_id?: string;
          is_active?: boolean;
          login_attempts?: number | null;
          locked_until?: string | null;
          last_login_at?: string | null;
          department?: string | null;
          region?: string | null;
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
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
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
          conditions?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          resource?: string;
          action?: string;
          conditions?: string | null;
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
          old_value: Json | null;
          new_value: Json | null;
          sensitive_data: Json | null;
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
          old_value?: Json | null;
          new_value?: Json | null;
          sensitive_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          result?: 'success' | 'failure';
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
          old_value?: Json | null;
          new_value?: Json | null;
          sensitive_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          result?: 'success' | 'failure';
          error_message?: string | null;
        };
      };
      login_attempts: {
        Row: {
          id: string;
          user_id: string | null;
          username: string;
          success: boolean;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          username: string;
          success?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          username?: string;
          success?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
