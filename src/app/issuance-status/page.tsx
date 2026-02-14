'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProjectBBS, { Comment } from '@/components/ProjectBBS';
import {
  Building,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  XCircle,
  PauseCircle,
} from 'lucide-react';
import { getIssuanceProjects } from '@/lib/data/real-issuance-projects';

// 产品状态枚举
type ProductStatus =
  | '已受理'
  | '已反馈'
  | '通过'
  | '上市/挂牌'
  | '中止'
  | '终止';

// 产品类型
type ProductType = 'REITs' | 'ABS';

// 产品接口
interface IssuanceProduct {
  id: string;
  code: string;
  name: string;
  type: ProductType;
  status: ProductStatus;
  applyDate: string;
  statusDate: string;
  issuer: string;
  assetType: string;
  issueScale: number;
  planManager: string;
  description: string;
  comments: Comment[];
}

// 状态进度映射
const statusProgressMap: Record<ProductStatus, number> = {
  '已受理': 10,
  '已反馈': 30,
  '通过': 70,
  '上市/挂牌': 100,
  '中止': 0,
  '终止': 0,
};

export default function IssuanceStatusPage() {
  const [reitsProducts, setReitsProducts] = useState<IssuanceProduct[]>([]);
  const [absProducts, setAbsProducts] = useState<IssuanceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // 从真实数据加载
  useEffect(() => {
    const loadRealData = async () => {
      try {
        const projects = await getIssuanceProjects();

        // 分离REITs和ABS
        const reitsData = projects
          .filter(p => p.type === 'REITs')
          .map(p => ({
            ...p,
            comments: [], // 初始无评论
          }));

        const absData = projects
          .filter(p => p.type === 'ABS')
          .map(p => ({
            ...p,
            comments: [], // 初始无评论
          }));

        setReitsProducts(reitsData);
        setAbsProducts(absData);
      } catch (error) {
        console.error('加载真实数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRealData();
  }, []);

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
      projectId,
      projectType: reitsProducts.find(p => p.id === projectId)?.type || 'ABS',
    };

    setReitsProducts(prev => prev.map(p =>
      p.id === projectId ? { ...p, comments: [newComment, ...p.comments] } : p
    ));
    setAbsProducts(prev => prev.map(p =>
      p.id === projectId ? { ...p, comments: [newComment, ...p.comments] } : p
    ));
  };

  // 处理回复评论
  const handleReplyComment = (commentId: string, content: string) => {
    console.log('Reply to comment:', commentId, content);
  };

  // 处理点赞评论
  const handleLikeComment = (commentId: string) => {
    console.log('Like comment:', commentId);
  };

  // 获取状态颜色
  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case '已受理':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '已反馈':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '通过':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case '上市/挂牌':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '中止':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case '终止':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: ProductStatus) => {
    switch (status) {
      case '已受理': return <FileText className="w-4 h-4" />;
      case '已反馈': return <AlertCircle className="w-4 h-4" />;
      case '通过': return <CheckCircle className="w-4 h-4" />;
      case '上市/挂牌': return <TrendingUp className="w-4 h-4" />;
      case '中止': return <PauseCircle className="w-4 h-4" />;
      case '终止': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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

  // 获取进度
  const getProgress = (status: ProductStatus) => {
    return statusProgressMap[status] || 0;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载真实数据中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            发行状态跟踪
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时跟踪REITs和ABS产品从申请到上市的全过程
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <Badge variant="outline" className="text-xs">
              <Building className="w-3 h-3 mr-1" />
              REITs产品: {reitsProducts.length}个
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Briefcase className="w-3 h-3 mr-1" />
              ABS产品: {absProducts.length}个
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* REITs产品列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                REITs产品发行状态
              </CardTitle>
              <CardDescription>
                显示从受理到上市/挂牌的REITs产品（实时数据）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[800px]">
                <div className="space-y-4 pb-2">
                  {reitsProducts.map((product) => (
                    <div key={product.id}>
                      {/* 产品信息卡片 */}
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          {/* 标题和状态 */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                代码: {product.code}
                              </p>
                            </div>
                            <Badge className={getStatusColor(product.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(product.status)}
                                {product.status}
                              </span>
                            </Badge>
                          </div>

                          {/* 进度条 */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>发行进度</span>
                              <span>{getProgress(product.status)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getProgress(product.status)}%` }}
                              />
                            </div>
                          </div>

                          {/* 基本信息 */}
                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <FileText className="w-3 h-3" />
                              <span>受理日期: {formatDate(product.applyDate)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <TrendingUp className="w-3 h-3" />
                              <span>规模: {formatAmount(product.issueScale)}</span>
                            </div>
                          </div>

                          {/* 发起人和计划管理人 */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">发起人:</span> {product.issuer}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">计划管理人:</span> {product.planManager}
                            </p>
                          </div>

                          {/* 资产类型 */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              底层资产类型:
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {product.assetType}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* BBS讨论区 */}
                      <ProjectBBS
                        projectId={product.id}
                        projectType={product.type}
                        projectName={product.name}
                        comments={product.comments}
                        onAddComment={handleAddComment}
                        onReplyComment={handleReplyComment}
                        onLikeComment={handleLikeComment}
                      />
                    </div>
                  ))}
                  {reitsProducts.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      <Building className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无REITs产品</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* ABS产品列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                ABS产品发行状态
              </CardTitle>
              <CardDescription>
                显示从受理到上市/挂牌的ABS产品（实时数据）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[800px]">
                <div className="space-y-4 pb-2">
                  {absProducts.map((product) => (
                    <div key={product.id}>
                      {/* 产品信息卡片 */}
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          {/* 标题和状态 */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                代码: {product.code}
                              </p>
                            </div>
                            <Badge className={getStatusColor(product.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(product.status)}
                                {product.status}
                              </span>
                            </Badge>
                          </div>

                          {/* 进度条 */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>发行进度</span>
                              <span>{getProgress(product.status)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getProgress(product.status)}%` }}
                              />
                            </div>
                          </div>

                          {/* 基本信息 */}
                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <FileText className="w-3 h-3" />
                              <span>受理日期: {formatDate(product.applyDate)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <TrendingUp className="w-3 h-3" />
                              <span>规模: {formatAmount(product.issueScale)}</span>
                            </div>
                          </div>

                          {/* 发起人和计划管理人 */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">发起人:</span> {product.issuer}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">计划管理人:</span> {product.planManager}
                            </p>
                          </div>

                          {/* 资产类型 */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              底层资产类型:
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {product.assetType}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* BBS讨论区 */}
                      <ProjectBBS
                        projectId={product.id}
                        projectType={product.type}
                        projectName={product.name}
                        comments={product.comments}
                        onAddComment={handleAddComment}
                        onReplyComment={handleReplyComment}
                        onLikeComment={handleLikeComment}
                      />
                    </div>
                  ))}
                  {absProducts.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无ABS产品</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
