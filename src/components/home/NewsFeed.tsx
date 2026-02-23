'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
];

export default function NewsFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <ExternalLink className="mr-2 h-5 w-5 text-purple-600" />
          资产证券化新闻
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {newsItems.map((item, index) => (
            <Link key={index} href={item.url} className="block">
              <div className="p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <p className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate">{item.source}</span>
                  <span>·</span>
                  <span className="flex items-center whitespace-nowrap">
                    <Clock className="h-3 w-3 mr-0.5" />
                    {item.time}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/news" className="block mt-4">
          <Button variant="ghost" className="w-full text-sm" size="sm">
            查看更多
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
