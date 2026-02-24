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
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/20 transition">
      <h3 className="text-sm font-semibold text-white mb-3">
        REITs 八张表（最新）
      </h3>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
              项目
            </th>
            <th className="text-right py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
              数值
            </th>
            <th className="text-right py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
              环比
            </th>
          </tr>
        </thead>
        <tbody>
          {tablePreviewData.map((item, index) => (
            <tr key={index} className="border-b border-white/10 last:border-0">
              <td className="py-2 text-sm text-white/80">{item.label}</td>
              <td className="py-2 text-sm text-white font-semibold text-right">
                {item.value}
              </td>
              <td className="py-2 text-sm text-right">
                <span
                  className={`font-semibold ${
                    item.isPositive ? 'text-green-400' : 'text-red-400'
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

      <div className="mt-3 pt-3 border-t border-white/10">
        <Link href="/reits-data-tables">
          <span className="text-sm text-blue-400 hover:underline">
            查看完整八张表
          </span>
        </Link>
      </div>
    </div>
  );
}
