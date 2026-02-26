'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  CheckCircle,
  Shield,
  ShieldCheck,
  Smartphone,
  Lock
} from 'lucide-react'

interface TwoFactorSetupData {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export default function TwoFactorSettings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [disableToken, setDisableToken] = useState('')

  const supabase = createClient()

  // 加载用户2FA状态
  const loadTwoFactorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('two_factor_enabled')
          .eq('id', user.id)
          .single()

        if (data) {
          setIsEnabled(data.two_factor_enabled)
        }
      }
    } catch (error) {
      console.error('加载2FA状态失败:', error)
    }
  }

  useState(() => {
    loadTwoFactorStatus()
  })

  // 生成2FA配置
  const handleSetup = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (result.success) {
        setSetupData(result)
      } else {
        setError(result.error || '生成配置失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 启用2FA
  const handleEnable = async () => {
    if (!token || !setupData) {
      setError('请输入验证码')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: setupData.secret,
          token: token
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('双因素认证已启用')
        setIsEnabled(true)
        setSetupData(null)
        setToken('')
      } else {
        setError(result.error || '启用失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 禁用2FA
  const handleDisable = async () => {
    if (!disableToken) {
      setError('请输入验证码')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: disableToken
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('双因素认证已禁用')
        setIsEnabled(false)
        setDisableToken('')
      } else {
        setError(result.error || '禁用失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6" />
            双因素认证 (2FA)
          </h1>
          <p className="text-white/60 mt-1">
            增强账户安全性，防止未授权访问
          </p>
        </div>

        {/* 当前状态 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isEnabled ? (
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-yellow-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    当前状态：{isEnabled ? '已启用' : '未启用'}
                  </h2>
                  <p className="text-sm text-white/60">
                    {isEnabled
                      ? '您的账户已受到双因素认证保护'
                      : '建议启用双因素认证以提高安全性'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 未启用状态 - 显示启用按钮 */}
        {!isEnabled && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">启用双因素认证</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-white/80">
                  <Smartphone className="w-5 h-5 mt-0.5 text-blue-400" />
                  <p>下载 Google Authenticator 或其他 TOTP 应用</p>
                </div>
                <div className="flex items-start gap-3 text-white/80">
                  <Lock className="w-5 h-5 mt-0.5 text-blue-400" />
                  <p>扫描下方二维码或输入密钥</p>
                </div>
                <div className="flex items-start gap-3 text-white/80">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-blue-400" />
                  <p>输入应用生成的6位验证码完成设置</p>
                </div>
              </div>

              {!setupData ? (
                <Button
                  onClick={handleSetup}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? '生成中...' : '开始设置'}
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* 二维码 */}
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={setupData.qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>

                  {/* 密钥 */}
                  <div>
                    <Label className="text-white">密钥（备用）</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={setupData.secret}
                        readOnly
                        className="bg-slate-700 border-slate-600 text-white font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(setupData.secret)
                          setSuccess('密钥已复制')
                          setTimeout(() => setSuccess(''), 2000)
                        }}
                      >
                        复制
                      </Button>
                    </div>
                  </div>

                  {/* 验证码输入 */}
                  <div>
                    <Label className="text-white">验证码</Label>
                    <Input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="输入6位验证码"
                      maxLength={6}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleEnable}
                    disabled={isLoading || token.length !== 6}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? '启用中...' : '确认启用'}
                  </Button>

                  {/* 备份码 */}
                  {setupData.backupCodes && setupData.backupCodes.length > 0 && (
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <Label className="text-white font-medium">备份码（请妥善保存）</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {setupData.backupCodes.map((code, index) => (
                          <div key={index} className="bg-slate-600/50 p-2 rounded font-mono text-sm text-white/80">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 已启用状态 - 显示禁用按钮 */}
        {isEnabled && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">禁用双因素认证</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlertCircle className="w-12 h-12 text-yellow-400 mb-4" />

              <p className="text-white/80">
                禁用双因素认证会降低您的账户安全性。建议仅在必要时禁用。
              </p>

              <div>
                <Label className="text-white">请输入当前验证码以确认禁用</Label>
                <Input
                  type="text"
                  value={disableToken}
                  onChange={(e) => setDisableToken(e.target.value)}
                  placeholder="输入6位验证码"
                  maxLength={6}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <Button
                onClick={handleDisable}
                disabled={isLoading || disableToken.length !== 6}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? '禁用中...' : '确认禁用'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-2 text-red-300">
            <AlertCircle className="w-5 h-5" />
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
