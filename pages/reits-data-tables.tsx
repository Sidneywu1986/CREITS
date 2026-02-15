'use client';

import { useState } from 'react';
import Head from 'next/head';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  PieChart,
  LineChart,
  Shield,
  PieChart as PieChartIcon,
} from 'lucide-react';

// 八张表的Tab定义
const REIT_TABLES = [
  { id: 'product', name: '产品信息', icon: Building2 },
  { id: 'property', name: '资产信息', icon: Building2 },
  { id: 'financial', name: '财务指标', icon: DollarSign },
  { id: 'operational', name: '运营数据', icon: TrendingUp },
  { id: 'market', name: '市场表现', icon: LineChart },
  { id: 'investor', name: '投资者结构', icon: PieChart },
  { id: 'dividend', name: '分红历史', icon: PieChartIcon },
  { id: 'risk', name: '风险指标', icon: Shield },
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
    investment_scope: '基础设施项目支持证券投资',
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
    investment_scope: '高速公路基础设施项目投资',
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
    investment_scope: '产业园基础设施项目投资',
  },
  {
    fund_code: '508003',
    fund_name: '富国首创水务封闭式基础设施证券投资基金',
    fund_short_name: '首创水务REIT',
    fund_type: '经营权类',
    asset_type: '污水处理',
    manager_name: '富国基金管理有限公司',
    custodian_name: '中国农业银行股份有限公司',
    operating_manager: '北京首创生态环保集团股份有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 3.700,
    issue_amount: 18.5000,
    fund_shares: 5.0000,
    management_fee_rate: 0.0038,
    custody_fee_rate: 0.0001,
    investment_scope: '水务基础设施项目投资',
  },
  {
    fund_code: '508004',
    fund_name: '红土创新盐田港仓储物流封闭式基础设施证券投资基金',
    fund_short_name: '盐田港REIT',
    fund_type: '产权类',
    asset_type: '仓储物流',
    manager_name: '红土创新基金管理有限公司',
    custodian_name: '上海浦东发展银行股份有限公司',
    operating_manager: '深圳市盐田港集团有限公司',
    issue_date: '2021-06-07',
    listing_date: '2021-06-07',
    issue_price: 2.300,
    issue_amount: 18.4000,
    fund_shares: 8.0000,
    management_fee_rate: 0.0042,
    custody_fee_rate: 0.0001,
    investment_scope: '仓储物流基础设施项目投资',
  },
  {
    fund_code: '508005',
    fund_name: '博时招商蛇口产业园封闭式基础设施证券投资基金',
    fund_short_name: '蛇口产园REIT',
    fund_type: '产权类',
    asset_type: '产业园',
    manager_name: '博时基金管理有限公司',
    custodian_name: '中国银行股份有限公司',
    operating_manager: '招商局蛇口工业区控股股份有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 2.310,
    issue_amount: 20.0000,
    fund_shares: 9.0000,
    management_fee_rate: 0.0048,
    custody_fee_rate: 0.0001,
    investment_scope: '产业园基础设施项目投资',
  },
  {
    fund_code: '508006',
    fund_name: '平安广州交投广河高速公路封闭式基础设施证券投资基金',
    fund_short_name: '广河高速REIT',
    fund_type: '经营权类',
    asset_type: '高速公路',
    manager_name: '平安基金管理有限公司',
    custodian_name: '中国建设银行股份有限公司',
    operating_manager: '广州交通投资集团有限公司',
    issue_date: '2021-12-14',
    listing_date: '2021-12-14',
    issue_price: 13.020,
    issue_amount: 91.1400,
    fund_shares: 7.0000,
    management_fee_rate: 0.0043,
    custody_fee_rate: 0.0001,
    investment_scope: '高速公路基础设施项目投资',
  },
  {
    fund_code: '508007',
    fund_name: '中金普洛斯仓储物流封闭式基础设施证券投资基金',
    fund_short_name: '普洛斯REIT',
    fund_type: '产权类',
    asset_type: '仓储物流',
    manager_name: '中金基金管理有限公司',
    custodian_name: '中国工商银行股份有限公司',
    operating_manager: '普洛斯（中国）投资有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 3.890,
    issue_amount: 58.3500,
    fund_shares: 15.0000,
    management_fee_rate: 0.0055,
    custody_fee_rate: 0.0001,
    investment_scope: '仓储物流基础设施项目投资',
  },
];

export default function REITsDataTablesPage() {
  const [products] = useState(MOCK_REIT_PRODUCTS);
  const [selectedTable, setSelectedTable] = useState('product');
  const [searchKeyword, setSearchKeyword] = useState('');

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿元`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  // 过滤产品
  const filteredProducts = products.filter(product => {
    if (!searchKeyword.trim()) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      product.fund_code.toLowerCase().includes(keyword) ||
      product.fund_short_name?.toLowerCase().includes(keyword) ||
      product.fund_name?.toLowerCase().includes(keyword) ||
      product.manager_name?.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <Head>
        <title>REITs八张表数据 - REITs智能助手</title>
        <meta name="description" content="公募REITs八张表数据展示" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* 页面标题 */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-[#667eea] mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">REITs八张表数据</h1>
                  <p className="text-sm text-gray-600 mt-1">公募REITs全维度数据展示</p>
                </div>
              </div>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-[#667eea]/10 to-[#667eea]/5 border-[#667eea]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  产品总数
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#667eea]">
                  {products.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  只REITs产品
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#764ba2]/10 to-[#764ba2]/5 border-[#764ba2]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  总发行规模
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#764ba2]">
                  {formatAmount(products.reduce((sum, p) => sum + (p.issue_amount || 0), 0))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  累计发行
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#ed8936]/10 to-[#ed8936]/5 border-[#ed8936]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  产权类
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#ed8936]">
                  {products.filter(p => p.fund_type === '产权类').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  只产品
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 border-[#10b981]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  经营权类
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#10b981]">
                  {products.filter(p => p.fund_type === '经营权类').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  只产品
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 数据来源说明 */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <BarChart3 className="w-4 h-4" />
                <span>
                  <strong>数据来源：</strong>
                  REITs产品信息来自中国证监会、沪深交易所、基金公司公告。
                  数据包含产品信息、资产信息、财务指标、运营数据、市场表现、投资者结构、分红历史、风险指标等八张表。
                  当前显示的是演示数据，如需使用真实数据，请按照 <strong>REITS_DATABASE_SETUP.md</strong> 文档初始化数据库。
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 搜索栏 */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索基金代码、产品名称、管理人..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]"
                  />
                </div>
                <Button variant="outline" onClick={() => setSearchKeyword('')}>
                  <Filter className="w-4 h-4 mr-2" />
                  清除
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 八张表Tab切换 */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={selectedTable} onValueChange={setSelectedTable} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1">
                  {REIT_TABLES.slice(0, 4).map((table) => (
                    <TabsTrigger
                      key={table.id}
                      value={table.id}
                      className="data-[state=active]:bg-[#667eea] data-[state=active]:text-white"
                    >
                      <table.icon className="w-4 h-4 mr-2" />
                      {table.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1 mt-1">
                  {REIT_TABLES.slice(4).map((table) => (
                    <TabsTrigger
                      key={table.id}
                      value={table.id}
                      className="data-[state=active]:bg-[#667eea] data-[state=active]:text-white"
                    >
                      <table.icon className="w-4 h-4 mr-2" />
                      {table.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* 产品信息表 */}
                <TabsContent value="product" className="p-6">
                  <REITProductTable products={filteredProducts} />
                </TabsContent>

                {/* 其他表格占位 */}
                {['property', 'financial', 'operational', 'market', 'investor', 'dividend', 'risk'].map(tableId => (
                  <TabsContent key={tableId} value={tableId} className="p-6">
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <Building2 className="w-16 h-16 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        {REIT_TABLES.find(t => t.id === tableId)?.name}
                      </h3>
                      <p>该功能正在开发中...</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// 产品信息表格组件
function REITProductTable({ products }: { products: any[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Search className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          暂无数据
        </h3>
        <p>请检查搜索条件或联系管理员</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="font-bold whitespace-nowrap">基金代码</TableHead>
            <TableHead className="font-bold whitespace-nowrap">产品名称</TableHead>
            <TableHead className="font-bold whitespace-nowrap">产品类型</TableHead>
            <TableHead className="font-bold whitespace-nowrap">资产类型</TableHead>
            <TableHead className="font-bold whitespace-nowrap">基金管理人</TableHead>
            <TableHead className="font-bold whitespace-nowrap">发行日期</TableHead>
            <TableHead className="font-bold whitespace-nowrap">发行价格</TableHead>
            <TableHead className="font-bold whitespace-nowrap">发行规模</TableHead>
            <TableHead className="font-bold whitespace-nowrap">基金份额</TableHead>
            <TableHead className="font-bold whitespace-nowrap">管理费率</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.fund_code} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <TableCell className="font-medium whitespace-nowrap">{product.fund_code}</TableCell>
              <TableCell className="min-w-[200px]">
                <div>
                  <div className="font-medium">{product.fund_short_name || product.fund_name}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{product.fund_name}</div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge 
                  variant={product.fund_type === '产权类' ? 'default' : 'secondary'}
                  className={product.fund_type === '产权类' ? 'bg-[#667eea] text-white' : ''}
                >
                  {product.fund_type}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">{product.asset_type}</TableCell>
              <TableCell className="whitespace-nowrap">{product.manager_name}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(product.issue_date)}</TableCell>
              <TableCell className="font-medium whitespace-nowrap">{product.issue_price.toFixed(2)}元</TableCell>
              <TableCell className="font-medium text-[#667eea] whitespace-nowrap">{formatAmount(product.issue_amount)}</TableCell>
              <TableCell className="font-medium whitespace-nowrap">{product.fund_shares.toFixed(2)}亿份</TableCell>
              <TableCell className="whitespace-nowrap">{formatRate(product.management_fee_rate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatAmount(amount: number) {
  return `${amount.toFixed(2)}亿元`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

function formatRate(rate: number) {
  return `${(rate * 100).toFixed(2)}%`;
}
