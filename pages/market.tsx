import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw, Newspaper, BarChart3, Globe, ArrowRight } from 'lucide-react';
import { MARKET_DATA } from '@/types';
import Link from 'next/link';

export default function MarketPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Globe className="mr-3 text-[#667eea]" />
            全球 REITs 市场行情
          </h1>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {MARKET_DATA.map((item) => (
          <Card key={item.region} className="hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                {item.region}
                {item.changePercent >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{item.index.toFixed(1)}</div>
                <div className={`text-lg font-semibold ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </div>
                <div className={`text-sm ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 text-[#667eea]" />
              市场指数走势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>图表展示区域</p>
                <p className="text-sm">（可集成图表库如 Recharts）</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <Button variant="outline" size="sm">折线图</Button>
              <Button variant="outline" size="sm">柱状图</Button>
              <Button variant="outline" size="sm">饼图</Button>
            </div>
          </CardContent>
        </Card>

        {/* Market News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Newspaper className="mr-2 text-[#764ba2]" />
              市场新闻
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-[#667eea] hover:shadow-md transition-shadow cursor-pointer">
                <div className="font-medium mb-1">新的REITs试点政策发布</div>
                <div className="text-sm text-muted-foreground mb-2">
                  发改委发布最新REITs试点指导意见，扩大试点范围，优化发行流程...
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">2024-01-15 10:30</div>
                  <Button variant="ghost" size="sm">阅读更多</Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-[#764ba2] hover:shadow-md transition-shadow cursor-pointer">
                <div className="font-medium mb-1">2023年REITs市场总结报告</div>
                <div className="text-sm text-muted-foreground mb-2">
                  全年发行规模突破1000亿元，同比增长45%，市场表现强劲...
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">2024-01-10 14:20</div>
                  <Button variant="ghost" size="sm">阅读更多</Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-[#48bb78] hover:shadow-md transition-shadow cursor-pointer">
                <div className="font-medium mb-1">多家公募REITs产品获批</div>
                <div className="text-sm text-muted-foreground mb-2">
                  首批消费基础设施REITs获批，标志着REITs市场进入新阶段...
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">2024-01-05 09:15</div>
                  <Button variant="ghost" size="sm">阅读更多</Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-[#ed8936] hover:shadow-md transition-shadow cursor-pointer">
                <div className="font-medium mb-1">国际REITs市场动态</div>
                <div className="text-sm text-muted-foreground mb-2">
                  美国REITs市场持续上涨，欧洲市场表现稳健，亚太地区增速领先...
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">2024-01-03 16:45</div>
                  <Button variant="ghost" size="sm">阅读更多</Button>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              查看全部新闻
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Market Data */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>市场分析报告</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border border-[#667eea]/20">
              <div className="text-sm text-muted-foreground mb-2">本月发行规模</div>
              <div className="text-2xl font-bold text-[#667eea]">125.6 亿元</div>
              <div className="text-sm text-green-600 mt-1">↑ 18.5% 环比</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-[#48bb78]/10 to-[#38a169]/10 border border-[#48bb78]/20">
              <div className="text-sm text-muted-foreground mb-2">活跃产品数量</div>
              <div className="text-2xl font-bold text-[#48bb78]">68 个</div>
              <div className="text-sm text-green-600 mt-1">↑ 5 个 新增</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-[#ed8936]/10 to-[#dd6b20]/10 border border-[#ed8936]/20">
              <div className="text-sm text-muted-foreground mb-2">平均收益率</div>
              <div className="text-2xl font-bold text-[#ed8936]">4.35%</div>
              <div className="text-sm text-red-600 mt-1">↓ 0.12% 环比</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: '市场行情 - REITs 智能助手',
  description: '全球REITs市场行情和分析',
};
