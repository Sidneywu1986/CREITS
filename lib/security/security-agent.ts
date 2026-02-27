import { createClient } from '@/lib/supabase/server'

export interface SecurityAlert {
  id: string
  type: 'bruteforce' | 'unusual_time' | 'multiple_ips' | 'permission_escalation'
  severity: 'critical' | 'high' | 'medium' | 'low'
  userId: string
  ipAddress: string
  timestamp: Date
  details: {
    failureCount?: number
    ipCount?: number
    denialCount?: number
    timeWindow?: string
    [key: string]: any
  }
  status: 'new' | 'acknowledged' | 'resolved'
}

export class SecurityAgent {
  private _supabase: any = null

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

  constructor() {
    // 延迟初始化
  }

  // 1. 分析登录模式异常
  async analyzeLoginPatterns(): Promise<SecurityAlert[]> {
    const supabase = this.supabase
    if (!supabase) {
      return []
    }

    const alerts: SecurityAlert[] = []

    // 获取最近24小时的登录尝试记录
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const { data: attempts } = await supabase
      .from('login_attempts')
      .select('*')
      .gte('created_at', oneDayAgo.toISOString())

    if (!attempts) return alerts

    // 检测：暴力破解（同一IP 5次以上失败登录）
    const ipFailures = new Map<string, number>()
    attempts.forEach((a: any) => {
      if (!a.success) {
        ipFailures.set(a.ip_address, (ipFailures.get(a.ip_address) || 0) + 1)
      }
    })

    ipFailures.forEach((count, ip) => {
      if (count >= 5) {
        alerts.push({
          id: `bf-${Date.now()}-${ip}`,
          type: 'bruteforce',
          severity: count >= 10 ? 'critical' : 'high',
          userId: '',
          ipAddress: ip,
          timestamp: new Date(),
          details: { failureCount: count, timeWindow: '24小时' },
          status: 'new'
        })
      }
    })

    // 检测：非常规时间登录（凌晨 0-6 点）
    const unusualLogins = new Map<string, number>()
    attempts.forEach((a: any) => {
      if (a.success) {
        const hour = new Date(a.created_at).getHours()
        if (hour >= 0 && hour < 6) {
          unusualLogins.set(a.user_id, (unusualLogins.get(a.user_id) || 0) + 1)
        }
      }
    })

    unusualLogins.forEach((count, userId) => {
      if (count >= 3) {
        alerts.push({
          id: `ut-${Date.now()}-${userId}`,
          type: 'unusual_time',
          severity: 'medium',
          userId,
          ipAddress: 'multiple',
          timestamp: new Date(),
          details: { loginCount: count, timeRange: '凌晨0-6点' },
          status: 'new'
        })
      }
    })

    // 检测：多IP登录（同一用户从3个以上不同IP登录）
    const userIPs = new Map<string, Set<string>>()
    attempts.forEach((a: any) => {
      if (a.success) {
        if (!userIPs.has(a.user_id)) {
          userIPs.set(a.user_id, new Set())
        }
        userIPs.get(a.user_id)!.add(a.ip_address)
      }
    })

    userIPs.forEach((ips, userId) => {
      if (ips.size >= 3) { // 同一用户从3个不同IP登录
        alerts.push({
          id: `mi-${Date.now()}-${userId}`,
          type: 'multiple_ips',
          severity: 'medium',
          userId,
          ipAddress: Array.from(ips).join(','),
          timestamp: new Date(),
          details: { ipCount: ips.size },
          status: 'new'
        })
      }
    })

    return alerts
  }

  // 2. 分析权限异常
  async analyzePermissionAnomalies(): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = []

    // 获取最近24小时的审计日志
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const { data: logs } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('result', 'failure')
      .gte('created_at', oneDayAgo.toISOString())

    if (!logs) return alerts

    // 检测：频繁权限拒绝
    const userDenials = new Map<string, number>()
    logs.forEach((log: any) => {
      if (log.action.includes('update') || log.action.includes('delete')) {
        userDenials.set(log.user_id, (userDenials.get(log.user_id) || 0) + 1)
      }
    })

    userDenials.forEach((count, userId) => {
      if (count >= 5) { // 5次权限拒绝/天
        alerts.push({
          id: `pe-${Date.now()}-${userId}`,
          type: 'permission_escalation',
          severity: 'high',
          userId,
          ipAddress: 'multiple',
          timestamp: new Date(),
          details: { denialCount: count, timeWindow: '24小时' },
          status: 'new'
        })
      }
    })

    return alerts
  }

  // 3. 运行完整分析
  async runFullAnalysis(): Promise<{
    alerts: SecurityAlert[]
    summary: any
  }> {
    const loginAlerts = await this.analyzeLoginPatterns()
    const permissionAlerts = await this.analyzePermissionAnomalies()
    const allAlerts = [...loginAlerts, ...permissionAlerts]

    // 存储告警
    if (allAlerts.length > 0) {
      await this.supabase.from('security_alerts').insert(
        allAlerts.map(a => ({
          type: a.type,
          severity: a.severity,
          user_id: a.userId || null,
          ip_address: a.ipAddress,
          details: a.details,
          status: 'new'
        }))
      )
    }

    return {
      alerts: allAlerts,
      summary: {
        total: allAlerts.length,
        critical: allAlerts.filter(a => a.severity === 'critical').length,
        high: allAlerts.filter(a => a.severity === 'high').length,
        medium: allAlerts.filter(a => a.severity === 'medium').length,
        low: allAlerts.filter(a => a.severity === 'low').length,
        timestamp: new Date()
      }
    }
  }
}
