'use client';

import { ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
}

const newsItems: NewsItem[] = [
  {
    title: '消费基础设施REITs试点扩围',
    source: '新浪财经',
    time: '2h前',
    url: '/news',
  },
  {
    title: '首批新能源REITs上市首日大涨',
    source: '证券时报',
    time: '5h前',
    url: '/news',
  },
  {
    title: '证监会：推动REITs常态化发行',
    source: '中证报',
    time: '昨天',
    url: '/news',
  },
  {
    title: '2024年REITs市场回顾与展望',
    source: '经济参考报',
    time: '2天前',
    url: '/news',
  },
  {
    title: '保障性租赁住房REITs扩容提速',
    source: '财经网',
    time: '3天前',
    url: '/news',
  },
];

export default function NewsHorizontal() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-700">资产证券化新闻</h3>
        </div>
        <Link href="/news">
          <span className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            更多 →
          </span>
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {newsItems.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            className="flex-shrink-0 w-72 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
              {item.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="truncate">{item.source}</span>
              <span>·</span>
              <span className="flex items-center whitespace-nowrap">{item.time}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
