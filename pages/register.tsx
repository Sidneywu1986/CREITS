'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerUser, type AuthResult } from '@/lib/supabase/auth';

// 默认角色列表
const DEFAULT_ROLES = [
  { code: 'super_admin', name: '超级管理员' },
  { code: 'admin', name: '管理员' },
  { code: 'editor', name: '编辑' },
  { code: 'viewer', name: '查看者' },
  { code: 'guest', name: '访客' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: 'viewer', // 默认角色
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      const result: AuthResult = await registerUser(
        formData.username,
        formData.email,
        formData.password,
        formData.roleId
      );

      if (result.success) {
        setSuccess(true);
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || '注册失败，请稍后重试');
      }
    } catch (err) {
      setError('系统错误，请稍后重试');
      console.error('注册错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, roleId: value }));
  };

  return (
    <>
      <Head>
        <title>注册 - REITs智能助手</title>
        <meta name="description" content="注册REITs智能助手账号" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">REITs智能助手</h1>
            <p className="text-slate-400">创建您的账号</p>
          </div>

          {/* 注册表单 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-white text-center">
                创建账号
              </CardTitle>
              <CardDescription className="text-slate-400 text-center">
                请填写以下信息完成注册
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 错误提示 */}
                  {error && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-400">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* 用户名 */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300">
                      用户名
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="请输入用户名"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#667eea]"
                    />
                  </div>

                  {/* 邮箱 */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      邮箱
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="请输入邮箱地址"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#667eea]"
                    />
                  </div>

                  {/* 密码 */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">
                      密码
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="请输入密码（至少6位）"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      minLength={6}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#667eea]"
                    />
                  </div>

                  {/* 确认密码 */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">
                      确认密码
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="请再次输入密码"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#667eea]"
                    />
                  </div>

                  {/* 角色 */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-300">
                      角色
                    </Label>
                    <Select value={formData.roleId} onValueChange={handleRoleChange} disabled={loading}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="请选择角色" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {DEFAULT_ROLES.map((role) => (
                          <SelectItem key={role.code} value={role.code} className="text-white hover:bg-slate-700">
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 注册按钮 */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#667eea]/90 hover:to-[#764ba2]/90 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        注册中...
                      </>
                    ) : (
                      '注册'
                    )}
                  </Button>
                </form>
              ) : (
                /* 注册成功提示 */
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">注册成功</h3>
                      <p className="text-slate-400">正在跳转到登录页面...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 登录链接 */}
              {!success && (
                <div className="mt-6 text-center text-sm text-slate-400">
                  已有账号？{' '}
                  <Link href="/login" className="text-[#667eea] hover:text-[#764ba2] font-medium">
                    立即登录
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 底部信息 */}
          <div className="mt-8 text-center text-xs text-slate-500">
            <p>REITs智能助手 v1.0.0</p>
            <p className="mt-1">© 2024 REITs Assistant. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}
