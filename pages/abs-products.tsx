import { useState, useEffect } from 'react';
import Head from 'next/head';
import { absDatabase, type ABSProduct, type ABSTranche } from '@/lib/database/abs-db';
import { Card } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ABSProductsPage() {
  const [products, setProducts] = useState<ABSProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ABSProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ABSProduct | null>(null);
  const [tranches, setTranches] = useState<ABSTranche[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');

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

    // 产品类型筛选
    if (productTypeFilter !== 'all') {
      filtered = filtered.filter((p) => p.product_type === productTypeFilter);
    }

    // 资产类型筛选
    if (assetTypeFilter !== 'all') {
      filtered = filtered.filter((p) => p.asset_type_sub === assetTypeFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchKeyword, productTypeFilter, assetTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, statsData] = await Promise.all([
        absDatabase.getAllProducts(),
        absDatabase.getStatistics(),
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product: ABSProduct) => {
    try {
      setSelectedProduct(product);
      const tranchesData = await absDatabase.getTranchesByProductCode(product.product_code);
      setTranches(tranchesData);
    } catch (error) {
      console.error('获取分层信息失败:', error);
    }
  };

  const getRatingColor = (rating: string) => {
    if (rating?.includes('AAA')) return 'bg-green-500';
    if (rating?.includes('AA')) return 'bg-blue-500';
    if (rating?.includes('A')) return 'bg-yellow-500';
    if (rating?.includes('BBB')) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  return (
    <>
      <Head>
        <title>ABS产品列表 - REITs智能助手</title>
        <meta name="description" content="ABS（资产支持证券）产品列表与详情" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 页面标题 */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">ABS产品列表</h1>
            <p className="text-gray-600 mt-2">资产支持证券（Asset-Backed Securities）产品数据库</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* 统计卡片 */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-6">
                <div className="text-sm text-gray-600 mb-2">产品总数</div>
                <div className="text-3xl font-bold text-gray-900">{statistics.totalProducts}</div>
              </Card>
              <Card className="p-6">
                <div className="text-sm text-gray-600 mb-2">总规模</div>
                <div className="text-3xl font-bold text-gray-900">
                  {statistics.totalScale.toFixed(2)} 亿元
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-sm text-gray-600 mb-2">产品类型分布</div>
                <div className="text-xl font-bold text-gray-900">
                  {Object.keys(statistics.typeDistribution).length} 类
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-sm text-gray-600 mb-2">基础资产类型</div>
                <div className="text-xl font-bold text-gray-900">
                  {Object.keys(statistics.assetDistribution).length} 种
                </div>
              </Card>
            </div>
          )}

          {/* 筛选工具栏 */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="搜索产品名称、发起机构..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="min-w-[150px]">
                <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="产品类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="企业ABS">企业ABS</SelectItem>
                    <SelectItem value="信贷ABS">信贷ABS</SelectItem>
                    <SelectItem value="ABN">ABN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[150px]">
                <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="基础资产" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部资产</SelectItem>
                    <SelectItem value="CMBS">CMBS</SelectItem>
                    <SelectItem value="应收账款">应收账款</SelectItem>
                    <SelectItem value="个人住房抵押贷款">个人住房抵押贷款</SelectItem>
                    <SelectItem value="汽车贷款">汽车贷款</SelectItem>
                    <SelectItem value="信用卡分期">信用卡分期</SelectItem>
                    <SelectItem value="可再生能源发电收益权">可再生能源发电收益权</SelectItem>
                    <SelectItem value="商业物业租金">商业物业租金</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={loadData}>刷新</Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 产品列表 */}
            <div className="lg:col-span-2">
              <Card>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">产品列表 ({filteredProducts.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>产品简称</TableHead>
                        <TableHead>产品类型</TableHead>
                        <TableHead>基础资产</TableHead>
                        <TableHead>发起机构</TableHead>
                        <TableHead>规模（亿元）</TableHead>
                        <TableHead>发行日期</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            加载中...
                          </TableCell>
                        </TableRow>
                      ) : filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow
                            key={product.product_code}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleProductClick(product)}
                          >
                            <TableCell className="font-medium">{product.product_short_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.product_type}</Badge>
                            </TableCell>
                            <TableCell>{product.asset_type_sub}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {product.issuer_name}
                            </TableCell>
                            <TableCell>{product.total_scale.toFixed(2)}</TableCell>
                            <TableCell>{product.issue_date}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            {/* 产品详情 */}
            <div>
              {selectedProduct ? (
                <Card>
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">产品详情</h2>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* 基本信息 */}
                    <div>
                      <h3 className="font-semibold mb-2">基本信息</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">产品代码:</span>
                          <span>{selectedProduct.product_code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">产品全称:</span>
                          <span className="text-right">{selectedProduct.product_full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">市场类型:</span>
                          <span>{selectedProduct.market_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">发起机构:</span>
                          <span className="text-right">{selectedProduct.issuer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">计划管理人:</span>
                          <span className="text-right">{selectedProduct.trustee_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* 发行信息 */}
                    <div>
                      <h3 className="font-semibold mb-2">发行信息</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">发行规模:</span>
                          <span className="font-semibold">
                            {selectedProduct.total_scale.toFixed(2)} 亿元
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">发行日期:</span>
                          <span>{selectedProduct.issue_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">分层结构:</span>
                          <span>
                            优先档 {selectedProduct.senior_tranches} 层，次级{' '}
                            {selectedProduct.subordinate_ratio}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 分层信息 */}
                    <div>
                      <h3 className="font-semibold mb-2">分层结构</h3>
                      <div className="space-y-2">
                        {tranches.map((tranche) => (
                          <div key={tranche.tranche_code} className="border rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{tranche.tranche_name}</span>
                              <Badge
                                className={`text-white ${getRatingColor(tranche.credit_rating_current)}`}
                              >
                                {tranche.credit_rating_current}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">规模:</span>{' '}
                                {tranche.issue_scale.toFixed(2)} 亿元
                              </div>
                              <div>
                                <span className="text-gray-600">票面利率:</span>{' '}
                                {tranche.initial_coupon
                                  ? `${tranche.initial_coupon.toFixed(2)}%`
                                  : '浮动'}
                              </div>
                              <div>
                                <span className="text-gray-600">加权期限:</span>{' '}
                                {tranche.expected_weighted_life.toFixed(2)} 年
                              </div>
                              <div>
                                <span className="text-gray-600">票息类型:</span>{' '}
                                {tranche.coupon_type}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="p-8 text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 mb-4 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p>点击左侧产品查看详情</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
