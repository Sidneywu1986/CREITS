'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TablePreviewItem {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const tablePreviewData: TablePreviewItem[] = [
  { label: '总市值', value: '¥2,345亿', change: '+2.3%', isPositive: true },
  { label: '平均股息率', value: '4.82%', change: '-0.1pp', isPositive: false },
  { label: '待发行项目', value: '3个', change: '-', isPositive: true },
];

export default function REITsTablePreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
          REITs 八张表数据（最新）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  项目
                </th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  数值
                </th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  环比
                </th>
              </tr>
            </thead>
            <tbody>
              {tablePreviewData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 text-sm text-gray-700 font-medium">{item.label}</td>
                  <td className="py-3 text-sm text-gray-800 text-right font-semibold">
                    {item.value}
                  </td>
                  <td className="py-3 text-sm text-right">
                    <span
                      className={`inline-flex items-center font-medium ${
                        item.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {item.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/reits-data-tables" className="block mt-4">
          <Button variant="ghost" className="w-full text-sm" size="sm">
            查看完整八张表
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
