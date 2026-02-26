'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * 八张表数据类型
 */
export interface REITTablesData {
  productInfo: any[];           // 产品基本信息
  propertyBase: any[];          // 底层资产信息
  propertyEquityOps: any[];     // 股权运作信息
  propertyConcessionOps: any[]; // 特许经营权运作信息
  financialMetrics: any[];      // 财务指标
  valuation: any[];             // 估值信息
  riskCompliance: any[];        // 风险合规
  marketStats: any[];           // 市场统计
}

/**
 * 表格配置
 */
interface TableConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  columns: { key: string; label: string; type?: 'text' | 'number' | 'percentage' | 'currency' }[];
}

/**
 * 八张表配置
 */
const TABLE_CONFIGS: TableConfig[] = [
  {
    id: 'productInfo',
    name: '产品基本信息',
    description: 'REITs产品的基本属性和发行信息',
    icon: '🏛️',
    color: 'bg-blue-500',
    columns: [
      { key: 'reit_code', label: '产品代码', type: 'text' },
      { key: 'reit_name', label: '产品名称', type: 'text' },
      { key: 'listing_date', label: '上市日期', type: 'text' },
      { key: 'fund_size', label: '基金规模', type: 'currency' },
      { key: 'avg_occupancy', label: '平均出租率', type: 'percentage' }
    ]
  },
  {
    id: 'propertyBase',
    name: '底层资产信息',
    description: '底层不动产的基本信息和运营数据',
    icon: '🏢',
    color: 'bg-green-500',
    columns: [
      { key: 'property_id', label: '资产编号', type: 'text' },
      { key: 'property_name', label: '资产名称', type: 'text' },
      { key: 'asset_type', label: '资产类型', type: 'text' },
      { key: 'city', label: '所在城市', type: 'text' },
      { key: 'occupancy_rate', label: '出租率', type: 'percentage' }
    ]
  },
  {
    id: 'propertyEquityOps',
    name: '股权运作信息',
    description: '底层资产的股权结构和运作情况',
    icon: '📊',
    color: 'bg-purple-500',
    columns: [
      { key: 'property_id', label: '资产编号', type: 'text' },
      { key: 'equity_ratio', label: '持股比例', type: 'percentage' },
      { key: 'market_value', label: '市场价值', type: 'currency' },
      { key: 'equity_change', label: '股权变动', type: 'text' },
      { key: 'effective_date', label: '生效日期', type: 'text' }
    ]
  },
  {
    id: 'propertyConcessionOps',
    name: '特许经营权运作',
    description: '特许经营权类资产的运营情况',
    icon: '🎫',
    color: 'bg-pink-500',
    columns: [
      { key: 'property_id', label: '资产编号', type: 'text' },
      { key: 'concession_period', label: '特许经营期', type: 'text' },
      { key: 'contract_value', label: '合同价值', type: 'currency' },
      { key: 'revenue_share', label: '收益分成', type: 'percentage' },
      { key: 'expiration_date', label: '到期日期', type: 'text' }
    ]
  },
  {
    id: 'financialMetrics',
    name: '财务指标',
    description: '财务数据和关键指标',
    icon: '💰',
    color: 'bg-yellow-500',
    columns: [
      { key: 'fund_code', label: '基金代码', type: 'text' },
      { key: 'total_assets', label: '总资产', type: 'currency' },
      { key: 'total_debt', label: '总负债', type: 'currency' },
      { key: 'debt_ratio', label: '资产负债率', type: 'percentage' },
      { key: 'reporting_period', label: '报告期', type: 'text' }
    ]
  },
  {
    id: 'valuation',
    name: '估值信息',
    description: '资产估值和定价信息',
    icon: '📈',
    color: 'bg-orange-500',
    columns: [
      { key: 'property_id', label: '资产编号', type: 'text' },
      { key: 'valuation_date', label: '估值日期', type: 'text' },
      { key: 'assessed_value', label: '评估价值', type: 'currency' },
      { key: 'valuation_method', label: '评估方法', type: 'text' },
      { key: 'valuation_firm', label: '评估机构', type: 'text' }
    ]
  },
  {
    id: 'riskCompliance',
    name: '风险合规',
    description: '风险指标和合规情况',
    icon: '⚠️',
    color: 'bg-red-500',
    columns: [
      { key: 'fund_code', label: '基金代码', type: 'text' },
      { key: 'risk_level', label: '风险等级', type: 'text' },
      { key: 'liquidity_ratio', label: '流动性比率', type: 'percentage' },
      { key: 'compliance_status', label: '合规状态', type: 'text' },
      { key: 'last_review', label: '最近复核', type: 'text' }
    ]
  },
  {
    id: 'marketStats',
    name: '市场统计',
    description: '市场表现和交易数据',
    icon: '📉',
    color: 'bg-cyan-500',
    columns: [
      { key: 'fund_code', label: '基金代码', type: 'text' },
      { key: 'trading_volume', label: '交易量', type: 'number' },
      { key: 'nav_per_share', label: '单位净值', type: 'currency' },
      { key: 'market_price', label: '市场价格', type: 'currency' },
      { key: 'date', label: '统计日期', type: 'text' }
    ]
  }
];

/**
 * 数据血缘关系配置
 */
const DATA_LINEAGE: Record<string, string[]> = {
  productInfo: ['propertyBase', 'financialMetrics', 'riskCompliance'],
  propertyBase: ['propertyEquityOps', 'propertyConcessionOps', 'valuation'],
  propertyEquityOps: ['financialMetrics'],
  propertyConcessionOps: ['financialMetrics'],
  financialMetrics: ['valuation', 'riskCompliance', 'marketStats'],
  valuation: ['marketStats'],
  riskCompliance: ['marketStats'],
  marketStats: []
};

/**
 * 八张表数据看板组件
 */
export function REITTablesDashboard({ data }: { data: REITTablesData }) {
  const [selectedTable, setSelectedTable] = useState('productInfo');
  const [selectedFundCode, setSelectedFundCode] = useState<string>('');

  // 统计信息
  const stats = useMemo(() => ({
    totalProducts: data.productInfo.length,
    totalProperties: data.propertyBase.length,
    totalValuation: data.valuation.reduce((sum, v) => sum + (v.assessed_value || 0), 0),
    avgDebtRatio: data.financialMetrics.length > 0
      ? data.financialMetrics.reduce((sum, f) => sum + (f.debt_ratio || 0), 0) / data.financialMetrics.length
      : 0
  }), [data]);

  // 当前表格配置
  const currentConfig = TABLE_CONFIGS.find(t => t.id === selectedTable);
  const currentData = data[selectedTable as keyof REITTablesData] || [];

  // 相关表格
  const relatedTables = DATA_LINEAGE[selectedTable] || [];

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-blue-900">八张表数据看板</h2>
        <p className="text-muted-foreground">统一查看REITs发行全流程数据</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="产品总数"
          value={stats.totalProducts}
          icon="🏛️"
          color="bg-blue-500"
        />
        <StatsCard
          title="底层资产数"
          value={stats.totalProperties}
          icon="🏢"
          color="bg-green-500"
        />
        <StatsCard
          title="总估值"
          value={`¥${(stats.totalValuation / 100000000).toFixed(2)}亿`}
          icon="💰"
          color="bg-yellow-500"
        />
        <StatsCard
          title="平均负债率"
          value={`${stats.avgDebtRatio.toFixed(2)}%`}
          icon="📊"
          color="bg-purple-500"
        />
      </div>

      {/* 表格选择 */}
      <Card>
        <CardHeader>
          <CardTitle>数据表格</CardTitle>
          <CardDescription>
            选择表格查看详细数据，支持表间跳转和关联查询
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTable} onValueChange={setSelectedTable}>
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1">
              {TABLE_CONFIGS.map(config => (
                <TabsTrigger key={config.id} value={config.id} className="flex flex-col items-center gap-1 h-auto py-2">
                  <span className="text-xl">{config.icon}</span>
                  <span className="text-xs font-medium">{config.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {data[config.id as keyof REITTablesData]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {TABLE_CONFIGS.map(config => (
              <TabsContent key={config.id} value={config.id} className="mt-6">
                <div className="space-y-4">
                  {/* 表格标题 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{config.name}</h3>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">导出</Button>
                      <Button variant="outline" size="sm">刷新</Button>
                    </div>
                  </div>

                  {/* 数据表格 */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {config.columns.map(col => (
                            <TableHead key={col.key}>{col.label}</TableHead>
                          ))}
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentData.map((row: any, index) => (
                          <TableRow key={index}>
                            {config.columns.map(col => (
                              <TableCell key={col.key}>
                                {formatValue(row[col.key], col.type)}
                              </TableCell>
                            ))}
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                查看
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={config.columns.length + 1} className="text-center py-8">
                              暂无数据
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* 相关表格 */}
                  {relatedTables.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">关联表格</h4>
                      <div className="flex gap-2 flex-wrap">
                        {relatedTables.map(tableId => {
                          const relatedConfig = TABLE_CONFIGS.find(t => t.id === tableId);
                          return (
                            <Button
                              key={tableId}
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTable(tableId)}
                            >
                              {relatedConfig?.icon} {relatedConfig?.name}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 数据血缘关系图 */}
      <Card>
        <CardHeader>
          <CardTitle>数据血缘关系</CardTitle>
          <CardDescription>可视化展示八张表之间的数据依赖关系</CardDescription>
        </CardHeader>
        <CardContent>
          <DataLineageGraph />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 统计卡片
 */
function StatsCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-2xl`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 格式化数值
 */
function formatValue(value: any, type?: string): string {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'currency':
      return `¥${(Number(value) / 10000).toFixed(2)}万`;
    case 'percentage':
      return `${Number(value).toFixed(2)}%`;
    case 'number':
      return Number(value).toLocaleString();
    default:
      return String(value);
  }
}

/**
 * 数据血缘关系图
 */
function DataLineageGraph() {
  return (
    <div className="flex flex-col gap-4 items-center py-8">
      {TABLE_CONFIGS.map((config, index) => {
        const dependencies = Object.entries(DATA_LINEAGE)
          .filter(([_, deps]) => deps.includes(config.id))
          .map(([id, _]) => TABLE_CONFIGS.find(t => t.id === id));

        return (
          <React.Fragment key={config.id}>
            {/* 依赖关系 */}
            {dependencies.length > 0 && dependencies[0] && (
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-2">
                  {dependencies.map(dep => (
                    <div key={dep?.id} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {dep?.icon} {dep?.name}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  ))}
                </div>
                <div className="w-0.5 h-6 bg-slate-300" />
              </div>
            )}

            {/* 节点 */}
            <div className="relative group">
              <div className={`w-48 px-4 py-3 ${config.color} text-white rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <p className="font-semibold">{config.name}</p>
                    <p className="text-xs opacity-80">{config.description}</p>
                  </div>
                </div>
              </div>

              {/* 下游连接 */}
              {DATA_LINEAGE[config.id].length > 0 && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-0.5 h-6 bg-slate-300" />
                  <div className="flex gap-2 justify-center">
                    {DATA_LINEAGE[config.id].map(tableId => {
                      const downstream = TABLE_CONFIGS.find(t => t.id === tableId);
                      return (
                        <div key={tableId} className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">{downstream?.icon}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        )
      })}
    </div>
  );
}
