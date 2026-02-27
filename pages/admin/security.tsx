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
  const { canRead } = usePermission()

  if (!canRead('system:settings')) {
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
            disabled={loading}
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
