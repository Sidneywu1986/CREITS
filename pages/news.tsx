import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, TrendingUp, FileText, RefreshCw, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
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
        <Button variant="outline">REITs</Button>
        <Button variant="outline">ABS</Button>
        <Button variant="outline">CLO</Button>
        <Button variant="outline">基础设施</Button>
        <Button variant="outline">消费金融</Button>
        <Button variant="outline">政策解读</Button>
      </div>

      {/* News List */}
      <div className="space-y-6">
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
            <Button variant="outline" size="sm">
              阅读全文
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const metadata = {
  title: '资产证券化新闻 - REITs 智能助手',
  description: '最新的REITs和ABS行业资讯',
};
