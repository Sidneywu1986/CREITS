'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  TrendingUp,
  ArrowRight,
  Eye,
} from 'lucide-react';

// 产品状态枚举
type ProductStatus = '申请中' | '审核中' | '发行中' | '发行成功' | '已转移';

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
  issueDate?: Date;
  transferDate?: Date;
  totalAmount: number;
  issuer: string;
  assets: string[];
  currentProgress: number; // 0-100
  statusHistory: {
    status: ProductStatus;
    date: Date;
    description: string;
  }[];
}

export default function IssuanceStatusPage() {
  // 模拟数据 - 实际应该从API获取
  const [reitsProducts, setReitsProducts] = useState<IssuanceProduct[]>([
    {
      id: 'REIT001',
      type: 'REITs',
      name: '北京科技园基础设施REIT',
      code: 'REIT.BJ.TECH',
      status: '审核中',
      applyDate: new Date('2024-12-01'),
      totalAmount: 5000000000,
      issuer: '北京科技园区开发有限公司',
      assets: ['研发办公楼', '产业配套公寓', '商业服务中心'],
      currentProgress: 35,
      statusHistory: [
        {
          status: '申请中',
          date: new Date('2024-12-01'),
          description: '提交发行申请'
        },
        {
          status: '审核中',
          date: new Date('2024-12-15'),
          description: '证监会审核中'
        }
      ]
    },
    {
      id: 'REIT002',
      type: 'REITs',
      name: '上海仓储物流REIT',
      code: 'REIT.SH.LOG',
      status: '申请中',
      applyDate: new Date('2024-12-20'),
      totalAmount: 3200000000,
      issuer: '上海物流集团股份有限公司',
      assets: ['智能仓储中心A区', '智能仓储中心B区'],
      currentProgress: 15,
      statusHistory: [
        {
          status: '申请中',
          date: new Date('2024-12-20'),
          description: '提交发行申请'
        }
      ]
    },
    {
      id: 'REIT003',
      type: 'REITs',
      name: '深圳产业园REIT',
      code: 'REIT.SZ.IND',
      status: '发行成功',
      applyDate: new Date('2024-11-01'),
      issueDate: new Date('2025-01-15'),
      totalAmount: 4500000000,
      issuer: '深圳产业投资控股集团',
      assets: ['高科技产业园A座', '高科技产业园B座', '研发中心'],
      currentProgress: 100,
      statusHistory: [
        {
          status: '申请中',
          date: new Date('2024-11-01'),
          description: '提交发行申请'
        },
        {
          status: '审核中',
          date: new Date('2024-11-15'),
          description: '证监会审核通过'
        },
        {
          status: '发行中',
          date: new Date('2025-01-10'),
          description: '开始发行认购'
        },
        {
          status: '发行成功',
          date: new Date('2025-01-15'),
          description: '发行成功，募集资金到位'
        }
      ]
    }
  ]);

  const [absProducts, setAbsProducts] = useState<IssuanceProduct[]>([
    {
      id: 'ABS001',
      type: 'ABS',
      name: '消费金融ABS',
      code: 'ABS.CON.001',
      status: '发行中',
      applyDate: new Date('2024-12-05'),
      issueDate: new Date('2025-01-10'),
      totalAmount: 1000000000,
      issuer: '消费金融股份有限公司',
      assets: ['个人消费贷款债权'],
      currentProgress: 85,
      statusHistory: [
        {
          status: '申请中',
          date: new Date('2024-12-05'),
          description: '提交发行申请'
        },
        {
          status: '审核中',
          date: new Date('2024-12-20'),
          description: '交易所审核通过'
        },
        {
          status: '发行中',
          date: new Date('2025-01-10'),
          description: '开始发行认购'
        }
      ]
    },
    {
      id: 'ABS002',
      type: 'ABS',
      name: '应收账款ABS',
      code: 'ABS.AR.002',
      status: '审核中',
      applyDate: new Date('2024-12-25'),
      totalAmount: 800000000,
      issuer: '供应链管理有限公司',
      assets: ['核心企业应收账款'],
      currentProgress: 25,
      statusHistory: [
        {
          status: '申请中',
          date: new Date('2024-12-25'),
          description: '提交发行申请'
        },
        {
          status: '审核中',
          date: new Date('2025-01-05'),
          description: '交易所审核中'
        }
      ]
    },
    {
      id: 'ABS003',
      type: 'ABS',
      name: '租赁债权ABS',
      code: 'ABS.LE.003',
      status: '发行成功',
      applyDate: new Date('2024-11-15'),
      issueDate: new Date('2025-01-05'),
      totalAmount: 1500000000,
      issuer: '融资租赁有限公司',
      assets: ['设备租赁债权', '车辆租赁债权'],
      currentProgress: 100,
      statusHistory: [
        {
          status: '申请中',
          date: new Date('2024-11-15'),
          description: '提交发行申请'
        },
        {
          status: '审核中',
          date: new Date('2024-11-30'),
          description: '交易所审核通过'
        },
        {
          status: '发行中',
          date: new Date('2024-12-20'),
          description: '开始发行认购'
        },
        {
          status: '发行成功',
          date: new Date('2025-01-05'),
          description: '发行成功'
        }
      ]
    }
  ]);

  // 检查是否需要转移已发行满一个月的产品
  const checkTransferProducts = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 检查REITs产品
    setReitsProducts(prev => prev.map(product => {
      if (product.status === '发行成功' && product.issueDate && 
          new Date(product.issueDate) < oneMonthAgo) {
        // 模拟转移 - 实际应该调用API
        console.log(`准备转移REITs产品: ${product.name}`);
        return { ...product, status: '已转移' as ProductStatus, transferDate: new Date() };
      }
      return product;
    }));

    // 检查ABS产品
    setAbsProducts(prev => prev.map(product => {
      if (product.status === '发行成功' && product.issueDate && 
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

  // 获取状态颜色
  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case '申请中':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '审核中':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '发行中':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case '发行成功':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '已转移':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: ProductStatus) => {
    switch (status) {
      case '申请中':
        return <FileText className="w-4 h-4" />;
      case '审核中':
        return <AlertCircle className="w-4 h-4" />;
      case '发行中':
        return <TrendingUp className="w-4 h-4" />;
      case '发行成功':
        return <CheckCircle className="w-4 h-4" />;
      case '已转移':
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(2)}亿元`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(2)}万元`;
    }
    return `${amount.toLocaleString()}元`;
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 过滤显示的产品（排除已转移的）
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
            实时跟踪REITs和ABS产品从申请到发行的全过程
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    REITs申请中
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '申请中').length}
                  </p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    REITs审核中
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '审核中').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ABS发行中
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeAbsProducts.filter(p => p.status === '发行中').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    本月发行成功
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '发行成功').length + 
                     activeAbsProducts.filter(p => p.status === '发行成功').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
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
                显示从申请到发行成功的REITs产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pb-2">
                  {activeReitsProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
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
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${product.currentProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* 基本信息 */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <FileText className="w-3 h-3" />
                          <span>申请日期: {formatDate(product.applyDate)}</span>
                        </div>
                        {product.issueDate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>发行日期: {formatDate(product.issueDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>规模: {formatAmount(product.totalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Building className="w-3 h-3" />
                          <span>发行人: {product.issuer}</span>
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

                      {/* 状态历史 */}
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          状态历史:
                        </p>
                        <div className="space-y-1">
                          {product.statusHistory.slice(-3).map((history, idx) => (
                            <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{formatDate(history.date)}</span>
                              <span className="mx-1">→</span>
                              <Badge className={`${getStatusColor(history.status)} scale-75`}>
                                {history.status}
                              </Badge>
                              <span className="ml-1">{history.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
                显示从申请到发行成功的ABS产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pb-2">
                  {activeAbsProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
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
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${product.currentProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* 基本信息 */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <FileText className="w-3 h-3" />
                          <span>申请日期: {formatDate(product.applyDate)}</span>
                        </div>
                        {product.issueDate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>发行日期: {formatDate(product.issueDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>规模: {formatAmount(product.totalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Briefcase className="w-3 h-3" />
                          <span>发行人: {product.issuer}</span>
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

                      {/* 状态历史 */}
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          状态历史:
                        </p>
                        <div className="space-y-1">
                          {product.statusHistory.slice(-3).map((history, idx) => (
                            <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{formatDate(history.date)}</span>
                              <span className="mx-1">→</span>
                              <Badge className={`${getStatusColor(history.status)} scale-75`}>
                                {history.status}
                              </Badge>
                              <span className="ml-1">{history.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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

        {/* 说明信息 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">💡 功能说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <div className="space-y-2">
              <p>• <strong>申请中</strong>：产品已提交发行申请，等待受理</p>
              <p>• <strong>审核中</strong>：监管部门正在审核产品资料</p>
              <p>• <strong>发行中</strong>：产品已通过审核，正在发行认购</p>
              <p>• <strong>发行成功</strong>：产品发行完成，募集资金到位</p>
              <p>• <strong>自动转移</strong>：发行成功满1个月后，产品将自动转移到"已发行REITs项目"或"已发行ABS项目"列表</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
