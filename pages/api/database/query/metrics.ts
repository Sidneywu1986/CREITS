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
  const mockMetrics = {
    reit_code: reit_code,
    report_date: '2024-09-30',
    report_type: '季报',
    total_revenue: 50000,
    net_profit: 25000,
    ffo: 30000,
    available_for_distribution: 28000,
    actual_distribution: 26000,
    distribution_per_share: 0.26,
    distribution_yield: 5.2,
    total_assets_balance: 1000000,
    net_assets: 800000,
  };

  return res.status(200).json({
    success: true,
    data: mockMetrics,
  });
}
