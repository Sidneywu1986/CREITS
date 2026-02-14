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
      // 查询特定产品的资产
      const assets = await reitsDB.getPropertiesByReitCode(reit_code);

      return res.status(200).json({
        success: true,
        data: assets,
        count: assets.length,
      });
    } else {
      // 查询所有资产
      const assets = await reitsDB.getAllProperties();

      return res.status(200).json({
        success: true,
        data: assets,
        count: assets.length,
      });
    }
  } catch (error: any) {
    console.error('Assets query error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
