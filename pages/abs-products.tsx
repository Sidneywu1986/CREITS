'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { absDatabase, type ABSProduct } from '@/lib/database/abs-db';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  DollarSign,
  RefreshCw,
  CreditCard,
  Zap,
  Home,
  ArrowRight,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

// 基础资产大类定义
const ASSET_MAIN_CATEGORIES = {
  '债权类': {
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-600',
    description: '企业因销售商品或提供服务形成的债权、租赁债权、小额贷款等',
    subTypes: ['应收账款', '融资租赁债权', '小额贷款债权', '企业融资债权', '不良债权', 'CMBS', '信用卡分期'],
  },
  '未来经营收入类': {
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-500/10 to-purple-600/5',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-600',
    description: '基础设施收费、PPP项目、其他经营性收费权等',
    subTypes: ['基础设施收费', 'PPP项目', '其他经营性收费权', '商业物业租金', '可再生能源发电收益权'],
  },
  '不动产抵押贷款类': {
    icon: Home,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-500/10 to-orange-600/5',
    borderColor: 'border-orange-500/20',
    textColor: 'text-orange-600',
    description: '以商业物业等不动产作为抵押担保发放的贷款债权',
    subTypes: ['不动产抵押贷款债权', '个人住房抵押贷款', '汽车贷款'],
  },
};

export default function ABSProductsPage() {
  const [products, setProducts] = useState<ABSProduct[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await absDatabase.getAllProducts();
      setProducts(productsData);
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));

      // 计算各类别的统计数据
      const stats: Record<string, any> = {};
      
      for (const [category, config] of Object.entries(ASSET_MAIN_CATEGORIES)) {
        const categoryProducts = productsData.filter(p => {
          return config.subTypes.some(sub => (p.asset_type_sub || '').includes(sub));
        });

        stats[category] = {
          count: categoryProducts.length,
          totalScale: categoryProducts.reduce((sum, p) => sum + (p.total_scale || 0), 0),
          issuers: new Set(categoryProducts.map(p => p.issuer_name)).size,
        };
      }
      
      setCategoryStats(stats);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿元`;
  };

  return (
    <>
      <Head>
        <title>已发行ABS项目 - REITs智能助手</title>
        <meta name="description" content="资产支持证券（ABS）项目数据库，按基础资产类型分类展示" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* 页面标题 */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-[#667eea] mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">已发行ABS项目</h1>
                  <p className="text-sm text-gray-600 mt-1">资产支持证券数据库</p>
                </div>
              </div>
              <Button variant="outline" onClick={loadData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-[#667eea]/10 to-[#667eea]/5 border-[#667eea]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  发行总数
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#667eea]">
                  {products.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  更新: {lastUpdate}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#764ba2]/10 to-[#764ba2]/5 border-[#764ba2]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  发行总规模
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#764ba2]">
                  {formatAmount(products.reduce((sum, p) => sum + (p.total_scale || 0), 0))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">累计发行</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#ed8936]/10 to-[#ed8936]/5 border-[#ed8936]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  发起机构
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#ed8936]">
                  {new Set(products.map(p => p.issuer_name)).size}
                </div>
                <div className="text-sm text-muted-foreground mt-1">家机构</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 border-[#10b981]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  基础资产大类
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#10b981]">
                  3
                </div>
                <div className="text-sm text-muted-foreground mt-1">个大类</div>
              </CardContent>
            </Card>
          </div>

          {/* 数据来源说明 */}
          <Card className="mb-8 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <Briefcase className="w-4 h-4" />
                <span>
                  <strong>数据来源：</strong>
                  ABS产品信息来自中国证券业协会、沪深交易所。
                  按基础资产类型分为三大类别：债权类、未来经营收入类、不动产抵押贷款类。
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 加载状态 */}
          {loading && products.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#667eea] mx-auto mb-4"></div>
                <p className="text-gray-600">加载数据中...</p>
              </div>
            </div>
          )}

          {/* 三大类别卡片 */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(ASSET_MAIN_CATEGORIES).map(([category, config]) => {
                const CategoryIcon = config.icon;
                const stats = categoryStats[category] || { count: 0, totalScale: 0, issuers: 0 };

                return (
                  <Link key={category} href={`/abs-products/${encodeURIComponent(category)}`}>
                    <Card className={`${config.bgColor} ${config.borderColor} border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group`}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-4 rounded-xl bg-gradient-to-br ${config.color} text-white shadow-lg`}>
                            <CategoryIcon className="w-8 h-8" />
                          </div>
                          <ArrowRight className={`w-6 h-6 ${config.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        </div>
                        <CardTitle className="text-2xl mb-2">{category}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {config.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">项目数量</span>
                            <Badge className={`${config.textColor} bg-opacity-20`}>{stats.count} 个</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">发行规模</span>
                            <span className={`text-lg font-bold ${config.textColor}`}>
                              {formatAmount(stats.totalScale)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">发起机构</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {stats.issuers} 家
                            </span>
                          </div>
                          
                          {/* 细分类型标签 */}
                          <div className="pt-3 border-t">
                            <div className="flex flex-wrap gap-1.5">
                              {config.subTypes.slice(0, 4).map((subType) => (
                                <Badge key={subType} variant="outline" className="text-xs">
                                  {subType}
                                </Badge>
                              ))}
                              {config.subTypes.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{config.subTypes.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* 空状态 */}
          {!loading && products.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Briefcase className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  暂无ABS产品数据
                </h3>
                <p className="text-gray-600">
                  请先在数据库中创建ABS产品数据
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
