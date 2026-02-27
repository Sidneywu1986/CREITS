import { getSupabaseClient } from '@/lib/supabase/client';

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  oldValue: any;
  newValue: any;
  sensitiveData: any;
  ipAddress: string | null;
  userAgent: string | null;
  result: 'success' | 'failure';
  errorMessage: string | null;
  createdAt: string;
}

export interface AuditLogFilter {
  userId?: string;
  resourceType?: string;
  action?: string;
  result?: 'success' | 'failure';
  startDate?: string;
  endDate?: string;
}

/**
 * 审计日志服务
 */
export class AuditLogService {
  /**
   * 记录审计日志
   */
  static async log(params: {
    userId: string;
    username: string;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    oldValue?: any;
    newValue?: any;
    sensitiveData?: any;
    result?: 'success' | 'failure';
    errorMessage?: string | null;
  }): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const clientIp = await this.getClientIp();
      const userAgent = navigator.userAgent;

      // 如果有敏感数据，进行加密
      let encryptedData = null;
      if (params.sensitiveData) {
        // 这里应该使用AES-256加密，暂时直接存储
        encryptedData = params.sensitiveData;
      }

      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      await supabase.from('audit_logs').insert({
        user_id: params.userId,
        username: params.username,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId || null,
        old_value: params.oldValue || null,
        new_value: params.newValue || null,
        sensitive_data: encryptedData,
        ip_address: clientIp,
        user_agent: userAgent,
        result: params.result || 'success',
        error_message: params.errorMessage || null,
      } as any);
    } catch (error) {
      console.error('记录审计日志失败:', error);
      // 审计日志记录失败不应该影响主流程
    }
  }

  /**
   * 查询审计日志
   */
  static async query(filter: AuditLogFilter = {}, page = 1, pageSize = 50): Promise<{
    data: AuditLog[];
    total: number;
  }> {
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return { data: [], total: 0 };
      }

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // 应用过滤条件
      if (filter.userId) {
        query = query.eq('user_id', filter.userId);
      }
      if (filter.resourceType) {
        query = query.eq('resource_type', filter.resourceType);
      }
      if (filter.action) {
        query = query.eq('action', filter.action);
      }
      if (filter.result) {
        query = query.eq('result', filter.result);
      }
      if (filter.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      if (filter.endDate) {
        query = query.lte('created_at', filter.endDate);
      }

      // 分页
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('查询审计日志失败:', error);
        return { data: [], total: 0 };
      }

      return {
        data: (data || []) as AuditLog[],
        total: count || 0,
      };
    } catch (error) {
      console.error('查询审计日志失败:', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * 获取单个审计日志详情
   */
  static async getById(id: string): Promise<AuditLog | null> {
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
      }

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('获取审计日志失败:', error);
        return null;
      }

      return data as AuditLog;
    } catch (error) {
      console.error('获取审计日志失败:', error);
      return null;
    }
  }

  /**
   * 获取用户操作统计
   */
  static async getUserActionStats(userId: string, days = 30): Promise<{
    total: number;
    success: number;
    failure: number;
    byAction: Record<string, number>;
  }> {
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return { total: 0, success: 0, failure: 0, byAction: {} };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, result')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('获取用户操作统计失败:', error);
        return { total: 0, success: 0, failure: 0, byAction: {} };
      }

      const stats = {
        total: data?.length || 0,
        success: 0,
        failure: 0,
        byAction: {} as Record<string, number>,
      };

      (data as any)?.forEach((log: any) => {
        if (log.result === 'success') {
          stats.success++;
        } else {
          stats.failure++;
        }

        const action = log.action as string;
        stats.byAction[action] = (stats.byAction[action] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('获取用户操作统计失败:', error);
      return { total: 0, success: 0, failure: 0, byAction: {} };
    }
  }

  /**
   * 获取资源操作历史
   */
  static async getResourceHistory(
    resourceType: string,
    resourceId: string,
    page = 1,
    pageSize = 50
  ): Promise<{
    data: AuditLog[];
    total: number;
  }> {
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return { data: [], total: 0 };
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('获取资源操作历史失败:', error);
        return { data: [], total: 0 };
      }

      return {
        data: (data || []) as AuditLog[],
        total: count || 0,
      };
    } catch (error) {
      console.error('获取资源操作历史失败:', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * 导出审计日志
   */
  static async export(filter: AuditLogFilter = {}): Promise<string> {
    try {
      const { data } = await this.query(filter, 1, 10000);

      // 转换为CSV格式
      const headers = [
        '时间',
        '用户',
        '操作',
        '资源类型',
        '资源ID',
        '结果',
        '错误信息',
      ];

      const rows = data.map((log) => [
        log.createdAt,
        log.username,
        log.action,
        log.resourceType,
        log.resourceId,
        log.result,
        log.errorMessage || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('导出审计日志失败:', error);
      return '';
    }
  }

  /**
   * 清理旧的审计日志
   */
  static async cleanup(daysToKeep = 90): Promise<number> {
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('清理审计日志失败:', error);
        return 0;
      }

      return 1;
    } catch (error) {
      console.error('清理审计日志失败:', error);
      return 0;
    }
  }

  /**
   * 获取客户端IP
   */
  private static async getClientIp(): Promise<string> {
    // 在浏览器端，我们无法直接获取真实的客户端IP
    // 实际应该通过API路由从请求头中获取
    return '0.0.0.0';
  }
}

// 预定义的操作类型
export const AuditActions = {
  // 用户操作
  USER_LOGIN: 'login',
  USER_LOGOUT: 'logout',
  USER_REGISTER: 'register',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // REITs数据操作
  REIT_CREATE: 'reit.create',
  REIT_UPDATE: 'reit.update',
  REIT_DELETE: 'reit.delete',
  REIT_EXPORT: 'reit.export',

  // 权限操作
  PERMISSION_GRANT: 'permission.grant',
  PERMISSION_REVOKE: 'permission.revoke',

  // 系统操作
  SYSTEM_CONFIG_UPDATE: 'system.config.update',
  SYSTEM_LOG_VIEW: 'system.log.view',
} as const;

export type AuditAction = typeof AuditActions[keyof typeof AuditActions];
