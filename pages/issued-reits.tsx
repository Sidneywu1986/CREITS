import Link from 'next/link';
import MainLayout from '../src/components/layout/MainLayout';
import { Button } from '../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { Badge } from '../src/components/ui/badge';
import { Activity, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { getREITsWithQuotes } from '../src/lib/services/simple-real-data-service';

export async function getServerSideProps() {
  try {
    const data = await getREITsWithQuotes();
    const productsWithQuotes = data.map((p: any) => ({
      ...p,
      issuePrice: p.issuePrice,
      price: p.quote?.price || p.issuePrice,
      change: p.quote?.change || 0,
      changePercent: p.quote?.changePercent || 0,
      volume: p.quote?.volume || 0,
      open: p.quote?.open || 0,
      high: p.quote?.high || 0,
      low: p.quote?.low || 0,
    }));
    
    return {
      props: {
        products: productsWithQuotes,
        lastUpdate: new Date().toLocaleTimeString('zh-CN'),
      },
    };
  } catch (error) {
    console.error('Server-side data loading failed:', error);
    return {
      props: {
        products: [],
        lastUpdate: '加载失败',
      },
    };
  }
}

interface PageProps {
  products: any[];
  lastUpdate: string;
}

export default function IssuedREITsPage({ products, lastUpdate }: PageProps) {
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
                已加载
              </Badge>
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                更新: {lastUpdate}
              </Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 text-[#ed8936]" />
              D-1日 REITs收盘价 ({products.length}只)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">暂无数据</p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.code}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          <Link href={`/issued-reits/${product.code}`} className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {product.code}
                            <ExternalLink className="ml-2 h-3 w-3 text-gray-400" />
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Link href={`/issued-reits/${product.code}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {product.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          {product.price ? String(product.price) : '0.00'}
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
                        <td className="py-3 px-4 text-sm text-right">
                          {product.price && product.issuePrice 
                            ? ((product.price - product.issuePrice) / product.issuePrice * 100).toFixed(2) + '%'
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
