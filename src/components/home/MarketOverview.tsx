'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, MoreHorizontal } from 'lucide-react';
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
  { label: '待发行项目', value: '3个', change: '-', isPositive: null },
];

export default function MarketOverview() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
            市场行情速览
          </CardTitle>
          <Link href="/market">
            <Button variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {marketData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-600 min-w-[70px]">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-800">{item.value}</span>
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
      </CardContent>
    </Card>
  );
}
