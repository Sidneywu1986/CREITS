'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2,
  XCircle,
  Star,
  Zap,
  Users,
  Database,
  MapPin,
  TrendingUp,
  BarChart3,
  Shield,
  Crown,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  PricingTier,
  PRICING_CONFIG,
  PricingTierService,
  getTierDisplayName,
  getTierPrice,
  type PricingTierFeatures,
} from '@/lib/services/pricing-tier-service';

interface PricingTiersProps {
  currentTier?: PricingTier;
  onSelectTier?: (tier: PricingTier) => void;
  yearly?: boolean;
  onToggleYearly?: (yearly: boolean) => void;
}

export default function PricingTiers({
  currentTier = PricingTier.FREE,
  onSelectTier,
  yearly = false,
  onToggleYearly,
}: PricingTiersProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);

  const handleSelectTier = (tier: PricingTier) => {
    setSelectedTier(tier);
    onSelectTier?.(tier);
  };

  const renderFeatureCheck = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
    ) : (
      <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
    );
  };

  const renderTierCard = (tier: PricingTier) => {
    const config = PRICING_CONFIG[tier];
    const isPopular = config.popular;
    const isCurrent = currentTier === tier;
    const isSelected = selectedTier === tier;

    const discount = yearly ? 17 : 0; // 年付8.3折

    return (
      <Card
        key={tier}
        className={`relative transition-all duration-300 ${
          isPopular
            ? 'border-2 border-[#667eea] shadow-xl scale-105 z-10'
            : isCurrent
            ? 'border-2 border-blue-300'
            : isSelected
            ? 'border-2 border-blue-500'
            : 'border border-gray-200'
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 py-1 text-sm font-semibold">
              {config.badge}
            </Badge>
          </div>
        )}

        {isCurrent && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300 px-4 py-1 text-sm font-semibold">
              当前档位
            </Badge>
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10">
              {tier === PricingTier.FREE && <Star className="w-6 h-6 text-gray-600" />}
              {tier === PricingTier.BASIC && <Zap className="w-6 h-6 text-blue-600" />}
              {tier === PricingTier.PROFESSIONAL && <Crown className="w-6 h-6 text-[#667eea]" />}
              {tier === PricingTier.ENTERPRISE && <Shield className="w-6 h-6 text-purple-600" />}
            </div>
            <div>
              <CardTitle className="text-xl">{config.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{config.description}</CardDescription>
            </div>
          </div>

          <div className="mt-4">
            {config.price.monthly === 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">¥0</span>
                <span className="text-gray-500">/永久免费</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ¥{yearly ? Math.round(config.price.yearly / 12) : config.price.monthly}
                  </span>
                  <span className="text-gray-500">/月</span>
                </div>
                {yearly && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 line-through">
                      ¥{config.price.monthly * 12}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      省¥{config.price.monthly * 12 - config.price.yearly} ({discount}% OFF)
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 核心功能 */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">核心功能</div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                {renderFeatureCheck(config.features.dataSource.osm)}
                <div className="flex-1">
                  <div className="text-sm font-medium">OpenStreetMap数据</div>
                  <div className="text-xs text-muted-foreground">全球POI数据</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                {renderFeatureCheck(config.features.dataSource.amap || config.features.dataSource.baidu)}
                <div className="flex-1">
                  <div className="text-sm font-medium">商业地图数据</div>
                  <div className="text-xs text-muted-foreground">高德/百度POI</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {renderFeatureCheck(config.features.carrierData.enabled)}
                <div className="flex-1">
                  <div className="text-sm font-medium">运营商数据</div>
                  <div className="text-xs text-muted-foreground">
                    {config.features.carrierData.unicom ? '联通智慧足迹' :
                     config.features.carrierData.aggregated ? '三大运营商聚合' :
                     config.features.carrierData.simulated ? '模拟数据' : '不支持'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 分析能力 */}
          <div className="space-y-3 pt-3 border-t">
            <div className="text-sm font-semibold text-gray-700 mb-2">分析能力</div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-muted-foreground">分析半径</div>
                  <div className="text-sm font-medium">
                    {config.features.analysis.maxRadius}公里
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-muted-foreground">历史数据</div>
                  <div className="text-sm font-medium">
                    {config.features.analysis.historicalData ? '支持' : '不支持'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-muted-foreground">对比分析</div>
                  <div className="text-sm font-medium">
                    {config.features.analysis.comparativeAnalysis ? '支持' : '不支持'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-muted-foreground">实时数据</div>
                  <div className="text-sm font-medium">
                    {config.features.analysis.realtimeData ? '支持' : '不支持'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 使用限制 */}
          <div className="space-y-3 pt-3 border-t">
            <div className="text-sm font-semibold text-gray-700 mb-2">使用限制</div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-muted-foreground">团队人数</div>
                  <div className="text-sm font-medium">
                    {config.features.limits.teamMembers === -1 ? '无限' : config.features.limits.teamMembers + '人'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-muted-foreground">每月分析</div>
                  <div className="text-sm font-medium">
                    {config.features.limits.monthlyAnalyses === -1 ? '无限' : config.features.limits.monthlyAnalyses + '次'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="pt-4">
            {isCurrent ? (
              <Button
                disabled
                className="w-full"
                variant="outline"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                当前档位
              </Button>
            ) : (
              <Button
                onClick={() => handleSelectTier(tier)}
                className={`w-full ${
                  isPopular
                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd6] hover:to-[#6a4190]'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {config.price.monthly === 0 ? (
                  '开始使用'
                ) : (
                  <>
                    立即升级
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* 年付/月付切换 */}
      <div className="flex justify-center items-center gap-4">
        <span className={`text-sm ${!yearly ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
          月付
        </span>
        <Button
          variant={yearly ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToggleYearly?.(!yearly)}
          className="relative"
        >
          <div className="flex items-center gap-2">
            <Checkbox
              checked={yearly}
              onChange={() => onToggleYearly?.(!yearly)}
            />
            <span className="text-sm">年付</span>
            <Badge className="bg-red-500 text-white text-xs">省17%</Badge>
          </div>
        </Button>
      </div>

      {/* 档位卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderTierCard(PricingTier.FREE)}
        {renderTierCard(PricingTier.BASIC)}
        {renderTierCard(PricingTier.PROFESSIONAL)}
        {renderTierCard(PricingTier.ENTERPRISE)}
      </div>

      {/* 功能对比表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#667eea]" />
            功能对比详情
          </CardTitle>
          <CardDescription>各档位功能详细对比</CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureComparisonTable />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 功能对比表组件
 */
function FeatureComparisonTable() {
  const tiers: PricingTier[] = [
    PricingTier.FREE,
    PricingTier.BASIC,
    PricingTier.PROFESSIONAL,
    PricingTier.ENTERPRISE,
  ];

  const features = [
    {
      category: '数据源',
      items: [
        { key: 'dataSource.osm', label: 'OpenStreetMap' },
        { key: 'dataSource.amap', label: '高德地图' },
        { key: 'dataSource.baidu', label: '百度地图' },
        { key: 'dataSource.aggregated', label: '聚合数据' },
      ],
    },
    {
      category: '运营商数据',
      items: [
        { key: 'carrierData.enabled', label: '启用运营商数据' },
        { key: 'carrierData.simulated', label: '模拟数据' },
        { key: 'carrierData.unicom', label: '联通智慧足迹' },
        { key: 'carrierData.mobile', label: '移动大数据' },
        { key: 'carrierData.telecom', label: '电信天翼大数据' },
        { key: 'carrierData.aggregated', label: '三大运营商聚合' },
      ],
    },
    {
      category: '分析功能',
      items: [
        { key: 'analysis.maxRadius', label: '最大分析半径', getValue: (v: any) => v + 'km' },
        { key: 'analysis.maxLocations', label: '最大地点数', getValue: (v: any) => v + '个' },
        { key: 'analysis.historicalData', label: '历史数据' },
        { key: 'analysis.comparativeAnalysis', label: '对比分析' },
        { key: 'analysis.exportReports', label: '导出报告' },
        { key: 'analysis.realtimeData', label: '实时数据' },
      ],
    },
    {
      category: '使用限制',
      items: [
        { key: 'limits.dailyAnalyses', label: '每日分析次数', getValue: (v: any) => v === -1 ? '无限' : v + '次' },
        { key: 'limits.monthlyAnalyses', label: '每月分析次数', getValue: (v: any) => v === -1 ? '无限' : v + '次' },
        { key: 'limits.teamMembers', label: '团队人数', getValue: (v: any) => v === -1 ? '无限' : v + '人' },
        { key: 'limits.storageDays', label: '数据存储天数', getValue: (v: any) => v + '天' },
      ],
    },
  ];

  const getFeatureValue = (tier: PricingTier, item: any) => {
    const config = PRICING_CONFIG[tier];
    const keys = item.key.split('.');
    let value = config.features;
    
    for (const key of keys) {
      value = value[key];
    }

    if (item.getValue) {
      return item.getValue(value);
    }

    return value ? '✓' : '✗';
  };

  const getValueStyle = (tier: PricingTier, item: any) => {
    const config = PRICING_CONFIG[tier];
    const keys = item.key.split('.');
    let value = config.features;
    
    for (const key of keys) {
      value = value[key];
    }

    if (item.getValue) {
      return '';
    }

    return value ? 'text-green-600' : 'text-gray-400';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">功能</th>
            {tiers.map((tier) => (
              <th key={tier} className="text-center py-3 px-4 font-semibold text-gray-700">
                {getTierDisplayName(tier)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <tr className="bg-gray-50">
                <td
                  colSpan={tiers.length + 1}
                  className="py-2 px-4 font-semibold text-sm text-gray-600"
                >
                  {group.category}
                </td>
              </tr>
              {group.items.map((item, itemIndex) => (
                <tr key={itemIndex} className="border-b">
                  <td className="py-3 px-4 text-sm">{item.label}</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="py-3 px-4 text-center">
                      <span className={getValueStyle(tier, item)}>
                        {getFeatureValue(tier, item)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
