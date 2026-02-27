'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { absDatabase, type ABSProduct } from '@/lib/database/abs-db';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  RefreshCw,
  ArrowLeft,
  Search,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  CreditCard,
  Zap,
  Home,
} from 'lucide-react';
import Link from 'next/link';

// 基础资产大类定义
const ASSET_MAIN_CATEGORIES: any = {
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

// 特定品种标签配置
const SPECIAL_TAGS = [
  { name: '绿色低碳', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', keywords: ['绿色', '环保', '生态', '可持续', '可再生能源', '清洁能源', '减排', '节能'] },
  { name: '科技创新', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', keywords: ['科技', '创新', '科创', '技术', '研发', '人工智能', '数字化', '智能制造'] },
  { name: '知识产权', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', keywords: ['知识产权', '专利', '商标', '版权', 'IP'] },
  { name: '乡村振兴', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', keywords: ['乡村振兴', '农业', '农村', '农产', '三农', '扶贫'] },
  { name: '"一带一路"', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400', keywords: ['一带一路', '丝绸之路', '跨境', '国际'] },
  { name: '住房租赁', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400', keywords: ['住房租赁', '租赁住房', '保障性租赁住房', '长租公寓', '公寓'] },
];

// 判断产品属于哪个特定品种
function getSpecialTags(product: ABSProduct): string[] {
  const tags: string[] = [];
  const searchFields = [product.product_name || '', product.underlying_asset || '', product.issuer_name || ''].join(' ').toLowerCase();
  
  for (const tag of SPECIAL_TAGS) {
    if (tag.keywords.some(keyword => searchFields.includes(keyword.toLowerCase()))) {
      tags.push(tag.name);
    }
  }
  
  return tags;
}

export default function ABSCategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const [products, setProducts] = useState<ABSProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ABSProduct[]>([]);
  const [allProducts, setAllProducts] = useState<ABSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSubType, setSelectedSubType] = useState('全部类型');

  // 加载数据
  useEffect(() => {
    if (category) {
      loadData();
    }
  }, [category]);

  // 筛选逻辑
  useEffect(() => {
    let filtered = products;

    // 按细分类型筛选
    if (selectedSubType !== '全部类型') {
      filtered = filtered.filter(p => (p.asset_type_sub || '').includes(selectedSubType));
    }

    // 按关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(p => 
        (p.product_name || '').toLowerCase().includes(keyword) ||
        (p.issuer_name || '').toLowerCase().includes(keyword) ||
        (p.underlying_asset || '').toLowerCase().includes(keyword)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedSubType, searchKeyword]);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await absDatabase.getAllProducts();
      setAllProducts(productsData);

      // 根据选中的大类筛选产品
      const categoryConfig = ASSET_MAIN_CATEGORIES[category as string];
      if (categoryConfig) {
        const categoryProducts = productsData.filter(p => {
          return categoryConfig.subTypes.some((sub: any) => (p.asset_type_sub || '').includes(sub));
        });
        setProducts(categoryProducts);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿元`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (!category) {
    return <div>加载中...</div>;
  }

  const categoryConfig = ASSET_MAIN_CATEGORIES[category as string];
  if (!categoryConfig) {
    return <div>未找到该类别</div>;
  }

  const CategoryIcon = categoryConfig.icon;
  const availableSubTypes = ['全部类型', ...categoryConfig.subTypes.filter((st: any) => 
    products.some(p => (p.asset_type_sub || '').includes(st))
  )];

  return (
    <>
      <Head>
        <title>{category} - ABS项目数据库</title>
        <meta name="description" content={`${category}资产支持证券（ABS）项目列表`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* 页面标题 */}
        <div className={`bg-gradient-to-r ${categoryConfig.color} shadow-lg`}>
          <div className="container mx-auto px-4 py-6">
            <Link href="/abs-products">
              <Button variant="outline" className="bg-white/20 hover:bg-white/30 border-white/30 text-white mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回总览
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm text-white shadow-lg mr-4">
                <CategoryIcon className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{category}</h1>
                <p className="text-sm text-white/90 mt-1">{categoryConfig.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className={`${categoryConfig.bgColor} ${categoryConfig.borderColor} border-2`}>
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  产品数量
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${categoryConfig.textColor}`}>
                  {products.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">个项目</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  发行规模
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#764ba2]">
                  {formatAmount(products.reduce((sum, p) => sum + (p.total_scale || 0), 0))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">累计发行</div>
              </CardContent>
            </Card>

            <Card>
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

            <Card>
              <CardHeader className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  特定品种
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#10b981]">
                  {new Set(products.flatMap(p => getSpecialTags(p))).size}
                </div>
                <div className="text-sm text-muted-foreground mt-1">种类型</div>
              </CardContent>
            </Card>
          </div>

          {/* 筛选和搜索栏 */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索产品名称、发起机构、基础资产..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedSubType}
                    onChange={(e) => setSelectedSubType(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]"
                  >
                    {availableSubTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" onClick={loadData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
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

          {/* 产品列表 */}
          {!loading && (
            <>
              {filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Briefcase className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchKeyword || selectedSubType !== '全部类型' ? '未找到匹配的产品' : '暂无该类别的ABS产品'}
                    </h3>
                    <p className="text-gray-600">
                      {searchKeyword || selectedSubType !== '全部类型' 
                        ? '请尝试调整搜索条件或筛选条件'
                        : '请先在数据库中创建该类别的ABS产品数据'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredProducts.map((product) => {
                    const specialTags = getSpecialTags(product);
                    
                    return (
                      <Card key={product.product_id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* 左侧：基本信息 */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900 flex-1">
                                  {product.product_name}
                                </h3>
                                {specialTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 ml-4">
                                    {specialTags.map(tag => {
                                      const tagConfig = SPECIAL_TAGS.find(t => t.name === tag);
                                      return (
                                        <Badge key={tag} className={tagConfig?.color}>
                                          {tag}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-700">
                                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-500 mr-2">发起机构：</span>
                                  <span className="font-medium">{product.issuer_name}</span>
                                </div>

                                <div className="flex items-center text-gray-700">
                                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-500 mr-2">基础资产：</span>
                                  <span className="font-medium">{product.underlying_asset}</span>
                                </div>

                                <div className="flex items-center text-gray-700">
                                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-500 mr-2">发行日期：</span>
                                  <span className="font-medium">{formatDate(product.issue_date)}</span>
                                </div>

                                <div className="flex items-center text-gray-700">
                                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-500 mr-2">发行规模：</span>
                                  <span className={`font-bold text-lg ${categoryConfig.textColor}`}>
                                    {formatAmount(product.total_scale || 0)}
                                  </span>
                                </div>

                                {product.asset_type_sub && (
                                  <div className="flex items-center text-gray-700">
                                    <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="text-gray-500 mr-2">细分类型：</span>
                                    <span className="font-medium">{product.asset_type_sub}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 右侧：产品指标 */}
                            <div className="md:w-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-3">产品指标</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">债券评级</span>
                                  <span className="font-medium">{product.rating || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">存续期</span>
                                  <span className="font-medium">{product.term_years ? `${product.term_years}年` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">管理费率</span>
                                  <span className="font-medium">{product.management_fee ? `${(product.management_fee * 100).toFixed(2)}%` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">规模区间</span>
                                  <span className="font-medium">{product.scale_range || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
