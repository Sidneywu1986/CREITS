import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Globe,
  ArrowRight,
  DollarSign,
  Activity,
  Landmark,
  Search,
  ArrowUp,
  ArrowDown,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { getREITsWithQuotes } from '@/src/lib/services/simple-real-data-service';
import { REAL_REITS_PRODUCTS } from '@/src/lib/data/real-reits-products';

// 全球REITs指数数据
const GLOBAL_REITS_INDEX = [
  { region: '美国', index: 2850.5, change: 65.3, changePercent: 2.34, name: 'FTSE NAREIT All REITs' },
  { region: '欧洲', index: 1425.2, change: 21.8, changePercent: 1.55, name: 'EPRA Europe' },
  { region: '日本', index: 1850.7, change: 55.6, changePercent: 3.10, name: 'Tokyo REIT Index' },
  { region: '澳洲', index: 1680.3, change: -12.5, changePercent: -0.74, name: 'S&P/ASX 200 A-REIT' },
  { region: '香港', index: 980.3, change: 8.2, changePercent: 0.84, name: 'Hang Seng REIT Index' },
  { region: '新加坡', index: 845.6, change: 12.4, changePercent: 1.49, name: 'iEdge S-REIT Index' },
];

// 全球主要市场股指
const GLOBAL_STOCK_INDEX = [
  { region: '美国道指', index: 38654.42, change: 234.52, changePercent: 0.61, name: 'Dow Jones Industrial' },
  { region: '美国纳指', index: 16428.82, change: 285.16, changePercent: 1.77, name: 'NASDAQ Composite' },
  { region: '美国标普', index: 5234.18, change: 45.87, changePercent: 0.88, name: 'S&P 500' },
  { region: '英国富时', index: 8164.12, change: -23.45, changePercent: -0.29, name: 'FTSE 100' },
  { region: '德国DAX', index: 17437.45, change: 89.32, changePercent: 0.51, name: 'DAX 40' },
  { region: '法国CAC', index: 8088.24, change: 56.78, changePercent: 0.71, name: 'CAC 40' },
  { region: '日经225', index: 39238.81, change: 324.56, changePercent: 0.83, name: 'NIKKEI 225' },
  { region: '恒生指数', index: 17651.15, change: -89.23, changePercent: -0.50, name: 'Hang Seng Index' },
  { region: '上证指数', index: 3088.64, change: 15.42, changePercent: 0.50, name: 'SSE Composite' },
  { region: '深证成指', index: 9668.52, change: -23.67, changePercent: -0.24, name: 'SZSE Component' },
];

// 十年期国债行情
const TREASURY_BOND_DATA = [
  { country: '美国', yield: 4.23, change: 0.05, name: 'US 10-Year Treasury' },
  { country: '中国', yield: 2.34, change: -0.02, name: 'CGB 10-Year' },
  { country: '日本', yield: 0.73, change: 0.01, name: 'JGB 10-Year' },
  { country: '德国', yield: 2.45, change: 0.03, name: 'Bund 10-Year' },
  { country: '英国', yield: 4.12, change: 0.07, name: 'Gilt 10-Year' },
  { country: '法国', yield: 2.98, change: 0.04, name: 'OAT 10-Year' },
];

export default function MarketPage() {
  // 初始化模拟数据
  const initialMockData = REAL_REITS_PRODUCTS.map(item => ({
    id: item.id,
    code: item.code,
    name: item.name,
    price: item.issuePrice * (1 + (Math.random() * 0.2 - 0.1)),
    change: Math.random() * 10 - 5,
    volume: Math.floor(Math.random() * 10000000),
    amount: item.issueScale * 100000000,
  }));

  const [products, setProducts] = useState<any[]>(initialMockData);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'change' | 'price' | 'volume'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // 初始化加载
  useEffect(() => {
    console.log('useEffect triggered');
    // 直接使用模拟数据进行测试
    const mockData = REAL_REITS_PRODUCTS.map(item => ({
      id: item.id,
      code: item.code,
      name: item.name,
      price: item.issuePrice * (1 + (Math.random() * 0.2 - 0.1)),
      change: Math.random() * 10 - 5,
      volume: Math.floor(Math.random() * 10000000),
      amount: item.issueScale * 100000000,
    }));
    console.log('mockData:', mockData);
    setProducts(mockData);
    setLoading(false);

    // 尝试获取真实数据（非阻塞）
    getREITsWithQuotes().then(data => {
      const realProducts = data.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        price: item.quote?.price || item.issuePrice,
        change: item.quote?.changePercent || 0,
        volume: item.quote?.volume || 0,
        amount: item.quote?.volume * (item.quote?.price || item.issuePrice) || 0,
      }));
      setProducts(realProducts);
    }).catch(error => {
      console.error('获取真实数据失败，使用模拟数据:', error);
    });
  }, []);

  // 初始化加载
  useEffect(() => {
    console.log('useEffect triggered');
    // 直接使用模拟数据进行测试
    const mockData = REAL_REITS_PRODUCTS.map(item => ({
      id: item.id,
      code: item.code,
      name: item.name,
      price: item.issuePrice * (1 + (Math.random() * 0.2 - 0.1)),
      change: Math.random() * 10 - 5,
      volume: Math.floor(Math.random() * 10000000),
      amount: item.issueScale * 100000000,
    }));
    console.log('mockData:', mockData);
    setProducts(mockData);
    setLoading(false);

    // 尝试获取真实数据（非阻塞）
    getREITsWithQuotes().then(data => {
      const realProducts = data.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        price: item.quote?.price || item.issuePrice,
        change: item.quote?.changePercent || 0,
        volume: item.quote?.volume || 0,
        amount: item.quote?.volume * (item.quote?.price || item.issuePrice) || 0,
      }));
      setProducts(realProducts);
    }).catch(error => {
      console.error('获取真实数据失败，使用模拟数据:', error);
    });
  }, []);

  // 排序函数
  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'change') {
      comparison = a.change - b.change;
    } else if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'volume') {
      comparison = (a.volume || 0) - (b.volume || 0);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 过滤搜索
  const filteredProducts = sortedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 格式化金额
  const formatVolume = (volume: number) => {
    if (volume >= 100000000) {
      return `${(volume / 100000000).toFixed(2)}亿`;
    } else if (volume >= 10000) {
      return `${(volume / 10000).toFixed(2)}万`;
    }
    return volume.toString();
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              返回
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Globe className="mr-3 text-[#667eea]" />
            金融看板
          </h1>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 板块1: 全球REITs指数 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Landmark className="mr-2 text-[#667eea]" />
            全球REITs指数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {GLOBAL_REITS_INDEX.map((item) => (
              <div
                key={item.region}
                className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="text-sm text-muted-foreground mb-1">{item.name}</div>
                <div className="text-xl font-bold mb-1">{item.index.toFixed(1)}</div>
                <div className={`flex items-center text-sm font-semibold ${item.changePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.changePercent >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 板块2: 全球主要市场股指 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 text-[#764ba2]" />
            全球主要市场股指
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {GLOBAL_STOCK_INDEX.map((item) => (
              <div
                key={item.region}
                className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="text-sm text-muted-foreground mb-1">{item.name}</div>
                <div className="text-xl font-bold mb-1">{item.index.toFixed(2)}</div>
                <div className={`flex items-center text-sm font-semibold ${item.changePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.changePercent >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 板块3: 十年期国债行情 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 text-[#48bb78]" />
            十年期国债行情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TREASURY_BOND_DATA.map((item) => (
              <div
                key={item.country}
                className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="text-sm text-muted-foreground mb-1">{item.name}</div>
                <div className="text-xl font-bold mb-1">{item.yield.toFixed(2)}%</div>
                <div className={`flex items-center text-sm font-semibold ${item.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.change >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 板块4: D-1日 全部REITs收盘价 */}
      <Card>
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
                    <th className="text-right py-3 px-4 font-semibold text-sm">涨跌幅</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">涨跌额</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">成交量</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">成交额</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium">{product.code}</td>
                      <td className="py-3 px-4 text-sm">{product.name}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium">{product.price.toFixed(3)}</td>
                      <td className={`py-3 px-4 text-sm text-right font-semibold ${product.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.change >= 0 ? '+' : ''}{product.change.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-4 text-sm text-right ${product.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.change >= 0 ? '+' : ''}{((product.change / 100) * product.price).toFixed(3)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">{formatVolume(product.volume || 0)}</td>
                      <td className="py-3 px-4 text-sm text-right">{formatVolume(product.amount || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: '金融看板 - REITs 智能助手',
  description: '全球REITs市场行情和金融数据',
};
