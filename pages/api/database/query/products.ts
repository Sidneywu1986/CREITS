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
    const products = await reitsDB.getAllProducts();

    return res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error: any) {
    console.error('Products query error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
