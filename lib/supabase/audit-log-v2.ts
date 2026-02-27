import { createClient } from '@/lib/supabase/server'
import { getEncryptionService } from '@/lib/security/encryption'

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  resourceType: string
  resourceId: string | null
  oldValue: any
  newValue: any
  sensitiveData: any
  ipAddress: string | null
  userAgent: string | null
  result: 'success' | 'failure'
  errorMessage: string | null
  createdAt: string
}

export interface AuditLogFilter {
  userId?: string
  resourceType?: string
  action?: string
  result?: 'success' | 'failure'
  startDate?: string
  endDate?: string
}

/**
 * 敏感数据脱敏服务
 */
export class DataMaskingService {
  // 脱敏规则：正则表达式列表
  private static sensitivePatterns: Array<{ pattern: RegExp; replace?: string; handler?: (match: string) => string }> = [
    // 密码
    { pattern: /"password"\s*:\s*"[^"]*"/gi, replace: '"password":"***"' },
    { pattern: /'password'\s*:\s*'[^']*'/gi, replace: "'password':'***'" },
    { pattern: /password=[^&\s]+/gi, replace: 'password=***' },

    // API密钥和Token
    { pattern: /"api[_-]?key"\s*:\s*"[^"]{8,}"/gi, replace: '"api_key":"***"' },
    { pattern: /"token"\s*:\s*"[^"]{8,}"/gi, replace: '"token":"***"' },
    { pattern: /"access[_-]?token"\s*:\s*"[^"]{8,}"/gi, replace: '"access_token":"***"' },
    { pattern: /"secret"\s*:\s*"[^"]{8,}"/gi, replace: '"secret":"***"' },

    // 2FA密钥
    { pattern: /"two[_-]?factor[_-]?secret"\s*:\s*"[^"]+"/gi, replace: '"two_factor_secret":"***"' },
    { pattern: /"otp"\s*:\s*"[^"]+"/gi, replace: '"otp":"***"' },

    // 身份证号
    { pattern: /\b\d{17}[\dXx]\b/g, replace: '***ID***' },

    // 手机号
    { pattern: /\b1[3-9]\d{9}\b/g, handler: (match: string) => {
      return match.substring(0, 3) + '****' + match.substring(7)
    } },

    // 邮箱
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, handler: (match: string) => {
      const [local, domain] = match.split('@')
      const maskedLocal = local.substring(0, 2) + '***'
      return maskedLocal + '@' + domain
    } },

    // IP地址（可选，根据需求）
    { pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, handler: (match: string) => {
      const parts = match.split('.')
      return parts[0] + '.' + parts[1] + '.***.***'
    } },

    // 信用卡号
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, handler: (match: string) => {
      const cleaned = match.replace(/[\s-]/g, '')
      return cleaned.substring(0, 4) + ' **** **** ' + cleaned.substring(12)
    } },
  ]

  /**
   * 脱敏处理JSON对象
   */
  static maskObject(obj: any): any {
    if (!obj) return obj

    const jsonStr = JSON.stringify(obj)
    const masked = this.maskString(jsonStr)

    try {
      return JSON.parse(masked)
    } catch (error) {
      console.error('脱敏后的JSON解析失败:', error)
      return null
    }
  }

  /**
   * 脱敏处理字符串
   */
  static maskString(str: string): string {
    if (!str) return str

    let masked = str

    // 应用所有脱敏规则
    for (const item of this.sensitivePatterns) {
      if (item.handler) {
        masked = masked.replace(item.pattern, item.handler)
      } else if (item.replace) {
        masked = masked.replace(item.pattern, item.replace)
      }
    }

    return masked
  }

  /**
   * 检查数据是否包含敏感信息
   */
  static containsSensitiveData(obj: any): boolean {
    if (!obj) return false

    const jsonStr = JSON.stringify(obj).toLowerCase()
    const sensitiveKeywords = [
      'password', 'secret', 'token', 'key', 'otp',
      'api_key', 'access_token', 'auth_token',
      'two_factor_secret', 'backup_code'
    ]

    return sensitiveKeywords.some(keyword => jsonStr.includes(keyword))
  }

  /**
   * 脱敏处理审计日志
   */
  static maskAuditLog(log: AuditLog): AuditLog {
    return {
      ...log,
      oldValue: this.maskObject(log.oldValue),
      newValue: this.maskObject(log.newValue),
      sensitiveData: null, // 敏感数据永远不返回
      errorMessage: this.maskString(log.errorMessage || ''),
      username: this.maskString(log.username)
    }
  }
}

/**
 * 审计日志服务
 */
export class AuditLogService {
  private _supabase: any = null
  private _encryptionService: any = null

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

  private get encryptionService() {
    if (!this._encryptionService) {
      try {
        this._encryptionService = getEncryptionService()
      } catch (error) {
        console.warn('Failed to create encryption service:', error)
        this._encryptionService = null
      }
    }
    return this._encryptionService
  }

  constructor() {
    // 延迟初始化，不在这里创建客户端
  }

  /**
   * 记录审计日志
   */
  async log(params: {
    userId: string
    username: string
    action: string
    resourceType: string
    resourceId?: string | null
    oldValue?: any
    newValue?: any
    sensitiveData?: any
    ipAddress?: string
    userAgent?: string
    result?: 'success' | 'failure'
    errorMessage?: string | null
  }): Promise<void> {
    try {
      // 检查是否包含敏感数据
      const hasSensitive = DataMaskingService.containsSensitiveData(params.newValue) ||
                          DataMaskingService.containsSensitiveData(params.oldValue)

      // 脱敏处理
      const maskedOldValue = hasSensitive ? DataMaskingService.maskObject(params.oldValue) : params.oldValue
      const maskedNewValue = hasSensitive ? DataMaskingService.maskObject(params.newValue) : params.newValue

      // 加密敏感数据（如果有）
      let encryptedData = null
      if (params.sensitiveData) {
        const encrypted = this.encryptionService.createEncryptedData(
          JSON.stringify(params.sensitiveData)
        )
        encryptedData = {
          encrypted_data: encrypted.encrypted_data,
          iv: encrypted.iv,
          auth_tag: encrypted.auth_tag
        }
      }

      await this.supabase.from('audit_logs').insert({
        user_id: params.userId,
        username: params.username,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId || null,
        old_value: maskedOldValue || null,
        new_value: maskedNewValue || null,
        sensitive_data: encryptedData,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
        result: params.result || 'success',
        error_message: DataMaskingService.maskString(params.errorMessage || '')
      })
    } catch (error) {
      console.error('记录审计日志失败:', error)
      // 审计日志记录失败不应该影响主流程
    }
  }

  /**
   * 查询审计日志
   */
  async query(
    filter: AuditLogFilter = {},
    page = 1,
    pageSize = 50
  ): Promise<{
    data: AuditLog[]
    total: number
  }> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // 应用过滤条件
      if (filter.userId) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.resourceType) {
        query = query.eq('resource_type', filter.resourceType)
      }
      if (filter.action) {
        query = query.eq('action', filter.action)
      }
      if (filter.result) {
        query = query.eq('result', filter.result)
      }
      if (filter.startDate) {
        query = query.gte('created_at', filter.startDate)
      }
      if (filter.endDate) {
        query = query.lte('created_at', filter.endDate)
      }

      // 分页
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query.range(from, to)

      if (error) {
        console.error('查询审计日志失败:', error)
        return { data: [], total: 0 }
      }

      // 脱敏处理返回数据
      const maskedData = (data || []).map((log: any) =>
        DataMaskingService.maskAuditLog(log as AuditLog)
      )

      return {
        data: maskedData,
        total: count || 0
      }
    } catch (error) {
      console.error('查询审计日志失败:', error)
      return { data: [], total: 0 }
    }
  }

  /**
   * 获取单个审计日志详情
   */
  async getById(id: string): Promise<AuditLog | null> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('获取审计日志失败:', error)
        return null
      }

      // 脱敏处理
      return DataMaskingService.maskAuditLog(data as AuditLog)
    } catch (error) {
      console.error('获取审计日志失败:', error)
      return null
    }
  }

  /**
   * 获取用户操作统计
   */
  async getUserActionStats(
    userId: string,
    days = 30
  ): Promise<{
    total: number
    success: number
    failure: number
    byAction: Record<string, number>
  }> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('action, result')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())

      if (error) {
        console.error('获取用户操作统计失败:', error)
        return { total: 0, success: 0, failure: 0, byAction: {} }
      }

      const stats = {
        total: data?.length || 0,
        success: 0,
        failure: 0,
        byAction: {} as Record<string, number>
      }

      data?.forEach((log: any) => {
        if (log.result === 'success') {
          stats.success++
        } else {
          stats.failure++
        }

        const action = log.action as string
        stats.byAction[action] = (stats.byAction[action] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('获取用户操作统计失败:', error)
      return { total: 0, success: 0, failure: 0, byAction: {} }
    }
  }

  /**
   * 导出审计日志（CSV格式）
   */
  async exportToCSV(filter: AuditLogFilter = {}): Promise<string> {
    const { data } = await this.query(filter, 1, 10000)

    const headers = ['时间', '用户', '操作', '资源类型', '资源ID', '结果', 'IP地址', '错误信息']
    const rows = data.map(log => [
      new Date(log.createdAt).toLocaleString('zh-CN'),
      log.username,
      log.action,
      log.resourceType,
      log.resourceId,
      log.result,
      log.ipAddress,
      log.errorMessage
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }
}
