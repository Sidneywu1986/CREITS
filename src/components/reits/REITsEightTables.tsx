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
} from 'lucide-react';

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
          const productRes = await fetch(`/api/database/query/products`);
          const productData = await productRes.json();
          // 在前端筛选数据
          const filteredProducts = productData.success
            ? productData.data.filter((p: any) => p.reit_code === reitCode)
            : [];
          data = filteredProducts;
          break;

        case 'reit_property_base':
        case 'reit_property_equity_ops':
        case 'reit_property_concession_ops':
          const assetsRes = await fetch(`/api/database/query/assets?reit_code=${reitCode}`);
          const assetsData = await assetsRes.json();
          data = assetsData.success ? assetsData.data : [];
          break;

        case 'reit_financial_metrics':
          const metricsRes = await fetch(`/api/database/query/metrics?reit_code=${reitCode}`);
          const metricsData = await metricsRes.json();
          data = metricsData.success ? [metricsData.data] : [];
          break;

        case 'reit_market_stats':
          const marketRes = await fetch(`/api/database/query/market?reit_code=${reitCode}`);
          const marketData = await marketRes.json();
          data = marketRes.success ? marketData.data : [];
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
              <span className="text-xs text-muted-foreground flex-shrink-0 w-24">
                {formatFieldName(key)}:
              </span>
              <span className="text-sm font-medium text-foreground flex-1">
                {formatValue(data[key])}
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
      fund_size: '基金总份额',
      total_assets: '募集规模',
      asset_type_national: '发改委大类',
      asset_type_csrc: '证监会资产类型',
      leverage_ratio: '杠杆率',
      property_id: '资产ID',
      property_name: '资产名称',
      location_province: '省份',
      location_city: '城市',
      location_district: '区域',
      asset_address: '地址',
      gross_floor_area: '总建筑面积',
      land_area: '占地面积',
      occupancy_rate: '出租率',
      average_rent: '平均租金',
      rental_income: '租金收入',
      traffic_volume_avg_daily: '日均车流量',
      toll_income: '通行费收入',
      processing_capacity: '处理能力',
      actual_processing: '实际处理量',
      ffo: '营运现金流FFO',
      affo: '调整后营运现金流',
      available_for_distribution: '可供分配金额',
      distribution_yield: '现金分派率',
      appraisal_value: '评估价值',
      discount_rate: '折现率',
      cap_rate: '资本化率',
      regulatory_status: '监管状态',
      esg_score: 'ESG评分',
      close_price: '收盘价',
      daily_volume: '成交量',
      market_cap: '总市值',
      institutional_holding_pct: '机构持有比例',
    };

    return mapping[fieldName] || fieldName;
  };

  // 格式化数值
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '是' : '否';
    if (typeof value === 'number') {
      if (value > 1000000) return `${(value / 100000000).toFixed(2)} 亿元`;
      if (value > 100) return value.toFixed(2);
      return value.toString();
    }
    if (typeof value === 'string') {
      // 日期格式化
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value).toLocaleDateString('zh-CN');
      }
    }
    return String(value);
  };

  const currentTable = tableData[activeTable];
  const Icon = currentTable?.icon || Database;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            REITs 八张表数据
          </CardTitle>
          <CardDescription>
            {reitName} ({reitCode}) 的完整数据视图
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTable} onValueChange={handleTableChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 gap-2">
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
            <TabsList className="grid w-full grid-cols-4 gap-2 mt-2">
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
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="space-y-0">
                            {table.data.map((data, index) => renderDataRow(data, index))}
                          </div>
                        </ScrollArea>
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

      {/* 数据提示 */}
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
          <p>• 点击上方标签页切换查看不同表的数据</p>
          <p>• 部分表可能需要额外权限才能访问完整数据</p>
        </CardContent>
      </Card>
    </div>
  );
}
