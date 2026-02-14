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
    const { reit_code } = req.query;

    if (reit_code && typeof reit_code === 'string') {
      // 查询特定产品的最新财务指标
      const metrics = await reitsDB.getLatestFinancialMetrics(reit_code);

      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } else {
      // 返回所有产品的最新财务指标汇总
      const products = await reitsDB.getAllProducts({ limit: 100 });

      const results = [];

      for (const product of products) {
        try {
          const metrics = await reitsDB.getLatestFinancialMetrics(product.reit_code);
          results.push({
            reit_code: product.reit_code,
            reit_short_name: product.reit_short_name,
            metrics,
          });
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
    console.error('Financial metrics query error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
