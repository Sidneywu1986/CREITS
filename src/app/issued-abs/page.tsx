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
import {
  Briefcase,
  Search,
  Filter,
  TrendingUp,
  ArrowRight,
  Calendar,
  DollarSign,
  Shield,
  Star,
} from 'lucide-react';
import Link from 'next/link';

export default function IssuedABSPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Briefcase className="mr-3 text-[#764ba2]" />
          已发行ABS项目
        </h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-[#764ba2]/10 to-[#764ba2]/5 border-[#764ba2]/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <Briefcase className="mr-2 h-4 w-4" />
              发行总数
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#764ba2]">458</div>
            <div className="text-sm text-muted-foreground mt-1">截至2024年1月</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#667eea]/10 to-[#667eea]/5 border-[#667eea]/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              发行总规模
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#667eea]">5,286.2亿</div>
            <div className="text-sm text-green-600 mt-1">↑ 18.6% 同比</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#48bb78]/10 to-[#48bb78]/5 border-[#48bb78]/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <Star className="mr-2 h-4 w-4" />
              平均信用评级
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#48bb78]">AAA</div>
            <div className="text-sm text-muted-foreground mt-1">优等信用</div>
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
            <div className="text-3xl font-bold text-[#ed8936]">32</div>
            <div className="text-sm text-green-600 mt-1">↑ 8 个 环比</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="搜索项目名称、发起机构..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="产品类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="clo">CLO</SelectItem>
                <SelectItem value="auto">Auto Loan ABS</SelectItem>
                <SelectItem value="credit">Credit Card ABS</SelectItem>
                <SelectItem value="housing">Housing Loan ABS</SelectItem>
                <SelectItem value="enterprise">企业ABS</SelectItem>
                <SelectItem value="infrastructure">基础设施ABS</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="信用评级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部评级</SelectItem>
                <SelectItem value="aaa">AAA</SelectItem>
                <SelectItem value="aa_plus">AA+</SelectItem>
                <SelectItem value="aa">AA</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="发行场所" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部场所</SelectItem>
                <SelectItem value="interbank">银行间市场</SelectItem>
                <SelectItem value="exchange">交易所市场</SelectItem>
                <SelectItem value="shibor">上海清算所</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => {
          return (
            <Link key={i} href={`/issued-abs/${i}`}>
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#764ba2]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2 flex-wrap">
                    <Badge className="bg-[#764ba2] text-white">存续期</Badge>
                    <Badge variant="outline">
                      {['CLO', 'Auto Loan ABS', '企业ABS', '信用卡ABS', 'Housing Loan ABS', '基础设施ABS'][i - 1]}
                    </Badge>
                    <Badge variant="secondary">
                      {i % 2 === 0 ? '银行间市场' : '交易所市场'}
                    </Badge>
                    <Badge className="bg-[#48bb78] text-white">
                      AAA
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-1">
                    {[
                      '招商银行2024年第一期信贷资产支持证券',
                      '一汽汽车金融2024年个人汽车贷款资产支持证券',
                      '京东科技供应链2024年第1期资产支持专项计划',
                      '工商银行2024年信用卡资产支持证券',
                      '建设银行2024年个人住房抵押贷款资产支持证券',
                      '中建基础设施2024年资产支持专项计划',
                    ][i - 1]}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">发起机构: {['招商银行', '一汽汽车金融', '京东科技', '工商银行', '建设银行', '中建集团'][i - 1]}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">存续期收益率</div>
                  <div className="text-2xl font-bold text-[#48bb78]">{[3.85, 3.65, 4.12, 3.72, 3.58, 4.25][i - 1]}%</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">发行规模</div>
                  <div className="text-lg font-semibold">{[85.6, 62.5, 45.8, 78.3, 92.6, 55.2][i - 1]} 亿元</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">优先档利率</div>
                  <div className="text-lg font-semibold">{[3.58, 3.42, 3.85, 3.65, 3.48, 3.95][i - 1]}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">次级档占比</div>
                  <div className="text-lg font-semibold">{[8.5, 10.2, 7.8, 9.5, 11.3, 8.9][i - 1]}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">发行日期</div>
                  <div className="text-lg font-semibold">
                    2024-01-{[18, 15, 22, 10, 8, 20][i - 1]}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="mr-1 h-3 w-3" />
                  增信措施: {['超额抵押 + 信用增级', '超额抵押 + 担保', '信用增级 + 保证金', '超额抵押', '担保 + 保证金', '信用增级'][i - 1]}
                </div>
                <Badge variant="outline" className="text-xs">
                  基础资产类型: {['对公贷款', '汽车贷款', '应收账款', '信用卡债权', '住房抵押贷款', '基础设施收费权'][i - 1]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  到期日: 2029-{(5 + i).toString().padStart(2, '0')}-{[15, 22, 10, 18, 5, 12][i - 1]}
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
