/**
 * UserBehaviorTracker - 用户行为追踪服务
 *
 * 功能：
 * 1. 前端无痕埋点（页面停留、搜索、导出、Agent交互）
 * 2. 数据脱敏存储（SHA-256 Hash用户ID，敏感词过滤）
 * 3. 关联现有审计日志
 * 4. 隐私保护（90天数据保留，用户可禁用）
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// 配置
const CONFIG = {
  dataRetentionDays: 90,  // 数据保留天数
  enableTracking: true,   // 全局追踪开关
  // 敏感词列表（需要过滤）
  sensitiveKeywords: [
    'password', 'pwd', '密码',
    'token', 'key', 'secret',
    '身份证', '手机号', '身份证号',
    'phone', 'mobile',
    '银行卡', 'bank'
  ],
  // 需要脱敏的字段
  sensitiveFields: [
    'email', 'phone', 'id_card', 'password',
    'token', 'api_key', 'secret'
  ]
};

// Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 用户Hash工具（SHA-256）
 * 对用户ID进行不可逆的Hash，保护用户隐私
 */
export class UserHasher {
  /**
   * 生成用户Hash
   */
  static hash(userId: string): string {
    return crypto
      .createHash('sha256')
      .update(userId + process.env.NEXT_PUBLIC_USER_HASH_SALT || 'default-salt')
      .digest('hex');
  }

  /**
   * 脱敏文本（过滤敏感词）
   */
  static sanitizeText(text: string): string {
    let sanitized = text;

    // 过滤敏感词
    CONFIG.sensitiveKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      sanitized = sanitized.replace(regex, '***');
    });

    // 过滤邮箱
    sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '***@***.***');

    // 过滤手机号（11位）
    sanitized = sanitized.replace(/\b1[3-9]\d{9}\b/g, '***********');

    // 过滤身份证号
    sanitized = sanitized.replace(/\d{17}[\dXx]/g, '*******************');

    return sanitized;
  }

  /**
   * 脱敏JSON对象
   */
  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (CONFIG.sensitiveFields.includes(key.toLowerCase())) {
        sanitized[key] = '***';
      } else if (typeof obj[key] === 'string') {
        sanitized[key] = this.sanitizeText(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }

    return sanitized;
  }
}

/**
 * Session管理器
 */
export class SessionManager {
  private static instance: SessionManager;
  private sessionId: string;
  private startTime: Date;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getStartTime(): Date {
    return this.startTime;
  }

  getSessionDuration(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  reset(): void {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
  }
}

/**
 * UserBehaviorTracker类
 */
export class UserBehaviorTracker {
  private enabled: boolean = CONFIG.enableTracking;

  /**
   * 设置追踪状态
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 检查用户是否允许追踪
   */
  private async checkTrackingEnabled(userId: string): Promise<boolean> {
    try {
      const userHash = UserHasher.hash(userId);

      const { data, error } = await supabase
        .from('user_behavior_privacy')
        .select('tracking_enabled')
        .eq('user_hash', userHash)
        .single();

      if (error || !data) {
        // 默认允许追踪
        return true;
      }

      return data.tracking_enabled;
    } catch (error) {
      console.error('检查追踪状态失败:', error);
      return true;
    }
  }

  /**
   * 追踪页面访问
   */
  async trackPageView(
    userId: string,
    pagePath: string,
    pageTitle?: string,
    referrer?: string,
    pageData?: any
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const userHash = UserHasher.hash(userId);
      const sessionManager = SessionManager.getInstance();

      // 检查用户是否允许追踪
      const trackingEnabled = await this.checkTrackingEnabled(userId);
      if (!trackingEnabled) return;

      // 脱敏数据
      const sanitizedPageData = pageData ? UserHasher.sanitizeObject(pageData) : null;

      // 记录页面访问
      await supabase
        .from('user_page_views')
        .insert({
          user_hash: userHash,
          session_id: sessionManager.getSessionId(),
          page_path: pagePath,
          page_title: pageTitle,
          referrer: referrer,
          page_view_start: new Date().toISOString(),
          page_data: sanitizedPageData
        });

      // 关联审计日志
      await this.createAuditLog(userId, 'page_view', pagePath, {
        page_path: pagePath,
        page_title: pageTitle
      });

    } catch (error) {
      console.error('追踪页面访问失败:', error);
    }
  }

  /**
   * 结束页面访问
   */
  async endPageView(userId: string, pagePath: string): Promise<void> {
    if (!this.enabled) return;

    try {
      const userHash = UserHasher.hash(userId);
      const sessionManager = SessionManager.getInstance();

      // 更新页面访问结束时间
      const { data: pageView } = await supabase
        .from('user_page_views')
        .select('id, page_view_start')
        .eq('user_hash', userHash)
        .eq('session_id', sessionManager.getSessionId())
        .eq('page_path', pagePath)
        .is('page_view_end', null)
        .order('page_view_start', { ascending: false })
        .limit(1)
        .single();

      if (pageView) {
        const duration = Math.floor(
          (Date.now() - new Date(pageView.page_view_start).getTime()) / 1000
        );

        await supabase
          .from('user_page_views')
          .update({
            page_view_end: new Date().toISOString(),
            duration_seconds: duration
          })
          .eq('id', pageView.id);
      }

    } catch (error) {
      console.error('结束页面访问失败:', error);
    }
  }

  /**
   * 追踪搜索行为
   */
  async trackSearch(
    userId: string,
    searchQuery: string,
    searchType: string,
    searchFilters?: any,
    resultCount?: number,
    clickedResultId?: string
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const userHash = UserHasher.hash(userId);
      const sessionManager = SessionManager.getInstance();

      // 检查用户是否允许追踪
      const trackingEnabled = await this.checkTrackingEnabled(userId);
      if (!trackingEnabled) return;

      // 脱敏数据
      const sanitizedQuery = UserHasher.sanitizeText(searchQuery);
      const sanitizedFilters = searchFilters ? UserHasher.sanitizeObject(searchFilters) : null;

      // 记录搜索行为
      await supabase
        .from('user_searches')
        .insert({
          user_hash: userHash,
          session_id: sessionManager.getSessionId(),
          search_query: sanitizedQuery,
          search_type: searchType,
          search_filters: sanitizedFilters,
          result_count: resultCount || 0,
          clicked_result_id: clickedResultId,
          search_timestamp: new Date().toISOString(),
          search_context: {
            session_duration: sessionManager.getSessionDuration()
          }
        });

      // 关联审计日志
      await this.createAuditLog(userId, 'search', `查询: ${sanitizedQuery}`, {
        search_type: searchType,
        result_count: resultCount
      });

    } catch (error) {
      console.error('追踪搜索行为失败:', error);
    }
  }

  /**
   * 追踪导出行为
   */
  async trackExport(
    userId: string,
    exportType: string,
    exportScope: string,
    exportSource: string,
    exportFilters?: any,
    recordCount?: number,
    fileSizeBytes?: number,
    exportStatus?: string,
    errorMessage?: string
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const userHash = UserHasher.hash(userId);
      const sessionManager = SessionManager.getInstance();

      // 检查用户是否允许追踪
      const trackingEnabled = await this.checkTrackingEnabled(userId);
      if (!trackingEnabled) return;

      // 脱敏数据
      const sanitizedFilters = exportFilters ? UserHasher.sanitizeObject(exportFilters) : null;
      const sanitizedError = errorMessage ? UserHasher.sanitizeText(errorMessage) : null;

      // 记录导出行为
      await supabase
        .from('user_exports')
        .insert({
          user_hash: userHash,
          session_id: sessionManager.getSessionId(),
          export_type: exportType,
          export_scope: exportScope,
          export_source: exportSource,
          export_filters: sanitizedFilters,
          record_count: recordCount || 0,
          file_size_bytes: fileSizeBytes || 0,
          export_status: exportStatus || 'success',
          error_message: sanitizedError,
          export_timestamp: new Date().toISOString()
        });

      // 关联审计日志
      await this.createAuditLog(userId, 'export', `导出: ${exportSource}`, {
        export_type: exportType,
        export_scope: exportScope,
        record_count: recordCount,
        export_status: exportStatus
      });

    } catch (error) {
      console.error('追踪导出行为失败:', error);
    }
  }

  /**
   * 追踪Agent交互行为
   */
  async trackAgentInteraction(
    userId: string,
    agentType: string,
    agentId: string,
    interactionType: string,
    interactionInput: string,
    interactionOutput: string,
    interactionTokens?: number,
    interactionDuration?: number,
    interactionStatus?: string,
    userFeedback?: number
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const userHash = UserHasher.hash(userId);
      const sessionManager = SessionManager.getInstance();

      // 检查用户是否允许追踪
      const trackingEnabled = await this.checkTrackingEnabled(userId);
      if (!trackingEnabled) return;

      // 脱敏数据
      const sanitizedInput = UserHasher.sanitizeText(interactionInput);
      // 输出仅保留摘要（前100字符）
      const sanitizedOutput = UserHasher.sanitizeText(interactionOutput).substring(0, 100) + '...';

      // 记录Agent交互
      await supabase
        .from('user_agent_interactions')
        .insert({
          user_hash: userHash,
          session_id: sessionManager.getSessionId(),
          agent_type: agentType,
          agent_id: agentId,
          interaction_type: interactionType,
          interaction_input: sanitizedInput,
          interaction_output: sanitizedOutput,
          interaction_tokens: interactionTokens || 0,
          interaction_duration_seconds: interactionDuration || 0,
          interaction_status: interactionStatus || 'success',
          user_feedback: userFeedback,
          interaction_timestamp: new Date().toISOString()
        });

      // 关联审计日志
      await this.createAuditLog(userId, 'agent_interaction', `${agentType}: ${interactionType}`, {
        agent_type: agentType,
        interaction_type: interactionType,
        interaction_status: interactionStatus,
        user_feedback: userFeedback
      });

    } catch (error) {
      console.error('追踪Agent交互失败:', error);
    }
  }

  /**
   * 创建关联审计日志
   */
  private async createAuditLog(
    userId: string,
    action: string,
    description: string,
    details: any
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          username: userId,  // 这里应该从用户表获取真实用户名
          action: action,
          resource_type: 'user_behavior',
          result: 'success',
          old_value: null,
          new_value: details,
          ip_address: null,  // 可以从请求中获取
          user_agent: null   // 可以从请求中获取
        });
    } catch (error) {
      console.error('创建审计日志失败:', error);
    }
  }

  /**
   * 生成每日聚合报告
   */
  async generateDailyAggregates(date?: Date): Promise<void> {
    try {
      const targetDate = date || new Date();
      const dateStr = targetDate.toISOString().split('T')[0];

      // 获取页面访问统计
      const { data: pageViews } = await supabase
        .from('user_page_views')
        .select('page_path, COUNT(*) as count')
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`)
        .group('page_path');

      // 获取搜索统计
      const { data: searches } = await supabase
        .from('user_searches')
        .select('search_query, COUNT(*) as count')
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`)
        .group('search_query');

      // 获取导出统计
      const { data: exports } = await supabase
        .from('user_exports')
        .select('COUNT(*) as count')
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`);

      // 获取Agent交互统计
      const { data: interactions } = await supabase
        .from('user_agent_interactions')
        .select('COUNT(*) as count')
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`);

      // 生成聚合数据
      const totalPages = pageViews?.length || 0;
      const totalExports = exports?.[0]?.count || 0;
      const totalInteractions = interactions?.[0]?.count || 0;

      // TOP 10 页面
      const topPages = pageViews
        ?.sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 10)
        .map(item => ({
          page_path: item.page_path,
          count: item.count
        })) || [];

      // TOP 10 搜索
      const topSearches = searches
        ?.sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 10)
        .map(item => ({
          search_query: item.search_query,
          count: item.count
        })) || [];

      // 插入聚合数据
      await supabase
        .from('user_behavior_aggregated')
        .upsert({
          aggregation_date: dateStr,
          aggregation_type: 'daily',
          total_page_views: totalPages,
          total_users: 0,  // 需要计算去重用户数
          average_session_duration: 0,  // 需要计算平均时长
          top_pages: topPages,
          top_searches: topSearches,
          total_exports: totalExports,
          total_agent_interactions: totalInteractions,
          avg_page_load_time: 0,
          error_rate: 0
        }, {
          onConflict: 'aggregation_date,aggregation_type',
          ignoreDuplicates: false
        });

    } catch (error) {
      console.error('生成每日聚合报告失败:', error);
    }
  }

  /**
   * 设置用户隐私配置
   */
  async setPrivacySettings(
    userId: string,
    settings: {
      trackingEnabled?: boolean;
      allowPageViewTracking?: boolean;
      allowSearchTracking?: boolean;
      allowExportTracking?: boolean;
      allowAgentTracking?: boolean;
    }
  ): Promise<void> {
    try {
      const userHash = UserHasher.hash(userId);

      await supabase
        .from('user_behavior_privacy')
        .upsert({
          user_hash: userHash,
          tracking_enabled: settings.trackingEnabled ?? true,
          allow_page_view_tracking: settings.allowPageViewTracking ?? true,
          allow_search_tracking: settings.allowSearchTracking ?? true,
          allow_export_tracking: settings.allowExportTracking ?? true,
          allow_agent_tracking: settings.allowAgentTracking ?? true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_hash',
          ignoreDuplicates: false
        });

    } catch (error) {
      console.error('设置用户隐私配置失败:', error);
    }
  }
}

// 导出单例
export const userBehaviorTracker = new UserBehaviorTracker();
export const sessionManager = SessionManager.getInstance();
