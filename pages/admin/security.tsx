// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Lock,
  UserX
} from 'lucide-react'
import { usePermission } from '@/hooks/usePermission'

type SecurityAlertStatus = 'new' | 'acknowledged' | 'resolved'

interface SecurityAlert {
  id: string
  type: string
  severity: string
  user_id: string | null
  ip_address: string
  details: any
  status: SecurityAlertStatus
  created_at: string
  resolved_at?: string
  resolved_by?: string
}

export default function SecurityDashboard() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const { canRead, canUpdate } = usePermission()
  const supabase = createClient()

  useEffect(() => {
    loadSecurityData()

    // 实时订阅新告警
    const subscription = supabase
      .channel('security_alerts')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'security_alerts' },
        (payload) => {
          setAlerts(prev => [payload.new as SecurityAlert, ...prev])
          updateSummary()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    loadSecurityData()
  }, [timeRange])

  const updateSummary = () => {
    setSummary({
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    })
  }

  const loadSecurityData = async () => {
    setLoading(true)

    try {
      // 根据时间范围过滤
      const now = new Date()
      const timeFilters: Record<string, Date> = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }

      const startDate = timeFilters[timeRange] || timeFilters['24h']

      // 获取告警数据
      const { data: alerts } = await supabase
        .from('security_alerts')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      if (alerts) {
        setAlerts(alerts as SecurityAlert[])
        updateSummary()
      }
    } catch (error) {
      console.error('加载安全数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/security/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('分析失败')
      }

      const result = await response.json()
      alert(`分析完成！发现 ${result.summary.total} 个告警`)
      await loadSecurityData()
    } catch (error) {
      console.error('运行分析失败:', error)
      alert('分析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      const { error } = (await supabase
        .from('security_alerts')
        .update({ status: 'acknowledged' })
        .eq('id', alertId)) as any

      if (error) throw error

      await loadSecurityData()
    } catch (error) {
      console.error('确认告警失败:', error)
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // @ts-ignore - Supabase 类型推断问题
      const { error } = await supabase
        .from('security_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', alertId)

      if (error) throw error

      await loadSecurityData()
    } catch (error) {
      console.error('解决告警失败:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'border-yellow-500/30 text-yellow-400'
      case 'acknowledged': return 'border-blue-500/30 text-blue-400'
      case 'resolved': return 'border-green-500/30 text-green-400'
      default: return 'border-slate-500/30 text-slate-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bruteforce': return <Lock className="w-4 h-4" />
      case 'unusual_time': return <Clock className="w-4 h-4" />
      case 'multiple_ips': return <Activity className="w-4 h-4" />
      case 'permission_escalation': return <Shield className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      bruteforce: '暴力破解',
      unusual_time: '非常规时间',
      multiple_ips: '多IP登录',
      permission_escalation: '权限异常'
    }
    return typeMap[type] || type
  }

  const getSeverityName = (severity: string) => {
    const severityMap: Record<string, string> = {
      critical: '严重',
      high: '高',
      medium: '中',
      low: '低'
    }
    return severityMap[severity] || severity
  }

  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      new: '待处理',
      acknowledged: '已确认',
      resolved: '已解决'
    }
    return statusMap[status] || status
  }

  if (!can('system', 'security')) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <UserX className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white/60 text-lg">无权访问安全仪表盘</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">安全智能分析</h1>
          <p className="text-white/60 text-sm mt-1">实时监控安全事件和异常行为</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="1h" className="text-white">最近1小时</SelectItem>
              <SelectItem value="24h" className="text-white">最近24小时</SelectItem>
              <SelectItem value="7d" className="text-white">最近7天</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={runAnalysis}
            disabled={loading || !can('system', 'analyze')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            运行分析
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">总告警数</p>
                <p className="text-2xl font-bold text-white">{summary?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">高危告警</p>
                <p className="text-2xl font-bold text-white">
                  {(summary?.critical || 0) + (summary?.high || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">待处理</p>
                <p className="text-2xl font-bold text-white">
                  {alerts.filter(a => a.status === 'new').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">已解决</p>
                <p className="text-2xl font-bold text-white">
                  {alerts.filter(a => a.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 告警列表 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">实时告警</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">类型</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">严重级别</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">IP地址</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">详情</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {alerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-700/20">
                    <td className="px-4 py-3 text-sm text-white/80">
                      {new Date(alert.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(alert.type)}
                        <span className="text-sm text-white/80">{getTypeName(alert.type)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {getSeverityName(alert.severity)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 font-mono">
                      {alert.ip_address}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {alert.details?.failureCount ? `${alert.details.failureCount}次失败` :
                       alert.details?.ipCount ? `${alert.details.ipCount}个IP` :
                       alert.details?.loginCount ? `${alert.details.loginCount}次登录` :
                       alert.details?.denialCount ? `${alert.details.denialCount}次拒绝` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getStatusColor(alert.status)}>
                        {getStatusName(alert.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {alert.status === 'new' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            确认
                          </Button>
                        )}
                        {(alert.status === 'new' || alert.status === 'acknowledged') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                            className="text-green-400 hover:text-green-300"
                          >
                            解决
                          </Button>
                        )}
                        {alert.status === 'resolved' && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-white/40">
                      暂无告警数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 说明卡片 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">告警类型说明</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-red-400 mt-1" />
              <div>
                <p className="text-white font-medium">暴力破解</p>
                <p className="text-white/60 text-sm">同一IP 5次以上失败登录，超过10次判定为严重</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-yellow-400 mt-1" />
              <div>
                <p className="text-white font-medium">非常规时间登录</p>
                <p className="text-white/60 text-sm">凌晨0-6点3次以上成功登录</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-yellow-400 mt-1" />
              <div>
                <p className="text-white font-medium">多IP异常登录</p>
                <p className="text-white/60 text-sm">同一用户从3个以上不同IP登录</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-orange-400 mt-1" />
              <div>
                <p className="text-white font-medium">权限异常</p>
                <p className="text-white/60 text-sm">24小时内5次以上权限拒绝（更新/删除操作）</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
