'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { absDatabase, type ABSProduct } from '@/lib/database/abs-db';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  Search,
  Filter,
  Calendar,
  DollarSign,
  RefreshCw,
  Building2,
  CreditCard,
  Home,
  Zap,
  Lightbulb,
  Leaf,
  Tractor,
  Globe,
  Home as HomeIcon,
  ChevronRight,
  Layers,
} from 'lucide-react';

// 基础资产大类定义
const ASSET_MAIN_CATEGORIES = {
  '债权类': {
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600',
    description: '企业因销售商品或提供服务形成的债权、租赁债权、小额贷款等',
  },
  '未来经营收入类': {
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
    description: '基础设施收费、PPP项目、其他经营性收费权等',
  },
  '不动产抵押贷款类': {
    icon: Home,
    color: 'from-orange-500 to-orange-600',
    description: '以商业物业等不动产作为抵押担保发放的贷款债权',
  },
};

// 基础资产细分类型映射
const ASSET_SUB_MAPPING = {
  '债权类': ['应收账款', '融资租赁债权', '小额贷款债权', '企业融资债权', '不良债权', 'CMBS', '信用卡分期'],
  '未来经营收入类': ['基础设施收费', 'PPP项目', '其他经营性收费权', '商业物业租金', '可再生能源发电收益权'],
  '不动产抵押贷款类': ['不动产抵押贷款债权', '个人住房抵押贷款', '汽车贷款'],
};

// 特定品种标签
const SPECIAL_TAGS = {
  '绿色低碳': { icon: Leaf, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  '科技创新': { icon: Lightbulb, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  '知识产权': { icon: Lightbulb, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  '乡村振兴': { icon: Tractor, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  '一带一路': { icon: Globe, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  '住房租赁': { icon: HomeIcon, color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' },
};

export default function ABSProductsPage() {
  const [products, setProducts] = useState<ABSProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ABSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [assetMainFilter, setAssetMainFilter] = useState('all');
  const [assetSubFilter, setAssetSubFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 筛选产品
  useEffect(() => {
    let filtered = products;

    // 关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(
        (p) =>
          p.product_short_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          p.product_full_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          p.issuer_name?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 基础资产大类筛选
    if (assetMainFilter !== 'all') {
      filtered = filtered.filter((p) => p.asset_type_main === assetMainFilter);
    }

    // 基础资产细分筛选
    if (assetSubFilter !== 'all') {
      filtered = filtered.filter((p) => p.asset_type_sub === assetSubFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchKeyword, assetMainFilter, assetSubFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await absDatabase.getAllProducts();
      setProducts(productsData);
      setFilteredProducts(productsData);
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿元`;
  };

  // 根据基础资产类型获取特殊标签
  const getSpecialTags = (assetSub: string) => {
    const tags = [];
    if (assetSub.includes('可再生能源') || assetSub.includes('绿色')) {
      tags.push('绿色低碳');
    }
    if (assetSub.includes('住房')) {
      tags.push('住房租赁');
    }
    return tags;
  };

  // 获取基础资产大类
  const getAssetMainCategory = (assetSub: string) => {
    for (const [main, subs] of Object.entries(ASSET_SUB_MAPPING)) {
      if (subs.some(sub => assetSub.includes(sub))) {
        return main;
      }
    }
    return '其他';
  };

  // 按大类分组
  const groupedProducts = assetMainFilter === 'all'
    ? Object.fromEntries(
        Object.keys(ASSET_MAIN_CATEGORIES).map(cat => [cat, filteredProducts.filter(p => getAssetMainCategory(p.asset_type_sub) === cat)])
      )
    : { [assetMainFilter]: filteredProducts };

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                  <Layers className="mr-2 h-4 w-4" />
                  资产类型数
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#ed8936]">
                  {new Set(products.map(p => p.asset_type_sub)).size}
                </div>
                <div className="text-sm text-muted-foreground mt-1">细分资产类型</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 border-[#10b981]/20">
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  发起机构
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#10b981]">
                  {new Set(products.map(p => p.issuer_name)).size}
                </div>
                <div className="text-sm text-muted-foreground mt-1">家机构</div>
              </CardContent>
            </Card>
          </div>

          {/* 筛选工具栏 */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索产品名称、发起机构..."
                    className="pl-10"
                    value={searchKeyword}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="min-w-[180px]">
                  <Select value={assetMainFilter} onValueChange={(v) => { setAssetMainFilter(v); setAssetSubFilter('all'); }}>
                    <SelectTrigger>
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="基础资产大类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部大类</SelectItem>
                      {Object.entries(ASSET_MAIN_CATEGORIES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center">
                            <config.icon className="w-4 h-4 mr-2" />
                            {key}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[180px]">
                  <Select value={assetSubFilter} onValueChange={setAssetSubFilter} disabled={assetMainFilter === 'all'}>
                    <SelectTrigger>
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="细分资产类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {assetMainFilter !== 'all' && ASSET_SUB_MAPPING[assetMainFilter as keyof typeof ASSET_SUB_MAPPING]?.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据来源说明 */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
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

          {/* 产品列表 - 按大类分组展示 */}
          {!loading && (
            <div className="space-y-8">
              {Object.entries(groupedProducts).map(([category, categoryProducts]) => {
                const categoryConfig = ASSET_MAIN_CATEGORIES[category as keyof typeof ASSET_MAIN_CATEGORIES];
                if (!categoryConfig || categoryProducts.length === 0) return null;
                const CategoryIcon = categoryConfig.icon;

                return (
                  <div key={category}>
                    {/* 大类标题 */}
                    <div className={`flex items-center mb-4 bg-gradient-to-r ${categoryConfig.color} text-white px-6 py-3 rounded-lg shadow-md`}>
                      <CategoryIcon className="w-6 h-6 mr-3" />
                      <div>
                        <h2 className="text-xl font-bold">{category}</h2>
                        <p className="text-sm opacity-90">{categoryConfig.description}</p>
                      </div>
                      <Badge className="ml-4 bg-white/20 text-white border-white/30">
                        {categoryProducts.length} 个项目
                      </Badge>
                    </div>

                    {/* 该大类下的产品卡片 */}
                    <div className="space-y-4">
                      {categoryProducts.map((product) => {
                        const specialTags = getSpecialTags(product.asset_type_sub || '');
                        
                        return (
                          <Card key={product.product_code} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-[#667eea]">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2 flex-wrap">
                                    <Badge className="bg-[#667eea] text-white">{product.market_type}</Badge>
                                    <Badge variant="outline">{product.product_code}</Badge>
                                    <Badge variant="secondary">{product.product_type}</Badge>
                                    {specialTags.map(tag => {
                                      const tagConfig = SPECIAL_TAGS[tag as keyof typeof SPECIAL_TAGS];
                                      if (!tagConfig) return null;
                                      const TagIcon = tagConfig.icon;
                                      return (
                                        <Badge key={tag} className={tagConfig.color}>
                                          <TagIcon className="w-3 h-3 mr-1" />
                                          {tag}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                  <CardTitle className="text-xl mb-1">
                                    {product.product_short_name}
                                  </CardTitle>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    发起人: {product.issuer_name} | 计划管理人: {product.trustee_name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatAmount(product.total_scale)}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    发行规模
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">发行日期</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {product.issue_date}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">基础资产</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {product.asset_type_sub}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">分层结构</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    优先档 {product.senior_tranches} 层 / 次级 {product.subordinate_ratio}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">预期到期日</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {product.expected_maturity_date}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">备案编号</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {product.registration_number}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* 空状态 */}
              {!loading && filteredProducts.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Briefcase className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      未找到匹配的ABS产品
                    </h3>
                    <p className="text-gray-600">
                      请尝试调整搜索条件或筛选器
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
