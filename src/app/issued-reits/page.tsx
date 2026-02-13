'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, Search, Filter, TrendingUp, TrendingDown, ArrowRight, Calendar, DollarSign, MapPin, } from 'lucide-react';
import Link from 'next/link';

export default function IssuedREITsPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Building className="mr-3 text-[#667eea]" />
          已发行REITs项目
        </h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-[#667eea]/10 to-[#667eea]/5 border-[#667eea]/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <Building className="mr-2 h-4 w-4" />
              发行总数
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#667eea]">68</div>
            <div className="text-sm text-muted-foreground mt-1">截至2024年1月</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#764ba2]/10 to-[#764ba2]/5 border-[#764ba2]/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              发行总规模
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#764ba2]">1,852.5亿</div>
            <div className="text-sm text-green-600 mt-1">↑ 23.6% 同比</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#48bb78]/10 to-[#48bb78]/5 border-[#48bb78]/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              平均收益率
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#48bb78]">4.25%</div>
            <div className="text-sm text-muted-foreground mt-1">年度化收益</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#ed8936]/10 to-[#ed8936]/5 border-[#ed8936]/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              本月新增
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#ed8936]">5</div>
            <div className="text-sm text-green-600 mt-1">↑ 2 个 环比</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="搜索项目名称、代码..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="资产类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="transport">交通基础设施</SelectItem>
                <SelectItem value="industrial">产业园区</SelectItem>
                <SelectItem value="warehouse">仓储物流</SelectItem>
                <SelectItem value="commercial">商业地产</SelectItem>
                <SelectItem value="energy">能源基础设施</SelectItem>
                <SelectItem value="environmental">环保设施</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="交易所" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部交易所</SelectItem>
                <SelectItem value="sh">上海证券交易所</SelectItem>
                <SelectItem value="sz">深圳证券交易所</SelectItem>
                <SelectItem value="hk">香港联交所</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="收益率范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="high">5%以上</SelectItem>
                <SelectItem value="medium">4%-5%</SelectItem>
                <SelectItem value="low">4%以下</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => {
          return (
            <Link key={i} href={`/issued-reits/${i}`}>
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#667eea]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-[#667eea] text-white">上市交易</Badge>
                        <Badge variant="outline">{i % 2 === 0 ? '上海证券交易所' : '深圳证券交易所'}</Badge>
                        <Badge variant="secondary">
                          {['交通基础设施', '产业园区', '仓储物流', '商业地产', '能源基础设施', '环保设施'][i - 1]}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-1">
                        {[
                          '沪杭甬高速REIT',
                          '张江光大园REIT',
                          '普洛斯仓储物流REIT',
                          '华润置地商业REIT',
                          '深圳能源REIT',
                          '首创环保REIT',
                        ][i - 1]}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">代码: {i % 2 === 0 ? '508000' : '180101'}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${i % 3 === 0 ? 'text-green-600' : i % 2 === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {i % 3 === 0 ? '+1.25%' : i % 2 === 0 ? '-0.56%' : '+2.18%'}
                      </div>
                      <div className="text-sm text-muted-foreground">今日涨跌</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">发行规模</div>
                      <div className="text-lg font-semibold">{[58.2, 32.5, 45.8, 62.3, 28.9, 35.6][i - 1]} 亿元</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">发行价格</div>
                      <div className="text-lg font-semibold">{[6.88, 5.62, 4.35, 7.25, 3.98, 5.15][i - 1]} 元/份</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">年化收益率</div>
                      <div className="text-lg font-semibold text-[#48bb78]">{[4.35, 4.52, 4.18, 4.68, 3.95, 4.28][i - 1]}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">上市日期</div>
                      <div className="text-lg font-semibold">
                        2024-{(11 - i).toString().padStart(2, '0')}-{[15, 22, 8, 18, 5, 12][i - 1]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {['上海', '北京', '深圳', '广州', '深圳', '北京'][i - 1]}
                    </div>
                    <Button variant="outline" size="sm">
                      查看详情
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <Button variant="outline" size="lg" className="w-full md:w-auto">
          加载更多项目
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </MainLayout>
  );
}
