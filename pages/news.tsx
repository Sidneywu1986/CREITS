'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, ArrowRight, Eye, Flame, AlertCircle, Loader2, Building2, Landmark, Newspaper, Globe } from 'lucide-react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceType: 'gov' | 'exchange' | 'media' | 'international';
  publishTime: string;
  url: string;
  tags: string[];
  readCount: number;
}

interface ApiResponse {
  success: boolean;
  data: NewsItem[];
  cached?: boolean;
  timestamp?: string;
  warning?: string;
  error?: string;
}

// 热门话题标签
const HOT_TOPICS = [
  'REITs试点扩容',
  '消费基础设施REITs',
  '绿色ABS',
  '基础设施REITs',
  '存量资产盘活',
  '碳中和金融',
  '公募REITs',
  '保障性租赁住房',
];

export default function NewsPage() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isCached, setIsCached] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: '全部新闻', icon: null },
    { id: 'gov', label: '国家部委', icon: <Landmark className="w-4 h-4" /> },
    { id: 'exchange', label: '交易所', icon: <Building2 className="w-4 h-4" /> },
    { id: 'media', label: '行业公司', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'international', label: '国际资讯', icon: <Globe className="w-4 h-4" /> },
  ];

  // 获取新闻数据
  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      // 并行调用四个接口
      const [policyRes, exchangeRes, industryRes, internationalRes] = await Promise.all([
        fetch('/api/news/policy'),
        fetch('/api/news/exchange'),
        fetch('/api/news/industry'),
        fetch('/api/news/international'),
      ]);

      const [policyData, exchangeData, industryData, internationalData] = await Promise.all([
        policyRes.json(),
        exchangeRes.json(),
        industryRes.json(),
        internationalRes.json(),
      ]);

      // 合并数据
      const allNews = [
        ...(policyData.data || []),
        ...(exchangeData.data || []),
        ...(industryData.data || []),
        ...(internationalData.data || []),
      ];

      // 按发布时间排序
      allNews.sort((a, b) => 
        new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
      );

      setNewsData(allNews);

      // 检查是否有缓存数据
      const hasCached = policyData.cached || exchangeData.cached || industryData.cached;
      setIsCached(hasCached);

      // 设置最后更新时间
      const latestTimestamp = [
        policyData.timestamp,
        exchangeData.timestamp,
        industryData.timestamp,
      ].filter(Boolean)[0] || new Date().toISOString();
      setLastUpdate(latestTimestamp);

      // 收集警告信息
      const warnings = [
        policyData.warning,
        exchangeData.warning,
        industryData.warning,
        internationalData.warning,
      ].filter(Boolean);
      if (warnings.length > 0) {
        setWarning(warnings.join('; '));
      }

    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchNews();
  }, []);

  // 格式化阅读量
  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) {
        return '刚刚';
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) {
          return `${diffDays}天前`;
        } else {
          return date.toLocaleDateString('zh-CN');
        }
      }
    } catch (err) {
      return dateStr;
    }
  };

  // 过滤新闻
  const filteredNews = newsData.filter((news) => {
    const categoryMatch = selectedCategory === 'all' || news.sourceType === selectedCategory;
    const searchMatch =
      !searchQuery ||
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const topicMatch = !selectedTopic || 
      news.tags.some(tag => tag.toLowerCase().includes(selectedTopic.toLowerCase())) ||
      news.title.toLowerCase().includes(selectedTopic.toLowerCase());
    return categoryMatch && searchMatch && topicMatch;
  });

  // 获取来源类型配置
  const getSourceConfig = (sourceType: 'gov' | 'exchange' | 'media') => {
    switch (sourceType) {
      case 'gov':
        return {
          label: '政务',
          color: 'bg-blue-600',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-400',
        };
      case 'exchange':
        return {
          label: '交易所',
          color: 'bg-purple-600',
          borderColor: 'border-purple-500',
          textColor: 'text-purple-400',
        };
      case 'media':
        return {
          label: '媒体',
          color: 'bg-green-600',
          borderColor: 'border-green-500',
          textColor: 'text-green-400',
        };
      case 'international':
        return {
          label: '国际',
          color: 'bg-orange-600',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-400',
        };
      default:
        return {
          label: '新闻',
          color: 'bg-gray-600',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-400',
        };
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
          {/* 右侧工具 */}
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <span className="text-xs text-white/60">
                  {isCached ? '缓存' : '更新'}: {formatTime(lastUpdate)}
                </span>
                {isCached && <span className="text-xs text-blue-400">📦</span>}
              </div>
            )}
            <button
              onClick={fetchNews}
              disabled={loading}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/70 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="刷新新闻"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 警告信息 */}
        {warning && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-200">{warning}</span>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-semibold text-red-300">获取新闻失败</span>
            </div>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* 搜索工具栏 */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索新闻标题、内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50" disabled={loading}>
            订阅
          </button>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm transition disabled:opacity-50" disabled={loading}>
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
                disabled={loading}
                className={`px-3 py-1.5 rounded-full text-sm transition disabled:opacity-50 ${
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
              disabled={loading}
              className={`pb-2 text-sm transition flex items-center gap-2 disabled:opacity-50 ${
                selectedCategory === cat.id
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white cursor-pointer'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* 加载状态 */}
        {loading && newsData.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="ml-3 text-white/60">加载中...</span>
          </div>
        )}

        {/* 新闻列表 */}
        {!loading && newsData.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredNews.map((news) => {
              const sourceConfig = getSourceConfig(news.sourceType);
              return (
                <a
                  key={news.id}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/20 transition cursor-pointer block"
                >
                  {/* 来源、时间、阅读量 */}
                  <div className="flex items-center gap-2">
                    {/* 来源类型标签 */}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${sourceConfig.color} text-white`}>
                      {sourceConfig.label}
                    </span>
                    {/* 来源名称 */}
                    <span className={`text-sm font-medium ${sourceConfig.textColor}`}>{news.source}</span>
                    <span className="text-xs text-white/40">· {formatTime(news.publishTime)}</span>
                    <span className="text-xs text-white/40 ml-auto flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(news.readCount)}阅读
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
                    {news.tags.length > 0 ? (
                      news.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                        #资讯
                      </span>
                    )}
                  </div>
                </a>
              );
            })}

            {/* 空状态 */}
            {filteredNews.length === 0 && (
              <div className="text-center py-10">
                <div className="text-white/60">没有找到匹配的新闻</div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTopic(null);
                    setSelectedCategory('all');
                  }}
                  className="mt-2 text-blue-400 hover:underline"
                >
                  清除筛选
                </button>
              </div>
            )}
          </div>
        )}

        {/* 无数据状态 */}
        {!loading && newsData.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-white/60 mb-4">暂无新闻数据</div>
            <button
              onClick={fetchNews}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              重新加载
            </button>
          </div>
        )}

        {/* 加载更多 */}
        {filteredNews.length > 0 && filteredNews.length >= 20 && (
          <div className="mt-8 text-center">
            <button className="border border-white/30 text-white px-6 py-2 rounded-lg hover:bg-white/10 transition disabled:opacity-50" disabled={loading}>
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
