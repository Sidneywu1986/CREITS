import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 返回测试数据，避免依赖问题
  return res.status(200).json({
    success: true,
    data: [
      {
        reit_code: '508000.SH',
        reit_short_name: '沪杭甬高速REIT',
        fund_manager: '浙江沪杭甬高速公路股份有限公司',
        asset_type_national: '交通基础设施',
        listing_date: '2021-06-21',
        total_assets: 100.5,
      },
    ],
    count: 1,
  });
}
