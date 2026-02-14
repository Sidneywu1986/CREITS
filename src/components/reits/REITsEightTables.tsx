'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Building,
  TrendingUp,
  Calculator,
  AlertTriangle,
  Activity,
  BarChart3,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Info,
} from 'lucide-react';
import {
  FinancialMetricsChart,
  DistributionYieldChart,
  OccupancyRateChart,
  TrafficVolumeChart,
  PriceChart,
  VolumeChart,
} from './REITsChart';

interface REITsEightTablesProps {
  reitCode: string;
  reitName: string;
}

interface TableData {
  tableName: string;
  displayName: string;
  icon: any;
  description: string;
  data: any[] | null;
  loading: boolean;
  error: string | null;
}

// 资产类型判断
const EQUITY_ASSET_TYPES = [
  '产业园', '仓储物流', '商业', '购物中心', '保障性租赁住房',
  '租赁住房', '写字楼', '公寓', '厂房', '数据中心'
];

const CONCESSION_ASSET_TYPES = [
  '收费公路', '高速公路', '桥梁', '隧道', '港口', '机场',
  '垃圾焚烧', '生物质发电', '污水处理', '供水', '供电', '供热'
];

const TABLES_CONFIG: Omit<TableData, 'data' | 'loading' | 'error'>[] = [
  {
    tableName: 'reit_product_info',
    displayName: '产品信息',
    icon: Building,
    description: '基金代码、管理人、资产类型、杠杆率等基本信息',
  },
  {
    tableName: 'reit_property_base',
    displayName: '底层资产',
    icon: MapPin,
    description: '地理位置、权证、土地信息等资产通用信息',
  },
  {
    tableName: 'reit_property_equity_ops',
    displayName: '产权类运营',
    icon: TrendingUp,
    description: '出租率、租金、租约分布等产权类运营数据',
  },
  {
    tableName: 'reit_property_concession_ops',
    displayName: '经营权类运营',
    icon: Activity,
    description: '车流量、处理量、剩余年限等经营权类运营数据',
  },
  {
    tableName: 'reit_financial_metrics',
    displayName: '财务指标',
    icon: DollarSign,
    description: 'FFO、可供分配金额、分派率等财务指标',
  },
  {
    tableName: 'reit_valuation',
    displayName: '估值信息',
    icon: Calculator,
    description: '评估价值、折现率、资本化率等估值数据',
  },
  {
    tableName: 'reit_risk_compliance',
    displayName: '风险合规',
    icon: AlertTriangle,
    description: '监管状态、诉讼、ESG评分等风险合规信息',
  },
  {
    tableName: 'reit_market_stats',
    displayName: '市场表现',
    icon: BarChart3,
    description: '股价、成交量、投资者结构等市场交易数据',
  },
];

export default function REITsEightTables({ reitCode, reitName }: REITsEightTablesProps) {
  const [activeTable, setActiveTable] = useState<string>('reit_product_info');
  const [tableData, setTableData] = useState<Record<string, TableData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [assetType, setAssetType] = useState<'equity' | 'concession' | 'unknown'>('unknown');
  const [productInfo, setProductInfo] = useState<any>(null);

  // 初始化表数据状态
  useEffect(() => {
    const initialData: Record<string, TableData> = {};
    TABLES_CONFIG.forEach((config) => {
      initialData[config.tableName] = {
        ...config,
        data: null,
        loading: false,
        error: null,
      };
    });
    setTableData(initialData);
  }, []);

  // 加载产品信息并判断资产类型
  const loadProductInfo = async () => {
    try {
      const res = await fetch('/api/database/query/products');
      const result = await res.json();

      if (result.success && result.data) {
        const product = result.data.find((p: any) => p.reit_code === reitCode);
        if (product) {
          setProductInfo(product);

          // 判断资产类型
          const assetTypeCsrc = product.asset_type_csrc || '';
          let determinedType: 'equity' | 'concession' | 'unknown' = 'unknown';

          if (EQUITY_ASSET_TYPES.some(type => assetTypeCsrc.includes(type))) {
            determinedType = 'equity';
          } else if (CONCESSION_ASSET_TYPES.some(type => assetTypeCsrc.includes(type))) {
            determinedType = 'concession';
          }

          setAssetType(determinedType);
        }
      }
    } catch (error) {
      console.error('加载产品信息失败:', error);
    }
  };

  // 加载指定表的数据
  const loadTableData = async (tableName: string) => {
    setTableData((prev) => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        data: null,
        loading: true,
        error: null,
      },
    }));

    try {
      let data: any[] = [];

      // 根据表名调用不同的API
      switch (tableName) {
        case 'reit_product_info':
          const productRes = await fetch('/api/database/query/products');
          const productData = await productRes.json();
          data = productData.success
            ? productData.data.filter((p: any) => p.reit_code === reitCode)
            : [];
          break;

        case 'reit_property_base':
          const assetsRes = await fetch(`/api/database/query/assets?reit_code=${reitCode}`);
          const assetsData = await assetsRes.json();
          data = assetsData.success ? assetsData.data : [];
          break;

        case 'reit_property_equity_ops':
          const equityOpsRes = await fetch(`/api/database/query/equity-ops?reit_code=${reitCode}`);
          const equityOpsData = await equityOpsRes.json();
          data = equityOpsData.success ? equityOpsData.data : [];
          break;

        case 'reit_property_concession_ops':
          const concessionOpsRes = await fetch(`/api/database/query/concession-ops?reit_code=${reitCode}`);
          const concessionOpsData = await concessionOpsRes.json();
          data = concessionOpsData.success ? concessionOpsData.data : [];
          break;

        case 'reit_financial_metrics':
          const metricsRes = await fetch(`/api/database/query/metrics?reit_code=${reitCode}`);
          const metricsData = await metricsRes.json();
          data = metricsData.success ? metricsData.data : [];
          break;

        case 'reit_market_stats':
          const marketRes = await fetch(`/api/database/query/market?reit_code=${reitCode}`);
          const marketData = await marketRes.json();
          data = marketData.success ? marketData.data : [];
          break;

        case 'reit_valuation':
        case 'reit_risk_compliance':
          // 这些表可能需要额外的API，暂时返回空数据
          data = [];
          break;

        default:
          data = [];
      }

      setTableData((prev) => ({
        ...prev,
        [tableName]: {
          ...prev[tableName],
          data,
          loading: false,
          error: data.length === 0 ? '暂无数据' : null,
        },
      }));
    } catch (error: any) {
      setTableData((prev) => ({
        ...prev,
        [tableName]: {
          ...prev[tableName],
          data: null,
          loading: false,
          error: error.message || '加载失败',
        },
      }));
    }
  };

  // 切换表时加载数据
  const handleTableChange = (tableName: string) => {
    setActiveTable(tableName);
    if (!tableData[tableName]?.data && !tableData[tableName]?.loading) {
      loadTableData(tableName);
    }
  };

  // 刷新当前表数据
  const handleRefresh = () => {
    loadTableData(activeTable);
  };

  // 首次加载时获取产品信息
  useEffect(() => {
    loadProductInfo();
  }, [reitCode]);

  // 渲染数据行
  const renderDataRow = (data: any, index: number) => {
    const fields = Object.keys(data).filter(
      (key) =>
        data[key] !== null &&
        data[key] !== undefined &&
        !key.endsWith('_id') &&
        !key.startsWith('effective_date') &&
        !key.startsWith('expiration_date')
    );

    return (
      <div key={index} className="border-b last:border-b-0 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((key) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground flex-shrink-0 w-28">
                {formatFieldName(key)}:
              </span>
              <span className="text-sm font-medium text-foreground flex-1 break-all">
                {formatValue(data[key], key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 格式化字段名
  const formatFieldName = (fieldName: string) => {
    const mapping: Record<string, string> = {
      reit_code: '基金代码',
      reit_short_name: '基金简称',
      fund_manager: '基金管理人',
      asset_manager: '资产支持证券管理人',
      operator: '运营管理机构',
      listing_date: '上市日期',
      fund_size: '基金总份额(亿份)',
      total_assets: '募集规模(亿元)',
      asset_type_national: '发改委大类',
      asset_type_csrc: '证监会资产类型',
      leverage_ratio: '杠杆率(%)',
      property_id: '资产ID',
      property_name: '资产名称',
      location_province: '省份',
      location_city: '城市',
      location_district: '区域',
      asset_address: '地址',
      gross_floor_area: '总建筑面积(m²)',
      land_area: '占地面积(m²)',
      land_right_type: '土地权属类型',
      land_expiry_date: '土地使用期限',
      occupancy_rate: '出租率(%)',
      average_rent: '平均租金(元/m²/月)',
      rental_income: '租金收入(万元)',
      traffic_volume_avg_daily: '日均车流量(辆次)',
      traffic_volume_total: '总车流量(万辆次)',
      toll_rate_avg: '平均收费标准(元/车公里)',
      toll_income: '通行费收入(万元)',
      processing_capacity: '处理能力(吨/日)',
      actual_processing: '实际处理量(吨)',
      tariff: '结算单价(元/吨)',
      operating_revenue: '运营收入(万元)',
      remaining_concession_years: '特许经营权剩余年限(年)',
      concession_expiry_date: '特许经营权到期日',
      ffo: '营运现金流FFO(万元)',
      affo: '调整后营运现金流(万元)',
      available_for_distribution: '可供分配金额(万元)',
      distribution_yield: '现金分派率(%)',
      appraisal_value: '评估价值(亿元)',
      discount_rate: '折现率(%)',
      cap_rate: '资本化率(%)',
      regulatory_status: '监管状态',
      esg_score: 'ESG评分',
      close_price: '收盘价(元)',
      daily_volume: '成交量(万份)',
      market_cap: '总市值(万元)',
      institutional_holding_pct: '机构持有比例(%)',
      retail_holding_pct: '个人持有比例(%)',
      report_date: '报告期',
      trade_date: '交易日期',
    };

    return mapping[fieldName] || fieldName;
  };

  // 格式化数值
  const formatValue = (value: any, key: string) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '是' : '否';
    if (typeof value === 'number') {
      // 根据字段名判断格式化方式
      if (key.includes('rate') || key.includes('ratio') || key.includes('pct') || key.includes('yield')) {
        return `${value.toFixed(2)}%`;
      }
      if (key.includes('price') && !key.includes('volume')) {
        return `¥${value.toFixed(2)}`;
      }
      if (key.includes('volume') || key.includes('count')) {
        return value.toLocaleString();
      }
      if (value > 1000000) return `${(value / 100000000).toFixed(2)} 亿元`;
      if (value > 100) return value.toFixed(2);
      return value.toString();
    }
    if (typeof value === 'string') {
      // JSON字段解析
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.join(', ');
          }
        } catch (e) {
          // 不是有效的JSON，返回原值
        }
      }
      // 日期格式化
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value).toLocaleDateString('zh-CN');
      }
    }
    return String(value);
  };

  const currentTable = tableData[activeTable];
  const Icon = currentTable?.icon || Database;

  // 根据资产类型显示提示
  const getAssetTypeHint = () => {
    if (assetType === 'equity') {
      return (
        <Badge variant="secondary" className="mb-4">
          <TrendingUp className="w-3 h-3 mr-1" />
          产权类资产 - 查看"产权类运营"标签
        </Badge>
      );
    } else if (assetType === 'concession') {
      return (
        <Badge variant="secondary" className="mb-4">
          <Activity className="w-3 h-3 mr-1" />
          经营权类资产 - 查看"经营权类运营"标签
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                REITs 八张表数据
              </CardTitle>
              <CardDescription className="mt-2">
                {reitName} ({reitCode}) 的完整数据视图
              </CardDescription>
            </div>
            {getAssetTypeHint()}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTable} onValueChange={handleTableChange} className="w-full">
            {/* PC端标签页 */}
            <div className="hidden md:block">
              <TabsList className="grid w-full grid-cols-4 gap-2 mb-2">
                {TABLES_CONFIG.slice(0, 4).map((config) => {
                  const table = tableData[config.tableName];
                  return (
                    <TabsTrigger
                      key={config.tableName}
                      value={config.tableName}
                      className="text-xs"
                    >
                      <config.icon className="w-3 h-3 mr-1" />
                      {config.displayName}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <TabsList className="grid w-full grid-cols-4 gap-2">
                {TABLES_CONFIG.slice(4, 8).map((config) => {
                  const table = tableData[config.tableName];
                  return (
                    <TabsTrigger
                      key={config.tableName}
                      value={config.tableName}
                      className="text-xs"
                    >
                      <config.icon className="w-3 h-3 mr-1" />
                      {config.displayName}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* 移动端标签页 - 简化为单行 */}
            <div className="md:hidden">
              <TabsList className="grid w-full grid-cols-2 gap-2 mb-2">
                {TABLES_CONFIG.slice(0, 4).map((config) => {
                  return (
                    <TabsTrigger
                      key={config.tableName}
                      value={config.tableName}
                      className="text-xs"
                    >
                      {config.displayName}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <TabsList className="grid w-full grid-cols-2 gap-2">
                {TABLES_CONFIG.slice(4, 8).map((config) => {
                  return (
                    <TabsTrigger
                      key={config.tableName}
                      value={config.tableName}
                      className="text-xs"
                    >
                      {config.displayName}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {TABLES_CONFIG.map((config) => {
              const table = tableData[config.tableName];
              if (!table) return null;

              const TableIcon = table.icon;

              return (
                <TabsContent key={config.tableName} value={config.tableName}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TableIcon className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg">{config.displayName}</CardTitle>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={table.loading}
                        >
                          <RefreshCw
                            className={`w-4 h-4 mr-1 ${table.loading ? 'animate-spin' : ''}`}
                          />
                          刷新
                        </Button>
                      </div>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {table.loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                          <span className="text-sm text-muted-foreground">加载数据中...</span>
                        </div>
                      ) : table.error ? (
                        <div className="flex items-center justify-center py-12">
                          <AlertCircle className="w-12 h-12 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {table.error}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              请确保数据库已正确初始化并导入数据
                            </p>
                          </div>
                        </div>
                      ) : table.data && table.data.length > 0 ? (
                        <div className="space-y-6">
                          {/* 图表展示区域 - PC端双列，移动端单列 */}
                          {config.tableName === 'reit_financial_metrics' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-1">
                                <FinancialMetricsChart data={table.data} />
                              </div>
                              <div className="md:col-span-1">
                                <DistributionYieldChart data={table.data} />
                              </div>
                            </div>
                          )}

                          {config.tableName === 'reit_market_stats' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-1">
                                <PriceChart data={table.data} />
                              </div>
                              <div className="md:col-span-1">
                                <VolumeChart data={table.data} />
                              </div>
                            </div>
                          )}

                          {config.tableName === 'reit_property_equity_ops' && assetType === 'equity' && (
                            <div className="md:col-span-2">
                              <OccupancyRateChart data={table.data} />
                            </div>
                          )}

                          {config.tableName === 'reit_property_concession_ops' && assetType === 'concession' && (
                            <div className="md:col-span-2">
                              <TrafficVolumeChart data={table.data} />
                            </div>
                          )}

                          {/* 时间序列提示 */}
                          {['reit_financial_metrics', 'reit_market_stats', 'reit_property_equity_ops', 'reit_property_concession_ops'].includes(config.tableName) && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-900 dark:text-blue-100">
                                  此表数据按报告期/交易日期排序，时间序列数据可用于绘制趋势图表
                                </span>
                              </div>
                            </div>
                          )}

                          {/* 历史数据提示 */}
                          {config.tableName === 'reit_property_base' && (
                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-900 dark:text-green-100">
                                  已过滤历史版本，仅显示最新数据（expiration_date='9999-12-31'）
                                </span>
                              </div>
                            </div>
                          )}

                          {/* 数据表格 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">详细数据</h4>
                            <ScrollArea className="h-[500px] pr-4">
                              <div className="space-y-0">
                                {table.data.map((data, index) => renderDataRow(data, index))}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-12">
                          <FileText className="w-12 h-12 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              暂无数据
                            </p>
                            <p className="text-xs text-muted-foreground">
                              该表暂无数据记录
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* 数据说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            数据说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• REITs 八张表包含产品的全生命周期数据，涵盖产品信息、资产、运营、财务、估值、风险、市场等方面</p>
          <p>• 数据来源于专业数据库，支持历史追溯和多维度分析</p>
          <p>• 时间序列数据（财务指标、市场表现、运营数据）已按报告期/交易日期排序，可用于趋势分析</p>
          <p>• 根据资产类型自动判断展示产权类或经营权类运营数据</p>
          <p>• 点击上方标签页切换查看不同表的数据</p>
        </CardContent>
      </Card>
    </div>
  );
}
