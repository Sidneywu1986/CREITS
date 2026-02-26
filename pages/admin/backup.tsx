'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  HardDrive,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react'
import { BackupMetadata } from '@/lib/backup/backup-service'

export default function BackupManagement() {
  const [backups, setBackups] = useState<BackupMetadata[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 加载备份数据
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [backupsRes, statsRes] = await Promise.all([
        fetch('/api/admin/backup'),
        fetch('/api/admin/backup/stats')
      ])

      const backupsData = await backupsRes.json()
      const statsData = await statsRes.json()

      if (backupsData.success) {
        setBackups(backupsData.data || [])
      }

      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('加载备份数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 创建备份
  const handleCreateBackup = async () => {
    if (!confirm('确定要创建新的备份吗？这可能需要几分钟时间。')) {
      return
    }

    setIsCreating(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('备份创建成功')
        await loadData()
      } else {
        setError(result.error || '创建备份失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsCreating(false)
    }
  }

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // 格式化时间
  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Database className="w-6 h-6" />
              数据备份管理
            </h1>
            <p className="text-white/60 mt-1">
              自动化备份和数据恢复，保护重要数据
            </p>
          </div>

          <Button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isCreating ? 'animate-spin' : ''}`} />
            {isCreating ? '创建中...' : '立即备份'}
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">总备份数</p>
                  <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">总大小</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalSize ? formatSize(stats.totalSize) : '0 B'}
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
                  <p className="text-sm text-white/60">成功备份</p>
                  <p className="text-2xl font-bold text-white">{stats?.successful || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">失败备份</p>
                  <p className="text-2xl font-bold text-white">{stats?.failed || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最新备份信息 */}
        {stats?.latestBackup && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                最新备份
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-white/60">文件名</p>
                  <p className="text-white font-medium mt-1">{stats.latestBackup.filename}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">创建时间</p>
                  <p className="text-white font-medium mt-1">{formatTime(stats.latestBackup.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">状态</p>
                  <Badge
                    variant="outline"
                    className={
                      stats.latestBackup.status === 'completed'
                        ? 'border-green-500/30 text-green-400 mt-1'
                        : 'border-red-500/30 text-red-400 mt-1'
                    }
                  >
                    {stats.latestBackup.status === 'completed' ? '成功' : '失败'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 备份列表 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">备份历史</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-white/60">加载中...</div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无备份记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        backup.status === 'completed'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        {backup.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>

                      <div>
                        <p className="text-white font-medium">{backup.filename}</p>
                        <p className="text-white/60 text-sm">
                          {formatTime(backup.created_at)} • {formatSize(backup.size)} • {backup.tables.length} 个表
                        </p>
                        {backup.error && (
                          <p className="text-red-400 text-xs mt-1">{backup.error}</p>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={
                        backup.status === 'completed'
                          ? 'border-green-500/30 text-green-400'
                          : 'border-red-500/30 text-red-400'
                      }
                    >
                      {backup.status === 'completed' ? '成功' : '失败'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 说明 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <h3 className="text-white font-medium mb-3">备份说明</h3>
            <ul className="text-white/60 text-sm space-y-2">
              <li>• 系统每天凌晨2点自动创建备份</li>
              <li>• 备份数据采用AES-256-GCM加密存储</li>
              <li>• 备份文件保留90天，超期自动清理</li>
              <li>• 可手动创建备份，不影响定时备份</li>
              <li>• 备份包含用户、角色、权限、审计日志等核心数据</li>
            </ul>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-2 text-red-300">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-2 text-green-300">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}
      </div>
    </div>
  )
}
