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

// 产品状态枚举
type ProductStatus = 
  | '已受理' 
  | '已反馈' 
  | '通过' 
  | '上市/挂牌' 
  | '中止' 
  | '终止'
  | '已转移';

// 产品类型
type ProductType = 'REITs' | 'ABS';

// 产品接口
interface IssuanceProduct {
  id: string;
  type: ProductType;
  name: string;
  code: string;
  status: ProductStatus;
  applyDate: Date;
  feedbackDate?: Date;
  approvedDate?: Date;
  issueDate?: Date;
  transferDate?: Date;
  totalAmount: number;
  issuer: string;
  assets: string[];
  currentProgress: number;
  statusHistory: {
    status: ProductStatus;
    date: Date;
    description: string;
  }[];
  comments: Comment[];
}

export default function IssuanceStatusPage() {
  // 模拟评论数据
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({
    'REIT001': [
      {
        id: 'c1',
        userId: 'u1',
        userName: '投资分析师张三',
        content: '该项目的底层资产质量不错，科技园区的现金流稳定，值得关注。',
        timestamp: new Date(Date.now() - 3600000 * 2),
        likes: 5,
        isLiked: false,
        replies: [],
        projectId: 'REIT001',
        projectType: 'REITs',
      },
      {
        id: 'c2',
        userId: 'u2',
        userName: '合规专员李四',
        content: '已反馈阶段需要尽快补充材料，建议关注审核进度。',
        timestamp: new Date(Date.now() - 3600000),
        likes: 3,
        isLiked: false,
        replies: [
          {
            id: 'c2-r1',
            userId: 'u1',
            userName: '投资分析师张三',
            content: '同意，回复期只有30天，需要抓紧时间。',
            timestamp: new Date(Date.now() - 1800000),
            likes: 1,
            isLiked: false,
            replies: [],
            projectId: 'REIT001',
            projectType: 'REITs',
          }
        ],
        projectId: 'REIT001',
        projectType: 'REITs',
      }
    ],
    'REIT003': [
      {
        id: 'c3',
        userId: 'u3',
        userName: '基金经理王五',
        content: '已通过审核，预计很快就会发行，准备认购。',
        timestamp: new Date(Date.now() - 7200000),
        likes: 8,
        isLiked: false,
        replies: [],
        projectId: 'REIT003',
        projectType: 'REITs',
      }
    ],
    'ABS001': [
      {
        id: 'c4',
        userId: 'u4',
        userName: '风控经理赵六',
        content: '消费金融ABS的风险主要集中在底层资产质量，需要关注坏账率。',
        timestamp: new Date(Date.now() - 5400000),
        likes: 4,
        isLiked: false,
        replies: [],
        projectId: 'ABS001',
        projectType: 'ABS',
      }
    ]
  });

  // 模拟数据 - 实际应该从API获取
  const [reitsProducts, setReitsProducts] = useState<IssuanceProduct[]>([
    {
      id: 'REIT001',
      type: 'REITs',
      name: '北京科技园基础设施REIT',
      code: 'REIT.BJ.TECH',
      status: '已反馈',
      applyDate: new Date('2024-12-01'),
      feedbackDate: new Date('2024-12-20'),
      totalAmount: 5000000000,
      issuer: '北京科技园区开发有限公司',
      assets: ['研发办公楼', '产业配套公寓', '商业服务中心'],
      currentProgress: 30,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-12-01'),
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        },
        {
          status: '已反馈',
          date: new Date('2024-12-20'),
          description: '审核部门提出书面反馈意见'
        }
      ],
      comments: commentsMap['REIT001'] || []
    },
    {
      id: 'REIT002',
      type: 'REITs',
      name: '上海仓储物流REIT',
      code: 'REIT.SH.LOG',
      status: '已受理',
      applyDate: new Date('2024-12-25'),
      totalAmount: 3200000000,
      issuer: '上海物流集团股份有限公司',
      assets: ['智能仓储中心A区', '智能仓储中心B区'],
      currentProgress: 10,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-12-25'),
          description: '交易所对申报材料进行初核'
        }
      ],
      comments: commentsMap['REIT002'] || []
    },
    {
      id: 'REIT003',
      type: 'REITs',
      name: '深圳产业园REIT',
      code: 'REIT.SZ.IND',
      status: '通过',
      applyDate: new Date('2024-11-01'),
      approvedDate: new Date('2025-01-10'),
      totalAmount: 4500000000,
      issuer: '深圳产业投资控股集团',
      assets: ['高科技产业园A座', '高科技产业园B座', '研发中心'],
      currentProgress: 80,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-11-01'),
          description: '交易所对申报材料进行初核'
        },
        {
          status: '已反馈',
          date: new Date('2024-11-15'),
          description: '审核部门提出书面反馈意见'
        },
        {
          status: '通过',
          date: new Date('2025-01-10'),
          description: '经审核会议审议通过'
        }
      ],
      comments: commentsMap['REIT003'] || []
    }
  ]);

  const [absProducts, setAbsProducts] = useState<IssuanceProduct[]>([
    {
      id: 'ABS001',
      type: 'ABS',
      name: '消费金融ABS',
      code: 'ABS.CON.001',
      status: '已受理',
      applyDate: new Date('2024-12-20'),
      totalAmount: 1000000000,
      issuer: '消费金融股份有限公司',
      assets: ['个人消费贷款债权'],
      currentProgress: 10,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-12-20'),
          description: '交易所对申报材料进行初核'
        }
      ],
      comments: commentsMap['ABS001'] || []
    },
    {
      id: 'ABS002',
      type: 'ABS',
      name: '应收账款ABS',
      code: 'ABS.AR.002',
      status: '已反馈',
      applyDate: new Date('2024-12-05'),
      feedbackDate: new Date('2024-12-22'),
      totalAmount: 800000000,
      issuer: '供应链管理有限公司',
      assets: ['核心企业应收账款'],
      currentProgress: 25,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-12-05'),
          description: '交易所对申报材料进行初核'
        },
        {
          status: '已反馈',
          date: new Date('2024-12-22'),
          description: '审核部门提出书面反馈意见'
        }
      ],
      comments: []
    },
    {
      id: 'ABS003',
      type: 'ABS',
      name: '租赁债权ABS',
      code: 'ABS.LE.003',
      status: '通过',
      applyDate: new Date('2024-11-15'),
      approvedDate: new Date('2025-01-02'),
      totalAmount: 1500000000,
      issuer: '融资租赁有限公司',
      assets: ['设备租赁债权', '车辆租赁债权'],
      currentProgress: 85,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-11-15'),
          description: '交易所对申报材料进行初核'
        },
        {
          status: '通过',
          date: new Date('2025-01-02'),
          description: '经审核会议审议通过'
        }
      ],
      comments: []
    }
  ]);

  // 检查是否需要转移已上市满一个月的产品
  const checkTransferProducts = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 检查REITs产品
    setReitsProducts(prev => prev.map(product => {
      if (product.status === '上市/挂牌' && product.issueDate && 
          new Date(product.issueDate) < oneMonthAgo) {
        console.log(`准备转移REITs产品: ${product.name}`);
        return { ...product, status: '已转移' as ProductStatus, transferDate: new Date() };
      }
      return product;
    }));

    // 检查ABS产品
    setAbsProducts(prev => prev.map(product => {
      if (product.status === '上市/挂牌' && product.issueDate && 
          new Date(product.issueDate) < oneMonthAgo) {
        console.log(`准备转移ABS产品: ${product.name}`);
        return { ...product, status: '已转移' as ProductStatus, transferDate: new Date() };
      }
      return product;
    }));
  };

  useEffect(() => {
    checkTransferProducts();
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

    setCommentsMap(prev => ({
      ...prev,
      [projectId]: [newComment, ...(prev[projectId] || [])]
    }));

    // 更新产品评论
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
    // 实际应该更新评论数据
  };

  // 处理点赞评论
  const handleLikeComment = (commentId: string) => {
    console.log('Like comment:', commentId);
    // 实际应该更新点赞数据
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
      case '已转移':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      case '已转移': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(2)}亿元`;
    }
    return `${(amount / 10000).toFixed(2)}万元`;
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 过滤显示的产品
  const activeReitsProducts = reitsProducts.filter(p => p.status !== '已转移');
  const activeAbsProducts = absProducts.filter(p => p.status !== '已转移');

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
                显示从受理到上市/挂牌的REITs产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[800px]">
                <div className="space-y-4 pb-2">
                  {activeReitsProducts.map((product) => (
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
                              <span>{product.currentProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${product.currentProgress}%` }}
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
                              <span>规模: {formatAmount(product.totalAmount)}</span>
                            </div>
                          </div>

                          {/* 资产类型 */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              底层资产:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {product.assets.map((asset, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
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
                  {activeReitsProducts.length === 0 && (
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
                显示从受理到上市/挂牌的ABS产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[800px]">
                <div className="space-y-4 pb-2">
                  {activeAbsProducts.map((product) => (
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
                              <span>{product.currentProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${product.currentProgress}%` }}
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
                              <span>规模: {formatAmount(product.totalAmount)}</span>
                            </div>
                          </div>

                          {/* 资产类型 */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              底层资产:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {product.assets.map((asset, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
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
                  {activeAbsProducts.length === 0 && (
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
