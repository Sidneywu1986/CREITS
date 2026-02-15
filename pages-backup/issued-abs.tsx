'use client';

import { useState, useEffect } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';
import { Badge } from '../src/components/ui/badge';
import { Input } from '../src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/ui/select';
import {
  Briefcase,
  Search,
  Filter,
  Calendar,
  DollarSign,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { getABSServices } from '../src/lib/services/simple-real-data-service';

export default function IssuedABSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 加载真实数据
  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await getABSServices();
      setProducts(productsData);
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 过滤产品
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = assetTypeFilter === 'all' || product.underlyingAssets.join(',').includes(assetTypeFilter);
    return matchesSearch && matchesType;
  });

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿元`;
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                返回
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <Briefcase className="mr-3 text-[#667eea]" />
              已发行ABS项目
            </h1>
          </div>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-[#667eea]/10 to-[#667eea]/5 border-[#667eea]/20">
          <CardHeader className="pb-3">
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
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              发行总规模
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#764ba2]">
              {formatAmount(products.reduce((sum: number, p: any) => sum + p.issueScale, 0))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">真实数据统计</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#ed8936]/10 to-[#ed8936]/5 border-[#ed8936]/20">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              平均票面利率
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#ed8936]">
              {(products.reduce((sum: number, p: any) => sum + p.couponRate, 0) / products.length || 0).toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">年度化收益</div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选栏 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索项目名称、代码..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="底层资产" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部资产</SelectItem>
                <SelectItem value="应收账款">应收账款</SelectItem>
                <SelectItem value="个人消费信贷">个人消费信贷</SelectItem>
                <SelectItem value="汽车贷款">汽车贷款</SelectItem>
                <SelectItem value="供应链应收账款">供应链应收账款</SelectItem>
              </SelectContent>
            </Select>
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
              ABS产品通常不提供实时行情，显示固定票面利率。
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 加载状态 */}
      {loading && products.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载真实数据中...</p>
          </div>
        </div>
      )}

      {/* 产品列表 */}
      <div className="space-y-4">
        {filteredProducts.map((product: any) => (
          <Link key={product.id} href={`/issued-abs/${product.code}`}>
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#667eea]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
                      <Badge className="bg-[#667eea] text-white">上市交易</Badge>
                      <Badge variant="outline">{product.code}</Badge>
                      <Badge variant="secondary">{product.rating}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-1">
                      {product.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      发起人: {product.issuer} | 计划管理人: {product.planManager}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {product.couponRate.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      票面利率
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">发行日期</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.issueDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">发行规模</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatAmount(product.issueScale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">期限</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.term}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">底层资产</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.underlyingAssets.join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 空状态 */}
      {!loading && filteredProducts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Briefcase className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              未找到匹配的ABS产品
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              请尝试调整搜索条件或筛选器
            </p>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
