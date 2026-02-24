'use client';

import { useState } from 'react';
import { Search, RefreshCw, ArrowRight, Eye, Flame } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    source: '发改委',
    category: 'national',
    subCategory: '发改委',
    date: '2024-01-18 09:30',
    views: 12580,
    summary: '国家发改委今日正式发布新一批基础设施领域不动产投资信托基金（REITs）试点项目名单，共计12个项目，涵盖交通、能源、产业园等多个领域。',
    tags: ['基础设施', '政策'],
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
    tags: ['REITs', '发行'],
  },
  {
    id: 3,
    title: '国务院办公厅印发关于进一步盘活存量资产扩大有效投资的意见',
    source: '国务院',
    category: 'national',
    subCategory: '国务院',
    date: '2024-01-12 10:00',
    views: 15620,
    summary: '意见明确提出，要积极推动基础设施领域不动产投资信托基金（REITs）健康发展，有效盘活存量资产，形成存量资产和新增投资的良性循环。',
    tags: ['政策', '存量资产'],
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
    tags: ['监管', '年度计划'],
  },

  // 交易所资讯
  {
    id: 5,
    title: '上交所发布REITs上市审核业务指引（2024年修订）',
    source: '上交所',
    category: 'exchange',
    subCategory: '上海交易所',
    date: '2024-01-17 11:00',
    views: 11200,
    summary: '上交所对REITs上市审核业务指引进行了修订，进一步明确审核标准和流程，提高审核效率。',
    tags: ['审核'],
  },
  {
    id: 6,
    title: '深交所REITs产品创新取得新进展，首单消费基础设施REITs获批',
    source: '深交所',
    category: 'exchange',
    subCategory: '深圳交易所',
    date: '2024-01-16 09:45',
    views: 13450,
    summary: '深交所首单消费基础设施REITs项目正式获批，标志着REITs产品类型进一步丰富。',
    tags: ['消费基础设施'],
  },
  {
    id: 7,
    title: '北交所发布基础设施REITs业务规则，助力多层次市场建设',
    source: '北交所',
    category: 'exchange',
    subCategory: '北京交易所',
    date: '2024-01-14 15:20',
    views: 7890,
    summary: '北交所发布基础设施REITs相关业务规则，完善多层次资本市场体系建设。',
    tags: ['规则'],
  },
  {
    id: 8,
    title: '上交所发布2023年REITs市场运行报告',
    source: '上交所',
    category: 'exchange',
    subCategory: '上海交易所',
    date: '2024-01-13 10:30',
    views: 9230,
    summary: '报告显示，2023年上交所REITs市场运行平稳，市场规模持续扩大，产品类型日益丰富。',
    tags: ['市场报告'],
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
    tags: ['公募REITs', '消费基础设施'],
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
    tags: ['ABS', '市场总结'],
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
    tags: ['公募REITs', '产品布局'],
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
    tags: ['绿色ABS', '碳中和'],
  },
];

// 热门话题标签
const HOT_TOPICS = [
  'REITs试点扩容',
  '消费基础设施REITs',
  '绿色ABS',
  '基础设施REITs',
  '存量资产盘活',
  '碳中和金融',
  '公募REITs',
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: '全部新闻' },
    { id: 'national', label: '国家部委' },
    { id: 'exchange', label: '交易所' },
    { id: 'industry', label: '行业公司' },
  ];

  const filteredNews = NEWS_DATA.filter((news) => {
    const categoryMatch = selectedCategory === 'all' || news.category === selectedCategory;
    const searchMatch =
      !searchQuery ||
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const topicMatch = !selectedTopic || news.tags.includes(selectedTopic) || news.title.includes(selectedTopic);
    return categoryMatch && searchMatch && topicMatch;
  });

  // 格式化阅读量
  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) {
      return '刚刚';
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}天前`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1E33] to-[#1A3B5E]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部区域 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>返回</span>
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">资产证券化新闻</h1>
              <p className="text-white/60 text-sm mt-1">行业动态 · 政策解读 · 市场分析</p>
            </div>
          </div>
          {/* 用户头像 */}
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition text-sm">
              个人中心
            </button>
          </div>
        </div>

        {/* 搜索工具栏 */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索新闻标题、内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            订阅
          </button>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm transition">
            筛选
          </button>
        </div>

        {/* 热门话题标签区 */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            热门话题
          </h2>
          <div className="flex flex-wrap gap-2">
            {HOT_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  selectedTopic === topic
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* 新闻分类导航 */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`pb-2 text-sm transition ${
                selectedCategory === cat.id
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white cursor-pointer'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 新闻列表 */}
        <div className="flex flex-col gap-4">
          {filteredNews.map((news) => (
            <div
              key={news.id}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/20 transition cursor-pointer"
            >
              {/* 来源、时间、阅读量 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-400">{news.source}</span>
                <span className="text-xs text-white/40">· {formatTime(news.date)}</span>
                <span className="text-xs text-white/40 ml-auto flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViews(news.views)}阅读
                </span>
              </div>

              {/* 标题 */}
              <h3 className="text-base font-semibold text-white mt-1 hover:text-blue-400 transition">
                {news.title}
              </h3>

              {/* 摘要 */}
              <p className="text-sm text-white/60 mt-1 line-clamp-2">{news.summary}</p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mt-3">
                {news.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* 空状态 */}
          {filteredNews.length === 0 && (
            <div className="text-center py-10">
              <div className="text-white/60">没有找到匹配的新闻</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTopic(null);
                }}
                className="mt-2 text-blue-400 hover:underline"
              >
                清除筛选
              </button>
            </div>
          )}
        </div>

        {/* 加载更多 */}
        {filteredNews.length > 0 && (
          <div className="mt-8 text-center">
            <button className="border border-white/30 text-white px-6 py-2 rounded-lg hover:bg-white/10 transition">
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
