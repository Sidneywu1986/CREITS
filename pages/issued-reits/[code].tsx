'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/ui/tabs';
import ProjectBBS, { Comment } from '../../src/components/ProjectBBS';
import DraggableFloatingWindow from '../../src/components/common/DraggableFloatingWindow';
import FloatingValuationCalculator from '../../src/components/reits/FloatingValuationCalculator';
import AnnouncementQuery from '../../src/components/reits/AnnouncementQuery';
import LocationAnalysis from '../../src/components/reits/LocationAnalysis';
import REITsEightTables from '../../src/components/reits/REITsEightTables';
import { getREITsDetail } from '../../src/lib/services/simple-real-data-service';
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
  RefreshCw,
  ArrowUpRight,
  Activity,
  Calculator,
} from 'lucide-react';

export default function REITsDetailPage() {
  const router = useRouter();
  const code = router.query.code as string;

  console.log('=== Component rendered ===');
  console.log('Router query:', router.query);
  console.log('Code from query:', code);

  const [activeTab, setActiveTab] = useState('overview');
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [showValuationCalculator, setShowValuationCalculator] = useState(false);

  // 加载真实数据
  const loadData = useCallback(async () => {
    try {
      if (!code) return;

      setLoading(true);
      console.log('正在加载REITs详情，代码:', code);
      const data = await getREITsDetail(code);

      if (data) {
        setProjectData(data);
        setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
        console.log('数据加载成功:', data);
      } else {
        console.error('未找到REITs产品，代码:', code);
        setProjectData(null);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      setProjectData(null);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    console.log('=== useEffect triggered ===');
    console.log('code value:', code);
    
    // 从 URL 参数获取 code 后加载的数据
    if (code) {
      console.log('开始加载数据，code:', code);
      loadData();
    }
  }, [code, loadData]);

  // 处理添加评论
  const handleAddComment = (projectId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'current-user',
      userName: '当前用户',
      content,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: [],
      projectId: projectData?.id || '',
      projectType: 'REITs',
    };
    setComments([newComment, ...comments]);
  };

  // 处理回复评论
  const handleReplyComment = (commentId: string, content: string) => {
    console.log('Reply to comment:', commentId, content);
  };

  // 处理点赞评论
  const handleLikeComment = (commentId: string) => {
    console.log('Like comment:', commentId);
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿元`;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 获取涨跌颜色
  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600 dark:text-red-400';
    if (change < 0) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // 获取涨跌图标
  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  if (!code) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            参数错误
          </h2>
          <Button onClick={() => router.push('/issued-reits')}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载真实数据中...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            未找到REITs产品
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            代码: {code}
          </p>
          <Button onClick={() => router.push('/issued-reits')}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const quote = projectData.quote;

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
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {projectData.name}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                代码: {projectData.code}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              {countdown}s 后自动刷新
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              1分钟/次
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              更新: {lastUpdate}
            </Badge>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 实时行情卡片 */}
        {quote && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                实时行情（来源：新浪财经）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最新价</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {quote.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">涨跌</p>
                  <p className={`text-2xl font-bold flex items-center gap-1 ${getPriceChangeColor(quote.change)}`}>
                    {getPriceChangeIcon(quote.change)}
                    {quote.change > 0 ? '+' : ''}{quote.change.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">涨跌幅</p>
                  <p className={`text-2xl font-bold ${getPriceChangeColor(quote.changePercent)}`}>
                    {quote.changePercent > 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">今开</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {quote.open.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最高</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {quote.high.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最低</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {quote.low.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 主要内容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="overview">项目概况</TabsTrigger>
            <TabsTrigger value="assets">REITs八张表</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 基本信息 */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      基本信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">产品全称</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {projectData.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">产品代码</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {projectData.code}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">发起人</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {projectData.issuer}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">资产类型</p>
                        <Badge variant="outline">{projectData.assetType}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">发行日期</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(projectData.issueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">上市日期</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(projectData.listingDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">发行规模</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatAmount(projectData.issueScale)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">发行价格</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {projectData.issuePrice.toFixed(2)}元
                        </p>
                      </div>
                    </div>
                    {/* 估值计算器按钮 */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => setShowValuationCalculator(true)}
                        className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#667eea]/90 hover:to-[#764ba2]/90"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        REITs估值计算器
                      </Button>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                        点击打开独立浮窗估值计算器，进行综合估值分析
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      项目描述
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {projectData.description}
                    </p>
                  </CardContent>
                </Card>

                {/* 风险提示 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      风险提示
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>投资REITs产品存在市场风险，价格可能受宏观经济、市场情绪等因素影响而波动</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>底层资产的收益和现金流可能受到行业周期、政策变化等因素影响</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>投资者应根据自身风险承受能力，理性投资</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* 讨论交流 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      讨论交流
                    </CardTitle>
                    <CardDescription>参与该产品的讨论和交流</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectBBS
                      projectId={projectData.id}
                      projectType="REITs"
                      projectName={projectData.name}
                      comments={comments}
                      onAddComment={handleAddComment}
                      onReplyComment={handleReplyComment}
                      onLikeComment={handleLikeComment}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 右侧信息 */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-blue-600" />
                      底层资产
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {projectData.assets.map((asset: string, index: number) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {asset}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          该项目的基础资产之一
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      相关文档
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 发行期文档 */}
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">发行期文档</h4>
                        </div>
                        <Badge variant="outline" className="text-xs">6份</Badge>
                      </div>
                      <div className="space-y-2 ml-6 max-h-[280px] overflow-y-auto pr-2">
                        <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer bg-gray-50 dark:bg-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900 flex items-center justify-center">
                              <FileText className="w-3 h-3 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-xs">发起人承诺函</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">2021-05-15</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-xs">专项计划说明书</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">2021-05-20</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-xs">法律意见书</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">2021-05-25</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                              <FileText className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-xs">评级报告</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">2021-05-28</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <FileText className="w-3 h-3 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-xs">审计报告</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">2021-05-30</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                              <FileText className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-xs">资产评估报告</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">2021-06-01</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 运营期文档 */}
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">运营期文档</h4>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs text-blue-600 hover:text-blue-700 p-0"
                          onClick={() => window.open(`/issued-reits/${projectData?.code}/documents`, '_blank')}
                        >
                          查看全部
                          <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                      <div className="space-y-3 ml-6 max-h-[280px] overflow-y-auto pr-2">
                        {/* 2024年 */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">2024年</Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <FileText className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">2024年第一季度报告</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">2024-04-30</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Download className="w-2.5 h-2.5" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <FileText className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">2024年半年度报告</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">2024-08-31</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Download className="w-2.5 h-2.5" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <FileText className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">2024年第三季度报告</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">2024-10-31</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Download className="w-2.5 h-2.5" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                  <FileText className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">2024年年度报告</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">2025-04-30</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Download className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* 2023年 */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">2023年</Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <FileText className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">2023年半年度报告</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">2023-08-31</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Download className="w-2.5 h-2.5" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                  <FileText className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">2023年年度报告</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">2024-04-30</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Download className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* 2022年 */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">2022年</Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <FileText className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">2022年半年度报告</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">2022-08-31</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Download className="w-2.5 h-2.5" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                  <FileText className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">2022年年度报告</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">2023-04-30</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Download className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">快捷操作</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      分享产品
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" onClick={loadData}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      刷新数据
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">数据来源</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600 dark:text-gray-400">上海/深圳证券交易所</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600 dark:text-gray-400">新浪财经API（免费）</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 交易所公告查询 */}
                <AnnouncementQuery
                  code={projectData.code}
                  name={projectData.name}
                />

                {/* 地理位置分析 */}
                <LocationAnalysis
                  address={projectData.location}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets">
            <REITsEightTables
              reitCode={projectData.code}
              reitName={projectData.name}
            />
          </TabsContent>
        </Tabs>

        {/* 浮窗估值计算器 */}
        {showValuationCalculator && (
          <DraggableFloatingWindow
            isOpen={showValuationCalculator}
            onClose={() => setShowValuationCalculator(false)}
            title="REITs估值计算器"
            initialPosition={{ x: 100, y: 100 }}
            initialSize={{ width: 500, height: 600 }}
            minSize={{ width: 400, height: 500 }}
            maxSize={{ width: 800, height: 800 }}
          >
            <FloatingValuationCalculator
              reitsName={projectData.name}
              reitsCode={projectData.code}
              currentPrice={quote?.price || projectData.issuePrice}
              annualDistribution={0}
            />
          </DraggableFloatingWindow>
        )}
      </div>
    </div>
  );
}
