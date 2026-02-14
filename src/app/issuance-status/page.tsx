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
  XCircle,
  PauseCircle,
  Ban,
} from 'lucide-react';

// 产品状态枚举 - 根据实际业务流程
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
          description: '审核部门提出书面反馈意见，要求解释或补充材料'
        }
      ]
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
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        }
      ]
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
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        },
        {
          status: '已反馈',
          date: new Date('2024-11-15'),
          description: '审核部门提出书面反馈意见'
        },
        {
          status: '通过',
          date: new Date('2025-01-10'),
          description: '经审核会议审议通过，交易所出具"通过"的审议意见'
        }
      ]
    },
    {
      id: 'REIT004',
      type: 'REITs',
      name: '广州医疗设施REIT',
      code: 'REIT.GZ.MED',
      status: '上市/挂牌',
      applyDate: new Date('2024-10-15'),
      approvedDate: new Date('2024-12-01'),
      issueDate: new Date('2025-01-05'),
      totalAmount: 6000000000,
      issuer: '广州医疗投资集团',
      assets: ['综合医院大楼', '医疗服务中心', '康复中心'],
      currentProgress: 100,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-10-15'),
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        },
        {
          status: '已反馈',
          date: new Date('2024-10-30'),
          description: '审核部门提出书面反馈意见'
        },
        {
          status: '通过',
          date: new Date('2024-12-01'),
          description: '经审核会议审议通过，交易所出具"通过"的审议意见'
        },
        {
          status: '上市/挂牌',
          date: new Date('2025-01-05'),
          description: '完成定价、募集资金，产品正式成立并在交易所挂牌上市'
        }
      ]
    },
    {
      id: 'REIT005',
      type: 'REITs',
      name: '杭州数据中心REIT',
      code: 'REIT.HZ.DC',
      status: '中止',
      applyDate: new Date('2024-11-20'),
      totalAmount: 2800000000,
      issuer: '杭州数字科技公司',
      assets: ['数据中心一期', '数据中心二期'],
      currentProgress: 45,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-11-20'),
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        },
        {
          status: '已反馈',
          date: new Date('2024-12-05'),
          description: '审核部门提出书面反馈意见'
        },
        {
          status: '中止',
          date: new Date('2025-01-08'),
          description: '因财务数据过期，审核流程暂停'
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
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        }
      ]
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
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        },
        {
          status: '已反馈',
          date: new Date('2024-12-22'),
          description: '审核部门提出书面反馈意见'
        }
      ]
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
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        },
        {
          status: '已反馈',
          date: new Date('2024-11-30'),
          description: '审核部门提出书面反馈意见'
        },
        {
          status: '通过',
          date: new Date('2025-01-02'),
          description: '经审核会议审议通过，交易所出具"通过"的审议意见'
        }
      ]
    },
    {
      id: 'ABS004',
      type: 'ABS',
      name: '汽车金融ABS',
      code: 'ABS.AUTO.004',
      status: '终止',
      applyDate: new Date('2024-11-01'),
      totalAmount: 500000000,
      issuer: '汽车金融有限公司',
      assets: ['汽车贷款债权'],
      currentProgress: 15,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-11-01'),
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        },
        {
          status: '已反馈',
          date: new Date('2024-11-15'),
          description: '审核部门提出书面反馈意见'
        },
        {
          status: '终止',
          date: new Date('2024-12-10'),
          description: '发行人主动撤回发行申请'
        }
      ]
    },
    {
      id: 'ABS005',
      type: 'ABS',
      name: '购房尾款ABS',
      code: 'ABS.HP.005',
      status: '上市/挂牌',
      applyDate: new Date('2024-10-01'),
      approvedDate: new Date('2024-11-20'),
      issueDate: new Date('2024-12-15'),
      totalAmount: 2000000000,
      issuer: '房地产开发集团',
      assets: ['购房尾款债权'],
      currentProgress: 100,
      statusHistory: [
        {
          status: '已受理',
          date: new Date('2024-10-01'),
          description: '交易所对申报材料进行初核，材料齐备后出具《受理通知函》'
        },
        {
          status: '已反馈',
          date: new Date('2024-10-20'),
          description: '审核部门提出书面反馈意见'
        },
        {
          status: '通过',
          date: new Date('2024-11-20'),
          description: '经审核会议审议通过，交易所出具"通过"的审议意见'
        },
        {
          status: '上市/挂牌',
          date: new Date('2024-12-15'),
          description: '完成定价、募集资金，产品正式成立并在交易所挂牌上市'
        }
      ]
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
        // 模拟转移 - 实际应该调用API
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
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: ProductStatus) => {
    switch (status) {
      case '已受理':
        return <FileText className="w-4 h-4" />;
      case '已反馈':
        return <AlertCircle className="w-4 h-4" />;
      case '通过':
        return <CheckCircle className="w-4 h-4" />;
      case '上市/挂牌':
        return <TrendingUp className="w-4 h-4" />;
      case '中止':
        return <PauseCircle className="w-4 h-4" />;
      case '终止':
        return <XCircle className="w-4 h-4" />;
      case '已转移':
        return <Clock className="w-4 h-4" />;
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
            实时跟踪REITs和ABS产品从申请到上市的全过程
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    已受理
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '已受理').length + 
                     activeAbsProducts.filter(p => p.status === '已受理').length}
                  </p>
                </div>
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    已反馈
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '已反馈').length + 
                     activeAbsProducts.filter(p => p.status === '已反馈').length}
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    通过
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '通过').length + 
                     activeAbsProducts.filter(p => p.status === '通过').length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    上市/挂牌
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '上市/挂牌').length + 
                     activeAbsProducts.filter(p => p.status === '上市/挂牌').length}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    中止
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '中止').length + 
                     activeAbsProducts.filter(p => p.status === '中止').length}
                  </p>
                </div>
                <PauseCircle className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    终止
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {activeReitsProducts.filter(p => p.status === '终止').length + 
                     activeAbsProducts.filter(p => p.status === '终止').length}
                  </p>
                </div>
                <XCircle className="w-6 h-6 text-red-600" />
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
                显示从受理到上市/挂牌的REITs产品
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
                          <span>受理日期: {formatDate(product.applyDate)}</span>
                        </div>
                        {product.feedbackDate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <AlertCircle className="w-3 h-3" />
                            <span>反馈日期: {formatDate(product.feedbackDate)}</span>
                          </div>
                        )}
                        {product.approvedDate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>通过日期: {formatDate(product.approvedDate)}</span>
                          </div>
                        )}
                        {product.issueDate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <TrendingUp className="w-3 h-3" />
                            <span>上市日期: {formatDate(product.issueDate)}</span>
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
                显示从受理到上市/挂牌的ABS产品
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
                          <span>受理日期: {formatDate(product.applyDate)}</span>
                        </div>
                        {product.feedbackDate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <AlertCircle className="w-3 h-3" />
                            <span>反馈日期: {formatDate(product.feedbackDate)}</span>
                          </div>
                        )}
                        {product.approvedDate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>通过日期: {formatDate(product.approvedDate)}</span>
                          </div>
                        )}
                        {product.issueDate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <TrendingUp className="w-3 h-3" />
                            <span>挂牌日期: {formatDate(product.issueDate)}</span>
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
            <CardTitle className="text-base">💡 状态说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">正常流程状态</h4>
                <div className="space-y-2">
                  <p><strong className="text-blue-600">已受理</strong>：交易所对申报材料进行初核，材料齐备后出具《受理通知函》</p>
                  <p><strong className="text-yellow-600">已反馈</strong>：审核部门提出书面反馈意见，要求解释或补充材料。ABS回复时限15个工作日，REITs回复时限30日</p>
                  <p><strong className="text-purple-600">通过</strong>：经审核会议审议通过，交易所出具"通过"的审议意见或挂牌条件确认文件</p>
                  <p><strong className="text-green-600">上市/挂牌</strong>：完成定价、募集资金，产品正式成立并在交易所挂牌上市</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">异常流程状态</h4>
                <div className="space-y-2">
                  <p><strong className="text-orange-600">中止</strong>：因财务数据过期、法律纠纷等特定原因，审核流程暂停</p>
                  <p><strong className="text-red-600">终止</strong>：主动撤回或因未回复反馈等被动原因，审核流程终结</p>
                </div>
                <h4 className="font-semibold mb-2 mt-4 text-gray-900 dark:text-white">💡 自动转移</h4>
                <p>上市/挂牌满1个月后，产品将自动转移到"已发行REITs项目"或"已发行ABS项目"列表</p>
                <h4 className="font-semibold mb-2 mt-4 text-gray-900 dark:text-white">📊 审核周期</h4>
                <p>交易所自受理申请材料起至出具首次书面反馈意见的用时已从30个工作日缩短为20个工作日</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
