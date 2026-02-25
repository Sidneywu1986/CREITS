'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  BarChart3,
  MapPin,
  Calendar,
  Shield,
  Users,
  PieChart as PieChartIcon,
  X,
  Download,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

// 八张表定义
const REIT_TABLES = [
  { id: 'product', name: '产品信息', icon: Building2, color: '#667eea' },
  { id: 'property', name: '资产信息', icon: MapPin, color: '#764ba2' },
  { id: 'financial', name: '财务指标', icon: DollarSign, color: '#10b981' },
  { id: 'operational', name: '运营数据', icon: TrendingUp, color: '#f59e0b' },
  { id: 'market', name: '市场表现', icon: BarChart3, color: '#ef4444' },
  { id: 'investor', name: '投资者结构', icon: Users, color: '#8b5cf6' },
  { id: 'dividend', name: '收益分配', icon: PieChartIcon, color: '#ec4899' },
  { id: 'risk', name: '风险指标', icon: Shield, color: '#06b6d4' },
];

// 模拟REITs产品数据
const MOCK_REIT_PRODUCTS = [
  {
    fund_code: '508000',
    fund_name: '华安张江光大园封闭式基础设施证券投资基金',
    fund_short_name: '张江REIT',
    fund_type: '产权类',
    asset_type: '产业园',
    manager_name: '华安基金管理有限公司',
    custodian_name: '招商银行股份有限公司',
    operating_manager: '上海张江高科技园区开发股份有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 3.000,
    issue_amount: 15.0000,
    fund_shares: 5.0000,
    management_fee_rate: 0.0045,
    custody_fee_rate: 0.0001,
    city: '上海',
    credit_rating: 'AAA',
  },
  {
    fund_code: '508001',
    fund_name: '浙江杭徽高速公路封闭式基础设施证券投资基金',
    fund_short_name: '杭徽高速REIT',
    fund_type: '经营权类',
    asset_type: '高速公路',
    manager_name: '鹏华基金管理有限公司',
    custodian_name: '中国工商银行股份有限公司',
    operating_manager: '浙江杭徽高速公路有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 5.000,
    issue_amount: 30.0000,
    fund_shares: 6.0000,
    management_fee_rate: 0.0040,
    custody_fee_rate: 0.0001,
    city: '杭州',
    credit_rating: 'AAA',
  },
  {
    fund_code: '508002',
    fund_name: '东吴苏州工业园区产业园封闭式基础设施证券投资基金',
    fund_short_name: '苏州工业园REIT',
    fund_type: '产权类',
    asset_type: '产业园',
    manager_name: '东吴基金管理有限公司',
    custodian_name: '中国建设银行股份有限公司',
    operating_manager: '苏州工业园区国有资产控股发展有限公司',
    issue_date: '2021-12-30',
    listing_date: '2021-12-30',
    issue_price: 3.000,
    issue_amount: 34.9200,
    fund_shares: 9.0000,
    management_fee_rate: 0.0050,
    custody_fee_rate: 0.0001,
    city: '苏州',
    credit_rating: 'AAA',
  },
  {
    fund_code: '508008',
    fund_name: '红土创新盐田港仓储物流封闭式基础设施证券投资基金',
    fund_short_name: '盐田港REIT',
    fund_type: '产权类',
    asset_type: '仓储物流',
    manager_name: '红土创新基金管理有限公司',
    custodian_name: '招商银行股份有限公司',
    operating_manager: '深圳市盐田港集团有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 2.300,
    issue_amount: 18.4000,
    fund_shares: 8.0000,
    management_fee_rate: 0.0050,
    custody_fee_rate: 0.0001,
    city: '深圳',
    credit_rating: 'AAA',
  },
  {
    fund_code: '508018',
    fund_name: '华夏中国交建高速公路封闭式基础设施证券投资基金',
    fund_short_name: '中交REIT',
    fund_type: '经营权类',
    asset_type: '高速公路',
    manager_name: '华夏基金管理有限公司',
    custodian_name: '中国工商银行股份有限公司',
    operating_manager: '中交投资有限公司',
    issue_date: '2022-04-28',
    listing_date: '2022-04-28',
    issue_price: 9.399,
    issue_amount: 93.9900,
    fund_shares: 10.0000,
    management_fee_rate: 0.0035,
    custody_fee_rate: 0.0001,
    city: '北京',
    credit_rating: 'AAA',
  },
];

// 全局筛选选项
const FUND_TYPES = ['产权类', '经营权类'];
const ASSET_TYPES = ['产业园', '仓储物流', '高速公路', '保障性租赁住房', '生态环保', '清洁能源'];
const CITIES = ['上海', '深圳', '北京', '广州', '杭州', '苏州', '成都', '武汉'];
const REPORT_PERIODS = ['2024Q4', '2024Q3', '2024Q2', '2024Q1', '2023Q4', '2023Q3'];
const CREDIT_RATINGS = ['AAA', 'AA+', 'AA'];

export default function REITsDataTables() {
  const [selectedTable, setSelectedTable] = useState('product');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  // 全局筛选条件
  const [filters, setFilters] = useState({
    fundType: '全部',
    assetType: '全部',
    city: '全部',
    reportPeriod: '2024Q4',
    creditRating: '全部',
  });

  const products = MOCK_REIT_PRODUCTS;

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿元`;
  };

  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const resetFilters = () => {
    setFilters({
      fundType: '全部',
      assetType: '全部',
      city: '全部',
      reportPeriod: '2024Q4',
      creditRating: '全部',
    });
    setSearchKeyword('');
  };

  // 过滤产品
  const filteredProducts = products.filter(product => {
    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      if (
        !product.fund_code.toLowerCase().includes(keyword) &&
        !product.fund_short_name?.toLowerCase().includes(keyword) &&
        !product.fund_name?.toLowerCase().includes(keyword)
      ) {
        return false;
      }
    }

    // 产品类型筛选
    if (filters.fundType !== '全部' && product.fund_type !== filters.fundType) {
      return false;
    }

    // 资产类型筛选
    if (filters.assetType !== '全部' && product.asset_type !== filters.assetType) {
      return false;
    }

    // 城市筛选
    if (filters.city !== '全部' && product.city !== filters.city) {
      return false;
    }

    // 信用评级筛选
    if (filters.creditRating !== '全部' && product.credit_rating !== filters.creditRating) {
      return false;
    }

    return true;
  });

  // 计算核心指标
  const coreMetrics = {
    totalProducts: products.length,
    totalMarketCap: products.reduce((sum, p) => sum + (p.issue_amount || 0) * p.issue_price, 0),
    avgDividendRate: 4.82,
    avgPFFO: 18.5,
  };

  return (
    <>
      <Head>
        <title>REITs八张表 - REITs智能助手</title>
        <meta name="description" content="公募REITs专业数据库，提供八张表全维度数据展示" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* 顶部导航栏 */}
        <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-[#667eea] mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-white">REITs八张表</h1>
                  <p className="text-sm text-slate-400 mt-0.5">专业数据库 · 全维度数据展示</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" onClick={() => setLoading(!loading)}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* 全局筛选栏 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                {/* 搜索框 */}
                <div className="flex-1 min-w-[250px] relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="搜索代码/名称..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#667eea]"
                  />
                </div>

                {/* 筛选下拉框 */}
                <Select value={filters.fundType} onValueChange={(v) => setFilters({...filters, fundType: v})}>
                  <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="产品类型" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="全部" className="text-white hover:bg-slate-700">全部</SelectItem>
                    {FUND_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.assetType} onValueChange={(v) => setFilters({...filters, assetType: v})}>
                  <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="资产类型" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="全部" className="text-white hover:bg-slate-700">全部</SelectItem>
                    {ASSET_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.city} onValueChange={(v) => setFilters({...filters, city: v})}>
                  <SelectTrigger className="w-[120px] bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="城市" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="全部" className="text-white hover:bg-slate-700">全部</SelectItem>
                    {CITIES.map(city => (
                      <SelectItem key={city} value={city} className="text-white hover:bg-slate-700">{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.reportPeriod} onValueChange={(v) => setFilters({...filters, reportPeriod: v})}>
                  <SelectTrigger className="w-[120px] bg-slate-700/50 border-slate-600 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="报告期" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {REPORT_PERIODS.map(period => (
                      <SelectItem key={period} value={period} className="text-white hover:bg-slate-700">{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.creditRating} onValueChange={(v) => setFilters({...filters, creditRating: v})}>
                  <SelectTrigger className="w-[120px] bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="评级" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="全部" className="text-white hover:bg-slate-700">全部</SelectItem>
                    {CREDIT_RATINGS.map(rating => (
                      <SelectItem key={rating} value={rating} className="text-white hover:bg-slate-700">{rating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-300 hover:bg-slate-700 hover:text-white">
                  <X className="w-4 h-4 mr-2" />
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 核心指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-[#667eea]/20 to-[#667eea]/10 border-[#667eea]/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-300 flex items-center">
                  <Building2 className="mr-2 h-4 w-4 text-[#667eea]" />
                  产品总数
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {coreMetrics.totalProducts}
                </div>
                <div className="text-xs text-slate-400 mt-1">只REITs产品</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#764ba2]/20 to-[#764ba2]/10 border-[#764ba2]/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-300 flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-[#764ba2]" />
                  总市值
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatAmount(coreMetrics.totalMarketCap)}
                </div>
                <div className="text-xs text-slate-400 mt-1">累计发行规模</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border-emerald-500/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-300 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-emerald-400" />
                  平均股息率
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {coreMetrics.avgDividendRate}%
                </div>
                <div className="text-xs text-slate-400 mt-1">最新数据</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/10 border-orange-500/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-300 flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-orange-400" />
                  平均P/FFO
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {coreMetrics.avgPFFO}x
                </div>
                <div className="text-xs text-slate-400 mt-1">估值倍数</div>
              </CardContent>
            </Card>
          </div>

          {/* 选中产品信息 */}
          {selectedProduct && (
            <Card className="bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 border-[#667eea]/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-white font-bold">
                      {selectedProduct.fund_short_name?.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {selectedProduct.fund_short_name}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {selectedProduct.fund_code} · {selectedProduct.fund_type} · {selectedProduct.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      查看详情
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)} className="text-slate-300 hover:bg-slate-700 hover:text-white">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 八张表Tab切换 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <TabsGrid
                tables={REIT_TABLES}
                selectedTable={selectedTable}
                onTableSelect={setSelectedTable}
                filteredProducts={filteredProducts}
                onProductSelect={setSelectedProduct}
                selectedProduct={selectedProduct}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Tab网格组件
function TabsGrid({ tables, selectedTable, onTableSelect, filteredProducts, onProductSelect, selectedProduct }: any) {
  // 图标渲染辅助组件
  const TableIcon = () => {
    const IconComponent = tables.find((t: any) => t.id === selectedTable)?.icon;
    if (!IconComponent) return null;
    return <IconComponent className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {tables.map((table: any) => (
        <button
          key={table.id}
          onClick={() => onTableSelect(table.id)}
          className={`
            p-4 rounded-xl text-left transition-all duration-200
            ${selectedTable === table.id
              ? `bg-gradient-to-br from-[${table.color}]/20 to-[${table.color}]/10 border-2 border-[${table.color}] shadow-lg`
              : 'bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50'
            }
          `}
        >
          <table.icon className={`w-6 h-6 mb-2 ${selectedTable === table.id ? `text-[${table.color}]` : 'text-slate-400'}`} />
          <div className={`font-semibold ${selectedTable === table.id ? 'text-white' : 'text-slate-300'}`}>
            {table.name}
          </div>
          {selectedTable === table.id && (
            <div className="text-xs text-slate-400 mt-1">
              {table.id === 'product' ? `${filteredProducts.length} 条记录` : '点击产品信息表查看'}
            </div>
          )}
        </button>
      ))}

      {/* 当前选中表格的内容区域 */}
      <div className="col-span-4 mt-4">
        {selectedTable === 'product' && (
          <REITProductTable
            products={filteredProducts}
            onProductSelect={onProductSelect}
            selectedProduct={selectedProduct}
          />
        )}
        {selectedTable !== 'product' && selectedProduct && (
          <div className="text-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                <TableIcon />
              </div>
              <h3 className="text-xl font-semibold text-white">
                {tables.find((t: any) => t.id === selectedTable)?.name}
              </h3>
              <p className="text-slate-400">
                当前选中: <span className="text-[#667eea] font-semibold">{selectedProduct.fund_short_name}</span>
              </p>
              <p className="text-sm text-slate-500">该表数据正在开发中...</p>
            </div>
          </div>
        )}
        {selectedTable !== 'product' && !selectedProduct && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <h3 className="text-xl font-semibold text-white mb-2">
              请先选择一个产品
            </h3>
            <p className="text-slate-400">在"产品信息"表中点击任意产品即可查看其详细信息</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 产品信息表格组件
function REITProductTable({ products, onProductSelect, selectedProduct }: any) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Search className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          暂无数据
        </h3>
        <p>请调整筛选条件后重试</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-700/30">
          <TableRow>
            <TableHead className="text-slate-300 whitespace-nowrap">基金代码</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap">产品名称</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap">产品类型</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap">资产类型</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap">城市</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap">基金管理人</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap">发行日期</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap text-right">发行价格</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap text-right">发行规模</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap text-right">管理费率</TableHead>
            <TableHead className="text-slate-300 whitespace-nowrap">评级</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product: any) => (
            <TableRow
              key={product.fund_code}
              onClick={() => onProductSelect(product)}
              className={`
                cursor-pointer transition-colors duration-150 border-b border-slate-700/50
                ${selectedProduct?.fund_code === product.fund_code
                  ? 'bg-[#667eea]/20 hover:bg-[#667eea]/30'
                  : 'hover:bg-slate-700/30'
                }
              `}
            >
              <TableCell className="font-medium text-white whitespace-nowrap">
                {product.fund_code}
              </TableCell>
              <TableCell className="min-w-[200px]">
                <div>
                  <div className="font-medium text-white">{product.fund_short_name || product.fund_name}</div>
                  <div className="text-xs text-slate-400 truncate">{product.fund_name}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={product.fund_type === '产权类' ? 'default' : 'secondary'}
                  className={product.fund_type === '产权类'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  }
                >
                  {product.fund_type}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-300">{product.asset_type}</TableCell>
              <TableCell className="text-slate-300">{product.city}</TableCell>
              <TableCell className="text-slate-300 min-w-[150px]">{product.manager_name}</TableCell>
              <TableCell className="text-slate-300">{new Date(product.issue_date).toLocaleDateString('zh-CN')}</TableCell>
              <TableCell className="text-right text-white font-medium">
                ¥{product.issue_price.toFixed(3)}
              </TableCell>
              <TableCell className="text-right text-white font-medium">
                {product.issue_amount.toFixed(2)}亿
              </TableCell>
              <TableCell className="text-right text-slate-300">{formatRate(product.management_fee_rate)}</TableCell>
              <TableCell>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  {product.credit_rating}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatRate(rate: number) {
  return `${(rate * 100).toFixed(2)}%`;
}
