'use client';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean | null;
  sparklineData?: number[];
}

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

function MetricCard({ label, value, change, isPositive, sparklineData }: MetricCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/20 transition">
      <div className="text-white/60 text-sm mb-1.5">{label}</div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className={`text-sm font-medium ${
          isPositive === true
            ? 'text-green-400'
            : isPositive === false
            ? 'text-red-400'
            : 'text-white/40'
        }`}>
          {isPositive === true && '↑'}
          {isPositive === false && '↓'}
          {change.replace(/[+-]/g, '')}
        </span>
      </div>
      {sparklineData && (
        <div className="mt-2">
          <Sparkline data={sparklineData} />
        </div>
      )}
    </div>
  );
}

export default function DataMetrics() {
  const metrics = [
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
