'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectBBS, { Comment } from '@/components/ProjectBBS';
import { getABSDetail } from '@/lib/services/simple-real-data-service';
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Share2,
  Info,
  RefreshCw,
} from 'lucide-react';

export default function ABSDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);

  // 加载真实数据
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getABSDetail(code);

      if (data) {
        setProjectData(data);
        setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
      } else {
        console.error('未找到ABS产品');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [code]);

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
      projectType: 'ABS',
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
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            未找到ABS产品
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            代码: {code}
          </p>
          <Button onClick={() => router.push('/issued-abs')}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

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
        {/* 票面利率卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              产品信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">票面利率</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {projectData.couponRate.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">发行规模</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatAmount(projectData.issueScale)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">期限</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {projectData.term}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">信用评级</p>
                <Badge variant="outline" className="text-base font-semibold">
                  {projectData.rating}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">项目概况</TabsTrigger>
            <TabsTrigger value="assets">底层资产</TabsTrigger>
            <TabsTrigger value="documents">相关文档</TabsTrigger>
            <TabsTrigger value="discussion">讨论交流</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 基本信息 */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-purple-600" />
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">计划管理人</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {projectData.planManager}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">发行日期</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {projectData.issueDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">信用评级</p>
                        <Badge variant="outline">{projectData.rating}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
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
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Info className="w-5 h-5" />
                      风险提示
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>投资ABS产品存在信用风险，底层资产质量直接影响产品收益</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>ABS产品流动性相对较低，可能存在变现困难</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>投资者应根据自身风险承受能力，理性投资</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* 右侧信息 */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">数据来源</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600 dark:text-gray-400">中国证券业协会</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600 dark:text-gray-400">沪深交易所</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">快捷操作</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      下载说明书
                    </Button>
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  底层资产详情
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectData.underlyingAssets.map((asset: string, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {asset}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        该ABS产品的基础资产类型
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  相关文档
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">发行说明书</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">PDF文档</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">法律意见书</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">PDF文档</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">信用评级报告</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">PDF文档</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussion">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-purple-600" />
                  讨论交流
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectBBS
                  projectId={projectData.id}
                  projectType="ABS"
                  projectName={projectData.name}
                  comments={comments}
                  onAddComment={handleAddComment}
                  onReplyComment={handleReplyComment}
                  onLikeComment={handleLikeComment}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
