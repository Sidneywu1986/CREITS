'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AGENTS, MARKET_DATA } from '@/types';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Newspaper, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <MainLayout>
      {/* Welcome Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">欢迎使用 REITs 智能助手</h2>
            <p className="text-lg opacity-90">全流程 REITs 发行服务，一站式解决方案</p>
          </div>
          <Sparkles className="w-16 h-16 opacity-50" />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <Sparkles className="mr-2 text-[#667eea]" />
          核心功能
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.slice(0, 6).map((agent) => (
            <Link key={agent.id} href={`/chat/${agent.id}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#667eea] group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${agent.color}20` }}
                    >
                      {agent.icon}
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                      Agent
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-[#667eea] group-hover:to-[#764ba2] group-hover:text-white group-hover:border-transparent">
                    立即使用
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Market Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 text-[#48bb78]" />
              全球 REITs 市场行情
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MARKET_DATA.map((item) => (
                <div
                  key={item.region}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div>
                    <div className="font-semibold">{item.region}</div>
                    <div className="text-sm text-muted-foreground">指数: {item.index}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
                    </div>
                    <div className={`text-sm ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/market">
              <Button variant="outline" className="w-full mt-4">
                查看详细行情
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Latest News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Newspaper className="mr-2 text-[#667eea]" />
              最新动态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-[#667eea]">
                <div className="font-medium mb-1">新的REITs试点政策发布</div>
                <div className="text-sm text-muted-foreground">发改委发布最新REITs试点指导意见...</div>
                <div className="text-xs text-gray-500 mt-2">2024-01-15</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-[#764ba2]">
                <div className="font-medium mb-1">2023年REITs市场总结报告</div>
                <div className="text-sm text-muted-foreground">全年发行规模突破1000亿元...</div>
                <div className="text-xs text-gray-500 mt-2">2024-01-10</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-[#48bb78]">
                <div className="font-medium mb-1">多家公募REITs产品获批</div>
                <div className="text-sm text-muted-foreground">首批消费基础设施REITs获批...</div>
                <div className="text-xs text-gray-500 mt-2">2024-01-05</div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              查看更多动态
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
