'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

interface ChartData {
  date: string;
  value: number;
  label?: string;
}

interface REITsChartProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'bar' | 'area';
  valueUnit?: string;
  showTrend?: boolean;
  color?: string;
}

export default function REITsChart({
  title,
  data,
  type,
  valueUnit = '',
  showTrend = true,
  color = '#3b82f6',
}: REITsChartProps) {
  // 计算趋势
  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const change = ((last - first) / first) * 100;
    return {
      value: change,
      isPositive: change >= 0,
    };
  }, [data]);

  // ECharts配置
  const option = useMemo(() => {
    const dates = data.map(d => d.date);
    const values = data.map(d => d.value);

    const baseOption = {
      title: {
        text: '',
        show: false,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ${param.value}${valueUnit}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: type === 'bar',
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#94a3b8',
          },
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 12,
          rotate: dates.length > 8 ? 45 : 0,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 12,
          formatter: (value: number) => `${value}${valueUnit}`,
        },
        splitLine: {
          lineStyle: {
            color: '#e2e8f0',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: title,
          type: type === 'area' ? 'line' : type,
          smooth: type === 'area' || type === 'line',
          data: values,
          areaStyle: type === 'area' ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${color}40` },
                { offset: 1, color: `${color}05` },
              ],
            },
          } : undefined,
          itemStyle: {
            color: color,
          },
          lineStyle: {
            width: 2,
            color: color,
          },
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };

    return baseOption;
  }, [data, type, title, valueUnit, color]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-muted-foreground">暂无数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {showTrend && trend && (
              <Badge variant={trend.isPositive ? 'default' : 'destructive'} className="ml-2">
                <TrendingUp className={`w-3 h-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
                {trend.isPositive ? '+' : ''}{trend.value.toFixed(2)}%
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {data.length} 个数据点
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// 财务指标图表组件
export function FinancialMetricsChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    date: d.report_date,
    value: d.available_for_distribution / 10000, // 转换为亿元
  }));

  return (
    <REITsChart
      title="可供分配金额趋势"
      data={chartData}
      type="area"
      valueUnit="亿元"
      color="#10b981"
    />
  );
}

// 分派率图表组件
export function DistributionYieldChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    date: d.report_date,
    value: d.distribution_yield,
  }));

  return (
    <REITsChart
      title="现金分派率趋势"
      data={chartData}
      type="line"
      valueUnit="%"
      color="#f59e0b"
    />
  );
}

// 出租率图表组件
export function OccupancyRateChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    date: d.report_date,
    value: d.occupancy_rate,
  }));

  return (
    <REITsChart
      title="出租率趋势"
      data={chartData}
      type="line"
      valueUnit="%"
      color="#8b5cf6"
    />
  );
}

// 车流量图表组件
export function TrafficVolumeChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    date: d.report_date,
    value: d.traffic_volume_avg_daily,
  }));

  return (
    <REITsChart
      title="日均车流量趋势"
      data={chartData}
      type="bar"
      valueUnit="辆"
      color="#ef4444"
    />
  );
}

// 股价图表组件
export function PriceChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    date: d.trade_date,
    value: d.close_price,
  }));

  return (
    <REITsChart
      title="股价走势"
      data={chartData}
      type="area"
      valueUnit="元"
      color="#3b82f6"
    />
  );
}

// 成交量图表组件
export function VolumeChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    date: d.trade_date,
    value: d.daily_volume,
  }));

  return (
    <REITsChart
      title="成交量趋势"
      data={chartData}
      type="bar"
      valueUnit="万份"
      color="#06b6d4"
    />
  );
}
