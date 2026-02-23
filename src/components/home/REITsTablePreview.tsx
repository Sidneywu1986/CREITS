'use client';

import Link from 'next/link';

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
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        REITs 八张表数据（最新）
      </h3>
      
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              项目
            </th>
            <th className="text-right py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              数值
            </th>
            <th className="text-right py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              环比
            </th>
          </tr>
        </thead>
        <tbody>
          {tablePreviewData.map((item, index) => (
            <tr key={index}>
              <td className="py-2 text-sm text-gray-800">{item.label}</td>
              <td className="py-2 text-sm text-gray-800 text-right font-semibold">
                {item.value}
              </td>
              <td className="py-2 text-sm text-right">
                <span
                  className={`font-semibold ${
                    item.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.change.startsWith('+') && '↑'}
                  {item.change.startsWith('-') && '↓'}
                  {item.change.replace(/[+-]/g, '')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link href="/reits-data-tables">
          <span className="text-sm text-blue-600 hover:underline">
            查看完整八张表
          </span>
        </Link>
      </div>
    </div>
  );
}
