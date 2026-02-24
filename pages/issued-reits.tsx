'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Search, ChevronLeft, ChevronRight, Activity, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface REITData {
  code: string;
  name: string;
  issuePrice: number;
  price: number;
  prevClose: number;  // 昨日收盘价
  open: number;
  change: number;
  changePercent: number;
  volume: number;
  turnoverRate: number;
  issueDate: string;
}

type SortOption = 'default' | 'changePercent' | 'volume' | 'issueDate';

export default function IssuedREITsPage() {
  const [products, setProducts] = useState<REITData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/database/query/products');
        
        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // 检查API返回数据格式，提取实际的产品数组
        let productsData: any[] = [];
        
        if (Array.isArray(result)) {
          // 直接返回数组
          productsData = result;
        } else if (result?.data && Array.isArray(result.data)) {
          // 常见包装格式: { data: [...] }
          productsData = result.data;
        } else if (result?.records && Array.isArray(result.records)) {
          // 常见包装格式: { records: [...] }
          productsData = result.records;
        } else if (result?.products && Array.isArray(result.products)) {
          // 常见包装格式: { products: [...] }
          productsData = result.products;
        } else if (result?.items && Array.isArray(result.items)) {
          // 常见包装格式: { items: [...] }
          productsData = result.items;
        } else {
          console.error('API返回格式异常，无法识别为数组:', result);
          setError('数据格式错误，请联系管理员');
          setProducts([]);
          return;
        }
        
        // 转换数据格式
        const productsWithQuotes = productsData.map((p: any) => ({
          code: p.code || '',
          name: p.name || '',
          issuePrice: p.issuePrice || 0,
          price: p.quote?.price || p.issuePrice || 0,
          prevClose: p.quote?.prevClose || 0,  // 昨日收盘价
          open: p.quote?.open || 0,
          change: p.quote?.change || 0,
          changePercent: p.quote?.changePercent || 0,
          volume: p.quote?.volume || 0,
          turnoverRate: p.quote?.turnoverRate || 0,
          issueDate: p.issueDate || '-',
        }));
        
        setProducts(productsWithQuotes);
      } catch (error) {
        console.error('加载数据失败:', error);
        setError(error instanceof Error ? error.message : '加载数据失败，请稍后重试');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 格式化成交量
  const formatVolume = (volume: number) => {
    if (volume >= 100000000) {
      return `${(volume / 100000000).toFixed(2)}亿`;
    } else if (volume >= 10000) {
      return `${(volume / 10000).toFixed(2)}万`;
    }
    return volume.toString();
  };

  // 过滤和排序数据
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.code.toLowerCase().includes(query) || 
        p.name.toLowerCase().includes(query)
      );
    }

    // 排序
    if (sortBy !== 'default') {
      result.sort((a, b) => {
        switch (sortBy) {
          case 'changePercent':
            return Math.abs(b.changePercent) - Math.abs(a.changePercent);
          case 'volume':
            return b.volume - a.volume;
          case 'issueDate':
            return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
          default:
            return 0;
        }
      });
    }

    return result;
  }, [products, searchQuery, sortBy]);

  // 分页数据
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // 重置页码
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem('jumpPage') as HTMLInputElement;
    const page = parseInt(input.value);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
    }
    input.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B1E33] to-[#1A3B5E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">加载数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B1E33] to-[#1A3B5E] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">数据加载失败</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1E33] to-[#1A3B5E]">
      {/* 头部区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>返回</span>
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                已发行REITs ({products.length}只)
              </h1>
              <p className="text-white/60 text-sm mt-1">
                D-1日收盘数据 · 更新于 {new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <Activity className="w-3 h-3 text-blue-400" />
              <span className="text-sm text-white/80">实时数据</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <Calendar className="w-3 h-3 text-blue-400" />
              <span className="text-sm text-white/80">
                共 {filteredAndSortedProducts.length} 只
              </span>
            </div>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="搜索代码或名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 排序下拉 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pr-10 pl-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="default" className="bg-gray-900 text-white">默认排序</option>
              <option value="changePercent" className="bg-gray-900 text-white">涨跌幅</option>
              <option value="volume" className="bg-gray-900 text-white">成交量</option>
              <option value="issueDate" className="bg-gray-900 text-white">发行时间</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          </div>
        </div>

        {/* 表格容器 */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
          {currentProducts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Search className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60">没有找到匹配的REITs</p>
              </div>
            </div>
          ) : (
            <>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#0B1E33]/95 backdrop-blur-sm">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[80px]">代码</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[140px]">名称</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[70px]">开盘</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[70px]">最新</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[70px]">昨日收盘</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[70px]">涨跌幅</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[70px]">涨跌额</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[100px]">成交量</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[70px]">换手率</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-[100px]">发行时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => (
                      <tr
                        key={product.code}
                        className="border-b border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm">
                          <Link
                            href={{
                              pathname: '/issued-reits/[code]',
                              query: { code: product.code }
                            }}
                            as={`/issued-reits/${product.code}`}
                            className="flex items-center font-mono font-bold text-white/80 hover:text-blue-400 transition-colors"
                          >
                            {product.code}
                            <ExternalLink className="ml-2 h-3 w-3 text-white/40" />
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Link
                            href={{
                              pathname: '/issued-reits/[code]',
                              query: { code: product.code }
                            }}
                            as={`/issued-reits/${product.code}`}
                            className="text-white/80 hover:text-blue-400 transition-colors"
                          >
                            {product.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-white/60">
                          {product.open > 0 ? product.open.toFixed(2) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-white/80">
                          {product.price ? product.price.toFixed(2) : '0.00'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-white/60">
                          {product.prevClose > 0 ? product.prevClose.toFixed(2) : '-'}
                        </td>
                        <td className={`py-3 px-4 text-sm text-right font-semibold ${product.changePercent >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {product.changePercent >= 0 ? '+' : ''}{product.changePercent.toFixed(2)}%
                        </td>
                        <td className={`py-3 px-4 text-sm text-right font-semibold ${product.change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {product.change >= 0 ? '+' : ''}{product.change.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-white/60">
                          {product.volume > 0 ? formatVolume(product.volume) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-white/60">
                          {product.turnoverRate > 0 ? product.turnoverRate.toFixed(2) + '%' : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-white/60">
                          {product.issueDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页控件 */}
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* 每页条数选择 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">每页显示</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                      className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={20} className="bg-gray-900">20条</option>
                      <option value={50} className="bg-gray-900">50条</option>
                      <option value={100} className="bg-gray-900">100条</option>
                    </select>
                  </div>

                  {/* 分页按钮 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* 页码 */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (currentPage <= 4) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = currentPage - 3 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              pageNum === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 快速跳转 */}
                  <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                    <span className="text-sm text-white/60">跳转到</span>
                    <input
                      type="number"
                      name="jumpPage"
                      min={1}
                      max={totalPages}
                      placeholder="页码"
                      className="w-16 px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-white/60">页</span>
                  </form>
                </div>

                {/* 统计信息 */}
                <div className="text-center mt-4 text-sm text-white/60">
                  显示 {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} 条，共 {filteredAndSortedProducts.length} 条
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
