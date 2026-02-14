import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reit_code, property_id } = req.query;

  if (!reit_code || typeof reit_code !== 'string') {
    return res.status(400).json({
      success: false,
      error: '缺少reit_code参数',
    });
  }

  // 产权类运营数据（产业园、仓储、商业、保障房）
  const equityOpsData = [
    {
      property_id: 'PROP-002',
      reit_code: '508001.SH',
      report_date: '2024-09-30',
      rentable_area: 195000,
      occupancy_rate: 95.5,
      average_rent: 1.8,
      rental_income: 32000,
      other_income: 5000,
      total_operating_income: 37000,
      top_tenant_name: '["京东物流", "菜鸟网络", "苏宁物流", "顺丰速运", "中通快递"]', // JSON格式
      top_tenant_ratio: 15.2,
      top5_tenant_ratio: 45.5,
      wale: 4.2,
      lease_expiry_1yr: 12.5,
      lease_expiry_2yr: 18.3,
      lease_expiry_3yr: 25.8,
      lease_expiry_3plus: 43.4,
      renewal_rate: 85.0,
      storage_capacity: null,
    },
    {
      property_id: 'PROP-002',
      reit_code: '508001.SH',
      report_date: '2024-06-30',
      rentable_area: 195000,
      occupancy_rate: 94.8,
      average_rent: 1.75,
      rental_income: 31000,
      other_income: 4800,
      total_operating_income: 35800,
      top_tenant_name: '["京东物流", "菜鸟网络", "苏宁物流", "顺丰速运", "中通快递"]',
      top_tenant_ratio: 15.5,
      top5_tenant_ratio: 46.2,
      wale: 4.1,
      lease_expiry_1yr: 13.0,
      lease_expiry_2yr: 17.8,
      lease_expiry_3yr: 26.2,
      lease_expiry_3plus: 43.0,
      renewal_rate: 83.5,
      storage_capacity: null,
    },
    {
      property_id: 'PROP-002',
      reit_code: '508001.SH',
      report_date: '2024-03-31',
      rentable_area: 195000,
      occupancy_rate: 94.2,
      average_rent: 1.72,
      rental_income: 30500,
      other_income: 4700,
      total_operating_income: 35200,
      top_tenant_name: '["京东物流", "菜鸟网络", "苏宁物流", "顺丰速运", "中通快递"]',
      top_tenant_ratio: 15.8,
      top5_tenant_ratio: 46.8,
      wale: 4.0,
      lease_expiry_1yr: 13.5,
      lease_expiry_2yr: 18.5,
      lease_expiry_3yr: 26.5,
      lease_expiry_3plus: 41.5,
      renewal_rate: 82.0,
      storage_capacity: null,
    },
  ];

  // 按报告期排序（时间序列）
  const sortedData = [...equityOpsData].sort((a, b) =>
    new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
  );

  if (property_id && typeof property_id === 'string') {
    const filtered = sortedData.filter(d => d.property_id === property_id);
    return res.status(200).json({
      success: true,
      data: filtered,
      count: filtered.length,
      asset_type: 'equity', // 产权类
    });
  }

  return res.status(200).json({
    success: true,
    data: sortedData,
    count: sortedData.length,
    asset_type: 'equity', // 产权类
  });
}
