'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MarketData {
  label: string;
  value: string;
  change: string;
  isPositive: boolean | null;
}

const marketData: MarketData[] = [
  { label: 'REITs 总市值', value: '¥2,345亿', change: '▲1.2%', isPositive: true },
  { label: '平均股息率', value: '4.82%', change: '▼0.1pp', isPositive: false },
  { label: '今日成交额', value: '¥12.3亿', change: '▲5%', isPositive: true },
  { label: '待发行项目', value: '3个', change: '-', isPositive: null },
];

export default function MarketOverview() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
          市场行情速览
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {marketData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs sm:text-sm text-gray-600 min-w-[70px]">{item.label}</span>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-xl font-bold text-gray-800">{item.value}</span>
                <span
                  className={`text-xs font-medium flex items-center whitespace-nowrap ${
                    item.isPositive === true
                      ? 'text-green-600'
                      : item.isPositive === false
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }`}
                >
                  {item.isPositive === true && <TrendingUp className="h-3 w-3 mr-0.5" />}
                  {item.isPositive === false && <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {item.isPositive === null && <Minus className="h-3 w-3 mr-0.5" />}
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Link href="/market">
            <Button variant="ghost" className="text-sm text-blue-600 hover:text-blue-700" size="sm">
              更多行情
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
