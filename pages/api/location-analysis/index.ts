/**
 * 地理位置分析API路由
 * 根据地址或经纬度生成人口、人流量、商业数据
 * 支持集成运营商数据（中国联通/中国移动/中国电信）
 * 支持集成开源数据（OpenStreetMap/高德/百度/国家统计局）
 * 支持定价档位控制（基础免费版 + ABC三个档次的收费方案）
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  analyzeLocationByAddress,
  analyzeLocationByCoordinates,
} from '@/lib/services/location-analysis-service';
import { CarrierDataSource } from '@/lib/services/carrier-data-service';
import { OpenDataSource } from '@/lib/services/open-data-service';
import { PricingTierService, PricingTier } from '@/lib/services/pricing-tier-service';

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
 * 
 * 请求体参数：
 * - address: 地址（可选）
 * - latitude: 纬度（可选）
 * - longitude: 经度（可选）
 * - useCarrierData: 是否使用运营商数据（可选，默认false）
 * - carrierDataSource: 运营商数据源（可选，默认'simulated'）
 * - useOpenData: 是否使用开源数据（可选，默认true）
 * - openDataSource: 开源数据源（可选，默认'osm'）
 * - amapKey: 高德地图API Key（可选）
 * - baiduKey: 百度地图API Key（可选）
 * - includeRealtime: 是否包含实时数据（可选，默认true）
 * - userId: 用户ID（可选，默认'anonymous'）
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      address, 
      latitude, 
      longitude,
      useCarrierData = false,
      carrierDataSource = CarrierDataSource.SIMULATED,
      useOpenData = true,
      openDataSource = OpenDataSource.OSM,
      amapKey,
      baiduKey,
      includeRealtime = true,
      userId = 'anonymous',
    } = req.body;

    // 参数验证
    if (!address && (!latitude || !longitude)) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: '需要提供 address 或 latitude + longitude',
      });
    }

    // 获取用户档位
    const userTier = PricingTierService.getUserTier(userId);
    
    // 检查分析次数限制
    const limitCheck = PricingTierService.checkAnalysisLimit(userId);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: '分析次数已达上限',
        message: `本月分析次数已用完，请升级档位或等待下月重置`,
        resetAt: limitCheck.resetAt,
        upgradeUrl: '/pricing',
      });
    }

    // 验证请求参数是否符合用户档位限制
    const validation = PricingTierService.validateRequest(userId, {
      radius: 2, // 默认2公里，可以从请求参数中获取
      useCarrierData,
      openDataSource,
    });

    if (!validation.valid) {
      return res.status(403).json({
        error: '权限不足',
        message: validation.error,
        currentTier: userTier,
        upgradeUrl: '/pricing',
      });
    }

    // 验证运营商数据源
    if (useCarrierData && !Object.values(CarrierDataSource).includes(carrierDataSource)) {
      return res.status(400).json({
        error: '无效的运营商数据源',
        validValues: Object.values(CarrierDataSource),
      });
    }

    // 验证开源数据源
    if (useOpenData && !Object.values(OpenDataSource).includes(openDataSource)) {
      return res.status(400).json({
        error: '无效的开源数据源',
        validValues: Object.values(OpenDataSource),
      });
    }

    // 获取用户可用的数据源
    const availableDataSources = PricingTierService.getAvailableDataSources(userId);
    const availableCarrierSources = PricingTierService.getAvailableCarrierDataSources(userId);

    // 检查用户是否有权限使用请求的数据源
    if (useCarrierData && !availableCarrierSources.includes(carrierDataSource)) {
      return res.status(403).json({
        error: '当前档位不支持该运营商数据源',
        message: `当前档位可用的运营商数据源: ${availableCarrierSources.join(', ') || '无'}`,
        upgradeUrl: '/pricing',
      });
    }

    if (useOpenData && !availableDataSources.includes(openDataSource)) {
      return res.status(403).json({
        error: '当前档位不支持该开源数据源',
        message: `当前档位可用的开源数据源: ${availableDataSources.join(', ')}`,
        upgradeUrl: '/pricing',
      });
    }

    const options = {
      useCarrierData,
      carrierDataSource,
      useOpenData,
      openDataSource,
      amapKey,
      baiduKey,
      includeRealtime,
    };

    let result;

    // 根据地址分析
    if (address) {
      result = await analyzeLocationByAddress(address, options);
    }
    // 根据经纬度分析
    else if (latitude && longitude) {
      result = await analyzeLocationByCoordinates(
        Number(latitude),
        Number(longitude),
        address,
        options
      );
    }

    // 记录分析次数
    PricingTierService.recordAnalysis(userId);

    // 添加用户档位信息到响应
    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        userTier,
        remainingAnalyses: limitCheck.remaining,
        resetAt: limitCheck.resetAt,
        features: PricingTierService.getUserFeatures(userId),
      },
    });
  } catch (error) {
    console.error('Location Analysis API error:', error);
    return res.status(500).json({
      error: '地理位置分析失败',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
