'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectBBS, { Comment } from '@/components/ProjectBBS';
import {
  ArrowLeft,
  Building,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  Download,
  Share2,
  AlertTriangle,
  Info,
  PieChart,
  BarChart3,
} from 'lucide-react';

export default function REITsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - 实际应该从API获取
  const projectData = {
    name: '沪杭甬高速REIT',
    code: '508000',
    exchange: '上海证券交易所',
    status: '上市交易',
    assetType: '交通基础设施',
    location: '上海',
    issueDate: '2024-11-15',
    listingDate: '2024-11-20',
    issueScale: 58.2,
    issuePrice: 6.88,
    annualYield: 4.35,
    currentPrice: 6.96,
    priceChange: 1.16,
    priceChangePercent: 1.16,
    marketCap: 40.05,
    turnoverRate: 2.35,
    peRatio: 18.5,
    assets: [
      { name: '沪杭高速杭州段', value: 22.5, percentage: 38.7 },
      { name: '杭甬高速宁波段', value: 18.2, percentage: 31.3 },
      { name: '杭宁高速湖州段', value: 10.8, percentage: 18.6 },
      { name: '其他配套设施', value: 6.7, percentage: 11.4 },
    ],
    financialData: {
      totalRevenue: 12.56,
      netProfit: 5.82,
      operatingIncome: 8.35,
      totalAssets: 156.8,
      totalLiabilities: 45.2,
      equity: 111.6,
    },
    riskFactors: [
      '高速公路交通流量受宏观经济影响较大',
      '资产集中度较高，区域风险不容忽视',
      '收费政策调整可能影响项目收益',
      '市场竞争加剧可能导致费率下降',
    ],
    documents: [
      { name: '招募说明书', date: '2024-10-28', size: '15.2MB' },
      { name: '法律意见书', date: '2024-10-25', size: '8.5MB' },
      { name: '资产评估报告', date: '2024-10-20', size: '22.8MB' },
      { name: '信用评级报告', date: '2024-10-22', size: '5.6MB' },
      { name: '年度财务报告', date: '2024-01-10', size: '12.3MB' },
    ],
  };

  const priceHistory = [
    { date: '2024-11-20', price: 6.88 },
    { date: '2024-11-21', price: 6.92 },
    { date: '2024-11-22', price: 6.85 },
    { date: '2024-11-25', price: 6.90 },
    { date: '2024-11-26', price: 6.96 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/issued-reits')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{projectData.name}</h1>
              <p className="text-xs text-muted-foreground">代码: {projectData.code}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              分享
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Price Card */}
        <Card className="mb-6 border-2 border-[#667eea]/20 bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">当前价格</div>
                <div className="text-3xl font-bold text-[#667eea]">{projectData.currentPrice}</div>
                <div className={`text-sm font-semibold ${projectData.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {projectData.priceChange >= 0 ? '+' : ''}{projectData.priceChangePercent}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">发行价格</div>
                <div className="text-2xl font-semibold">{projectData.issuePrice}</div>
                <div className="text-sm text-muted-foreground">元/份</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">年化收益率</div>
                <div className="text-2xl font-semibold text-[#48bb78]">{projectData.annualYield}%</div>
                <div className="text-sm text-muted-foreground">年度化收益</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">发行规模</div>
                <div className="text-2xl font-semibold">{projectData.issueScale}</div>
                <div className="text-sm text-muted-foreground">亿元</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">总市值</div>
                <div className="text-2xl font-semibold">{projectData.marketCap}</div>
                <div className="text-sm text-muted-foreground">亿元</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">换手率</div>
                <div className="text-2xl font-semibold">{projectData.turnoverRate}%</div>
                <div className="text-sm text-muted-foreground">今日</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-900">
            <TabsTrigger value="overview">项目概览</TabsTrigger>
            <TabsTrigger value="assets">资产构成</TabsTrigger>
            <TabsTrigger value="financial">财务数据</TabsTrigger>
            <TabsTrigger value="risk">风险提示</TabsTrigger>
            <TabsTrigger value="documents">相关文档</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="mr-2 h-5 w-5 text-[#667eea]" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">项目名称</div>
                      <div className="font-semibold">{projectData.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">项目代码</div>
                      <div className="font-semibold">{projectData.code}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">交易所</div>
                      <div className="font-semibold">{projectData.exchange}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">当前状态</div>
                      <Badge className="bg-[#667eea] text-white">{projectData.status}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">资产类型</div>
                      <div className="font-semibold">{projectData.assetType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">所在地区</div>
                      <div className="font-semibold flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {projectData.location}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">发行日期</div>
                      <div className="font-semibold flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {projectData.issueDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">上市日期</div>
                      <div className="font-semibold flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {projectData.listingDate}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-[#667eea]" />
                    价格走势
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>价格走势图</p>
                      <p className="text-sm">（可集成ECharts或Recharts）</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {priceHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.date}</span>
                        <span className="font-semibold">¥{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-[#667eea]" />
                  业绩指标
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#667eea]/10 to-[#667eea]/5 border border-[#667eea]/20">
                    <div className="text-sm text-muted-foreground mb-1">近1月涨跌幅</div>
                    <div className="text-2xl font-bold text-[#667eea]">+2.15%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#764ba2]/10 to-[#764ba2]/5 border border-[#764ba2]/20">
                    <div className="text-sm text-muted-foreground mb-1">近3月涨跌幅</div>
                    <div className="text-2xl font-bold text-[#764ba2]">+5.68%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#48bb78]/10 to-[#48bb78]/5 border border-[#48bb78]/20">
                    <div className="text-sm text-muted-foreground mb-1">近6月涨跌幅</div>
                    <div className="text-2xl font-bold text-[#48bb78]">+8.52%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#ed8936]/10 to-[#ed8936]/5 border border-[#ed8936]/20">
                    <div className="text-sm text-muted-foreground mb-1">近1年涨跌幅</div>
                    <div className="text-2xl font-bold text-[#ed8936]">+12.35%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-[#667eea]" />
                  基础资产构成
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart Placeholder */}
                  <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <PieChart className="h-16 w-16 mx-auto mb-3 opacity-50" />
                      <p>资产构成饼图</p>
                      <p className="text-sm">（可集成ECharts或Recharts）</p>
                    </div>
                  </div>

                  {/* Asset Details */}
                  <div className="space-y-4">
                    {projectData.assets.map((asset, index) => (
                      <div key={index} className="p-4 rounded-lg border-2 hover:border-[#667eea] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-3"
                              style={{
                                backgroundColor: ['#667eea', '#764ba2', '#48bb78', '#ed8936'][index],
                              }}
                            ></div>
                            <span className="font-semibold">{asset.name}</span>
                          </div>
                          <Badge variant="outline">{asset.percentage}%</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">资产价值</span>
                          <span className="font-semibold">{asset.value} 亿元</span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${asset.percentage}%`,
                              backgroundColor: ['#667eea', '#764ba2', '#48bb78', '#ed8936'][index],
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>资产详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectData.assets.map((asset, index) => (
                    <div key={index} className="p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {['主要连接上海与杭州的高速公路段', '连接杭州与宁波的重要交通干线', '连接杭州与湖州的高速公路段', '包括服务区、收费站等配套设施'][index]}
                          </p>
                        </div>
                        <Badge className="bg-[#667eea] text-white">{asset.percentage}%</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">资产价值</div>
                          <div className="font-semibold">{asset.value} 亿元</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">运营年限</div>
                          <div className="font-semibold">{[15, 18, 12, 20][index]} 年</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">年收益</div>
                          <div className="font-semibold text-[#48bb78]">{[2.8, 2.3, 1.4, 0.8][index]} 亿元</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-[#667eea]" />
                    财务指标
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#667eea]/10 to-[#667eea]/5 border border-[#667eea]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">营业收入</span>
                      <span className="text-2xl font-bold text-[#667eea]">{projectData.financialData.totalRevenue} 亿元</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#48bb78]/10 to-[#48bb78]/5 border border-[#48bb78]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">净利润</span>
                      <span className="text-2xl font-bold text-[#48bb78]">{projectData.financialData.netProfit} 亿元</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#764ba2]/10 to-[#764ba2]/5 border border-[#764ba2]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">营业利润</span>
                      <span className="text-2xl font-bold text-[#764ba2]">{projectData.financialData.operatingIncome} 亿元</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#ed8936]/10 to-[#ed8936]/5 border border-[#ed8936]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">净利润率</span>
                      <span className="text-2xl font-bold text-[#ed8936]">
                        {((projectData.financialData.netProfit / projectData.financialData.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="mr-2 h-5 w-5 text-[#667eea]" />
                    资产负债结构
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>资产负债结构图</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-muted-foreground">总资产</span>
                      <span className="font-semibold">{projectData.financialData.totalAssets} 亿元</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-muted-foreground">总负债</span>
                      <span className="font-semibold">{projectData.financialData.totalLiabilities} 亿元</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-[#48bb78]/10 to-[#48bb78]/5 border border-[#48bb78]/20">
                      <span className="text-sm text-muted-foreground font-medium">净资产</span>
                      <span className="font-semibold text-[#48bb78]">{projectData.financialData.equity} 亿元</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-muted-foreground">资产负债率</span>
                      <span className="font-semibold">
                        {((projectData.financialData.totalLiabilities / projectData.financialData.totalAssets) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Tab */}
          <TabsContent value="risk" className="space-y-6">
            <Card className="border-2 border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  风险提示
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectData.riskFactors.map((risk, index) => (
                    <div key={index} className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm">{risk}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>投资提示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500">
                  <div className="font-semibold mb-2 flex items-center">
                    <Info className="mr-2 h-4 w-4" />
                    投资收益说明
                  </div>
                  <p className="text-sm text-muted-foreground">
                    本产品收益主要来源于基础资产的运营收入和资产增值，收益水平与基础资产运营情况密切相关，存在一定波动性。
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500">
                  <div className="font-semibold mb-2 flex items-center">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    风险缓释措施
                  </div>
                  <p className="text-sm text-muted-foreground">
                    项目采取超额抵押、优先级/次级结构化设计等措施，有效降低投资者风险，保障优先级证券持有人利益。
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500">
                  <div className="font-semibold mb-2 flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    信息披露
                  </div>
                  <p className="text-sm text-muted-foreground">
                    项目管理人将按照监管要求，定期披露项目运营情况和财务信息，投资者可通过交易所网站查询相关信息。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-[#667eea]" />
                  相关文档
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectData.documents.map((doc, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:border-[#667eea] transition-colors flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{doc.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>{doc.date}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        下载
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* BBS讨论区 */}
        <ProjectBBS
          projectId={projectData.code}
          projectType="REITs"
          projectName={projectData.name}
          comments={[]}
        />
      </div>
    </div>
  );
}
