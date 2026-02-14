/**
 * 地理位置分析API路由
 * 根据地址或经纬度生成人口、人流量、商业数据
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  analyzeLocationByAddress,
  analyzeLocationByCoordinates,
} from '@/lib/services/location-analysis-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 处理不同的HTTP方法
  if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * POST /api/location-analysis
 * 执行地理位置分析
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { address, latitude, longitude } = req.body;

    // 参数验证
    if (!address && (!latitude || !longitude)) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: '需要提供 address 或 latitude + longitude',
      });
    }

    let result;

    // 根据地址分析
    if (address) {
      result = await analyzeLocationByAddress(address);
    }
    // 根据经纬度分析
    else if (latitude && longitude) {
      result = await analyzeLocationByCoordinates(
        Number(latitude),
        Number(longitude)
      );
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Location Analysis API error:', error);
    return res.status(500).json({
      error: '地理位置分析失败',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
