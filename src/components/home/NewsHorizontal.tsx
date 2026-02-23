'use client';

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
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/20 transition">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">资产证券化新闻</h3>
        <Link href="/news">
          <span className="text-sm text-blue-400 hover:underline">更多</span>
        </Link>
      </div>

      <div className="space-y-0">
        {newsItems.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            className="block group"
          >
            <div className="py-3 hover:bg-white/5 transition-colors duration-200 relative pl-3 last:pb-0 border-b border-white/10 last:border-0">
              {/* 左侧蓝色竖线 */}
              <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <p className="text-sm font-medium text-white/80 group-hover:text-blue-400 transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                <span>{item.source}</span>
                <span>·</span>
                <span>{item.time}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
