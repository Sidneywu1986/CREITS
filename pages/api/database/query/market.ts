import type { NextApiRequest, NextApiResponse } from 'next';
import { reitsDB } from '@/lib/database/reits-db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reit_code, start_date, end_date } = req.query;

    if (reit_code && typeof reit_code === 'string') {
      // 查询特定产品的市场表现
      const params: any = { reit_code };

      if (start_date && typeof start_date === 'string') {
        params.start_date = new Date(start_date);
      }

      if (end_date && typeof end_date === 'string') {
        params.end_date = new Date(end_date);
      }

      const marketStats = await reitsDB.getMarketStats(params);

      return res.status(200).json({
        success: true,
        data: marketStats,
        count: marketStats.length,
      });
    } else {
      // 查询所有产品的最新市场表现
      const products = await reitsDB.getAllProducts({ limit: 100 });

      const results = [];

      for (const product of products) {
        try {
          const latestStats = await reitsDB.getMarketStats({
            reit_code: product.reit_code,
            limit: 1,
          });

          if (latestStats.length > 0) {
            results.push({
              reit_code: product.reit_code,
              reit_short_name: product.reit_short_name,
              latest: latestStats[0],
            });
          }
        } catch (error) {
          // 忽略单个产品的查询错误
        }
      }

      return res.status(200).json({
        success: true,
        data: results,
        count: results.length,
      });
    }
  } catch (error: any) {
    console.error('Market stats query error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
