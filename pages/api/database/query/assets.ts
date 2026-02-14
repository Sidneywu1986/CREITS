import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reit_code } = req.query;

  // 返回测试数据 - 底层资产（支持历史追溯）
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
      land_right_type: '出让',
      land_expiry_date: '2080-12-31',
      year_built: 2005,
      year_acquired: 2020,
      certificate_number: '浙国用(2020)第001号',
      asset_encumbrance: null,
      effective_date: '2020-01-01',
      expiration_date: '9999-12-31', // 最新版本标记
    },
    {
      property_id: 'PROP-002',
      reit_code: '508001.SH',
      property_name: '普洛斯苏州物流园',
      location_province: '江苏省',
      location_city: '苏州市',
      location_district: '工业园区',
      asset_address: '江苏省苏州市工业园区',
      gross_floor_area: 200000,
      land_area: 350000,
      land_right_type: '出让',
      land_expiry_date: '2068-06-30',
      year_built: 2008,
      year_acquired: 2018,
      certificate_number: '苏国用(2018)第002号',
      asset_encumbrance: null,
      effective_date: '2018-07-01',
      expiration_date: '9999-12-31',
    },
    {
      property_id: 'PROP-003',
      reit_code: '508002.SH',
      property_name: '首钢生物质能源项目',
      location_province: '北京市',
      location_city: '北京市',
      location_district: '石景山区',
      asset_address: '北京市石景山区首钢园区',
      gross_floor_area: 50000,
      land_area: 80000,
      land_right_type: '划拨',
      land_expiry_date: '2068-12-31',
      year_built: 2015,
      year_acquired: 2015,
      certificate_number: '京国用(2015)第003号',
      asset_encumbrance: null,
      effective_date: '2015-01-01',
      expiration_date: '9999-12-31',
    },
  ];

  // 过滤历史数据，只返回最新版本（expiration_date='9999-12-31'）
  const latestAssets = mockAssets.filter(asset => asset.expiration_date === '9999-12-31');

  if (reit_code && typeof reit_code === 'string') {
    const filtered = latestAssets.filter(a => a.reit_code === reit_code);
    return res.status(200).json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  }

  return res.status(200).json({
    success: true,
    data: latestAssets,
    count: latestAssets.length,
  });
}
