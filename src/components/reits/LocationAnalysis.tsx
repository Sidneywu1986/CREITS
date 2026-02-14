/**
 * 地理位置分析组件
 * 展示人口、人流量、商业数据分析
 */

'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Users,
  TrendingUp,
  Building2,
  Search,
  Loader2,
  Star,
  CheckCircle2,
  AlertCircle,
  Target,
  Shield,
  BarChart3,
  Navigation,
  Sun,
  Moon,
  Clock,
  Calendar,
  ShoppingBag,
  Utensils,
  Bus,
  Car,
  Activity,
  Database,
  Signal,
  CheckCircle,
} from 'lucide-react';
import MapLocationSelector from './MapLocationSelector';
import type {
  LocationAnalysisResult,
  PopulationData,
  FootTrafficData,
  CommercialData,
} from '@/lib/services/location-analysis-service';
import { CarrierDataSource } from '@/lib/services/carrier-data-service';

interface LocationAnalysisProps {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export default function LocationAnalysis({
  address: propAddress,
  latitude: propLatitude,
  longitude: propLongitude,
}: LocationAnalysisProps) {
  const [selectedLatitude, setSelectedLatitude] = useState<number>(propLatitude || 39.9042);
  const [selectedLongitude, setSelectedLongitude] = useState<number>(propLongitude || 116.4074);
  const [selectedAddress, setSelectedAddress] = useState<string>(propAddress || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocationAnalysisResult | null>(null);
  const [useCarrierData, setUseCarrierData] = useState(false);
  const [carrierDataSource, setCarrierDataSource] = useState<CarrierDataSource>(CarrierDataSource.SIMULATED);
  const [includeRealtime, setIncludeRealtime] = useState(true);

  // 处理地图位置变化
  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setSelectedLatitude(lat);
    setSelectedLongitude(lng);
    setSelectedAddress(address);
  };

  const handleAnalyze = async () => {
    if (!selectedAddress) {
      alert('请先选择位置');
      return;
    }

    try {
      setLoading(true);
      const body = {
        latitude: selectedLatitude,
        longitude: selectedLongitude,
        address: selectedAddress,
        useCarrierData,
        carrierDataSource,
        includeRealtime,
      };

      const response = await fetch('/api/location-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        alert(`分析失败: ${data.error}`);
      }
    } catch (error) {
      console.error('分析失败:', error);
      alert('分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getCarrierDataSourceName = (source: CarrierDataSource): string => {
    switch (source) {
      case CarrierDataSource.SIMULATED:
        return '模拟数据';
      case CarrierDataSource.UNICOM:
        return '中国联通智慧足迹';
      case CarrierDataSource.MOBILE:
        return '中国移动大数据';
      case CarrierDataSource.TELECOM:
        return '中国电信天翼大数据';
      case CarrierDataSource.AGGREGATED:
        return '聚合数据（多运营商）';
      default:
        return '未知数据源';
    }
  };

  const renderPopulationData = (data: PopulationData) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold">{(data.totalPopulation / 10000).toFixed(1)}万</div>
          <div className="text-xs text-muted-foreground">常住人口</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold">{(data.populationDensity / 10000).toFixed(1)}万</div>
          <div className="text-xs text-muted-foreground">人口密度/km²</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Sun className="w-6 h-6 mx-auto mb-2 text-orange-600" />
          <div className="text-2xl font-bold">{(data.dayPopulation / 10000).toFixed(1)}万</div>
          <div className="text-xs text-muted-foreground">白天人口</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Moon className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold">{(data.nightPopulation / 10000).toFixed(1)}万</div>
          <div className="text-xs text-muted-foreground">夜间人口</div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          年龄分布
        </h4>
        <div className="space-y-2">
          {Object.entries(data.ageDistribution).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-32 text-sm">{getAgeLabel(key)}</span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-12 text-right">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          教育水平
        </h4>
        <div className="space-y-2">
          {Object.entries(data.educationDistribution).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-32 text-sm">{getEducationLabel(key)}</span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-12 text-right">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          收入水平
        </h4>
        <div className="space-y-2">
          {Object.entries(data.incomeDistribution).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-32 text-sm">{getIncomeLabel(key)}</span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 rounded-full"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-12 text-right">{value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFootTrafficData = (data: FootTrafficData) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold">{(data.dailyFootfall / 10000).toFixed(1)}万</div>
          <div className="text-xs text-muted-foreground">日均人流量</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-red-600" />
          <div className="text-2xl font-bold">{(data.peakHourFootfall / 1000).toFixed(1)}千</div>
          <div className="text-xs text-muted-foreground">高峰时段人流量</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold">{(data.weekendFootfall / 10000).toFixed(1)}万</div>
          <div className="text-xs text-muted-foreground">周末人流量</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold">{data.averageStayTime}分钟</div>
          <div className="text-xs text-muted-foreground">平均停留时长</div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3">24小时人流分布</h4>
        <div className="h-40 flex items-end gap-1">
          {data.hourlyDistribution.map((item) => (
            <div
              key={item.hour}
              className="flex-1 bg-blue-600 rounded-t transition-all hover:bg-blue-700"
              style={{
                height: `${(item.footfall / Math.max(...data.hourlyDistribution.map(d => d.footfall))) * 100}%`,
              }}
              title={`${item.hour}:00 - ${item.footfall}人次`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0:00</span>
          <span>12:00</span>
          <span>24:00</span>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">客群特征</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{data.visitorProfile.localResident}%</div>
            <div className="text-xs text-muted-foreground">本地居民</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xl font-bold text-green-600">{data.visitorProfile.commuter}%</div>
            <div className="text-xs text-muted-foreground">通勤人群</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xl font-bold text-orange-600">{data.visitorProfile.tourist}%</div>
            <div className="text-xs text-muted-foreground">游客</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommercialData = (data: CommercialData) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Building2 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold">{data.totalCommercialFacilities}</div>
          <div className="text-xs text-muted-foreground">商业设施总数</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-pink-600" />
          <div className="text-2xl font-bold">{data.shoppingMalls}</div>
          <div className="text-xs text-muted-foreground">购物中心</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Utensils className="w-6 h-6 mx-auto mb-2 text-orange-600" />
          <div className="text-2xl font-bold">{data.restaurants}</div>
          <div className="text-xs text-muted-foreground">餐饮</div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            商圈信息
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>商圈名称</span>
              <span className="font-semibold">{data.commercialCircle.name}</span>
            </div>
            <div className="flex justify-between">
              <span>商圈等级</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.commercialCircle.level }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span>商圈半径</span>
              <span className="font-semibold">{data.commercialCircle.radius}公里</span>
            </div>
            <div className="flex justify-between">
              <span>商圈面积</span>
              <span className="font-semibold">{data.commercialCircle.totalArea}万m²</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            竞争对手
          </h4>
          <div className="space-y-2 text-sm">
            {data.competitors.map((competitor, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                <div>
                  <div className="font-semibold">{competitor.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {competitor.type} • {competitor.distance}米
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">交通便利性</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Navigation className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-xl font-bold">{data.transportation.subwayStations}</div>
              <div className="text-xs text-muted-foreground">地铁站</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Bus className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-xl font-bold">{data.transportation.busStops}</div>
              <div className="text-xs text-muted-foreground">公交站点</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Car className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-xl font-bold">{data.transportation.parkingSpaces}</div>
              <div className="text-xs text-muted-foreground">停车位</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Activity className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-xl font-bold">{data.transportation.trafficFlow}</div>
              <div className="text-xs text-muted-foreground">车次/小时</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 输入区域 - 地图选择器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#667eea]" />
            地理位置分析
          </CardTitle>
          <CardDescription>
            在地图上选择位置，分析人口、人流量、商业数据（2公里范围）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MapLocationSelector
              onLocationChange={handleLocationChange}
              initialLatitude={selectedLatitude}
              initialLongitude={selectedLongitude}
              radius={2}
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  开始分析
                </>
              )}
            </Button>

            {/* 数据来源选择 */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useCarrierData"
                    checked={useCarrierData}
                    onChange={(e) => setUseCarrierData(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#667eea] focus:ring-[#667eea]"
                  />
                  <label htmlFor="useCarrierData" className="text-sm font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    使用运营商大数据（更精准）
                  </label>
                </div>

                {useCarrierData && (
                  <div className="ml-7 space-y-2">
                    <div className="text-xs text-muted-foreground">选择运营商数据源：</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: CarrierDataSource.SIMULATED, label: '模拟数据', icon: Activity },
                        { value: CarrierDataSource.UNICOM, label: '联通智慧足迹', icon: Signal },
                        { value: CarrierDataSource.MOBILE, label: '移动大数据', icon: Signal },
                        { value: CarrierDataSource.TELECOM, label: '电信天翼数据', icon: Signal },
                        { value: CarrierDataSource.AGGREGATED, label: '聚合数据（推荐）', icon: CheckCircle },
                      ].map((source) => (
                        <button
                          key={source.value}
                          onClick={() => setCarrierDataSource(source.value)}
                          className={`flex items-center gap-2 px-3 py-2 text-xs rounded-md border transition-all ${
                            carrierDataSource === source.value
                              ? 'border-[#667eea] bg-[#667eea]/10 text-[#667eea]'
                              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <source.icon className="w-3.5 h-3.5" />
                          {source.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeRealtime"
                        checked={includeRealtime}
                        onChange={(e) => setIncludeRealtime(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#667eea] focus:ring-[#667eea]"
                      />
                      <label htmlFor="includeRealtime" className="text-xs text-muted-foreground">
                        包含实时监测数据
                      </label>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-start gap-1">
                      <span>💡</span>
                      <span>真实运营商数据需要商业合作，当前使用模拟数据演示</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分析结果 */}
      {result && (
        <>
          {/* 综合评分 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#667eea]" />
                综合评分
              </CardTitle>
              {result.metadata && (
                <CardDescription>
                  分析范围：{result.metadata.analysisRadiusKm}公里半径（约{result.metadata.analysisAreaSqKm}平方公里）
                  {' '}| 分析时间：{new Date(result.metadata.analysisDate).toLocaleString('zh-CN')}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.analysis.overallScore).split(' ')[0]}`}>
                  {result.analysis.overallScore}
                </div>
                <div className="text-sm text-muted-foreground mb-4">综合评分</div>
                <p className="text-sm">{result.analysis.recommendation}</p>
              </div>
            </CardContent>
          </Card>

          {/* SWOT分析 */}
          <Card>
            <CardHeader>
              <CardTitle>SWOT分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    优势
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {result.analysis.strengths.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-orange-700">
                    <AlertCircle className="w-4 h-4" />
                    劣势
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {result.analysis.weaknesses.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-700">
                    <Target className="w-4 h-4" />
                    机会
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {result.analysis.opportunities.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-red-700">
                    <Shield className="w-4 h-4" />
                    威胁
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {result.analysis.threats.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">!</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 运营商数据分析 */}
          {result.carrierData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  运营商大数据分析
                </CardTitle>
                <CardDescription>
                  数据来源：{getCarrierDataSourceName(result.carrierData.metadata.primaryDataSource)}
                  {' '}| 数据质量：{result.carrierData.metadata.dataQuality.overallScore}/100
                  {' '}| 置信度：{result.carrierData.populationDensity.confidence}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 人口密度数据 */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      人口密度（基于基站）
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {(result.carrierData.populationDensity.totalPopulation / 10000).toFixed(1)}万
                        </div>
                        <div className="text-xs text-muted-foreground">覆盖人口</div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {(result.carrierData.populationDensity.populationPerSqKm / 10000).toFixed(1)}万
                        </div>
                        <div className="text-xs text-muted-foreground">人口密度/km²</div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {(result.carrierData.populationDensity.residentPopulation / 10000).toFixed(1)}万
                        </div>
                        <div className="text-xs text-muted-foreground">常住人口</div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {(result.carrierData.populationDensity.floatingPopulation / 10000).toFixed(1)}万
                        </div>
                        <div className="text-xs text-muted-foreground">流动人口</div>
                      </div>
                    </div>
                  </div>

                  {/* 人流量数据 */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-600" />
                      人流量数据（基于移动轨迹）
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {(result.carrierData.footTraffic.dailyFootfall / 10000).toFixed(1)}万
                        </div>
                        <div className="text-xs text-muted-foreground">日均人流量</div>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {(result.carrierData.footTraffic.returnVisitorRate)}%
                        </div>
                        <div className="text-xs text-muted-foreground">复访率</div>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.carrierData.footTraffic.averageStayTime}分钟
                        </div>
                        <div className="text-xs text-muted-foreground">平均停留</div>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {result.carrierData.footTraffic.visitorProfile.localResident}%
                        </div>
                        <div className="text-xs text-muted-foreground">本地居民</div>
                      </div>
                    </div>
                  </div>

                  {/* 用户画像 */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      用户画像
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-sm font-semibold mb-2">消费能力</div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {result.carrierData.userPortrait.consumptionPower.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.carrierData.userPortrait.consumptionPower.level === 'high' ? '高消费' :
                           result.carrierData.userPortrait.consumptionPower.level === 'medium_high' ? '中高消费' :
                           result.carrierData.userPortrait.consumptionPower.level === 'medium' ? '中等消费' : '低消费'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          月均消费 ¥{result.carrierData.userPortrait.consumptionPower.averageMonthlyConsumption}
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-sm font-semibold mb-2">性别分布</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>男性</span>
                            <span className="font-semibold">{result.carrierData.userPortrait.genderDistribution.male}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>女性</span>
                            <span className="font-semibold">{result.carrierData.userPortrait.genderDistribution.female}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-sm font-semibold mb-2">生活方式标签</div>
                        <div className="flex flex-wrap gap-1">
                          {result.carrierData.userPortrait.lifestyleTags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 职住分析 */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-green-600" />
                      职住分析
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-sm font-semibold mb-2">平均通勤距离</div>
                        <div className="text-2xl font-bold text-green-600">
                          {result.carrierData.workHomeAnalysis.commuteDistance.average}公里
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="text-xs flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>短距离（&lt;5km）: {result.carrierData.workHomeAnalysis.commuteDistance.short}%</span>
                          </div>
                          <div className="text-xs flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            <span>中距离（5-15km）: {result.carrierData.workHomeAnalysis.commuteDistance.medium}%</span>
                          </div>
                          <div className="text-xs flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span>长距离（&gt;15km）: {result.carrierData.workHomeAnalysis.commuteDistance.long}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-sm font-semibold mb-2">平均通勤时间</div>
                        <div className="text-2xl font-bold text-green-600">
                          {result.carrierData.workHomeAnalysis.commuteTime.average}分钟
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div>驾车平均: {result.carrierData.workHomeAnalysis.commuteTime.byCar}分钟</div>
                          <div>公交平均: {result.carrierData.workHomeAnalysis.commuteTime.byPublicTransport}分钟</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 实时数据 */}
                  {result.carrierData.realtimeData && result.carrierData.realtimeData.currentPopulation > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        实时监测数据
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <div className="text-sm font-semibold mb-1">当前人口</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {(result.carrierData.realtimeData.currentPopulation / 10000).toFixed(1)}万
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            趋势: {
                              result.carrierData.realtimeData.populationTrend === 'rising' ? '↑ 上升' :
                              result.carrierData.realtimeData.populationTrend === 'stable' ? '→ 稳定' : '↓ 下降'
                            }
                          </div>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <div className="text-sm font-semibold mb-1">当前人流量</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {(result.carrierData.realtimeData.currentFootfall / 10000).toFixed(1)}万
                          </div>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg col-span-2">
                          <div className="text-sm font-semibold mb-2">高峰时段</div>
                          <div className="space-y-1">
                            {result.carrierData.realtimeData.peakHours.map((peak, index) => (
                              <div key={index} className="text-xs flex items-center justify-between">
                                <span>{peak.startTime} - {peak.endTime}</span>
                                <span className="font-semibold text-orange-600">
                                  {(peak.footfall / 10000).toFixed(1)}万
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 详细数据 */}
          <Tabs defaultValue="population" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="population">人口数据</TabsTrigger>
              <TabsTrigger value="traffic">人流量</TabsTrigger>
              <TabsTrigger value="commercial">商业数据</TabsTrigger>
            </TabsList>
            <TabsContent value="population">
              <Card>
                <CardHeader>
                  <CardTitle>人口数据</CardTitle>
                </CardHeader>
                <CardContent>{renderPopulationData(result.population)}</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="traffic">
              <Card>
                <CardHeader>
                  <CardTitle>人流量数据</CardTitle>
                </CardHeader>
                <CardContent>{renderFootTrafficData(result.footTraffic)}</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="commercial">
              <Card>
                <CardHeader>
                  <CardTitle>商业数据</CardTitle>
                </CardHeader>
                <CardContent>{renderCommercialData(result.commercial)}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// 辅助函数
function getAgeLabel(key: string): string {
  const labels: Record<string, string> = {
    under18: '18岁以下',
    age18To35: '18-35岁',
    age36To50: '36-50岁',
    age50To65: '50-65岁',
    over65: '65岁以上',
  };
  return labels[key] || key;
}

function getEducationLabel(key: string): string {
  const labels: Record<string, string> = {
    primary: '初中及以下',
    secondary: '高中/中专',
    bachelor: '本科',
    master: '硕士及以上',
  };
  return labels[key] || key;
}

function getIncomeLabel(key: string): string {
  const labels: Record<string, string> = {
    low: '低收入 (<5K)',
    medium: '中等收入 (5K-10K)',
    mediumHigh: '中高收入 (10K-20K)',
    high: '高收入 (>20K)',
  };
  return labels[key] || key;
}
