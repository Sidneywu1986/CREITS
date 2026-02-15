/**
 * 积分充值页面
 *
 * 支持多种支付方式，显示二维码
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import { ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

import { createRechargeOrder, getRechargeOrder, type RechargeOrder } from '@/lib/api/points';
import { QUERY_KEYS } from '@/lib/api';

const RECHARGE_AMOUNTS = [
  { value: 10, points: 100, label: '100 积分' },
  { value: 50, points: 500, label: '500 积分' },
  { value: 100, points: 1000, label: '1000 积分' },
  { value: 500, points: 5000, label: '5000 积分' },
  { value: 1000, points: 10000, label: '10000 积分' },
];

export default function RechargePage() {
  const router = useRouter();

  const [amount, setAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'expired' | 'cancelled'>('pending');
  const [isPolling, setIsPolling] = useState(false);

  // 创建充值订单
  const createOrderMutation = useMutation({
    mutationFn: createRechargeOrder,
    onSuccess: (data) => {
      setOrderId(data.data.id);
      setOrderStatus(data.data.status);
      startPolling(data.data.id);
      toast.success('订单创建成功');
    },
    onError: (error: any) => {
      toast.error('订单创建失败', {
        description: error.message || '未知错误',
      });
    },
  });

  // 轮询订单状态
  const startPolling = (id: string) => {
    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await getRechargeOrder(id);
        const status = response.data.status;
        setOrderStatus(status);

        if (status === 'paid') {
          clearInterval(interval);
          setIsPolling(false);
          toast.success('充值成功！');
          setTimeout(() => {
            router.push('/points');
          }, 2000);
        } else if (status === 'expired' || status === 'cancelled') {
          clearInterval(interval);
          setIsPolling(false);
        }
      } catch (error) {
        clearInterval(interval);
        setIsPolling(false);
      }
    }, 3000);

    // 30分钟后停止轮询
    setTimeout(() => {
      clearInterval(interval);
      setIsPolling(false);
    }, 30 * 60 * 1000);
  };

  // 创建订单
  const handleCreateOrder = () => {
    if (!amount) {
      toast.error('请选择充值金额');
      return;
    }

    createOrderMutation.mutate({
      amount: amount!,
      paymentMethod,
    });
  };

  // 返回重新选择
  const handleReset = () => {
    setOrderId(null);
    setAmount(null);
    setOrderStatus('pending');
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">积分充值</h1>
        <p className="text-muted-foreground">
          1 元 = 10 积分，支持多种支付方式
        </p>
      </div>

      {!orderId ? (
        // 选择金额
        <Card>
          <CardHeader>
            <CardTitle>选择充值金额</CardTitle>
            <CardDescription>请选择您要充值的金额</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 金额选项 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {RECHARGE_AMOUNTS.map((item) => (
                <Card
                  key={item.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    amount === item.value
                      ? 'ring-2 ring-primary border-primary'
                      : 'border-muted'
                  }`}
                  onClick={() => setAmount(item.value)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{item.label}</div>
                      <div className="text-muted-foreground text-sm mt-1">
                        ¥ {item.value}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 支付方式 */}
            <div>
              <Label className="mb-3 block">选择支付方式</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="alipay" id="alipay" />
                  <Label htmlFor="alipay" className="flex-1 cursor-pointer font-medium">
                    支付宝
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="wechat" id="wechat" />
                  <Label htmlFor="wechat" className="flex-1 cursor-pointer font-medium">
                    微信支付
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 提交按钮 */}
            <Button
              onClick={handleCreateOrder}
              disabled={!amount || createOrderMutation.isPending}
              size="lg"
              className="w-full"
            >
              {createOrderMutation.isPending ? '创建订单中...' : '确认充值'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        // 支付二维码
        <Card>
          <CardHeader>
            <CardTitle>扫码支付</CardTitle>
            <CardDescription>
              请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫描下方二维码完成支付
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 二维码显示 */}
            {createOrderMutation.data?.data.qrCode ? (
              <div className="flex justify-center">
                <div className="border-4 border-primary rounded-lg p-4">
                  <img
                    src={createOrderMutation.data.data.qrCode}
                    alt="支付二维码"
                    className="w-64 h-64"
                  />
                </div>
              </div>
            ) : (
              <Skeleton className="h-64 w-64 mx-auto" />
            )}

            {/* 支付金额 */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">支付金额</p>
              <p className="text-3xl font-bold mt-1">¥ {amount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                获得 {amount! * 10} 积分
              </p>
            </div>

            {/* 订单状态 */}
            <div className="flex items-center justify-center gap-2">
              {isPolling && (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">正在检测支付状态...</span>
                </>
              )}
              {orderStatus === 'paid' && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">支付成功</span>
                </>
              )}
              {orderStatus === 'expired' && (
                <span className="text-sm text-red-600">订单已过期</span>
              )}
              {orderStatus === 'cancelled' && (
                <span className="text-sm text-red-600">订单已取消</span>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={orderStatus === 'paid'}
              >
                重新选择
              </Button>
              <Button
                variant="ghost"
                onClick={() => startPolling(orderId!)}
                disabled={isPolling || orderStatus === 'paid'}
              >
                刷新状态
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
