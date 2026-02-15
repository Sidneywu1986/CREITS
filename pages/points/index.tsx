/**
 * 积分系统主页面
 *
 * 展示积分余额、历史记录，提供充值和提现入口
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import { Wallet, ArrowUpRight, ArrowDownLeft, History, RefreshCw } from 'lucide-react';

import { getPointsBalance, getPointsHistory, type PointsTransaction } from '@/lib/api/points';
import { useUserStore } from '@/stores/userStore';
import { QUERY_KEYS } from '@/lib/api';

export default function PointsPage() {
  const { points: localPoints } = useUserStore();

  // 获取积分余额
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: QUERY_KEYS.userPoints,
    queryFn: getPointsBalance,
  });

  // 获取积分历史记录
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: QUERY_KEYS.userPointsHistory,
    queryFn: () => getPointsHistory({ pageSize: 50 }),
  });

  const balance = balanceData?.data?.balance ?? localPoints;
  const history = historyData?.data?.data || [];

  const getTransactionTypeText = (type: PointsTransaction['type']) => {
    const types: Record<PointsTransaction['type'], { text: string; color: string }> = {
      deposit: { text: '充值', color: 'text-green-600' },
      withdraw: { text: '提现', color: 'text-red-600' },
      tip: { text: '打赏', color: 'text-red-600' },
      receive_tip: { text: '收到打赏', color: 'text-green-600' },
      reward: { text: '奖励', color: 'text-green-600' },
      penalty: { text: '扣罚', color: 'text-red-600' },
    };
    return types[type] || { text: type, color: 'text-gray-600' };
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* 页面头部 */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">积分中心</h1>
        <p className="text-muted-foreground">
          管理您的积分，支持充值和提现
        </p>
      </div>

      {/* 积分余额卡片 */}
      <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardDescription>积分余额</CardDescription>
              {balanceLoading ? (
                <Skeleton className="h-12 w-48 mt-2" />
              ) : (
                <CardTitle className="text-4xl mt-2">{balance} 积分</CardTitle>
              )}
            </div>
            <Wallet className="h-16 w-16 text-primary opacity-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href="/points/recharge" className="flex-1">
              <Button className="w-full" size="lg">
                <ArrowUpRight className="h-5 w-5 mr-2" />
                充值
              </Button>
            </Link>
            <Link href="/points/withdraw" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <ArrowDownLeft className="h-5 w-5 mr-2" />
                提现
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 积分规则 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">积分规则</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>充值获得积分</span>
            <span className="text-green-600">1 元 = 10 积分</span>
          </div>
          <div className="flex justify-between">
            <span>打赏消耗积分</span>
            <span className="text-red-600">1 积分 = 1 积分</span>
          </div>
          <div className="flex justify-between">
            <span>提现兑换比例</span>
            <span>10 积分 = 1 元</span>
          </div>
        </CardContent>
      </Card>

      {/* 积分历史 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>积分历史</CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-16 w-64" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((transaction) => {
                const { text, color } = getTransactionTypeText(transaction.type);
                const isPositive = ['deposit', 'receive_tip', 'reward'].includes(transaction.type);

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <History className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{text}</Badge>
                          <span className="text-sm font-medium">{transaction.description}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${color}`}>
                        {isPositive ? '+' : '-'}{Math.abs(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        余额: {transaction.balance}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">暂无积分记录</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
