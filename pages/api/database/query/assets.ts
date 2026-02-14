import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reit_code } = req.query;

  // 返回测试数据
  const mockAssets = [
    {
      property_id: 'PROP-001',
      reit_code: '508000.SH',
      property_name: '杭甬高速公路',
      location_province: '浙江省',
      location_city: '杭州市',
      location_district: '西湖区',
      asset_address: '浙江省杭州市西湖区',
      gross_floor_area: 150000,
      land_area: 300000,
      effective_date: '2021-01-01',
    },
  ];

  if (reit_code && typeof reit_code === 'string') {
    const filtered = mockAssets.filter(a => a.reit_code === reit_code);
    return res.status(200).json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  }

  return res.status(200).json({
    success: true,
    data: mockAssets,
    count: mockAssets.length,
  });
}
