import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reit_code } = req.query;

  if (!reit_code || typeof reit_code !== 'string') {
    return res.status(400).json({
      success: false,
      error: '缺少reit_code参数',
    });
  }

  // 市场表现数据（时间序列）
  const mockMarketStats = [
    {
      reit_code: reit_code,
      trade_date: '2025-01-15',
      open_price: 5.20,
      close_price: 5.25,
      high_price: 5.30,
      low_price: 5.15,
      daily_volume: 50000,
      daily_turnover: 262500,
      turnover_rate: 0.5,
      market_cap: 1000000000,
      institutional_holding_pct: 60.5,
      retail_holding_pct: 39.5,
      top10_holder_names: '["机构A", "机构B", "机构C", "机构D", "机构E"]', // JSON格式
      top10_holder_ratios: '[15.2, 12.5, 10.8, 9.5, 8.2]', // JSON格式
      top10_holder_total_pct: 56.2,
      original_holder_holding_pct: 30.0,
    },
    {
      reit_code: reit_code,
      trade_date: '2025-01-14',
      open_price: 5.18,
      close_price: 5.20,
      high_price: 5.22,
      low_price: 5.15,
      daily_volume: 45000,
      daily_turnover: 234000,
      turnover_rate: 0.45,
      market_cap: 995000000,
      institutional_holding_pct: 60.3,
      retail_holding_pct: 39.7,
      top10_holder_names: '["机构A", "机构B", "机构C", "机构D", "机构E"]',
      top10_holder_ratios: '[15.2, 12.5, 10.8, 9.5, 8.2]',
      top10_holder_total_pct: 56.2,
      original_holder_holding_pct: 30.0,
    },
    {
      reit_code: reit_code,
      trade_date: '2025-01-13',
      open_price: 5.15,
      close_price: 5.18,
      high_price: 5.20,
      low_price: 5.12,
      daily_volume: 52000,
      daily_turnover: 269000,
      turnover_rate: 0.52,
      market_cap: 990000000,
      institutional_holding_pct: 60.1,
      retail_holding_pct: 39.9,
      top10_holder_names: '["机构A", "机构B", "机构C", "机构D", "机构E"]',
      top10_holder_ratios: '[15.2, 12.5, 10.8, 9.5, 8.2]',
      top10_holder_total_pct: 56.2,
      original_holder_holding_pct: 30.0,
    },
    {
      reit_code: reit_code,
      trade_date: '2025-01-10',
      open_price: 5.10,
      close_price: 5.15,
      high_price: 5.18,
      low_price: 5.08,
      daily_volume: 48000,
      daily_turnover: 247000,
      turnover_rate: 0.48,
      market_cap: 985000000,
      institutional_holding_pct: 60.0,
      retail_holding_pct: 40.0,
      top10_holder_names: '["机构A", "机构B", "机构C", "机构D", "机构E"]',
      top10_holder_ratios: '[15.2, 12.5, 10.8, 9.5, 8.2]',
      top10_holder_total_pct: 56.2,
      original_holder_holding_pct: 30.0,
    },
    {
      reit_code: reit_code,
      trade_date: '2025-01-09',
      open_price: 5.08,
      close_price: 5.10,
      high_price: 5.13,
      low_price: 5.05,
      daily_volume: 55000,
      daily_turnover: 280000,
      turnover_rate: 0.55,
      market_cap: 980000000,
      institutional_holding_pct: 59.8,
      retail_holding_pct: 40.2,
      top10_holder_names: '["机构A", "机构B", "机构C", "机构D", "机构E"]',
      top10_holder_ratios: '[15.2, 12.5, 10.8, 9.5, 8.2]',
      top10_holder_total_pct: 56.2,
      original_holder_holding_pct: 30.0,
    },
  ];

  // 按交易日期排序（时间序列）
  const sortedData = [...mockMarketStats].sort((a, b) =>
    new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  return res.status(200).json({
    success: true,
    data: sortedData,
    count: sortedData.length,
  });
}
