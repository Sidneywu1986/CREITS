/**
 * 数据分析模块定价档位服务
 * 定义基础免费版 + ABC三个档次的收费方案
 */

// 定价档位类型
export enum PricingTier {
  FREE = 'free', // 基础免费版
  BASIC = 'basic', // A档 - 基础付费版
  PROFESSIONAL = 'professional', // B档 - 专业版
  ENTERPRISE = 'enterprise', // C档 - 企业版
}

// 用户订阅类型
export interface UserSubscription {
  userId: string;
  tier: PricingTier;
  startDate: Date;
  endDate?: Date;
  features: PricingTierFeatures;
  usage: UsageStats;
}

// 使用统计
export interface UsageStats {
  analysisCount: number; // 本月分析次数
  maxAnalyses: number; // 最大分析次数
  lastAnalysisDate: Date;
}

// 定价档位功能配置
export interface PricingTierFeatures {
  // 数据源权限
  dataSource: {
    osm: boolean; // OpenStreetMap
    amap: boolean; // 高德地图
    baidu: boolean; // 百度地图
    nationalStats: boolean; // 国家统计局
    aggregated: boolean; // 聚合数据
  };
  
  // 运营商数据权限
  carrierData: {
    enabled: boolean; // 是否启用
    simulated: boolean; // 模拟数据
    unicom: boolean; // 联通智慧足迹
    mobile: boolean; // 移动大数据
    telecom: boolean; // 电信天翼大数据
    aggregated: boolean; // 聚合运营商数据
  };
  
  // 分析功能
  analysis: {
    maxRadius: number; // 最大分析半径（公里）
    maxLocations: number; // 最大地点数量
    historicalData: boolean; // 历史数据
    comparativeAnalysis: boolean; // 对比分析
    exportReports: boolean; // 导出报告
    realtimeData: boolean; // 实时数据
  };
  
  // 数据展示
  display: {
    poiDetails: boolean; // POI详细信息
    demographicDetails: boolean; // 人口统计详细信息
    trafficHeatmap: boolean; // 人流热力图
    competitorAnalysis: boolean; // 竞品分析
    investmentScore: boolean; // 投资评分
  };
  
  // 高级功能
  advanced: {
    aiInsights: boolean; // AI洞察
    customReports: boolean; // 自定义报告
    apiAccess: boolean; // API访问
    prioritySupport: boolean; // 优先支持
    dedicatedManager: boolean; // 专属经理
  };
  
  // 限制
  limits: {
    dailyAnalyses: number; // 每日分析次数
    monthlyAnalyses: number; // 每月分析次数
    concurrentUsers: number; // 并发用户数
    storageDays: number; // 数据存储天数
    teamMembers: number; // 团队成员数
  };
}

// 定价配置
export const PRICING_CONFIG: Record<PricingTier, {
  name: string;
  displayName: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: PricingTierFeatures;
  popular?: boolean;
  badge?: string;
}> = {
  [PricingTier.FREE]: {
    name: '基础免费版',
    displayName: 'Free',
    description: '适合个人体验，基础功能免费使用',
    price: {
      monthly: 0,
      yearly: 0,
      currency: '¥',
    },
    features: {
      dataSource: {
        osm: true,
        amap: false,
        baidu: false,
        nationalStats: true,
        aggregated: false,
      },
      carrierData: {
        enabled: false,
        simulated: false,
        unicom: false,
        mobile: false,
        telecom: false,
        aggregated: false,
      },
      analysis: {
        maxRadius: 2,
        maxLocations: 5,
        historicalData: false,
        comparativeAnalysis: false,
        exportReports: false,
        realtimeData: false,
      },
      display: {
        poiDetails: true,
        demographicDetails: false,
        trafficHeatmap: false,
        competitorAnalysis: false,
        investmentScore: true,
      },
      advanced: {
        aiInsights: false,
        customReports: false,
        apiAccess: false,
        prioritySupport: false,
        dedicatedManager: false,
      },
      limits: {
        dailyAnalyses: 10,
        monthlyAnalyses: 50,
        concurrentUsers: 1,
        storageDays: 7,
        teamMembers: 1,
      },
    },
  },
  
  [PricingTier.BASIC]: {
    name: 'A档 - 基础付费版',
    displayName: 'Basic',
    description: '适合小型团队，使用商业级数据源',
    price: {
      monthly: 199,
      yearly: 1990,
      currency: '¥',
    },
    features: {
      dataSource: {
        osm: true,
        amap: true,
        baidu: true,
        nationalStats: true,
        aggregated: false,
      },
      carrierData: {
        enabled: true,
        simulated: true,
        unicom: false,
        mobile: false,
        telecom: false,
        aggregated: false,
      },
      analysis: {
        maxRadius: 5,
        maxLocations: 20,
        historicalData: true,
        comparativeAnalysis: false,
        exportReports: true,
        realtimeData: false,
      },
      display: {
        poiDetails: true,
        demographicDetails: true,
        trafficHeatmap: true,
        competitorAnalysis: false,
        investmentScore: true,
      },
      advanced: {
        aiInsights: true,
        customReports: false,
        apiAccess: true,
        prioritySupport: false,
        dedicatedManager: false,
      },
      limits: {
        dailyAnalyses: 50,
        monthlyAnalyses: 500,
        concurrentUsers: 3,
        storageDays: 30,
        teamMembers: 5,
      },
    },
  },
  
  [PricingTier.PROFESSIONAL]: {
    name: 'B档 - 专业版',
    displayName: 'Professional',
    description: '适合专业机构，使用运营商真实数据',
    price: {
      monthly: 999,
      yearly: 9990,
      currency: '¥',
    },
    popular: true,
    badge: '最受欢迎',
    features: {
      dataSource: {
        osm: true,
        amap: true,
        baidu: true,
        nationalStats: true,
        aggregated: true,
      },
      carrierData: {
        enabled: true,
        simulated: false,
        unicom: true,
        mobile: false,
        telecom: false,
        aggregated: false,
      },
      analysis: {
        maxRadius: 10,
        maxLocations: 100,
        historicalData: true,
        comparativeAnalysis: true,
        exportReports: true,
        realtimeData: true,
      },
      display: {
        poiDetails: true,
        demographicDetails: true,
        trafficHeatmap: true,
        competitorAnalysis: true,
        investmentScore: true,
      },
      advanced: {
        aiInsights: true,
        customReports: true,
        apiAccess: true,
        prioritySupport: true,
        dedicatedManager: false,
      },
      limits: {
        dailyAnalyses: 200,
        monthlyAnalyses: 2000,
        concurrentUsers: 10,
        storageDays: 90,
        teamMembers: 20,
      },
    },
  },
  
  [PricingTier.ENTERPRISE]: {
    name: 'C档 - 企业版',
    displayName: 'Enterprise',
    description: '适合大型企业，聚合三大运营商数据',
    price: {
      monthly: 4999,
      yearly: 49990,
      currency: '¥',
    },
    badge: '定制服务',
    features: {
      dataSource: {
        osm: true,
        amap: true,
        baidu: true,
        nationalStats: true,
        aggregated: true,
      },
      carrierData: {
        enabled: true,
        simulated: false,
        unicom: true,
        mobile: true,
        telecom: true,
        aggregated: true,
      },
      analysis: {
        maxRadius: 50,
        maxLocations: 1000,
        historicalData: true,
        comparativeAnalysis: true,
        exportReports: true,
        realtimeData: true,
      },
      display: {
        poiDetails: true,
        demographicDetails: true,
        trafficHeatmap: true,
        competitorAnalysis: true,
        investmentScore: true,
      },
      advanced: {
        aiInsights: true,
        customReports: true,
        apiAccess: true,
        prioritySupport: true,
        dedicatedManager: true,
      },
      limits: {
        dailyAnalyses: -1, // 无限制
        monthlyAnalyses: -1, // 无限制
        concurrentUsers: -1, // 无限制
        storageDays: 365,
        teamMembers: -1, // 无限制
      },
    },
  },
};

/**
 * 定价档位服务类
 */
export class PricingTierService {
  /**
   * 获取用户当前档位
   */
  static getUserTier(userId: string): PricingTier {
    // TODO: 从数据库或缓存中获取用户档位
    // 暂时返回免费版
    return PricingTier.FREE;
  }

  /**
   * 获取用户功能配置
   */
  static getUserFeatures(userId: string): PricingTierFeatures {
    const tier = this.getUserTier(userId);
    return PRICING_CONFIG[tier].features;
  }

  /**
   * 检查用户是否有权限使用某个功能
   */
  static hasPermission(userId: string, feature: keyof PricingTierFeatures): boolean {
    const features = this.getUserFeatures(userId);
    return features[feature] !== undefined;
  }

  /**
   * 检查用户分析次数限制
   */
  static checkAnalysisLimit(userId: string): {
    allowed: boolean;
    remaining: number;
    resetAt?: Date;
  } {
    const tier = this.getUserTier(userId);
    const limits = PRICING_CONFIG[tier].features.limits;
    
    // TODO: 从数据库中获取用户实际使用次数
    const currentUsage = 0;
    
    if (limits.monthlyAnalyses === -1) {
      return { allowed: true, remaining: -1 };
    }
    
    const remaining = limits.monthlyAnalyses - currentUsage;
    return {
      allowed: remaining > 0,
      remaining,
      resetAt: this.getNextMonthFirstDay(),
    };
  }

  /**
   * 记录用户分析次数
   */
  static recordAnalysis(userId: string): void {
    // TODO: 增加用户分析次数计数
    console.log(`Recorded analysis for user ${userId}`);
  }

  /**
   * 获取可用的数据源
   */
  static getAvailableDataSources(userId: string): string[] {
    const features = this.getUserFeatures(userId);
    const sources: string[] = [];
    
    if (features.dataSource.osm) sources.push('osm');
    if (features.dataSource.amap) sources.push('amap');
    if (features.dataSource.baidu) sources.push('baidu');
    if (features.dataSource.nationalStats) sources.push('national_stats');
    if (features.dataSource.aggregated) sources.push('aggregated');
    
    return sources;
  }

  /**
   * 获取可用的运营商数据源
   */
  static getAvailableCarrierDataSources(userId: string): string[] {
    const features = this.getUserFeatures(userId);
    const sources: string[] = [];
    
    if (!features.carrierData.enabled) return sources;
    
    if (features.carrierData.simulated) sources.push('simulated');
    if (features.carrierData.unicom) sources.push('unicom');
    if (features.carrierData.mobile) sources.push('mobile');
    if (features.carrierData.telecom) sources.push('telecom');
    if (features.carrierData.aggregated) sources.push('aggregated');
    
    return sources;
  }

  /**
   * 验证请求参数是否符合用户档位限制
   */
  static validateRequest(
    userId: string,
    params: {
      radius?: number;
      useCarrierData?: boolean;
      openDataSource?: string;
    }
  ): {
    valid: boolean;
    error?: string;
  } {
    const features = this.getUserFeatures(userId);
    
    // 检查分析半径限制
    if (params.radius && params.radius > features.analysis.maxRadius) {
      return {
        valid: false,
        error: `分析半径超出限制，最大允许 ${features.analysis.maxRadius} 公里`,
      };
    }
    
    // 检查运营商数据权限
    if (params.useCarrierData && !features.carrierData.enabled) {
      return {
        valid: false,
        error: '当前档位不支持运营商数据，请升级到付费版',
      };
    }
    
    // 检查数据源权限
    const availableSources = this.getAvailableDataSources(userId);
    if (params.openDataSource && !availableSources.includes(params.openDataSource)) {
      return {
        valid: false,
        error: '当前档位不支持该数据源',
      };
    }
    
    return { valid: true };
  }

  /**
   * 计算升级费用
   */
  static calculateUpgradeCost(
    currentTier: PricingTier,
    targetTier: PricingTier,
    yearly: boolean
  ): {
    proratedAmount: number;
    fullAmount: number;
    remainingDays: number;
  } {
    const currentPrice = PRICING_CONFIG[currentTier].price;
    const targetPrice = PRICING_CONFIG[targetTier].price;
    
    const periodPrice = yearly ? targetPrice.yearly : targetPrice.monthly;
    
    return {
      proratedAmount: periodPrice,
      fullAmount: periodPrice,
      remainingDays: 30,
    };
  }

  /**
   * 获取下一个月份的第一天
   */
  private static getNextMonthFirstDay(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth;
  }

  /**
   * 获取档位升级路径
   */
  static getUpgradePath(currentTier: PricingTier): PricingTier[] {
    const tiers = Object.values(PricingTier);
    const currentIndex = tiers.indexOf(currentTier);
    return tiers.slice(currentIndex + 1);
  }

  /**
   * 获取档位降级路径
   */
  static getDowngradePath(currentTier: PricingTier): PricingTier[] {
    const tiers = Object.values(PricingTier);
    const currentIndex = tiers.indexOf(currentTier);
    return tiers.slice(0, currentIndex);
  }
}

/**
 * 档位比较工具函数
 */
export function isHigherTier(tier1: PricingTier, tier2: PricingTier): boolean {
  const tierOrder = [PricingTier.FREE, PricingTier.BASIC, PricingTier.PROFESSIONAL, PricingTier.ENTERPRISE];
  return tierOrder.indexOf(tier1) > tierOrder.indexOf(tier2);
}

/**
 * 获取档位显示名称
 */
export function getTierDisplayName(tier: PricingTier): string {
  return PRICING_CONFIG[tier].displayName;
}

/**
 * 获取档位价格
 */
export function getTierPrice(tier: PricingTier, yearly: boolean = false): number {
  return yearly ? PRICING_CONFIG[tier].price.yearly : PRICING_CONFIG[tier].price.monthly;
}
