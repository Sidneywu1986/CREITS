'use client';

import Link from 'next/link';

interface MarketData {
  label: string;
  value: string;
  change: string;
  isPositive: boolean | null;
  sparklineData?: number[];
}

const marketData: MarketData[] = [
  {
    label: 'REITs 总市值',
    value: '¥2,345亿',
    change: '+1.2%',
    isPositive: true,
    sparklineData: [18, 12, 15, 8, 10, 5, 12],
  },
  {
    label: '平均股息率',
    value: '4.82%',
    change: '-0.1pp',
    isPositive: false,
    sparklineData: [10, 14, 12, 16, 13, 9, 11],
  },
  {
    label: '待发行项目',
    value: '3个',
    change: '-',
    isPositive: null,
    sparklineData: [5, 5, 6, 4, 4, 3, 3],
  },
];

// 迷你折线图组件
function Sparkline({ data }: { data: number[] }) {
  const width = 100;
  const height = 24;
  const points = data.map((y, i) => {
    const x = (i / (data.length - 1)) * width;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="stroke-white/40 fill-none"
    >
      <polyline
        points={points}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MarketOverview() {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full hover:bg-white/20 transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">更多行情指标</h3>
        <Link href="/market">
          <span className="text-sm text-white/40 hover:text-white/60">···</span>
        </Link>
      </div>

      <div className="space-y-3">
        {marketData.slice(1).map((item, index) => (
          <div
            key={index}
            className="border border-white/10 rounded-lg p-3 hover:bg-white/5 transition-colors duration-200"
          >
            <div className="text-sm text-white/60 mb-1">{item.label}</div>
            <div className="flex items-end justify-between">
              <span className="text-lg font-semibold text-white">{item.value}</span>
              <span className={`text-sm font-medium ${
                item.isPositive === true
                  ? 'text-green-400'
                  : item.isPositive === false
                  ? 'text-red-400'
                  : 'text-white/40'
              }`}>
                {item.isPositive === true && '↑'}
                {item.isPositive === false && '↓'}
                {item.change.replace(/[+-]/g, '')}
              </span>
            </div>
            {item.sparklineData && (
              <div className="mt-2">
                <Sparkline data={item.sparklineData} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
