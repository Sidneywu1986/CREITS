'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, TrendingUp, FileText, RefreshCw, ArrowRight, Building2, Landmark, Briefcase } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  category: 'national' | 'exchange' | 'industry';
  subCategory?: string;
  date: string;
  views: number;
  summary: string;
  tags: string[];
}

const NEWS_DATA: NewsItem[] = [
  // 国家部委资讯
  {
    id: 1,
    title: '国家发改委发布新一批REITs试点项目，市场规模将突破2000亿',
    source: '发改委官网',
    category: 'national',
    subCategory: '发改委',
    date: '2024-01-18 09:30',
    views: 12580,
    summary: '国家发改委今日正式发布新一批基础设施领域不动产投资信托基金（REITs）试点项目名单，共计12个项目，涵盖交通、能源、产业园等多个领域。',
    tags: ['REITs', '基础设施', '政策'],
  },
  {
    id: 2,
    title: '证监会发布REITs新规，优化发行流程提升市场效率',
    source: '证监会',
    category: 'national',
    subCategory: '证监会',
    date: '2024-01-15 14:20',
    views: 9840,
    summary: '证监会发布《公开募集基础设施证券投资基金指引（试行）》修订稿，进一步优化REITs发行审核流程，提升市场运行效率。',
    tags: ['REITs', '政策', '监管'],
  },
  {
    id: 3,
    title: '国务院办公厅印发关于进一步盘活存量资产扩大有效投资的意见',
    source: '国务院办公厅',
    category: 'national',
    subCategory: '国务院',
    date: '2024-01-12 10:00',
    views: 15620,
    summary: '意见明确提出，要积极推动基础设施领域不动产投资信托基金（REITs）健康发展，有效盘活存量资产，形成存量资产和新增投资的良性循环。',
    tags: ['政策', '存量资产', 'REITs'],
  },
  {
    id: 4,
    title: '证监会公布2024年REITs重点工作安排',
    source: '证监会',
    category: 'national',
    subCategory: '证监会',
    date: '2024-01-10 16:30',
    views: 8760,
    summary: '证监会新闻发言人表示，2024年将继续稳步推进REITs市场发展，扩大试点范围，完善监管规则。',
    tags: ['REITs', '监管', '年度计划'],
  },

  // 交易所资讯
  {
    id: 5,
    title: '上交所发布REITs上市审核业务指引（2024年修订）',
    source: '上海证券交易所',
    category: 'exchange',
    subCategory: '上海交易所',
    date: '2024-01-17 11:00',
    views: 11200,
    summary: '上交所对REITs上市审核业务指引进行了修订，进一步明确审核标准和流程，提高审核效率。',
    tags: ['上交所', 'REITs', '审核'],
  },
  {
    id: 6,
    title: '深交所REITs产品创新取得新进展，首单消费基础设施REITs获批',
    source: '深圳证券交易所',
    category: 'exchange',
    subCategory: '深圳交易所',
    date: '2024-01-16 09:45',
    views: 13450,
    summary: '深交所首单消费基础设施REITs项目正式获批，标志着REITs产品类型进一步丰富。',
    tags: ['深交所', '消费基础设施', 'REITs'],
  },
  {
    id: 7,
    title: '北交所发布基础设施REITs业务规则，助力多层次市场建设',
    source: '北京证券交易所',
    category: 'exchange',
    subCategory: '北京交易所',
    date: '2024-01-14 15:20',
    views: 7890,
    summary: '北交所发布基础设施REITs相关业务规则，完善多层次资本市场体系建设。',
    tags: ['北交所', 'REITs', '规则'],
  },
  {
    id: 8,
    title: '上交所发布2023年REITs市场运行报告',
    source: '上海证券交易所',
    category: 'exchange',
    subCategory: '上海交易所',
    date: '2024-01-13 10:30',
    views: 9230,
    summary: '报告显示，2023年上交所REITs市场运行平稳，市场规模持续扩大，产品类型日益丰富。',
    tags: ['上交所', '市场报告', 'REITs'],
  },

  // 行业及公司资讯
  {
    id: 9,
    title: '首单消费基础设施REITs成功发行，市场反响热烈',
    source: '华夏基金',
    category: 'industry',
    subCategory: '公募REITs',
    date: '2024-01-18 14:00',
    views: 18760,
    summary: '首单消费基础设施REITs产品成功发行，首日涨幅超过10%，市场认购倍数达到35倍，显示出投资者对REITs产品的强烈需求。',
    tags: ['公募REITs', '消费基础设施', '发行'],
  },
  {
    id: 10,
    title: '2023年ABS市场总结：发行规模再创新高，突破5000亿元',
    source: '中诚信国际',
    category: 'industry',
    subCategory: 'ABS',
    date: '2024-01-17 16:45',
    views: 14500,
    summary: '2023年ABS市场发行规模达到5023亿元，同比增长23%，创历史新高。企业ABS、信贷ABS、ABN等品种均实现较快增长。',
    tags: ['ABS', '市场总结', '发行规模'],
  },
  {
    id: 11,
    title: '多家公募基金加速布局REITs产品，竞争日趋激烈',
    source: '基金业协会',
    category: 'industry',
    subCategory: '公募REITs',
    date: '2024-01-16 11:30',
    views: 10200,
    summary: '截至2024年初，已有30家公募基金获得REITs管理人资格，产品布局呈现加速态势，市场竞争日趋激烈。',
    tags: ['公募REITs', '产品布局', '竞争'],
  },
  {
    id: 12,
    title: '绿色ABS发行规模快速增长，碳中和目标驱动绿色金融',
    source: '中债研发',
    category: 'industry',
    subCategory: 'ABS',
    date: '2024-01-15 09:15',
    views: 8940,
    summary: '2023年绿色ABS发行规模达到850亿元，同比增长65%，碳中和目标推动绿色金融快速发展。',
    tags: ['绿色ABS', '碳中和', '绿色金融'],
  },
];

const CATEGORY_CONFIG = {
  national: {
    label: '国家部委资讯',
    icon: <Landmark className="w-5 h-5" />,
    color: 'from-red-500 to-orange-500',
    subCategories: ['国务院', '发改委', '证监会'],
  },
  exchange: {
    label: '交易所资讯',
    icon: <Building2 className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    subCategories: ['上海交易所', '深圳交易所', '北京交易所'],
  },
  industry: {
    label: '行业及公司资讯',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    subCategories: ['公募REITs', 'ABS', '市场分析'],
  },
};

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = NEWS_DATA.filter((news) => {
    const categoryMatch = selectedCategory ? news.category === selectedCategory : true;
    const searchMatch =
      !searchQuery ||
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

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
            <Input
              placeholder="搜索新闻标题、内容..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              绿色ABS
            </Badge>
            <Badge className="bg-[#ed8936] text-white px-4 py-2 text-base">
              基础设施REITs
            </Badge>
            <Badge className="bg-[#f56565] text-white px-4 py-2 text-base">
              存量资产盘活
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">新闻来源</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            className={selectedCategory === null ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2]' : ''}
            onClick={() => setSelectedCategory(null)}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            全部新闻
          </Button>

          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              className={
                selectedCategory === key
                  ? `bg-gradient-to-r ${config.color}`
                  : ''
              }
              onClick={() => setSelectedCategory(key)}
            >
              {config.icon}
              <span className="ml-2">{config.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Subcategory Filters (when a category is selected) */}
      {selectedCategory && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {CATEGORY_CONFIG[selectedCategory].label}子分类
          </h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_CONFIG[selectedCategory].subCategories.map((sub) => (
              <Badge key={sub} variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                {sub}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* News List */}
      <div className="space-y-6">
        {filteredNews.map((news) => {
          const config = CATEGORY_CONFIG[news.category];
          return (
            <Card
              key={news.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4"
              style={{
                borderLeftColor:
                  news.category === 'national'
                    ? '#ef4444'
                    : news.category === 'exchange'
                    ? '#3b82f6'
                    : '#8b5cf6',
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`bg-gradient-to-r ${config.color} text-white`}
                    >
                      {config.label}
                    </Badge>
                    {news.subCategory && (
                      <Badge variant="outline">{news.subCategory}</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {news.date}
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">{news.title}</CardTitle>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <span>来源：{news.source}</span>
                  <span>•</span>
                  <span>阅读量：{news.views.toLocaleString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{news.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {news.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    阅读全文
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredNews.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">暂无相关新闻</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: '资产证券化新闻 - REITs 智能助手',
  description: '最新的REITs和ABS行业资讯',
};
