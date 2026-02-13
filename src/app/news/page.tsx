'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, TrendingUp, FileText, RefreshCw, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <FileText className="mr-3 text-[#667eea]" />
          资产证券化新闻
        </h1>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="搜索新闻标题、内容..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Hot Topics */}
      <Card className="mb-8 border-2 border-[#667eea]/20 bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="mr-2 text-[#667eea]" />
            热门话题
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-[#667eea] text-white px-4 py-2 text-base">
              REITs试点扩容
            </Badge>
            <Badge className="bg-[#764ba2] text-white px-4 py-2 text-base">
              消费基础设施REITs
            </Badge>
            <Badge className="bg-[#48bb78] text-white px-4 py-2 text-base">
              CLO市场创新
            </Badge>
            <Badge className="bg-[#ed8936] text-white px-4 py-2 text-base">
              绿色ABS
            </Badge>
            <Badge className="bg-[#f56565] text-white px-4 py-2 text-base">
              基础设施REITs
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* News Categories */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="default" className="bg-gradient-to-r from-[#667eea] to-[#764ba2]">
          全部新闻
        </Button>
        <Button variant="outline">
          REITs
        </Button>
        <Button variant="outline">
          ABS
        </Button>
        <Button variant="outline">
          CLO
        </Button>
        <Button variant="outline">
          基础设施
        </Button>
        <Button variant="outline">
          消费金融
        </Button>
        <Button variant="outline">
          政策解读
        </Button>
      </div>

      {/* News List */}
      <div className="space-y-6">
        {/* Featured News */}
        <Card className="border-2 border-[#667eea] hover:shadow-2xl transition-all duration-300 cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-[#667eea] text-white">重磅</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                2024-01-18 09:30
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">
              国家发改委发布新一批REITs试点项目，市场规模将突破2000亿
            </CardTitle>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <span>来源：发改委官网</span>
              <span>•</span>
              <span>阅读量：12,580</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              国家发改委今日正式发布新一批基础设施领域不动产投资信托基金（REITs）试点项目名单，共计12个项目，涵盖交通、能源、产业园等多个领域。此次试点扩容标志着我国REITs市场进入快速发展新阶段...
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">REITs</Badge>
                <Badge variant="outline">基础设施</Badge>
                <Badge variant="outline">政策</Badge>
              </div>
              <Button variant="outline" size="sm">
                阅读全文
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Regular News Items */}
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={i === 1 ? 'secondary' : 'outline'}>
                  {i === 1 ? '热点' : i === 2 ? '推荐' : '资讯'}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  2024-01-{(15 - i).toString().padStart(2, '0')} {10 + i * 2}:00
                </div>
              </div>
              <CardTitle className="text-lg">
                {[
                  '首单消费基础设施REITs成功发行，市场反响热烈',
                  '2023年ABS市场总结：发行规模再创新高，突破5000亿元',
                  'CLO市场创新产品频出，助力实体经济发展',
                  '绿色ABS发行规模快速增长，碳中和目标驱动绿色金融',
                  '证监会发布REITs新规，优化发行流程提升市场效率',
                ][i - 1]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 line-clamp-2">
                {[
                  '首单以购物中心为基础资产的消费基础设施REITs成功在上交所上市，首日涨幅达8.5%，受到市场广泛关注和追捧。这标志着消费基础设施正式进入REITs市场...',
                  '2023年中国资产证券化（ABS）市场持续向好，全年发行规模达5286亿元，同比增长18.6%。其中，企业ABS发行量最大，占比超过40%，金融机构ABS和信贷ABS紧随其后...',
                  '近年来，抵押贷款债券（CLO）市场不断创新，推出多款服务实体经济的新产品。这些产品通过优化结构设计和风险管理，有效提升了资金配置效率，为中小企业融资提供了新渠道...',
                  '随着"双碳"目标的持续推进，绿色资产证券化产品（绿色ABS）发行规模快速增长。2023年绿色ABS发行规模达365亿元，同比增长156%，涉及绿色能源、环保设施、低碳交通等多个领域...',
                  '中国证监会今日发布《公开募集基础设施证券投资基金指引（试行）》，对REITs的发行条件、信息披露、投资者保护等方面进行了全面优化，旨在提升市场效率，保护投资者权益...',
                ][i - 1]}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <span>来源：{['新华社', '证券时报', '财经日报', '中国证券报', '金融时报'][i - 1]}</span>
                  <span>•</span>
                  <span>阅读量：{(10 - i) * 1500 + 580}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <Button variant="outline" size="lg" className="w-full md:w-auto">
          加载更多新闻
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </MainLayout>
  );
}
