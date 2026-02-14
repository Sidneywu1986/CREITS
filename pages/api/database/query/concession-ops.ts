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

  // 经营权类运营数据（高速公路、能源、环保）
  const concessionOpsData = [
    {
      property_id: 'PROP-001',
      reit_code: '508000.SH',
      report_date: '2024-09-30',
      traffic_volume_avg_daily: 85000,
      traffic_volume_total: 23375000,
      toll_rate_avg: 0.5,
      toll_income: 150000,
      processing_capacity: null,
      actual_processing: null,
      tariff: null,
      operating_revenue: 150000,
      remaining_concession_years: 75,
      concession_expiry_date: '2099-12-31',
      major_maintenance_date: '2020-06-01',
      next_major_maintenance_date: '2025-06-01',
      maintenance_reserve: 50000,
    },
    {
      property_id: 'PROP-001',
      reit_code: '508000.SH',
      report_date: '2024-06-30',
      traffic_volume_avg_daily: 82000,
      traffic_volume_total: 22650000,
      toll_rate_avg: 0.5,
      toll_income: 145000,
      processing_capacity: null,
      actual_processing: null,
      tariff: null,
      operating_revenue: 145000,
      remaining_concession_years: 76,
      concession_expiry_date: '2099-12-31',
      major_maintenance_date: '2020-06-01',
      next_major_maintenance_date: '2025-06-01',
      maintenance_reserve: 48000,
    },
    {
      property_id: 'PROP-001',
      reit_code: '508000.SH',
      report_date: '2024-03-31',
      traffic_volume_avg_daily: 80000,
      traffic_volume_total: 22000000,
      toll_rate_avg: 0.5,
      toll_income: 140000,
      processing_capacity: null,
      actual_processing: null,
      tariff: null,
      operating_revenue: 140000,
      remaining_concession_years: 76,
      concession_expiry_date: '2099-12-31',
      major_maintenance_date: '2020-06-01',
      next_major_maintenance_date: '2025-06-01',
      maintenance_reserve: 46000,
    },
    {
      property_id: 'PROP-003',
      reit_code: '508002.SH',
      report_date: '2024-09-30',
      traffic_volume_avg_daily: null,
      traffic_volume_total: null,
      toll_rate_avg: null,
      toll_income: null,
      processing_capacity: 3000,
      actual_processing: 2850,
      tariff: 0.85,
      operating_revenue: 80000,
      remaining_concession_years: 44,
      concession_expiry_date: '2068-12-31',
      major_maintenance_date: '2020-01-01',
      next_major_maintenance_date: '2025-01-01',
      maintenance_reserve: 30000,
    },
    {
      property_id: 'PROP-003',
      reit_code: '508002.SH',
      report_date: '2024-06-30',
      traffic_volume_avg_daily: null,
      traffic_volume_total: null,
      toll_rate_avg: null,
      toll_income: null,
      processing_capacity: 3000,
      actual_processing: 2800,
      tariff: 0.85,
      operating_revenue: 78000,
      remaining_concession_years: 45,
      concession_expiry_date: '2068-12-31',
      major_maintenance_date: '2020-01-01',
      next_major_maintenance_date: '2025-01-01',
      maintenance_reserve: 29000,
    },
    {
      property_id: 'PROP-003',
      reit_code: '508002.SH',
      report_date: '2024-03-31',
      traffic_volume_avg_daily: null,
      traffic_volume_total: null,
      toll_rate_avg: null,
      toll_income: null,
      processing_capacity: 3000,
      actual_processing: 2750,
      tariff: 0.85,
      operating_revenue: 76000,
      remaining_concession_years: 45,
      concession_expiry_date: '2068-12-31',
      major_maintenance_date: '2020-01-01',
      next_major_maintenance_date: '2025-01-01',
      maintenance_reserve: 28000,
    },
  ];

  // 按报告期排序（时间序列）
  const sortedData = [...concessionOpsData].sort((a, b) =>
    new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
  );

  if (property_id && typeof property_id === 'string') {
    const filtered = sortedData.filter(d => d.property_id === property_id);
    return res.status(200).json({
      success: true,
      data: filtered,
      count: filtered.length,
      asset_type: 'concession', // 经营权类
    });
  }

  return res.status(200).json({
    success: true,
    data: sortedData,
    count: sortedData.length,
    asset_type: 'concession', // 经营权类
  });
}
