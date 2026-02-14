'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '../src/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../src/components/ui/card';
import { Badge } from '../src/components/ui/badge';
import { ScrollArea } from '../src/components/ui/scroll-area';
import ProjectBBS, { Comment } from '../src/components/ProjectBBS';
import REITsValuationCalculator from '../src/components/reits/REITsValuationCalculator';
import { Building, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw, Activity, Calendar, Calculator } from 'lucide-react';
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
      annualDistribution: 0, // 数据源中没有年度分红，设为0，用户可在计算器中修改
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: any) => (
            <div key={product.id}>
              <Card
                className="border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
                onClick={() => window.location.href = `/issued-reits/${product.code}`}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                    {product.name}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400" />
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">代码:</span>
                      <span className="font-medium">{product.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">现价:</span>
                      <span className="font-medium">{product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">涨跌:</span>
                      <span className={`flex items-center ${product.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {product.change}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">市值:</span>
                      <span className="font-medium">{product.marketCap}亿</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 hover:from-[#667eea]/20 hover:to-[#764ba2]/20"
                      onClick={(e) => handleOpenCalculator(product, e)}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      估值计算
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <ProjectBBS
                projectId={product.id}
                projectType="REITs"
                projectName={product.name}
                comments={product.comments}
                onAddComment={handleAddComment}
                onReplyComment={handleReplyComment}
                onLikeComment={handleLikeComment}
              />
            </div>
          ))}
        </div>

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
