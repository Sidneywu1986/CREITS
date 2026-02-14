import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 返回测试数据 - 产品基本信息
  const mockProducts = [
    {
      reit_code: '508000.SH',
      reit_short_name: '沪杭甬高速REIT',
      fund_manager: '浙江沪杭甬高速公路股份有限公司',
      asset_manager: '中信证券股份有限公司',
      operator: '浙江沪杭甬高速公路股份有限公司',
      listing_date: '2021-06-21',
      fund_size: 10.0,
      total_assets: 100.5,
      asset_type_national: '交通基础设施',
      asset_type_csrc: '收费公路', // 用于判断产权类/经营权类
      product_structure: '公募REITs',
      duration_years: 99,
      leverage_ratio: 25.5,
      info_disclosure_officer: '张三',
      disclosure_contact: '0571-12345678',
    },
    {
      reit_code: '508001.SH',
      reit_short_name: '普洛斯REIT',
      fund_manager: '普洛斯中国控股有限公司',
      asset_manager: '中信证券股份有限公司',
      operator: '普洛斯物流园管理有限公司',
      listing_date: '2021-06-21',
      fund_size: 15.8,
      total_assets: 158.0,
      asset_type_national: '仓储物流基础设施',
      asset_type_csrc: '仓储物流', // 产权类
      product_structure: '公募REITs',
      duration_years: 50,
      leverage_ratio: 30.2,
      info_disclosure_officer: '李四',
      disclosure_contact: '021-87654321',
    },
    {
      reit_code: '508002.SH',
      reit_short_name: '首钢绿能REIT',
      fund_manager: '首钢绿能环境产业有限公司',
      asset_manager: '中信证券股份有限公司',
      operator: '首钢绿能运营管理有限公司',
      listing_date: '2021-12-14',
      fund_size: 13.38,
      total_assets: 133.8,
      asset_type_national: '生态环保基础设施',
      asset_type_csrc: '垃圾焚烧及生物质发电', // 经营权类
      product_structure: '公募REITs',
      duration_years: 20,
      leverage_ratio: 28.5,
      info_disclosure_officer: '王五',
      disclosure_contact: '010-11111111',
    },
  ];

  return res.status(200).json({
    success: true,
    data: mockProducts,
    count: mockProducts.length,
  });
}
