'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '../src/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../src/components/ui/card';
import { Badge } from '../src/components/ui/badge';
import { ScrollArea } from '../src/components/ui/scroll-area';
import ProjectBBS, { Comment } from '../src/components/ProjectBBS';
import REITsValuationCalculator from '../src/components/reits/REITsValuationCalculator';
import { Input } from '../src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/ui/select';
import {
  Building,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  RefreshCw,
  Activity,
  Calendar,
  Calculator,
  Search,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { getREITsProducts } from '../src/lib/data/real-reits-products';

export default function IssuedREITsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedREITs, setSelectedREITs] = useState<{
    name: string;
    code: string;
    currentPrice: number;
    annualDistribution: number;
  } | null>(null);
  const [sortBy, setSortBy] = useState<'change' | 'price' | 'volume'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const loadRealData = async () => {
    try {
      setLoading(true);
      const data = await getREITsProducts();
      setProducts(data.map((p: any) => ({ ...p, comments: [] })));
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
      setCountdown(60);
    } catch (error) {
      console.error('加载REITs数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化成交量/成交额
  const formatVolume = (value: number): string => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(2)}亿`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(2)}万`;
    }
    return value.toFixed(0);
  };

  // 排序后的产品列表
  const filteredProducts = products
    .filter(p =>
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valueA, valueB;
      switch (sortBy) {
        case 'change':
          valueA = a.change || 0;
          valueB = b.change || 0;
          break;
        case 'price':
          valueA = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
          valueB = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
          break;
        case 'volume':
          valueA = a.volume || 0;
          valueB = b.volume || 0;
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

  useEffect(() => {
    loadRealData();

    // 设置30秒自动刷新
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          loadRealData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    // 清理定时器
    return () => clearInterval(interval);
  }, []);

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
      projectType: 'REITs',
    };
    setProducts((prev: any[]) => prev.map((p: any) =>
      p.id === projectId ? { ...p, comments: [newComment, ...p.comments] } : p
    ));
  };

  const handleReplyComment = (commentId: string, content: string) => {
    console.log('Reply to comment:', commentId, content);
  };

  const handleLikeComment = (commentId: string) => {
    console.log('Like comment:', commentId);
  };

  const handleOpenCalculator = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedREITs({
      name: product.name,
      code: product.code,
      currentPrice: parseFloat(product.price.replace(/[^\d.]/g, '')) || 0,
      annualDistribution: 0,
    });
    setShowCalculator(true);
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  已发行REITs
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  查看市场上已发行的REITs产品实时行情
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                <Activity className="w-3 h-3 mr-1" />
                {countdown}s 后自动刷新
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                1分钟/次
              </Badge>
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                更新: {lastUpdate}
              </Badge>
              <Button variant="outline" size="sm" onClick={loadRealData} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>
        </div>

        {/* D-1日 REITs收盘价表格 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 text-[#ed8936]" />
                D-1日 REITs收盘价 ({products.length}只)
              </CardTitle>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="change">涨跌幅</SelectItem>
                    <SelectItem value="price">成交价</SelectItem>
                    <SelectItem value="volume">成交量</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '升序' : '降序'}
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 搜索框 */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索REITs代码或名称..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* 数据表格 */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-sm">代码</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">名称</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">收盘价</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">首发价</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">发行时间</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">涨跌幅</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">涨跌额</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">成交量</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">成交额</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          <Link href={`/issued-reits/${product.code}`} className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {product.code}
                            <ExternalLink className="ml-2 h-3 w-3 text-gray-400" />
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm">{product.name}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          {product.price}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          {product.issuePrice ? product.issuePrice : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
                          {product.issueDate || '-'}
                        </td>
                        <td className={`py-3 px-4 text-sm text-right font-semibold ${product.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.change >= 0 ? '+' : ''}{product.change}%
                        </td>
                        <td className={`py-3 px-4 text-sm text-right ${product.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {(() => {
                            const price = parseFloat(product.price.replace(/[^\d.]/g, '')) || 0;
                            const changeAmount = (product.change / 100) * price;
                            return `${product.change >= 0 ? '+' : ''}${changeAmount.toFixed(3)}`;
                          })()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          {formatVolume(product.volume || 0)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          {formatVolume((product.volume || 0) * (parseFloat(product.price.replace(/[^\d.]/g, '')) || 0))}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleOpenCalculator(product, e)}
                          >
                            <Calculator className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 估值计算器 */}
        {selectedREITs && (
          <REITsValuationCalculator
            isOpen={showCalculator}
            onClose={() => setShowCalculator(false)}
            reitsName={selectedREITs.name}
            reitsCode={selectedREITs.code}
            currentPrice={selectedREITs.currentPrice}
            annualDistribution={selectedREITs.annualDistribution}
          />
        )}
      </div>
    </MainLayout>
  );
}
