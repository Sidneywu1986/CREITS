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

  // 返回测试数据
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
    },
  ];

  return res.status(200).json({
    success: true,
    data: mockMarketStats,
    count: mockMarketStats.length,
  });
}
