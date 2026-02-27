import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { AuditLogService } from '@/lib/supabase/audit-log-v2'

/**
 * API密钥
 */
export interface APIKey {
  id: string
  name: string
  key: string
  prefix: string
  scopes: string[]
  rateLimit: number
  userId: string
  organizationId?: string
  isActive: boolean
  expiresAt?: string
  lastUsedAt?: string
  createdAt: string
}

/**
 * API用量统计
 */
export interface APIUsage {
  apiKeyId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  timestamp: string
}

/**
 * 用量汇总
 */
export interface UsageSummary {
  apiKeyId: string
  date: string
  totalRequests: number
  successRequests: number
  failedRequests: number
  totalResponseTime: number
  avgResponseTime: number
  statusCodes: Record<number, number>
  topEndpoints: Array<{ endpoint: string; count: number }>
}

/**
 * API平台服务
 */
export class APIPlatformService {
  private _supabase: any = null
  private _auditService: any = null

  private get supabase() {
    if (!this._supabase) {
      try {
        this._supabase = createClient()
      } catch (error) {
        console.warn('Failed to create Supabase client:', error)
        this._supabase = null
      }
    }
    return this._supabase
  }

  private get auditService() {
    if (!this._auditService) {
      try {
        this._auditService = new AuditLogService()
      } catch (error) {
        console.warn('Failed to create audit service:', error)
        this._auditService = null
      }
    }
    return this._auditService
  }

  constructor() {
    // 延迟初始化，不在这里创建客户端
  }

  /**
   * 生成API密钥
   */
  generateAPIKey(): { key: string; prefix: string } {
    const prefix = `reit_${crypto.randomBytes(4).toString('hex')}`
    const secret = crypto.randomBytes(32).toString('hex')
    const key = `${prefix}_${secret}`
    return { key, prefix }
  }

  /**
   * 创建API密钥
   */
  async createAPIKey(
    name: string,
    scopes: string[],
    rateLimit: number,
    userId: string,
    organizationId?: string,
    expiresIn?: number
  ): Promise<APIKey> {
    const { key, prefix } = this.generateAPIKey()
    const apiKeyId = crypto.randomUUID()

    const apiKey: APIKey = {
      id: apiKeyId,
      name,
      key, // 实际应该加密存储
      prefix,
      scopes,
      rateLimit,
      userId,
      organizationId,
      isActive: true,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      createdAt: new Date().toISOString()
    }

    // 保存到数据库
    await this.supabase.from('api_keys').insert({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      prefix: apiKey.prefix,
      scopes: apiKey.scopes,
      rate_limit: apiKey.rateLimit,
      user_id: apiKey.userId,
      organization_id: apiKey.organizationId,
      is_active: apiKey.isActive,
      expires_at: apiKey.expiresAt,
      created_at: apiKey.createdAt
    })

    // 记录审计日志
    await this.auditService.log({
      userId,
      username: 'api_user',
      action: 'api_key_created',
      resourceType: 'api_key',
      resourceId: apiKey.id,
      oldValue: null,
      newValue: { name, scopes },
      result: 'success'
    })

    return apiKey
  }

  /**
   * 验证API密钥
   */
  async validateAPIKey(apiKey: string): Promise<{
    valid: boolean;
    apiKeyId?: string;
    userId?: string;
    organizationId?: string;
    scopes?: string[];
    error?: string;
  }> {
    const prefix = apiKey.split('_')[0]

    const { data, error } = await this.supabase
      .from('api_keys')
      .select('*')
      .eq('prefix', prefix)
      .eq('key', apiKey)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { valid: false, error: 'Invalid API key' }
    }

    // 检查是否过期
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'API key expired' }
    }

    // 更新最后使用时间
    await this.supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id)

    return {
      valid: true,
      apiKeyId: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      scopes: data.scopes
    }
  }

  /**
   * 检查权限
   */
  hasScope(scopes: string[] | undefined, requiredScope: string): boolean {
    return scopes ? scopes.includes(requiredScope) : false
  }

  /**
   * 记录API调用
   */
  async recordAPIUsage(usage: Omit<APIUsage, 'timestamp'>): Promise<void> {
    await this.supabase.from('api_usage').insert({
      api_key_id: usage.apiKeyId,
      endpoint: usage.endpoint,
      method: usage.method,
      status_code: usage.statusCode,
      response_time: usage.responseTime,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 获取API密钥列表
   */
  async getAPIKeys(userId: string, organizationId?: string): Promise<APIKey[]> {
    let query = this.supabase
      .from('api_keys')
      .select('*')

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    } else {
      query = query.eq('user_id', userId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`获取API密钥失败: ${error.message}`)
    }

    return (data || []).map((record: any) => ({
      id: record.id,
      name: record.name,
      key: record.key,
      prefix: record.prefix,
      scopes: record.scopes,
      rateLimit: record.rate_limit,
      userId: record.user_id,
      organizationId: record.organization_id,
      isActive: record.is_active,
      expiresAt: record.expires_at,
      lastUsedAt: record.last_used_at,
      createdAt: record.created_at
    }))
  }

  /**
   * 撤销API密钥
   */
  async revokeAPIKey(apiKeyId: string, userId: string): Promise<void> {
    await this.supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', apiKeyId)
      .eq('user_id', userId)

    await this.auditService.log({
      userId,
      username: 'api_user',
      action: 'api_key_revoked',
      resourceType: 'api_key',
      resourceId: apiKeyId,
      oldValue: null,
      newValue: null,
      result: 'success'
    })
  }

  /**
   * 获取用量统计
   */
  async getUsageSummary(
    apiKeyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageSummary[]> {
    const { data, error } = await this.supabase
      .from('api_usage')
      .select('*')
      .eq('api_key_id', apiKeyId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      throw new Error(`获取用量统计失败: ${error.message}`)
    }

    // 按日期聚合
    const summaryByDate: Record<string, UsageSummary> = {}

    for (const record of data || []) {
      const date = record.timestamp.split('T')[0]

      if (!summaryByDate[date]) {
        summaryByDate[date] = {
          apiKeyId,
          date,
          totalRequests: 0,
          successRequests: 0,
          failedRequests: 0,
          totalResponseTime: 0,
          avgResponseTime: 0,
          statusCodes: {},
          topEndpoints: []
        }
      }

      const summary = summaryByDate[date]
      summary.totalRequests++
      summary.totalResponseTime += record.response_time

      if (record.status_code >= 200 && record.status_code < 300) {
        summary.successRequests++
      } else {
        summary.failedRequests++
      }

      // 统计状态码
      summary.statusCodes[record.status_code] = (summary.statusCodes[record.status_code] || 0) + 1

      // 统计端点
      const endpointExists = summary.topEndpoints.find(e => e.endpoint === record.endpoint)
      if (endpointExists) {
        endpointExists.count++
      } else {
        summary.topEndpoints.push({ endpoint: record.endpoint, count: 1 })
      }
    }

    // 计算平均响应时间和排序
    for (const date in summaryByDate) {
      const summary = summaryByDate[date]
      summary.avgResponseTime = summary.totalRequests > 0
        ? summary.totalResponseTime / summary.totalRequests
        : 0
      summary.topEndpoints.sort((a, b) => b.count - a.count)
    }

    return Object.values(summaryByDate)
  }

  /**
   * 检查速率限制
   */
  async checkRateLimit(apiKeyId: string, windowMinutes: number = 1): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: string;
  }> {
    // 查询当前时间窗口内的请求次数
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

    const { data, error } = await this.supabase
      .from('api_usage')
      .select('count')
      .eq('api_key_id', apiKeyId)
      .gte('timestamp', windowStart.toISOString())

    if (error) {
      throw new Error(`检查速率限制失败: ${error.message}`)
    }

    const currentCount = data?.length || 0

    // 获取密钥的速率限制
    const { data: apiKeyData } = await this.supabase
      .from('api_keys')
      .select('rate_limit')
      .eq('id', apiKeyId)
      .single()

    const rateLimit = apiKeyData?.rate_limit || 1000

    return {
      allowed: currentCount < rateLimit,
      remaining: Math.max(0, rateLimit - currentCount),
      resetAt: new Date(Date.now() + windowMinutes * 60 * 1000).toISOString()
    }
  }

  /**
   * 获取API密钥详情
   */
  async getAPIKeyDetails(apiKeyId: string): Promise<APIKey | null> {
    const { data, error } = await this.supabase
      .from('api_keys')
      .select('*')
      .eq('id', apiKeyId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      name: data.name,
      key: data.key,
      prefix: data.prefix,
      scopes: data.scopes,
      rateLimit: data.rate_limit,
      userId: data.user_id,
      organizationId: data.organization_id,
      isActive: data.is_active,
      expiresAt: data.expires_at,
      lastUsedAt: data.last_used_at,
      createdAt: data.created_at
    }
  }
}
