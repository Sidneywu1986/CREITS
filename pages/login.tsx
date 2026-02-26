'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, AlertCircle } from 'lucide-react';
import { loginUser, type AuthResult } from '@/lib/supabase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result: AuthResult = await loginUser(formData.username, formData.password);

      if (result.success && result.user) {
        // 保存用户信息到 localStorage
        localStorage.setItem('currentUser', JSON.stringify(result.user));

        // 记录登录成功
        console.log('登录成功:', result.user);

        // 重定向到目标页面或首页
        const callbackUrl = router.query.callback as string;
        router.push(callbackUrl || '/');
      } else {
        setError(result.error || '登录失败，请检查用户名和密码');
      }
    } catch (err) {
      setError('系统错误，请稍后重试');
      console.error('登录错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Head>
        <title>登录 - REITs智能助手</title>
        <meta name="description" content="登录REITs智能助手后台管理系统" />
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
            <p className="text-slate-400">登录后台管理系统</p>
          </div>

          {/* 登录表单 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-white text-center">
                欢迎回来
              </CardTitle>
              <CardDescription className="text-slate-400 text-center">
                请输入您的账号和密码
              </CardDescription>
            </CardHeader>
            <CardContent>
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

                {/* 密码 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300">
                      密码
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#667eea] hover:text-[#764ba2]"
                    >
                      忘记密码？
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#667eea]"
                  />
                </div>

                {/* 登录按钮 */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#667eea]/90 hover:to-[#764ba2]/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    '登录'
                  )}
                </Button>
              </form>

              {/* 注册链接 */}
              <div className="mt-6 text-center text-sm text-slate-400">
                还没有账号？{' '}
                <Link href="/register" className="text-[#667eea] hover:text-[#764ba2] font-medium">
                  立即注册
                </Link>
              </div>
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
