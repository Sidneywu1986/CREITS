'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { IPWhitelistItem } from '@/lib/security/ip-whitelist'
import {
  Shield,
  Plus,
  Trash2,
  Globe,
  Check,
  X,
  AlertTriangle
} from 'lucide-react'

export default function IPWhitelistPage() {
  const [whitelist, setWhitelist] = useState<IPWhitelistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newIP, setNewIP] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const supabase = createClient()
  const hasSupabase = supabase !== null

  // 加载白名单
  const loadWhitelist = async () => {
    if (!hasSupabase) {
      setError('数据库未配置')
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/ip-whitelist')
      const result = await response.json()

      if (result.success) {
        setWhitelist(result.data || [])
      }
    } catch (error) {
      console.error('加载白名单失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWhitelist()
  }, [])

  // 添加IP到白名单
  const handleAdd = async () => {
    setError('')
    setSuccess('')

    if (!newIP) {
      setError('请输入IP地址')
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch('/api/admin/ip-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip_address: newIP.trim(),
          description: newDescription.trim() || undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('IP已添加到白名单')
        setNewIP('')
        setNewDescription('')
        setIsDialogOpen(false)
        await loadWhitelist()
      } else {
        setError(result.error || '添加失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsAdding(false)
    }
  }

  // 从白名单移除IP
  const handleRemove = async (id: string) => {
    if (!confirm('确定要从白名单移除此IP吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/ip-whitelist/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('IP已从白名单移除')
        await loadWhitelist()
      } else {
        setError(result.error || '移除失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    }
  }

  // 验证IP格式
  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const cidrRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/

    return ipv4Regex.test(ip) || cidrRegex.test(ip)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6" />
              IP 白名单管理
            </h1>
            <p className="text-white/60 mt-1">
              限制允许访问的IP地址，提高账户安全性
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                添加IP
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">添加IP到白名单</DialogTitle>
                <DialogDescription className="text-white/60">
                  添加IP地址或CIDR范围到白名单
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">IP地址 / CIDR</Label>
                  <Input
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                    placeholder="例如: 192.168.1.1 或 192.168.1.0/24"
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                  />
                  {newIP && !isValidIP(newIP) && (
                    <p className="text-red-400 text-sm mt-1">IP地址格式无效</p>
                  )}
                </div>

                <div>
                  <Label className="text-white">描述（可选）</Label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="例如: 办公室网络"
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setNewIP('')
                    setNewDescription('')
                    setError('')
                  }}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  取消
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={isAdding || !newIP || !isValidIP(newIP)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAdding ? '添加中...' : '添加'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-white/80 space-y-2">
                <p className="font-medium">重要提示</p>
                <ul className="text-sm space-y-1">
                  <li>• 支持单个IP地址（如 192.168.1.1）</li>
                  <li>• 支持CIDR范围（如 192.168.1.0/24）</li>
                  <li>• 添加到白名单的IP将被允许访问</li>
                  <li>• 请谨慎添加，避免将自己锁定</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 白名单列表 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              白名单列表 ({whitelist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-white/60">加载中...</div>
            ) : whitelist.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无IP白名单</p>
              </div>
            ) : (
              <div className="space-y-3">
                {whitelist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium font-mono">{item.ip_address}</p>
                        {item.description && (
                          <p className="text-white/60 text-sm">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-2 text-red-300">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-2 text-green-300">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}
      </div>
    </div>
  )
}
