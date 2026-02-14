'use client';
import ProjectBBS from "@/components/ProjectBBS";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Share2,
  AlertTriangle,
  Info,
  PieChart,
  BarChart3,
  Shield,
  Layers,
  Building,
  CheckCircle,
  Clock,
} from 'lucide-react';

export default function ABSDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - 实际应该从API获取
  const projectData = {
    name: '招商银行2024年第一期信贷资产支持证券',
    code: '24招银1A',
    initiator: '招商银行股份有限公司',
    manager: '招商证券股份有限公司',
    ratingAgency: '联合资信评估股份有限公司',
    issuePlace: '银行间市场',
    status: '存续期',
    productType: 'CLO',
    issueDate: '2024-01-18',
    maturityDate: '2029-05-18',
    issueScale: 85.6,
    securityStructure: [
      { name: '优先A-1档', amount: 35.5, percentage: 41.5, rating: 'AAA', rate: 3.58, status: '正常偿付' },
      { name: '优先A-2档', amount: 28.2, percentage: 32.9, rating: 'AAA', rate: 3.62, status: '正常偿付' },
      { name: '优先B档', amount: 12.5, percentage: 14.6, rating: 'AA+', rate: 3.85, status: '正常偿付' },
      { name: '次级档', amount: 9.4, percentage: 11.0, rating: '无评级', rate: 0, status: '正常偿付' },
    ],
    assets: {
      totalAssets: 95.8,
      assetCount: 256,
      averageYield: 4.65,
      overdueRate: 0.85,
      defaultRate: 0.32,
      distribution: [
        { type: '制造业', amount: 38.5, percentage: 40.2, count: 95 },
        { type: '批发零售业', amount: 22.3, percentage: 23.3, count: 68 },
        { type: '房地产业', amount: 15.2, percentage: 15.9, count: 42 },
        { type: '交通运输业', amount: 12.8, percentage: 13.4, count: 35 },
        { type: '其他', amount: 7.0, percentage: 7.2, count: 16 },
      ],
    },
    creditEnhancement: [
      { type: '超额抵押', detail: '资产池规模95.8亿元，证券发行规模85.6亿元，超额抵押率11.9%', level: 'high' },
      { type: '优先/次级结构', detail: '次级档占比11.0%，为优先档提供信用支持', level: 'high' },
      { type: '信用增级', detail: '原始权益人对证券提供信用增级支持', level: 'medium' },
    ],
    paymentSchedule: [
      { period: '第一期', date: '2024-04-18', principal: 8.56, interest: 1.52, total: 10.08, status: '已完成' },
      { period: '第二期', date: '2024-07-18', principal: 8.56, interest: 1.48, total: 10.04, status: '已完成' },
      { period: '第三期', date: '2024-10-18', principal: 8.56, interest: 1.45, total: 10.01, status: '已完成' },
      { period: '第四期', date: '2025-01-18', principal: 8.56, interest: 1.42, total: 9.98, status: '待偿付' },
      { period: '第五期', date: '2025-04-18', principal: 8.56, interest: 1.38, total: 9.94, status: '未到期' },
      { period: '第六期', date: '2025-07-18', principal: 8.56, interest: 1.35, total: 9.91, status: '未到期' },
    ],
    riskFactors: [
      '借款人信用风险：部分借款人可能因经营不善导致无法按时偿还贷款',
      '资产集中度风险：前十大借款人占比38.5%，存在一定的集中度风险',
      '宏观经济风险：经济下行可能导致资产池整体违约率上升',
      '利率风险：市场利率上升可能影响产品吸引力',
      '流动性风险：次级档流动性较差，可能面临折价风险',
    ],
    documents: [
      { name: '募集说明书', date: '2024-01-10', size: '18.5MB' },
      { name: '信用评级报告', date: '2024-01-08', size: '12.3MB' },
      { name: '法律意见书', date: '2024-01-05', size: '9.8MB' },
      { name: '资产评估报告', date: '2024-01-06', size: '25.6MB' },
      { name: '现金流压力测试报告', date: '2024-01-07', size: '8.2MB' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/issued-abs')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#764ba2] to-[#667eea] flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
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
        {/* Summary Card */}
        <Card className="mb-6 border-2 border-[#764ba2]/20 bg-gradient-to-br from-[#764ba2]/5 to-[#667eea]/5">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">发行规模</div>
                <div className="text-3xl font-bold text-[#764ba2]">{projectData.issueScale}</div>
                <div className="text-sm text-muted-foreground">亿元</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">优先档利率</div>
                <div className="text-3xl font-bold text-[#667eea]">3.58%</div>
                <div className="text-sm text-muted-foreground">平均</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">次级档占比</div>
                <div className="text-3xl font-bold text-[#48bb78]">
                  {projectData.securityStructure[3].percentage}%
                </div>
                <div className="text-sm text-muted-foreground">信用增级</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">资产池规模</div>
                <div className="text-3xl font-bold">{projectData.assets.totalAssets}</div>
                <div className="text-sm text-muted-foreground">亿元</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">存续期收益率</div>
                <div className="text-3xl font-bold text-[#48bb78]">3.85%</div>
                <div className="text-sm text-muted-foreground">优先A档</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-900">
            <TabsTrigger value="overview">项目概览</TabsTrigger>
            <TabsTrigger value="structure">证券结构</TabsTrigger>
            <TabsTrigger value="assets">基础资产</TabsTrigger>
            <TabsTrigger value="payment">偿付安排</TabsTrigger>
            <TabsTrigger value="documents">相关文档</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="mr-2 h-5 w-5 text-[#764ba2]" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">项目名称</div>
                      <div className="font-semibold text-sm">{projectData.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">项目代码</div>
                      <div className="font-semibold">{projectData.code}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">发起机构</div>
                      <div className="font-semibold text-sm">{projectData.initiator}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">计划管理人</div>
                      <div className="font-semibold text-sm">{projectData.manager}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">评级机构</div>
                      <div className="font-semibold text-sm">{projectData.ratingAgency}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">产品类型</div>
                      <Badge variant="outline">{projectData.productType}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">发行场所</div>
                      <Badge className="bg-[#764ba2] text-white">{projectData.issuePlace}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">当前状态</div>
                      <Badge className="bg-[#48bb78] text-white">{projectData.status}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">发行日期</div>
                      <div className="font-semibold flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {projectData.issueDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">到期日期</div>
                      <div className="font-semibold flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {projectData.maturityDate}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-[#764ba2]" />
                    证券结构概览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectData.securityStructure.map((security, index) => (
                      <div key={index} className="p-4 rounded-lg border hover:border-[#764ba2] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: ['#667eea', '#764ba2', '#48bb78', '#ed8936'][index],
                              }}
                            ></div>
                            <span className="font-semibold">{security.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={index === 3 ? 'bg-gray-500 text-white' : 'bg-[#48bb78] text-white'}>
                              {security.rating}
                            </Badge>
                            <Badge variant="outline">{security.percentage}%</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <div className="text-sm text-muted-foreground">金额</div>
                            <div className="font-semibold">{security.amount} 亿元</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">利率</div>
                            <div className="font-semibold">{security.rate}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">状态</div>
                            <div className="font-semibold text-[#48bb78] flex items-center">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              {security.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Credit Enhancement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-[#764ba2]" />
                  增信措施
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projectData.creditEnhancement.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        item.level === 'high'
                          ? 'border-[#48bb78]/30 bg-gradient-to-br from-[#48bb78]/10 to-[#48bb78]/5'
                          : 'border-[#ed8936]/30 bg-gradient-to-br from-[#ed8936]/10 to-[#ed8936]/5'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <Shield className={`mr-2 h-5 w-5 ${item.level === 'high' ? 'text-[#48bb78]' : 'text-[#ed8936]'}`} />
                        <span className="font-semibold">{item.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-[#764ba2]" />
                  证券层级结构
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Structure Chart */}
                  <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-16 w-16 mx-auto mb-3 opacity-50" />
                      <p>证券结构瀑布图</p>
                      <p className="text-sm">（可集成ECharts或Recharts）</p>
                    </div>
                  </div>

                  {/* Structure Details */}
                  <div className="space-y-3">
                    {projectData.securityStructure.map((security, index) => (
                      <div key={index} className="p-4 rounded-lg border-2 hover:border-[#764ba2] transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: ['#667eea', '#764ba2', '#48bb78', '#ed8936'][index],
                              }}
                            ></div>
                            <span className="font-semibold text-lg">{security.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={index === 3 ? 'bg-gray-500 text-white' : 'bg-[#48bb78] text-white'}>
                              {security.rating}
                            </Badge>
                            <Badge variant="outline">{security.percentage}%</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">发行金额</div>
                            <div className="text-xl font-bold">{security.amount} 亿元</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">票面利率</div>
                            <div className="text-xl font-bold">{security.rate}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">偿付顺序</div>
                            <div className="text-xl font-bold">{index + 1}</div>
                          </div>
                        </div>
                        <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${security.percentage}%`,
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
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">资产池总规模</div>
                  <div className="text-2xl font-bold text-[#764ba2]">{projectData.assets.totalAssets} 亿元</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">资产笔数</div>
                  <div className="text-2xl font-bold">{projectData.assets.assetCount} 笔</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">平均收益率</div>
                  <div className="text-2xl font-bold text-[#48bb78]">{projectData.assets.averageYield}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">逾期率</div>
                  <div className="text-2xl font-bold text-[#ed8936]">{projectData.assets.overdueRate}%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-[#764ba2]" />
                  资产分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <PieChart className="h-16 w-16 mx-auto mb-3 opacity-50" />
                      <p>资产分布饼图</p>
                      <p className="text-sm">（可集成ECharts或Recharts）</p>
                    </div>
                  </div>

                  {/* Distribution Details */}
                  <div className="space-y-3">
                    {projectData.assets.distribution.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg border hover:border-[#764ba2] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565'][index],
                              }}
                            ></div>
                            <span className="font-semibold">{item.type}</span>
                          </div>
                          <Badge variant="outline">{item.percentage}%</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">金额</div>
                            <div className="font-semibold">{item.amount} 亿元</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">笔数</div>
                            <div className="font-semibold">{item.count} 笔</div>
                          </div>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565'][index],
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  风险提示
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectData.riskFactors.map((risk, index) => (
                    <div key={index} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500">
                      <p className="text-sm">{risk}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-[#764ba2]" />
                  偿付计划
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">期数</th>
                        <th className="text-left py-3 px-4">偿付日期</th>
                        <th className="text-right py-3 px-4">本金（亿元）</th>
                        <th className="text-right py-3 px-4">利息（亿元）</th>
                        <th className="text-right py-3 px-4">合计（亿元）</th>
                        <th className="text-center py-3 px-4">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectData.paymentSchedule.map((payment, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-4 px-4 font-semibold">{payment.period}</td>
                          <td className="py-4 px-4">{payment.date}</td>
                          <td className="py-4 px-4 text-right">{payment.principal.toFixed(2)}</td>
                          <td className="py-4 px-4 text-right">{payment.interest.toFixed(2)}</td>
                          <td className="py-4 px-4 text-right font-semibold">{payment.total.toFixed(2)}</td>
                          <td className="py-4 px-4 text-center">
                            {payment.status === '已完成' ? (
                              <Badge className="bg-[#48bb78] text-white flex items-center justify-center w-20">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                已完成
                              </Badge>
                            ) : payment.status === '待偿付' ? (
                              <Badge className="bg-[#ed8936] text-white flex items-center justify-center w-20">
                                <Clock className="mr-1 h-3 w-3" />
                                待偿付
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center justify-center w-20">
                                未到期
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-[#764ba2]" />
                  相关文档
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectData.documents.map((doc, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:border-[#764ba2] transition-colors flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#764ba2] to-[#667eea] flex items-center justify-center">
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
          projectType="ABS"
          projectName={projectData.name}
          comments={[]}
        />
      </div>
    </div>
  );
}
