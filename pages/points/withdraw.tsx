/**
 * 积分提现页面
 *
 * 专家可申请提现积分
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { ArrowLeft, Info } from 'lucide-react';

import {
  getPointsBalance,
  createWithdrawRequest,
  type WithdrawRequest,
} from '@/lib/api/points';
import { getBBSManager } from '@/lib/encryption';
import { useUserStore } from '@/stores/userStore';
import { QUERY_KEYS } from '@/lib/api';

export default function WithdrawPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useUserStore();

  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');

  // 获取积分余额
  const { data: balanceData } = useQuery({
    queryKey: QUERY_KEYS.userPoints,
    queryFn: getPointsBalance,
  });

  const balance = balanceData?.data?.balance ?? 0;

  // 创建提现请求
  const createWithdrawMutation = useMutation({
    mutationFn: createWithdrawRequest,
    onSuccess: () => {
      toast.success('提现申请已提交，请等待审核');
      setTimeout(() => {
        router.push('/points');
      }, 2000);
    },
    onError: (error: any) => {
      toast.error('提现申请失败', {
        description: error.message || '未知错误',
      });
    },
  });

  // 提交提现请求
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }

    const withdrawAmount = parseInt(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('请输入有效的提现金额');
      return;
    }

    if (withdrawAmount > balance) {
      toast.error('积分余额不足');
      return;
    }

    // 最小提现金额 1000 积分
    if (withdrawAmount < 1000) {
      toast.error('最小提现金额为 1000 积分');
      return;
    }

    if (!bankAccount || !bankName || !accountName) {
      toast.error('请填写完整的银行账户信息');
      return;
    }

    try {
      const bbsManager = await getBBSManager();
      const signature = await bbsManager.sign(
        `${withdrawAmount}\n${bankAccount}\n${bankName}\n${accountName}`
      );
      createWithdrawMutation.mutate({
        amount: withdrawAmount,
        bankAccount,
        bankName,
        accountName,
        signature: signature.signature,
      });
    } catch (error: any) {
      toast.error('签名生成失败', {
        description: error.message || '未知错误',
      });
    }
  };

  const calculateWithdrawAmount = (points: number) => {
    return (points / 10).toFixed(2);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">积分提现</h1>
        <p className="text-muted-foreground">
          10 积分 = 1 元，最小提现 1000 积分
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          提现申请提交后，我们会在 3-5 个工作日内审核并打款到您的银行账户
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>提现申请</CardTitle>
          <CardDescription>
            当前可用积分: <span className="font-bold text-foreground">{balance}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 提现金额 */}
            <div className="space-y-2">
              <Label htmlFor="amount">提现积分 *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="请输入提现积分"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1000}
                max={balance}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>可提现积分: {balance}</span>
                {amount && (
                  <span>
                    预计到账: ¥{calculateWithdrawAmount(parseInt(amount))}
                  </span>
                )}
              </div>
              {/* 快捷金额 */}
              <div className="flex gap-2 mt-2">
                {[1000, 5000, 10000, 50000].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={quickAmount > balance}
                  >
                    {quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* 银行信息 */}
            <div className="space-y-4">
              <h3 className="font-medium">银行账户信息</h3>

              <div className="space-y-2">
                <Label htmlFor="bankName">开户银行 *</Label>
                <Input
                  id="bankName"
                  placeholder="例如：中国工商银行"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">银行卡号 *</Label>
                <Input
                  id="bankAccount"
                  type="text"
                  placeholder="请输入银行卡号"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">持卡人姓名 *</Label>
                <Input
                  id="accountName"
                  placeholder="请输入持卡人真实姓名"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
            </div>

            {/* 提现规则 */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>最小提现金额为 1000 积分（100 元）</li>
                  <li>提现比例为 10 积分 = 1 元</li>
                  <li>提现申请将在 3-5 个工作日内处理</li>
                  <li>提现需要使用 BBS 签名验证身份</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* 提交按钮 */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={createWithdrawMutation.isPending}
            >
              {createWithdrawMutation.isPending ? '提交中...' : '提交提现申请'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
