import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Gift, History, ArrowRight } from 'lucide-react';

export default function PointsIndexPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">积分中心</h1>
        <p className="text-gray-600">管理您的积分，兑换奖励和增值服务</p>
      </div>

      {/* 积分余额 */}
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            我的积分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold mb-2">1,250</div>
              <div className="text-blue-100">当前积分余额</div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                VIP 会员
              </Badge>
              <div className="text-sm text-blue-100 mt-2">
                有效期至 2025-12-31
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 积分充值 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              积分充值
            </CardTitle>
            <CardDescription>快速充值，享受更多服务</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>100 积分</span>
                <span className="font-bold">¥10</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>500 积分</span>
                <span className="font-bold">¥45</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>1000 积分</span>
                <span className="font-bold">¥80</span>
              </div>
            </div>
            <Button className="w-full mt-4">
              立即充值
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 积分兑换 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              积分兑换
            </CardTitle>
            <CardDescription>用积分兑换礼品和服务</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>专家咨询券</span>
                <Badge variant="secondary">500 积分</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>月度会员</span>
                <Badge variant="secondary">1000 积分</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>年度会员</span>
                <Badge variant="secondary">10000 积分</Badge>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              查看更多
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 积分明细 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              积分明细
            </CardTitle>
            <CardDescription>查看积分获取和使用记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">登录奖励</div>
                  <div className="text-xs text-gray-500">2025-02-15</div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  +10
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">专家咨询</div>
                  <div className="text-xs text-gray-500">2025-02-14</div>
                </div>
                <Badge variant="outline" className="text-red-600 border-red-600">
                  -200
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">签到奖励</div>
                  <div className="text-xs text-gray-500">2025-02-13</div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  +20
                </Badge>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              查看全部
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 获取积分 */}
      <Card>
        <CardHeader>
          <CardTitle>如何获取积分？</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎁</div>
              <div>
                <div className="font-medium">每日登录</div>
                <div className="text-sm text-gray-500">+10 积分/天</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📝</div>
              <div>
                <div className="font-medium">发布内容</div>
                <div className="text-sm text-gray-500">+20 积分/篇</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <div className="font-medium">参与讨论</div>
                <div className="text-sm text-gray-500">+5 积分/条</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="font-medium">完成任务</div>
                <div className="text-sm text-gray-500">+50 积分/任务</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
