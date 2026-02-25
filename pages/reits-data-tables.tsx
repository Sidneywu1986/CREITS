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

// 投资者结构模拟数据
const MOCK_INVESTOR_DATA: Record<string, any[]> = {
  '508000': [
    { investor_type: '机构投资者', holding_ratio: 65.3, holding_amount: 3.265, investor_count: 45 },
    { investor_type: '个人投资者', holding_ratio: 34.7, holding_amount: 1.735, investor_count: 12890 },
    { investor_type: '其中：前十大持有人', holding_ratio: 42.8, holding_amount: 2.140, investor_count: 10 },
    { investor_type: '其中：战略投资者', holding_ratio: 20.5, holding_amount: 1.025, investor_count: 3 },
  ],
  '508001': [
    { investor_type: '机构投资者', holding_ratio: 72.5, holding_amount: 4.350, investor_count: 52 },
    { investor_type: '个人投资者', holding_ratio: 27.5, holding_amount: 1.650, investor_count: 9560 },
    { investor_type: '其中：前十大持有人', holding_ratio: 48.3, holding_amount: 2.898, investor_count: 10 },
    { investor_type: '其中：战略投资者', holding_ratio: 25.0, holding_amount: 1.500, investor_count: 4 },
  ],
  '508002': [
    { investor_type: '机构投资者', holding_ratio: 68.9, holding_amount: 6.201, investor_count: 38 },
    { investor_type: '个人投资者', holding_ratio: 31.1, holding_amount: 2.799, investor_count: 15620 },
    { investor_type: '其中：前十大持有人', holding_ratio: 45.6, holding_amount: 4.104, investor_count: 10 },
    { investor_type: '其中：战略投资者', holding_ratio: 22.0, holding_amount: 1.980, investor_count: 3 },
  ],
  '508008': [
    { investor_type: '机构投资者', holding_ratio: 70.2, holding_amount: 5.616, investor_count: 41 },
    { investor_type: '个人投资者', holding_ratio: 29.8, holding_amount: 2.384, investor_count: 11230 },
    { investor_type: '其中：前十大持有人', holding_ratio: 46.9, holding_amount: 3.752, investor_count: 10 },
    { investor_type: '其中：战略投资者', holding_ratio: 23.5, holding_amount: 1.880, investor_count: 3 },
  ],
  '508018': [
    { investor_type: '机构投资者', holding_ratio: 75.8, holding_amount: 7.580, investor_count: 58 },
    { investor_type: '个人投资者', holding_ratio: 24.2, holding_amount: 2.420, investor_count: 7890 },
    { investor_type: '其中：前十大持有人', holding_ratio: 52.3, holding_amount: 5.230, investor_count: 10 },
    { investor_type: '其中：战略投资者', holding_ratio: 28.0, holding_amount: 2.800, investor_count: 4 },
  ],
};

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
              {table.id === 'product' ? `${filteredProducts.length} 条记录` :
               '点击产品信息表查看'}
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
        {selectedTable === 'investor' && (
          <InvestorStructureTable selectedProduct={selectedProduct} />
        )}
        {selectedTable === 'property' && (
          <PropertyTable selectedProduct={selectedProduct} />
        )}
        {selectedTable === 'financial' && (
          <FinancialTable selectedProduct={selectedProduct} />
        )}
        {selectedTable === 'operational' && (
          <OperationalTable selectedProduct={selectedProduct} />
        )}
        {selectedTable === 'market' && (
          <MarketTable selectedProduct={selectedProduct} />
        )}
        {selectedTable === 'dividend' && (
          <DividendTable selectedProduct={selectedProduct} />
        )}
        {selectedTable === 'risk' && (
          <RiskTable selectedProduct={selectedProduct} />
        )}
        {selectedTable !== 'product' && selectedTable !== 'investor' && selectedTable !== 'property' && selectedTable !== 'financial' && selectedTable !== 'operational' && selectedTable !== 'market' && selectedTable !== 'dividend' && selectedTable !== 'risk' && selectedProduct && (
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

// 投资者结构表格组件
function InvestorStructureTable({ selectedProduct }: any) {
  if (!selectedProduct) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Users className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          请先选择一个产品
        </h3>
        <p>在"产品信息"表中点击任意产品即可查看其投资者结构</p>
      </div>
    );
  }

  const investorData = MOCK_INVESTOR_DATA[selectedProduct.fund_code] || [];

  // 准备饼图数据（只显示机构投资者和个人投资者）
  const pieData = investorData
    .filter(item => !item.investor_type.includes('其中'))
    .map(item => ({
      name: item.investor_type,
      value: item.holding_ratio,
      itemStyle: {
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#1e293b'
      }
    }));

  // 饼图配置
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: {
        color: '#fff',
        fontSize: 13
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        color: '#cbd5e1',
        fontSize: 12
      },
      itemGap: 12
    },
    series: [
      {
        name: '投资者结构',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#1e293b',
          borderWidth: 3
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: '#cbd5e1',
          fontSize: 12,
          fontWeight: '500'
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: '#64748b'
          }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: pieData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: ['#60a5fa', '#a78bfa'][index % 2],
            borderWidth: 3,
            borderColor: '#1e293b'
          }
        }))
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 饼图展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-white">
              <PieChartIcon className="mr-2 h-5 w-5 text-[#8b5cf6]" />
              投资者结构分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={pieOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>

        {/* 统计摘要 */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              持有人统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investorData.map((item, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index % 2 === 0 ? 'bg-[#60a5fa]' : 'bg-[#a78bfa]'
                      }`}></div>
                      <span className="font-medium text-white">{item.investor_type}</span>
                    </div>
                    <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">
                      {item.holding_ratio.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">持有份额</div>
                      <div className="text-white font-semibold">{item.holding_amount.toFixed(3)}亿份</div>
                    </div>
                    <div>
                      <div className="text-slate-400">持有人数</div>
                      <div className="text-white font-semibold">{item.investor_count.toLocaleString()}户</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细数据表格 */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            投资者结构明细
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-700/30">
                <TableRow>
                  <TableHead className="text-slate-300 whitespace-nowrap">投资者类型</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">持有比例</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">持有份额</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">持有人数</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap">占比分布</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investorData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-slate-700/30 border-b border-slate-700/50">
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index % 2 === 0 ? 'bg-[#60a5fa]' : 'bg-[#a78bfa]'
                        }`}></div>
                        {item.investor_type}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-white font-semibold">
                      {item.holding_ratio.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {item.holding_amount.toFixed(3)}亿份
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {item.investor_count.toLocaleString()}户
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index % 2 === 0 ? 'bg-[#60a5fa]' : 'bg-[#a78bfa]'
                          }`}
                          style={{ width: `${item.holding_ratio}%` }}
                        ></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatRate(rate: number) {
  return `${(rate * 100).toFixed(2)}%`;
}

// ==================== 资产信息表 ====================
// 模拟资产数据
const MOCK_PROPERTY_DATA: any = {
  '508000': {
    properties: [
      {
        property_name: '张江光大园',
        address: '上海市浦东新区张江高科技园区',
        city: '上海',
        province: '上海市',
        asset_type: '产业园',
        floor_area: 152000.00,
        valuation_amount: 12.5000,
        occupancy_rate: 0.95,
        annual_rent: 1.2000,
        lease_expiry_date: '2028-12-31',
        property_manager: '上海张江高科技园区开发股份有限公司'
      },
      {
        property_name: '张江集电港',
        address: '上海市浦东新区张江高科技园区集电港',
        city: '上海',
        province: '上海市',
        asset_type: '产业园',
        floor_area: 85000.00,
        valuation_amount: 7.8000,
        occupancy_rate: 0.92,
        annual_rent: 0.7600,
        lease_expiry_date: '2027-06-30',
        property_manager: '上海张江高科技园区开发股份有限公司'
      }
    ],
    summary: {
      total_properties: 2,
      total_floor_area: 237000.00,
      total_valuation: 20.3000,
      avg_occupancy_rate: 0.94,
      total_annual_rent: 1.9600
    }
  },
  '508001': {
    properties: [
      {
        property_name: '杭徽高速公路（安徽段）',
        address: '安徽省黄山市至杭州市',
        city: '杭州',
        province: '浙江省',
        asset_type: '高速公路',
        floor_area: 0,
        valuation_amount: 25.0000,
        occupancy_rate: 0,
        annual_rent: 2.5000,
        lease_expiry_date: '2030-12-31',
        property_manager: '浙江杭徽高速公路有限公司'
      }
    ],
    summary: {
      total_properties: 1,
      total_floor_area: 0,
      total_valuation: 25.0000,
      avg_occupancy_rate: 0,
      total_annual_rent: 2.5000
    }
  },
  '508002': {
    properties: [
      {
        property_name: '苏州工业园区科技园一期',
        address: '江苏省苏州市工业园区',
        city: '苏州',
        province: '江苏省',
        asset_type: '产业园',
        floor_area: 120000.00,
        valuation_amount: 15.2000,
        occupancy_rate: 0.93,
        annual_rent: 1.4500,
        lease_expiry_date: '2029-12-31',
        property_manager: '苏州工业园区科技发展有限公司'
      },
      {
        property_name: '苏州工业园区科技园二期',
        address: '江苏省苏州市工业园区',
        city: '苏州',
        province: '江苏省',
        asset_type: '产业园',
        floor_area: 95000.00,
        valuation_amount: 12.0000,
        occupancy_rate: 0.91,
        annual_rent: 1.1500,
        lease_expiry_date: '2028-06-30',
        property_manager: '苏州工业园区科技发展有限公司'
      }
    ],
    summary: {
      total_properties: 2,
      total_floor_area: 215000.00,
      total_valuation: 27.2000,
      avg_occupancy_rate: 0.92,
      total_annual_rent: 2.6000
    }
  },
  '508006': {
    properties: [
      {
        property_name: '深圳盐田港集装箱码头',
        address: '广东省深圳市盐田区盐田港',
        city: '深圳',
        province: '广东省',
        asset_type: '仓储物流',
        floor_area: 280000.00,
        valuation_amount: 35.0000,
        occupancy_rate: 0.96,
        annual_rent: 3.2000,
        lease_expiry_date: '2032-12-31',
        property_manager: '盐田港集团有限公司'
      }
    ],
    summary: {
      total_properties: 1,
      total_floor_area: 280000.00,
      total_valuation: 35.0000,
      avg_occupancy_rate: 0.96,
      total_annual_rent: 3.2000
    }
  },
  '508021': {
    properties: [
      {
        property_name: '重庆国际物流枢纽园',
        address: '重庆市沙坪坝区西部物流园',
        city: '重庆',
        province: '重庆市',
        asset_type: '仓储物流',
        floor_area: 320000.00,
        valuation_amount: 28.5000,
        occupancy_rate: 0.94,
        annual_rent: 2.8000,
        lease_expiry_date: '2030-06-30',
        property_manager: '重庆国际物流枢纽建设有限公司'
      }
    ],
    summary: {
      total_properties: 1,
      total_floor_area: 320000.00,
      total_valuation: 28.5000,
      avg_occupancy_rate: 0.94,
      total_annual_rent: 2.8000
    }
  },
  '508027': {
    properties: [
      {
        property_name: '北京保障房项目',
        address: '北京市朝阳区',
        city: '北京',
        province: '北京市',
        asset_type: '保障性租赁住房',
        floor_area: 450000.00,
        valuation_amount: 40.0000,
        occupancy_rate: 0.98,
        annual_rent: 2.2000,
        lease_expiry_date: '2035-12-31',
        property_manager: '北京保障房投资中心'
      }
    ],
    summary: {
      total_properties: 1,
      total_floor_area: 450000.00,
      total_valuation: 40.0000,
      avg_occupancy_rate: 0.98,
      total_annual_rent: 2.2000
    }
  },
  '508031': {
    properties: [
      {
        property_name: '广州新能源充电设施',
        address: '广东省广州市',
        city: '广州',
        province: '广东省',
        asset_type: '基础设施',
        floor_area: 0,
        valuation_amount: 18.0000,
        occupancy_rate: 0,
        annual_rent: 1.8000,
        lease_expiry_date: '2031-12-31',
        property_manager: '广州新能源科技有限公司'
      }
    ],
    summary: {
      total_properties: 1,
      total_floor_area: 0,
      avg_occupancy_rate: 0,
      total_valuation: 18.0000,
      total_annual_rent: 1.8000
    }
  },
  '508056': {
    properties: [
      {
        property_name: '武汉商业综合体',
        address: '湖北省武汉市江汉区',
        city: '武汉',
        province: '湖北省',
        asset_type: '商业地产',
        floor_area: 380000.00,
        valuation_amount: 32.0000,
        occupancy_rate: 0.88,
        annual_rent: 2.9000,
        lease_expiry_date: '2029-12-31',
        property_manager: '武汉商业管理有限公司'
      }
    ],
    summary: {
      total_properties: 1,
      total_floor_area: 380000.00,
      total_valuation: 32.0000,
      avg_occupancy_rate: 0.88,
      total_annual_rent: 2.9000
    }
  },
  '508058': {
    properties: [
      {
        property_name: '成都数据中心',
        address: '四川省成都市高新区',
        city: '成都',
        province: '四川省',
        asset_type: '数据中心',
        floor_area: 120000.00,
        valuation_amount: 25.0000,
        occupancy_rate: 0.95,
        annual_rent: 2.4000,
        lease_expiry_date: '2030-12-31',
        property_manager: '成都数据科技有限公司'
      }
    ],
    summary: {
      total_properties: 1,
      total_floor_area: 120000.00,
      total_valuation: 25.0000,
      avg_occupancy_rate: 0.95,
      total_annual_rent: 2.4000
    }
  },
  '508071': {
    properties: [
      {
        property_name: '上海购物中心',
        address: '上海市浦东新区陆家嘴',
        city: '上海',
        province: '上海市',
        asset_type: '商业地产',
        floor_area: 420000.00,
        valuation_amount: 45.0000,
        occupancy_rate: 0.92,
        annual_rent: 4.1000,
        lease_expiry_date: '2032-12-31',
        property_manager: '上海购物中心管理有限公司'
      }
    ],
    summary: {
      total_properties: 1,
      total_floor_area: 420000.00,
      total_valuation: 45.0000,
      avg_occupancy_rate: 0.92,
      total_annual_rent: 4.1000
    }
  }
};

function PropertyTable({ selectedProduct }: any) {
  if (!selectedProduct) {
    return (
      <div className="text-center py-20">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold text-white mb-2">
          请先选择一个产品
        </h3>
        <p className="text-slate-400">在"产品信息"表中点击任意产品即可查看其资产信息</p>
      </div>
    );
  }

  const data = MOCK_PROPERTY_DATA[selectedProduct.fund_code] || {
    properties: [],
    summary: { total_properties: 0, total_floor_area: 0, total_valuation: 0, avg_occupancy_rate: 0, total_annual_rent: 0 }
  };

  // 资产规模分布饼图数据
  const pieData = data.properties.map((p: any, i: number) => ({
    name: p.property_name,
    value: p.valuation_amount,
    itemStyle: { color: `hsl(${240 + i * 30}, 70%, 60%)` }
  }));

  // 饼图配置
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}亿元 ({d}%)',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: { color: '#cbd5e1', fontSize: 12 },
      itemGap: 12
    },
    series: [{
      name: '资产估值分布',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#1e293b', borderWidth: 3 },
      label: { show: true, formatter: '{b}\n{d}%', color: '#cbd5e1', fontSize: 12, fontWeight: '500' },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' },
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      },
      data: pieData
    }]
  };

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">资产数量</div>
            <div className="text-2xl font-bold text-white">{data.summary.total_properties}个</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">总建筑面积</div>
            <div className="text-2xl font-bold text-[#764ba2]">{(data.summary.total_floor_area / 10000).toFixed(1)}万㎡</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">资产估值</div>
            <div className="text-2xl font-bold text-emerald-400">{data.summary.total_valuation.toFixed(2)}亿元</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">平均出租率</div>
            <div className="text-2xl font-bold text-orange-400">{(data.summary.avg_occupancy_rate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 资产估值分布饼图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-white">
              <MapPin className="mr-2 h-5 w-5 text-[#764ba2]" />
              资产估值分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={pieOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">资产规模对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.properties.map((p: any, i: number) => (
                <div key={i} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${240 + i * 30}, 70%, 60%)` }}></div>
                      <span className="font-medium text-white">{p.property_name}</span>
                    </div>
                    <Badge className="bg-[#764ba2]/20 text-[#764ba2] border-[#764ba2]/30">
                      {p.valuation_amount.toFixed(2)}亿
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">建筑面积</div>
                      <div className="text-white font-semibold">{(p.floor_area / 10000).toFixed(2)}万㎡</div>
                    </div>
                    <div>
                      <div className="text-slate-400">年租金</div>
                      <div className="text-white font-semibold">{p.annual_rent.toFixed(2)}亿元</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 资产明细表格 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">资产明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-700/30">
                <TableRow>
                  <TableHead className="text-slate-300 whitespace-nowrap">资产名称</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap">地址</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap">资产类型</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">建筑面积(万㎡)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">估值(亿元)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">出租率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">年租金(亿元)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap">到期日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.properties.map((p: any, i: number) => (
                  <TableRow key={i} className="hover:bg-slate-700/30 border-b border-slate-700/50">
                    <TableCell className="text-white font-semibold">{p.property_name}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{p.address}</TableCell>
                    <TableCell className="text-slate-300">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">{p.asset_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-white">{(p.floor_area / 10000).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white font-semibold">{p.valuation_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white">
                      <span className={`${p.occupancy_rate >= 0.9 ? 'text-emerald-400' : p.occupancy_rate >= 0.8 ? 'text-orange-400' : 'text-red-400'}`}>
                        {(p.occupancy_rate * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-white">{p.annual_rent.toFixed(2)}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{p.lease_expiry_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== 财务指标表 ====================
// 模拟财务数据
const MOCK_FINANCIAL_DATA: any = {
  '508000': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0625, roa: 0.0480, debt_ratio: 0.45, current_ratio: 1.85, net_profit_margin: 0.32 },
      { report_period: '2024Q2', roe: 0.0580, roa: 0.0450, debt_ratio: 0.46, current_ratio: 1.80, net_profit_margin: 0.30 },
      { report_period: '2024Q1', roe: 0.0535, roa: 0.0420, debt_ratio: 0.47, current_ratio: 1.75, net_profit_margin: 0.28 },
      { report_period: '2023Q4', roe: 0.0600, roa: 0.0460, debt_ratio: 0.44, current_ratio: 1.88, net_profit_margin: 0.31 },
      { report_period: '2023Q3', roe: 0.0570, roa: 0.0440, debt_ratio: 0.45, current_ratio: 1.82, net_profit_margin: 0.29 },
    ]
  },
  '508001': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0450, roa: 0.0320, debt_ratio: 0.52, current_ratio: 1.45, net_profit_margin: 0.38 },
      { report_period: '2024Q2', roe: 0.0420, roa: 0.0300, debt_ratio: 0.53, current_ratio: 1.40, net_profit_margin: 0.36 },
      { report_period: '2024Q1', roe: 0.0390, roa: 0.0280, debt_ratio: 0.54, current_ratio: 1.35, net_profit_margin: 0.34 },
      { report_period: '2023Q4', roe: 0.0435, roa: 0.0310, debt_ratio: 0.51, current_ratio: 1.48, net_profit_margin: 0.37 },
      { report_period: '2023Q3', roe: 0.0410, roa: 0.0290, debt_ratio: 0.52, current_ratio: 1.42, net_profit_margin: 0.35 },
    ]
  },
  '508002': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0550, roa: 0.0410, debt_ratio: 0.48, current_ratio: 1.70, net_profit_margin: 0.33 },
      { report_period: '2024Q2', roe: 0.0520, roa: 0.0390, debt_ratio: 0.49, current_ratio: 1.65, net_profit_margin: 0.31 },
      { report_period: '2024Q1', roe: 0.0490, roa: 0.0370, debt_ratio: 0.50, current_ratio: 1.60, net_profit_margin: 0.29 },
      { report_period: '2023Q4', roe: 0.0535, roa: 0.0400, debt_ratio: 0.47, current_ratio: 1.72, net_profit_margin: 0.32 },
      { report_period: '2023Q3', roe: 0.0505, roa: 0.0380, debt_ratio: 0.48, current_ratio: 1.67, net_profit_margin: 0.30 },
    ]
  },
  '508006': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0500, roa: 0.0380, debt_ratio: 0.50, current_ratio: 1.60, net_profit_margin: 0.34 },
      { report_period: '2024Q2', roe: 0.0470, roa: 0.0360, debt_ratio: 0.51, current_ratio: 1.55, net_profit_margin: 0.32 },
      { report_period: '2024Q1', roe: 0.0440, roa: 0.0340, debt_ratio: 0.52, current_ratio: 1.50, net_profit_margin: 0.30 },
      { report_period: '2023Q4', roe: 0.0485, roa: 0.0370, debt_ratio: 0.49, current_ratio: 1.62, net_profit_margin: 0.33 },
      { report_period: '2023Q3', roe: 0.0455, roa: 0.0350, debt_ratio: 0.50, current_ratio: 1.57, net_profit_margin: 0.31 },
    ]
  },
  '508021': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0480, roa: 0.0360, debt_ratio: 0.51, current_ratio: 1.55, net_profit_margin: 0.35 },
      { report_period: '2024Q2', roe: 0.0450, roa: 0.0340, debt_ratio: 0.52, current_ratio: 1.50, net_profit_margin: 0.33 },
      { report_period: '2024Q1', roe: 0.0420, roa: 0.0320, debt_ratio: 0.53, current_ratio: 1.45, net_profit_margin: 0.31 },
      { report_period: '2023Q4', roe: 0.0465, roa: 0.0350, debt_ratio: 0.50, current_ratio: 1.57, net_profit_margin: 0.34 },
      { report_period: '2023Q3', roe: 0.0435, roa: 0.0330, debt_ratio: 0.51, current_ratio: 1.52, net_profit_margin: 0.32 },
    ]
  },
  '508027': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0420, roa: 0.0300, debt_ratio: 0.55, current_ratio: 1.35, net_profit_margin: 0.38 },
      { report_period: '2024Q2', roe: 0.0390, roa: 0.0280, debt_ratio: 0.56, current_ratio: 1.30, net_profit_margin: 0.36 },
      { report_period: '2024Q1', roe: 0.0360, roa: 0.0260, debt_ratio: 0.57, current_ratio: 1.25, net_profit_margin: 0.34 },
      { report_period: '2023Q4', roe: 0.0405, roa: 0.0290, debt_ratio: 0.54, current_ratio: 1.37, net_profit_margin: 0.37 },
      { report_period: '2023Q3', roe: 0.0375, roa: 0.0270, debt_ratio: 0.55, current_ratio: 1.32, net_profit_margin: 0.35 },
    ]
  },
  '508031': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0460, roa: 0.0340, debt_ratio: 0.53, current_ratio: 1.48, net_profit_margin: 0.36 },
      { report_period: '2024Q2', roe: 0.0430, roa: 0.0320, debt_ratio: 0.54, current_ratio: 1.43, net_profit_margin: 0.34 },
      { report_period: '2024Q1', roe: 0.0400, roa: 0.0300, debt_ratio: 0.55, current_ratio: 1.38, net_profit_margin: 0.32 },
      { report_period: '2023Q4', roe: 0.0445, roa: 0.0330, debt_ratio: 0.52, current_ratio: 1.50, net_profit_margin: 0.35 },
      { report_period: '2023Q3', roe: 0.0415, roa: 0.0310, debt_ratio: 0.53, current_ratio: 1.45, net_profit_margin: 0.33 },
    ]
  },
  '508056': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0530, roa: 0.0390, debt_ratio: 0.49, current_ratio: 1.68, net_profit_margin: 0.33 },
      { report_period: '2024Q2', roe: 0.0500, roa: 0.0370, debt_ratio: 0.50, current_ratio: 1.63, net_profit_margin: 0.31 },
      { report_period: '2024Q1', roe: 0.0470, roa: 0.0350, debt_ratio: 0.51, current_ratio: 1.58, net_profit_margin: 0.29 },
      { report_period: '2023Q4', roe: 0.0515, roa: 0.0380, debt_ratio: 0.48, current_ratio: 1.70, net_profit_margin: 0.32 },
      { report_period: '2023Q3', roe: 0.0485, roa: 0.0360, debt_ratio: 0.49, current_ratio: 1.65, net_profit_margin: 0.30 },
    ]
  },
  '508058': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0570, roa: 0.0420, debt_ratio: 0.47, current_ratio: 1.75, net_profit_margin: 0.31 },
      { report_period: '2024Q2', roe: 0.0540, roa: 0.0400, debt_ratio: 0.48, current_ratio: 1.70, net_profit_margin: 0.29 },
      { report_period: '2024Q1', roe: 0.0510, roa: 0.0380, debt_ratio: 0.49, current_ratio: 1.65, net_profit_margin: 0.27 },
      { report_period: '2023Q4', roe: 0.0555, roa: 0.0410, debt_ratio: 0.46, current_ratio: 1.77, net_profit_margin: 0.30 },
      { report_period: '2023Q3', roe: 0.0525, roa: 0.0390, debt_ratio: 0.47, current_ratio: 1.72, net_profit_margin: 0.28 },
    ]
  },
  '508071': {
    indicators: [
      { report_period: '2024Q3', roe: 0.0510, roa: 0.0370, debt_ratio: 0.50, current_ratio: 1.62, net_profit_margin: 0.32 },
      { report_period: '2024Q2', roe: 0.0480, roa: 0.0350, debt_ratio: 0.51, current_ratio: 1.57, net_profit_margin: 0.30 },
      { report_period: '2024Q1', roe: 0.0450, roa: 0.0330, debt_ratio: 0.52, current_ratio: 1.52, net_profit_margin: 0.28 },
      { report_period: '2023Q4', roe: 0.0495, roa: 0.0360, debt_ratio: 0.49, current_ratio: 1.64, net_profit_margin: 0.31 },
      { report_period: '2023Q3', roe: 0.0465, roa: 0.0340, debt_ratio: 0.50, current_ratio: 1.59, net_profit_margin: 0.29 },
    ]
  }
};

function FinancialTable({ selectedProduct }: any) {
  if (!selectedProduct) {
    return (
      <div className="text-center py-20">
        <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold text-white mb-2">
          请先选择一个产品
        </h3>
        <p className="text-slate-400">在"产品信息"表中点击任意产品即可查看其财务指标</p>
      </div>
    );
  }

  const data = MOCK_FINANCIAL_DATA[selectedProduct.fund_code] || { indicators: [] };
  const latest = data.indicators[0] || {};

  // 趋势图数据
  const periods = data.indicators.map((i: any) => i.report_period);
  const roeData = data.indicators.map((i: any) => (i.roe * 100).toFixed(2));
  const roaData = data.indicators.map((i: any) => (i.roa * 100).toFixed(2));
  const debtData = data.indicators.map((i: any) => (i.debt_ratio * 100).toFixed(2));

  // 趋势图配置
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      data: ['ROE', 'ROA', '资产负债率'],
      textStyle: { color: '#cbd5e1', fontSize: 12 },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: periods,
      axisLine: { lineStyle: { color: '#64748b' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '%',
      axisLine: { lineStyle: { color: '#64748b' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#334155' } }
    },
    series: [
      {
        name: 'ROE',
        type: 'line',
        data: roeData,
        smooth: true,
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16, 185, 129, 0.1)' }
      },
      {
        name: 'ROA',
        type: 'line',
        data: roaData,
        smooth: true,
        itemStyle: { color: '#60a5fa' },
        areaStyle: { color: 'rgba(96, 165, 250, 0.1)' }
      },
      {
        name: '资产负债率',
        type: 'line',
        data: debtData,
        smooth: true,
        itemStyle: { color: '#f59e0b' },
        areaStyle: { color: 'rgba(245, 158, 11, 0.1)' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">ROE</div>
            <div className="text-2xl font-bold text-emerald-400">{(latest.roe * 100).toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">ROA</div>
            <div className="text-2xl font-bold text-blue-400">{(latest.roa * 100).toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">资产负债率</div>
            <div className="text-2xl font-bold text-orange-400">{(latest.debt_ratio * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">流动比率</div>
            <div className="text-2xl font-bold text-purple-400">{latest.current_ratio.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">净利润率</div>
            <div className="text-2xl font-bold text-pink-400">{(latest.net_profit_margin * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <TrendingUp className="mr-2 h-5 w-5 text-[#10b981]" />
            财务指标趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={trendOption} style={{ height: '350px' }} />
        </CardContent>
      </Card>

      {/* 详细数据表格 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">财务指标明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-700/30">
                <TableRow>
                  <TableHead className="text-slate-300 whitespace-nowrap">报告期</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">ROE</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">ROA</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">资产负债率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">流动比率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">净利润率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.indicators.map((i: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-slate-700/30 border-b border-slate-700/50">
                    <TableCell className="text-white font-semibold">{i.report_period}</TableCell>
                    <TableCell className="text-right text-white">{(i.roe * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right text-white">{(i.roa * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right text-white">{(i.debt_ratio * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-white">{i.current_ratio.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white">{(i.net_profit_margin * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== 运营数据表 ====================
// 模拟运营数据
const MOCK_OPERATIONAL_DATA: any = {
  '508000': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0.95, rental_income: 0.52, nii: 0.48, cap_rate: 0.048, avg_rent: 3.42 },
      { report_period: '2024Q2', occupancy_rate: 0.94, rental_income: 0.50, nii: 0.46, cap_rate: 0.047, avg_rent: 3.40 },
      { report_period: '2024Q1', occupancy_rate: 0.93, rental_income: 0.48, nii: 0.44, cap_rate: 0.046, avg_rent: 3.38 },
      { report_period: '2023Q4', occupancy_rate: 0.94, rental_income: 0.51, nii: 0.47, cap_rate: 0.047, avg_rent: 3.41 },
      { report_period: '2023Q3', occupancy_rate: 0.93, rental_income: 0.49, nii: 0.45, cap_rate: 0.046, avg_rent: 3.39 },
    ]
  },
  '508001': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0, rental_income: 0.65, nii: 0.62, cap_rate: 0.052, avg_rent: 0 },
      { report_period: '2024Q2', occupancy_rate: 0, rental_income: 0.63, nii: 0.60, cap_rate: 0.051, avg_rent: 0 },
      { report_period: '2024Q1', occupancy_rate: 0, rental_income: 0.61, nii: 0.58, cap_rate: 0.050, avg_rent: 0 },
      { report_period: '2023Q4', occupancy_rate: 0, rental_income: 0.64, nii: 0.61, cap_rate: 0.051, avg_rent: 0 },
      { report_period: '2023Q3', occupancy_rate: 0, rental_income: 0.62, nii: 0.59, cap_rate: 0.050, avg_rent: 0 },
    ]
  },
  '508002': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0.93, rental_income: 0.68, nii: 0.64, cap_rate: 0.049, avg_rent: 3.52 },
      { report_period: '2024Q2', occupancy_rate: 0.92, rental_income: 0.66, nii: 0.62, cap_rate: 0.048, avg_rent: 3.50 },
      { report_period: '2024Q1', occupancy_rate: 0.91, rental_income: 0.64, nii: 0.60, cap_rate: 0.047, avg_rent: 3.48 },
      { report_period: '2023Q4', occupancy_rate: 0.92, rental_income: 0.67, nii: 0.63, cap_rate: 0.048, avg_rent: 3.51 },
      { report_period: '2023Q3', occupancy_rate: 0.91, rental_income: 0.65, nii: 0.61, cap_rate: 0.047, avg_rent: 3.49 },
    ]
  },
  '508006': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0.96, rental_income: 0.82, nii: 0.78, cap_rate: 0.051, avg_rent: 2.93 },
      { report_period: '2024Q2', occupancy_rate: 0.95, rental_income: 0.80, nii: 0.76, cap_rate: 0.050, avg_rent: 2.91 },
      { report_period: '2024Q1', occupancy_rate: 0.94, rental_income: 0.78, nii: 0.74, cap_rate: 0.049, avg_rent: 2.89 },
      { report_period: '2023Q4', occupancy_rate: 0.95, rental_income: 0.81, nii: 0.77, cap_rate: 0.050, avg_rent: 2.92 },
      { report_period: '2023Q3', occupancy_rate: 0.94, rental_income: 0.79, nii: 0.75, cap_rate: 0.049, avg_rent: 2.90 },
    ]
  },
  '508021': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0.94, rental_income: 0.72, nii: 0.68, cap_rate: 0.050, avg_rent: 2.25 },
      { report_period: '2024Q2', occupancy_rate: 0.93, rental_income: 0.70, nii: 0.66, cap_rate: 0.049, avg_rent: 2.23 },
      { report_period: '2024Q1', occupancy_rate: 0.92, rental_income: 0.68, nii: 0.64, cap_rate: 0.048, avg_rent: 2.21 },
      { report_period: '2023Q4', occupancy_rate: 0.93, rental_income: 0.71, nii: 0.67, cap_rate: 0.049, avg_rent: 2.24 },
      { report_period: '2023Q3', occupancy_rate: 0.92, rental_income: 0.69, nii: 0.65, cap_rate: 0.048, avg_rent: 2.22 },
    ]
  },
  '508027': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0.98, rental_income: 0.56, nii: 0.54, cap_rate: 0.045, avg_rent: 1.24 },
      { report_period: '2024Q2', occupancy_rate: 0.97, rental_income: 0.54, nii: 0.52, cap_rate: 0.044, avg_rent: 1.23 },
      { report_period: '2024Q1', occupancy_rate: 0.96, rental_income: 0.52, nii: 0.50, cap_rate: 0.043, avg_rent: 1.22 },
      { report_period: '2023Q4', occupancy_rate: 0.97, rental_income: 0.55, nii: 0.53, cap_rate: 0.044, avg_rent: 1.23 },
      { report_period: '2023Q3', occupancy_rate: 0.96, rental_income: 0.53, nii: 0.51, cap_rate: 0.043, avg_rent: 1.22 },
    ]
  },
  '508031': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0, rental_income: 0.46, nii: 0.44, cap_rate: 0.047, avg_rent: 0 },
      { report_period: '2024Q2', occupancy_rate: 0, rental_income: 0.44, nii: 0.42, cap_rate: 0.046, avg_rent: 0 },
      { report_period: '2024Q1', occupancy_rate: 0, rental_income: 0.42, nii: 0.40, cap_rate: 0.045, avg_rent: 0 },
      { report_period: '2023Q4', occupancy_rate: 0, rental_income: 0.45, nii: 0.43, cap_rate: 0.046, avg_rent: 0 },
      { report_period: '2023Q3', occupancy_rate: 0, rental_income: 0.43, nii: 0.41, cap_rate: 0.045, avg_rent: 0 },
    ]
  },
  '508056': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0.88, rental_income: 0.74, nii: 0.70, cap_rate: 0.050, avg_rent: 1.95 },
      { report_period: '2024Q2', occupancy_rate: 0.87, rental_income: 0.72, nii: 0.68, cap_rate: 0.049, avg_rent: 1.93 },
      { report_period: '2024Q1', occupancy_rate: 0.86, rental_income: 0.70, nii: 0.66, cap_rate: 0.048, avg_rent: 1.91 },
      { report_period: '2023Q4', occupancy_rate: 0.87, rental_income: 0.73, nii: 0.69, cap_rate: 0.049, avg_rent: 1.94 },
      { report_period: '2023Q3', occupancy_rate: 0.86, rental_income: 0.71, nii: 0.67, cap_rate: 0.048, avg_rent: 1.92 },
    ]
  },
  '508058': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0.95, rental_income: 0.62, nii: 0.59, cap_rate: 0.053, avg_rent: 5.17 },
      { report_period: '2024Q2', occupancy_rate: 0.94, rental_income: 0.60, nii: 0.57, cap_rate: 0.052, avg_rent: 5.15 },
      { report_period: '2024Q1', occupancy_rate: 0.93, rental_income: 0.58, nii: 0.55, cap_rate: 0.051, avg_rent: 5.13 },
      { report_period: '2023Q4', occupancy_rate: 0.94, rental_income: 0.61, nii: 0.58, cap_rate: 0.052, avg_rent: 5.16 },
      { report_period: '2023Q3', occupancy_rate: 0.93, rental_income: 0.59, nii: 0.56, cap_rate: 0.051, avg_rent: 5.14 },
    ]
  },
  '508071': {
    data: [
      { report_period: '2024Q3', occupancy_rate: 0.92, rental_income: 1.04, nii: 0.99, cap_rate: 0.052, avg_rent: 2.48 },
      { report_period: '2024Q2', occupancy_rate: 0.91, rental_income: 1.02, nii: 0.97, cap_rate: 0.051, avg_rent: 2.46 },
      { report_period: '2024Q1', occupancy_rate: 0.90, rental_income: 1.00, nii: 0.95, cap_rate: 0.050, avg_rent: 2.44 },
      { report_period: '2023Q4', occupancy_rate: 0.91, rental_income: 1.03, nii: 0.98, cap_rate: 0.051, avg_rent: 2.47 },
      { report_period: '2023Q3', occupancy_rate: 0.90, rental_income: 1.01, nii: 0.96, cap_rate: 0.050, avg_rent: 2.45 },
    ]
  }
};

function OperationalTable({ selectedProduct }: any) {
  if (!selectedProduct) {
    return (
      <div className="text-center py-20">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold text-white mb-2">
          请先选择一个产品
        </h3>
        <p className="text-slate-400">在"产品信息"表中点击任意产品即可查看其运营数据</p>
      </div>
    );
  }

  const data = MOCK_OPERATIONAL_DATA[selectedProduct.fund_code] || { data: [] };
  const latest = data.data[0] || {};

  // 趋势图数据
  const periods = data.data.map((i: any) => i.report_period);
  const occupancyData = data.data.map((i: any) => (i.occupancy_rate * 100).toFixed(1));
  const incomeData = data.data.map((i: any) => i.rental_income.toFixed(2));

  // 趋势图配置
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      data: ['出租率', '租金收入'],
      textStyle: { color: '#cbd5e1', fontSize: 12 },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: periods,
      axisLine: { lineStyle: { color: '#64748b' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '出租率(%)',
        position: 'left',
        axisLine: { lineStyle: { color: '#64748b' } },
        axisLabel: { color: '#94a3b8', fontSize: 11, formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      {
        type: 'value',
        name: '租金收入(亿元)',
        position: 'right',
        axisLine: { lineStyle: { color: '#64748b' } },
        axisLabel: { color: '#94a3b8', fontSize: 11, formatter: '{value}' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '出租率',
        type: 'line',
        yAxisIndex: 0,
        data: occupancyData,
        smooth: true,
        itemStyle: { color: '#f59e0b' },
        areaStyle: { color: 'rgba(245, 158, 11, 0.1)' }
      },
      {
        name: '租金收入',
        type: 'bar',
        yAxisIndex: 1,
        data: incomeData,
        itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">出租率</div>
            <div className="text-2xl font-bold text-orange-400">{(latest.occupancy_rate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">租金收入</div>
            <div className="text-2xl font-bold text-emerald-400">{latest.rental_income.toFixed(2)}亿元</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">NOI</div>
            <div className="text-2xl font-bold text-blue-400">{latest.nii.toFixed(2)}亿元</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">资本化率</div>
            <div className="text-2xl font-bold text-purple-400">{(latest.cap_rate * 100).toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">平均租金</div>
            <div className="text-2xl font-bold text-pink-400">{latest.avg_rent.toFixed(2)}元/㎡/天</div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <TrendingUp className="mr-2 h-5 w-5 text-[#f59e0b]" />
            出租率与租金收入趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={trendOption} style={{ height: '350px' }} />
        </CardContent>
      </Card>

      {/* 详细数据表格 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">运营数据明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-700/30">
                <TableRow>
                  <TableHead className="text-slate-300 whitespace-nowrap">报告期</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">出租率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">租金收入(亿元)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">NOI(亿元)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">资本化率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">平均租金(元/㎡/天)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((i: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-slate-700/30 border-b border-slate-700/50">
                    <TableCell className="text-white font-semibold">{i.report_period}</TableCell>
                    <TableCell className="text-right text-white">{i.occupancy_rate > 0 ? `${(i.occupancy_rate * 100).toFixed(1)}%` : '-'}</TableCell>
                    <TableCell className="text-right text-white">{i.rental_income.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white">{i.nii.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white">{(i.cap_rate * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right text-white">{i.avg_rent > 0 ? i.avg_rent.toFixed(2) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== 市场表现表 ====================
// 模拟市场表现数据
const MOCK_MARKET_DATA: any = {
  '508000': {
    data: [
      { trade_date: '2024-12-20', closing_price: 3.52, change_pct: 0.012, volume: 2580000, turnover_rate: 0.0516, pe_ratio: 18.5, pb_ratio: 1.2 },
      { trade_date: '2024-12-19', closing_price: 3.48, change_pct: -0.008, volume: 2200000, turnover_rate: 0.0440, pe_ratio: 18.3, pb_ratio: 1.19 },
      { trade_date: '2024-12-18', closing_price: 3.51, change_pct: 0.015, volume: 3100000, turnover_rate: 0.0620, pe_ratio: 18.4, pb_ratio: 1.2 },
      { trade_date: '2024-12-17', closing_price: 3.46, change_pct: -0.003, volume: 1850000, turnover_rate: 0.0370, pe_ratio: 18.2, pb_ratio: 1.18 },
      { trade_date: '2024-12-16', closing_price: 3.47, change_pct: 0.009, volume: 2450000, turnover_rate: 0.0490, pe_ratio: 18.2, pb_ratio: 1.19 },
    ]
  },
  '508001': {
    data: [
      { trade_date: '2024-12-20', closing_price: 5.85, change_pct: 0.018, volume: 1520000, turnover_rate: 0.0253, pe_ratio: 22.5, pb_ratio: 1.45 },
      { trade_date: '2024-12-19', closing_price: 5.75, change_pct: -0.012, volume: 1280000, turnover_rate: 0.0213, pe_ratio: 22.1, pb_ratio: 1.42 },
      { trade_date: '2024-12-18', closing_price: 5.82, change_pct: 0.022, volume: 1850000, turnover_rate: 0.0308, pe_ratio: 22.4, pb_ratio: 1.44 },
      { trade_date: '2024-12-17', closing_price: 5.70, change_pct: -0.005, volume: 950000, turnover_rate: 0.0158, pe_ratio: 21.9, pb_ratio: 1.41 },
      { trade_date: '2024-12-16', closing_price: 5.73, change_pct: 0.011, volume: 1450000, turnover_rate: 0.0242, pe_ratio: 22.0, pb_ratio: 1.42 },
    ]
  },
  '508002': {
    data: [
      { trade_date: '2024-12-20', closing_price: 5.28, change_pct: 0.015, volume: 1920000, turnover_rate: 0.0480, pe_ratio: 19.8, pb_ratio: 1.35 },
      { trade_date: '2024-12-19', closing_price: 5.20, change_pct: -0.010, volume: 1650000, turnover_rate: 0.0413, pe_ratio: 19.5, pb_ratio: 1.33 },
      { trade_date: '2024-12-18', closing_price: 5.25, change_pct: 0.019, volume: 2200000, turnover_rate: 0.0550, pe_ratio: 19.7, pb_ratio: 1.34 },
      { trade_date: '2024-12-17', closing_price: 5.15, change_pct: -0.007, volume: 1400000, turnover_rate: 0.0350, pe_ratio: 19.3, pb_ratio: 1.32 },
      { trade_date: '2024-12-16', closing_price: 5.18, change_pct: 0.012, volume: 1750000, turnover_rate: 0.0438, pe_ratio: 19.4, pb_ratio: 1.33 },
    ]
  },
  '508006': {
    data: [
      { trade_date: '2024-12-20', closing_price: 6.95, change_pct: 0.022, volume: 2850000, turnover_rate: 0.0380, pe_ratio: 21.5, pb_ratio: 1.52 },
      { trade_date: '2024-12-19', closing_price: 6.80, change_pct: -0.015, volume: 2450000, turnover_rate: 0.0327, pe_ratio: 21.0, pb_ratio: 1.49 },
      { trade_date: '2024-12-18', closing_price: 6.90, change_pct: 0.028, volume: 3200000, turnover_rate: 0.0427, pe_ratio: 21.3, pb_ratio: 1.51 },
      { trade_date: '2024-12-17', closing_price: 6.71, change_pct: -0.009, volume: 1900000, turnover_rate: 0.0253, pe_ratio: 20.8, pb_ratio: 1.47 },
      { trade_date: '2024-12-16', closing_price: 6.77, change_pct: 0.014, volume: 2550000, turnover_rate: 0.0340, pe_ratio: 20.9, pb_ratio: 1.48 },
    ]
  },
  '508021': {
    data: [
      { trade_date: '2024-12-20', closing_price: 5.12, change_pct: 0.018, volume: 1680000, turnover_rate: 0.0420, pe_ratio: 20.2, pb_ratio: 1.38 },
      { trade_date: '2024-12-19', closing_price: 5.03, change_pct: -0.011, volume: 1450000, turnover_rate: 0.0363, pe_ratio: 19.8, pb_ratio: 1.35 },
      { trade_date: '2024-12-18', closing_price: 5.09, change_pct: 0.023, volume: 1950000, turnover_rate: 0.0488, pe_ratio: 20.1, pb_ratio: 1.37 },
      { trade_date: '2024-12-17', closing_price: 4.98, change_pct: -0.006, volume: 1250000, turnover_rate: 0.0313, pe_ratio: 19.7, pb_ratio: 1.34 },
      { trade_date: '2024-12-16', closing_price: 5.01, change_pct: 0.013, volume: 1580000, turnover_rate: 0.0395, pe_ratio: 19.8, pb_ratio: 1.35 },
    ]
  },
  '508027': {
    data: [
      { trade_date: '2024-12-20', closing_price: 4.85, change_pct: 0.025, volume: 2250000, turnover_rate: 0.0450, pe_ratio: 23.5, pb_ratio: 1.25 },
      { trade_date: '2024-12-19', closing_price: 4.73, change_pct: -0.016, volume: 1920000, turnover_rate: 0.0384, pe_ratio: 22.9, pb_ratio: 1.22 },
      { trade_date: '2024-12-18', closing_price: 4.81, change_pct: 0.032, volume: 2650000, turnover_rate: 0.0530, pe_ratio: 23.3, pb_ratio: 1.24 },
      { trade_date: '2024-12-17', closing_price: 4.66, change_pct: -0.008, volume: 1550000, turnover_rate: 0.0310, pe_ratio: 22.5, pb_ratio: 1.20 },
      { trade_date: '2024-12-16', closing_price: 4.70, change_pct: 0.017, volume: 2100000, turnover_rate: 0.0420, pe_ratio: 22.8, pb_ratio: 1.21 },
    ]
  },
  '508031': {
    data: [
      { trade_date: '2024-12-20', closing_price: 4.25, change_pct: 0.014, volume: 1380000, turnover_rate: 0.0345, pe_ratio: 21.8, pb_ratio: 1.30 },
      { trade_date: '2024-12-19', closing_price: 4.19, change_pct: -0.009, volume: 1180000, turnover_rate: 0.0295, pe_ratio: 21.5, pb_ratio: 1.28 },
      { trade_date: '2024-12-18', closing_price: 4.23, change_pct: 0.018, volume: 1650000, turnover_rate: 0.0413, pe_ratio: 21.7, pb_ratio: 1.29 },
      { trade_date: '2024-12-17', closing_price: 4.15, change_pct: -0.005, volume: 1020000, turnover_rate: 0.0255, pe_ratio: 21.3, pb_ratio: 1.27 },
      { trade_date: '2024-12-16', closing_price: 4.17, change_pct: 0.010, volume: 1350000, turnover_rate: 0.0338, pe_ratio: 21.4, pb_ratio: 1.28 },
    ]
  },
  '508056': {
    data: [
      { trade_date: '2024-12-20', closing_price: 5.95, change_pct: 0.020, volume: 2080000, turnover_rate: 0.0416, pe_ratio: 22.0, pb_ratio: 1.48 },
      { trade_date: '2024-12-19', closing_price: 5.83, change_pct: -0.013, volume: 1780000, turnover_rate: 0.0356, pe_ratio: 21.6, pb_ratio: 1.45 },
      { trade_date: '2024-12-18', closing_price: 5.91, change_pct: 0.026, volume: 2450000, turnover_rate: 0.0490, pe_ratio: 21.9, pb_ratio: 1.47 },
      { trade_date: '2024-12-17', closing_price: 5.76, change_pct: -0.007, volume: 1520000, turnover_rate: 0.0304, pe_ratio: 21.3, pb_ratio: 1.43 },
      { trade_date: '2024-12-16', closing_price: 5.80, change_pct: 0.015, volume: 1950000, turnover_rate: 0.0390, pe_ratio: 21.5, pb_ratio: 1.44 },
    ]
  },
  '508058': {
    data: [
      { trade_date: '2024-12-20', closing_price: 6.48, change_pct: 0.017, volume: 1650000, turnover_rate: 0.0330, pe_ratio: 24.5, pb_ratio: 1.60 },
      { trade_date: '2024-12-19', closing_price: 6.37, change_pct: -0.011, volume: 1420000, turnover_rate: 0.0284, pe_ratio: 24.1, pb_ratio: 1.57 },
      { trade_date: '2024-12-18', closing_price: 6.44, change_pct: 0.021, volume: 1950000, turnover_rate: 0.0390, pe_ratio: 24.4, pb_ratio: 1.59 },
      { trade_date: '2024-12-17', closing_price: 6.31, change_pct: -0.006, volume: 1280000, turnover_rate: 0.0256, pe_ratio: 23.9, pb_ratio: 1.56 },
      { trade_date: '2024-12-16', closing_price: 6.35, change_pct: 0.012, volume: 1580000, turnover_rate: 0.0316, pe_ratio: 24.0, pb_ratio: 1.57 },
    ]
  },
  '508071': {
    data: [
      { trade_date: '2024-12-20', closing_price: 7.85, change_pct: 0.023, volume: 2450000, turnover_rate: 0.0490, pe_ratio: 26.2, pb_ratio: 1.75 },
      { trade_date: '2024-12-19', closing_price: 7.67, change_pct: -0.014, volume: 2080000, turnover_rate: 0.0416, pe_ratio: 25.6, pb_ratio: 1.71 },
      { trade_date: '2024-12-18', closing_price: 7.78, change_pct: 0.029, volume: 2850000, turnover_rate: 0.0570, pe_ratio: 26.0, pb_ratio: 1.73 },
      { trade_date: '2024-12-17', closing_price: 7.56, change_pct: -0.008, volume: 1750000, turnover_rate: 0.0350, pe_ratio: 25.2, pb_ratio: 1.68 },
      { trade_date: '2024-12-16', closing_price: 7.62, change_pct: 0.016, volume: 2250000, turnover_rate: 0.0450, pe_ratio: 25.4, pb_ratio: 1.70 },
    ]
  }
};

function MarketTable({ selectedProduct }: any) {
  if (!selectedProduct) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold text-white mb-2">
          请先选择一个产品
        </h3>
        <p className="text-slate-400">在"产品信息"表中点击任意产品即可查看其市场表现</p>
      </div>
    );
  }

  const data = MOCK_MARKET_DATA[selectedProduct.fund_code] || { data: [] };
  const latest = data.data[0] || {};

  // 价格走势和成交量数据
  const dates = data.data.map((i: any) => i.trade_date.substring(5));
  const prices = data.data.map((i: any) => i.closing_price.toFixed(2));
  const volumes = data.data.map((i: any) => (i.volume / 10000).toFixed(0));

  // 价格走势图配置
  const priceOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      data: ['收盘价', '成交量(万手)'],
      textStyle: { color: '#cbd5e1', fontSize: 12 },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#64748b' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '元',
        position: 'left',
        axisLine: { lineStyle: { color: '#64748b' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      {
        type: 'value',
        name: '万手',
        position: 'right',
        axisLine: { lineStyle: { color: '#64748b' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '收盘价',
        type: 'line',
        yAxisIndex: 0,
        data: prices,
        smooth: true,
        itemStyle: { color: '#ef4444' },
        areaStyle: { color: 'rgba(239, 68, 68, 0.1)' }
      },
      {
        name: '成交量(万手)',
        type: 'bar',
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: (params: any) => {
            const change = data.data[params.dataIndex]?.change_pct || 0;
            return change >= 0 ? '#10b981' : '#ef4444';
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">最新价</div>
            <div className="text-2xl font-bold text-red-400">{latest.closing_price.toFixed(2)}元</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">涨跌幅</div>
            <div className={`text-2xl font-bold ${latest.change_pct >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {latest.change_pct >= 0 ? '+' : ''}{(latest.change_pct * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">成交量</div>
            <div className="text-2xl font-bold text-blue-400">{(latest.volume / 10000).toFixed(0)}万手</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">换手率</div>
            <div className="text-2xl font-bold text-purple-400">{(latest.turnover_rate * 100).toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">PE</div>
            <div className="text-2xl font-bold text-orange-400">{latest.pe_ratio.toFixed(1)}x</div>
          </CardContent>
        </Card>
      </div>

      {/* 价格走势图 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <BarChart3 className="mr-2 h-5 w-5 text-[#ef4444]" />
            价格走势与成交量
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={priceOption} style={{ height: '350px' }} />
        </CardContent>
      </Card>

      {/* 详细数据表格 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">市场表现明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-700/30">
                <TableRow>
                  <TableHead className="text-slate-300 whitespace-nowrap">交易日期</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">收盘价(元)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">涨跌幅</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">成交量(万手)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">换手率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">PE</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">PB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((i: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-slate-700/30 border-b border-slate-700/50">
                    <TableCell className="text-white font-semibold">{i.trade_date}</TableCell>
                    <TableCell className="text-right text-white font-semibold">{i.closing_price.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-semibold ${i.change_pct >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {i.change_pct >= 0 ? '+' : ''}{(i.change_pct * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right text-white">{(i.volume / 10000).toFixed(0)}</TableCell>
                    <TableCell className="text-right text-white">{(i.turnover_rate * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right text-white">{i.pe_ratio.toFixed(1)}x</TableCell>
                    <TableCell className="text-right text-white">{i.pb_ratio.toFixed(2)}x</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== 收益分配表 ====================
// 模拟分红数据
const MOCK_DIVIDEND_DATA: any = {
  '508000': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.085, dividend_yield: 0.048, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.080, dividend_yield: 0.045, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.075, dividend_yield: 0.043, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.070, dividend_yield: 0.041, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.065, dividend_yield: 0.038, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508001': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.120, dividend_yield: 0.052, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.115, dividend_yield: 0.049, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.110, dividend_yield: 0.046, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.105, dividend_yield: 0.044, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.100, dividend_yield: 0.041, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508002': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.095, dividend_yield: 0.049, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.090, dividend_yield: 0.046, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.085, dividend_yield: 0.043, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.080, dividend_yield: 0.041, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.075, dividend_yield: 0.038, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508006': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.105, dividend_yield: 0.051, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.100, dividend_yield: 0.048, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.095, dividend_yield: 0.045, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.090, dividend_yield: 0.043, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.085, dividend_yield: 0.040, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508021': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.092, dividend_yield: 0.050, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.087, dividend_yield: 0.047, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.082, dividend_yield: 0.044, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.077, dividend_yield: 0.042, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.072, dividend_yield: 0.039, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508027': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.078, dividend_yield: 0.046, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.073, dividend_yield: 0.043, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.068, dividend_yield: 0.040, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.063, dividend_yield: 0.037, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.058, dividend_yield: 0.034, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508031': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.082, dividend_yield: 0.047, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.077, dividend_yield: 0.044, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.072, dividend_yield: 0.041, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.067, dividend_yield: 0.038, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.062, dividend_yield: 0.035, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508056': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.098, dividend_yield: 0.052, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.093, dividend_yield: 0.049, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.088, dividend_yield: 0.046, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.083, dividend_yield: 0.043, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.078, dividend_yield: 0.040, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508058': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.110, dividend_yield: 0.054, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.105, dividend_yield: 0.051, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.100, dividend_yield: 0.048, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.095, dividend_yield: 0.045, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.090, dividend_yield: 0.042, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  },
  '508071': {
    dividends: [
      { ex_date: '2024-06-30', dividend_per_share: 0.125, dividend_yield: 0.056, record_date: '2024-07-01', pay_date: '2024-07-05' },
      { ex_date: '2023-12-31', dividend_per_share: 0.120, dividend_yield: 0.053, record_date: '2024-01-02', pay_date: '2024-01-05' },
      { ex_date: '2023-06-30', dividend_per_share: 0.115, dividend_yield: 0.050, record_date: '2023-07-01', pay_date: '2023-07-05' },
      { ex_date: '2022-12-31', dividend_per_share: 0.110, dividend_yield: 0.047, record_date: '2023-01-03', pay_date: '2023-01-06' },
      { ex_date: '2022-06-30', dividend_per_share: 0.105, dividend_yield: 0.044, record_date: '2022-07-01', pay_date: '2022-07-05' },
    ]
  }
};

function DividendTable({ selectedProduct }: any) {
  if (!selectedProduct) {
    return (
      <div className="text-center py-20">
        <PieChartIcon className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold text-white mb-2">
          请先选择一个产品
        </h3>
        <p className="text-slate-400">在"产品信息"表中点击任意产品即可查看其收益分配历史</p>
      </div>
    );
  }

  const data = MOCK_DIVIDEND_DATA[selectedProduct.fund_code] || { dividends: [] };
  const latest = data.dividends[0] || {};

  // 计算累计分红
  const totalDividend = data.dividends.reduce((sum: number, d: any) => sum + d.dividend_per_share, 0);
  const avgYield = data.dividends.length > 0
    ? data.dividends.reduce((sum: number, d: any) => sum + d.dividend_yield, 0) / data.dividends.length
    : 0;

  // 分红趋势数据
  const dates = data.dividends.map((d: any) => d.ex_date.substring(0, 7));
  const amounts = data.dividends.map((d: any) => d.dividend_per_share.toFixed(3));
  const yields = data.dividends.map((d: any) => (d.dividend_yield * 100).toFixed(2));

  // 分红趋势图配置
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      data: ['每股分红', '分红收益率'],
      textStyle: { color: '#cbd5e1', fontSize: 12 },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#64748b' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '每股分红(元)',
        position: 'left',
        axisLine: { lineStyle: { color: '#64748b' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      {
        type: 'value',
        name: '分红收益率(%)',
        position: 'right',
        axisLine: { lineStyle: { color: '#64748b' } },
        axisLabel: { color: '#94a3b8', fontSize: 11, formatter: '{value}%' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '每股分红',
        type: 'line',
        yAxisIndex: 0,
        data: amounts,
        smooth: true,
        itemStyle: { color: '#ec4899' },
        areaStyle: { color: 'rgba(236, 72, 153, 0.1)' }
      },
      {
        name: '分红收益率',
        type: 'bar',
        yAxisIndex: 1,
        data: yields,
        itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">最新每股分红</div>
            <div className="text-2xl font-bold text-pink-400">{latest.dividend_per_share.toFixed(3)}元</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">最新分红收益率</div>
            <div className="text-2xl font-bold text-purple-400">{(latest.dividend_yield * 100).toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">累计每股分红</div>
            <div className="text-2xl font-bold text-emerald-400">{totalDividend.toFixed(3)}元</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">平均分红收益率</div>
            <div className="text-2xl font-bold text-blue-400">{(avgYield * 100).toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 分红趋势图 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <PieChartIcon className="mr-2 h-5 w-5 text-[#ec4899]" />
            分红历史趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={trendOption} style={{ height: '350px' }} />
        </CardContent>
      </Card>

      {/* 分红明细表格 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">收益分配明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-700/30">
                <TableRow>
                  <TableHead className="text-slate-300 whitespace-nowrap">除权除息日</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">每股分红(元)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">分红收益率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap">股权登记日</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap">派息日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.dividends.map((d: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-slate-700/30 border-b border-slate-700/50">
                    <TableCell className="text-white font-semibold">{d.ex_date}</TableCell>
                    <TableCell className="text-right text-white font-semibold">{d.dividend_per_share.toFixed(3)}</TableCell>
                    <TableCell className="text-right text-pink-400 font-semibold">{(d.dividend_yield * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-slate-300">{d.record_date}</TableCell>
                    <TableCell className="text-slate-300">{d.pay_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== 风险指标表 ====================
// 模拟风险数据
const MOCK_RISK_DATA: any = {
  '508000': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.18, var_95: 0.08, beta: 0.85, sharpe: 1.45, max_drawdown: 0.12 },
      { report_period: '2024Q3', volatility: 0.17, var_95: 0.07, beta: 0.83, sharpe: 1.52, max_drawdown: 0.11 },
      { report_period: '2024Q2', volatility: 0.19, var_95: 0.08, beta: 0.87, sharpe: 1.38, max_drawdown: 0.13 },
      { report_period: '2024Q1', volatility: 0.20, var_95: 0.09, beta: 0.89, sharpe: 1.32, max_drawdown: 0.14 },
      { report_period: '2023Q4', volatility: 0.18, var_95: 0.08, beta: 0.86, sharpe: 1.40, max_drawdown: 0.12 },
    ]
  },
  '508001': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.22, var_95: 0.10, beta: 0.95, sharpe: 1.28, max_drawdown: 0.15 },
      { report_period: '2024Q3', volatility: 0.21, var_95: 0.09, beta: 0.93, sharpe: 1.35, max_drawdown: 0.14 },
      { report_period: '2024Q2', volatility: 0.23, var_95: 0.11, beta: 0.97, sharpe: 1.22, max_drawdown: 0.16 },
      { report_period: '2024Q1', volatility: 0.24, var_95: 0.12, beta: 0.99, sharpe: 1.18, max_drawdown: 0.17 },
      { report_period: '2023Q4', volatility: 0.22, var_95: 0.10, beta: 0.96, sharpe: 1.25, max_drawdown: 0.15 },
    ]
  },
  '508002': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.20, var_95: 0.09, beta: 0.88, sharpe: 1.35, max_drawdown: 0.13 },
      { report_period: '2024Q3', volatility: 0.19, var_95: 0.08, beta: 0.86, sharpe: 1.42, max_drawdown: 0.12 },
      { report_period: '2024Q2', volatility: 0.21, var_95: 0.10, beta: 0.90, sharpe: 1.30, max_drawdown: 0.14 },
      { report_period: '2024Q1', volatility: 0.22, var_95: 0.11, beta: 0.92, sharpe: 1.25, max_drawdown: 0.15 },
      { report_period: '2023Q4', volatility: 0.20, var_95: 0.09, beta: 0.89, sharpe: 1.32, max_drawdown: 0.13 },
    ]
  },
  '508006': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.21, var_95: 0.09, beta: 0.90, sharpe: 1.38, max_drawdown: 0.14 },
      { report_period: '2024Q3', volatility: 0.20, var_95: 0.08, beta: 0.88, sharpe: 1.45, max_drawdown: 0.13 },
      { report_period: '2024Q2', volatility: 0.22, var_95: 0.10, beta: 0.92, sharpe: 1.32, max_drawdown: 0.15 },
      { report_period: '2024Q1', volatility: 0.23, var_95: 0.11, beta: 0.94, sharpe: 1.28, max_drawdown: 0.16 },
      { report_period: '2023Q4', volatility: 0.21, var_95: 0.09, beta: 0.91, sharpe: 1.35, max_drawdown: 0.14 },
    ]
  },
  '508021': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.23, var_95: 0.10, beta: 0.92, sharpe: 1.32, max_drawdown: 0.15 },
      { report_period: '2024Q3', volatility: 0.22, var_95: 0.09, beta: 0.90, sharpe: 1.40, max_drawdown: 0.14 },
      { report_period: '2024Q2', volatility: 0.24, var_95: 0.11, beta: 0.94, sharpe: 1.25, max_drawdown: 0.16 },
      { report_period: '2024Q1', volatility: 0.25, var_95: 0.12, beta: 0.96, sharpe: 1.20, max_drawdown: 0.17 },
      { report_period: '2023Q4', volatility: 0.23, var_95: 0.10, beta: 0.93, sharpe: 1.28, max_drawdown: 0.15 },
    ]
  },
  '508027': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.16, var_95: 0.07, beta: 0.80, sharpe: 1.55, max_drawdown: 0.10 },
      { report_period: '2024Q3', volatility: 0.15, var_95: 0.06, beta: 0.78, sharpe: 1.62, max_drawdown: 0.09 },
      { report_period: '2024Q2', volatility: 0.17, var_95: 0.08, beta: 0.82, sharpe: 1.48, max_drawdown: 0.11 },
      { report_period: '2024Q1', volatility: 0.18, var_95: 0.08, beta: 0.84, sharpe: 1.42, max_drawdown: 0.12 },
      { report_period: '2023Q4', volatility: 0.16, var_95: 0.07, beta: 0.81, sharpe: 1.52, max_drawdown: 0.10 },
    ]
  },
  '508031': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.25, var_95: 0.11, beta: 1.05, sharpe: 1.20, max_drawdown: 0.17 },
      { report_period: '2024Q3', volatility: 0.24, var_95: 0.10, beta: 1.03, sharpe: 1.28, max_drawdown: 0.16 },
      { report_period: '2024Q2', volatility: 0.26, var_95: 0.12, beta: 1.07, sharpe: 1.15, max_drawdown: 0.18 },
      { report_period: '2024Q1', volatility: 0.27, var_95: 0.13, beta: 1.09, sharpe: 1.10, max_drawdown: 0.19 },
      { report_period: '2023Q4', volatility: 0.25, var_95: 0.11, beta: 1.06, sharpe: 1.18, max_drawdown: 0.17 },
    ]
  },
  '508056': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.24, var_95: 0.11, beta: 0.98, sharpe: 1.25, max_drawdown: 0.16 },
      { report_period: '2024Q3', volatility: 0.23, var_95: 0.10, beta: 0.96, sharpe: 1.32, max_drawdown: 0.15 },
      { report_period: '2024Q2', volatility: 0.25, var_95: 0.12, beta: 1.00, sharpe: 1.20, max_drawdown: 0.17 },
      { report_period: '2024Q1', volatility: 0.26, var_95: 0.13, beta: 1.02, sharpe: 1.15, max_drawdown: 0.18 },
      { report_period: '2023Q4', volatility: 0.24, var_95: 0.11, beta: 0.99, sharpe: 1.22, max_drawdown: 0.16 },
    ]
  },
  '508058': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.26, var_95: 0.12, beta: 1.10, sharpe: 1.18, max_drawdown: 0.18 },
      { report_period: '2024Q3', volatility: 0.25, var_95: 0.11, beta: 1.08, sharpe: 1.25, max_drawdown: 0.17 },
      { report_period: '2024Q2', volatility: 0.27, var_95: 0.13, beta: 1.12, sharpe: 1.12, max_drawdown: 0.19 },
      { report_period: '2024Q1', volatility: 0.28, var_95: 0.14, beta: 1.14, sharpe: 1.08, max_drawdown: 0.20 },
      { report_period: '2023Q4', volatility: 0.26, var_95: 0.12, beta: 1.11, sharpe: 1.15, max_drawdown: 0.18 },
    ]
  },
  '508071': {
    indicators: [
      { report_period: '2024Q4', volatility: 0.23, var_95: 0.10, beta: 1.02, sharpe: 1.30, max_drawdown: 0.15 },
      { report_period: '2024Q3', volatility: 0.22, var_95: 0.09, beta: 1.00, sharpe: 1.38, max_drawdown: 0.14 },
      { report_period: '2024Q2', volatility: 0.24, var_95: 0.11, beta: 1.04, sharpe: 1.25, max_drawdown: 0.16 },
      { report_period: '2024Q1', volatility: 0.25, var_95: 0.12, beta: 1.06, sharpe: 1.20, max_drawdown: 0.17 },
      { report_period: '2023Q4', volatility: 0.23, var_95: 0.10, beta: 1.03, sharpe: 1.28, max_drawdown: 0.15 },
    ]
  }
};

function RiskTable({ selectedProduct }: any) {
  if (!selectedProduct) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold text-white mb-2">
          请先选择一个产品
        </h3>
        <p className="text-slate-400">在"产品信息"表中点击任意产品即可查看其风险指标</p>
      </div>
    );
  }

  const data = MOCK_RISK_DATA[selectedProduct.fund_code] || { indicators: [] };
  const latest = data.indicators[0] || {};

  // 趋势图数据
  const periods = data.indicators.map((i: any) => i.report_period);
  const volatilityData = data.indicators.map((i: any) => (i.volatility * 100).toFixed(1));
  const sharpeData = data.indicators.map((i: any) => i.sharpe.toFixed(2));
  const betaData = data.indicators.map((i: any) => i.beta.toFixed(2));

  // 波动率与夏普比率图配置
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      data: ['年化波动率', '夏普比率', 'Beta系数'],
      textStyle: { color: '#cbd5e1', fontSize: 12 },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: periods,
      axisLine: { lineStyle: { color: '#64748b' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '波动率/Beta',
        position: 'left',
        axisLine: { lineStyle: { color: '#64748b' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      {
        type: 'value',
        name: '夏普比率',
        position: 'right',
        axisLine: { lineStyle: { color: '#64748b' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '年化波动率',
        type: 'line',
        yAxisIndex: 0,
        data: volatilityData,
        smooth: true,
        itemStyle: { color: '#ef4444' },
        areaStyle: { color: 'rgba(239, 68, 68, 0.1)' }
      },
      {
        name: '夏普比率',
        type: 'line',
        yAxisIndex: 1,
        data: sharpeData,
        smooth: true,
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16, 185, 129, 0.1)' }
      },
      {
        name: 'Beta系数',
        type: 'line',
        yAxisIndex: 0,
        data: betaData,
        smooth: true,
        itemStyle: { color: '#8b5cf6' },
        lineStyle: { type: 'dashed' }
      }
    ]
  };

  // 风险雷达图数据
  const radarOption = {
    tooltip: {
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: { color: '#fff', fontSize: 13 }
    },
    radar: {
      indicator: [
        { name: '波动率', max: 30, min: 0 },
        { name: 'VaR', max: 15, min: 0 },
        { name: 'Beta', max: 1.5, min: 0 },
        { name: '夏普比率', max: 2, min: 0 },
        { name: '最大回撤', max: 25, min: 0 }
      ],
      axisName: { color: '#cbd5e1', fontSize: 12 },
      splitArea: { areaStyle: { color: ['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.05)'] } },
      axisLine: { lineStyle: { color: '#64748b' } },
      splitLine: { lineStyle: { color: '#475569' } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          latest.volatility * 100,
          latest.var_95 * 100,
          latest.beta,
          latest.sharpe,
          latest.max_drawdown * 100
        ],
        name: '最新风险指标',
        areaStyle: { color: 'rgba(6, 182, 212, 0.3)' },
        itemStyle: { color: '#06b6d4' },
        lineStyle: { color: '#06b6d4' }
      }]
    }]
  };

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">年化波动率</div>
            <div className={`text-2xl font-bold ${latest.volatility <= 0.2 ? 'text-emerald-400' : latest.volatility <= 0.25 ? 'text-orange-400' : 'text-red-400'}`}>
              {(latest.volatility * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">VaR(95%)</div>
            <div className="text-2xl font-bold text-orange-400">{(latest.var_95 * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">Beta系数</div>
            <div className={`text-2xl font-bold ${latest.beta <= 0.9 ? 'text-emerald-400' : latest.beta <= 1.1 ? 'text-orange-400' : 'text-red-400'}`}>
              {latest.beta.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">夏普比率</div>
            <div className={`text-2xl font-bold ${latest.sharpe >= 1.5 ? 'text-emerald-400' : latest.sharpe >= 1.2 ? 'text-orange-400' : 'text-red-400'}`}>
              {latest.sharpe.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">最大回撤</div>
            <div className="text-2xl font-bold text-purple-400">{(latest.max_drawdown * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图和雷达图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-white">
              <Shield className="mr-2 h-5 w-5 text-[#06b6d4]" />
              风险指标趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={trendOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">风险雷达图</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={radarOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>
      </div>

      {/* 详细数据表格 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">风险指标明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-700/30">
                <TableRow>
                  <TableHead className="text-slate-300 whitespace-nowrap">报告期</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">年化波动率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">VaR(95%)</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">Beta</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">夏普比率</TableHead>
                  <TableHead className="text-slate-300 whitespace-nowrap text-right">最大回撤</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.indicators.map((i: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-slate-700/30 border-b border-slate-700/50">
                    <TableCell className="text-white font-semibold">{i.report_period}</TableCell>
                    <TableCell className="text-right text-white">{(i.volatility * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-white">{(i.var_95 * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-white">{i.beta.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white">{i.sharpe.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white">{(i.max_drawdown * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
