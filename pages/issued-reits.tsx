'use client';

import { useState, useEffect } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../src/components/ui/card';
import { Badge } from '../src/components/ui/badge';
import { ScrollArea } from '../src/components/ui/scroll-area';
import ProjectBBS, { Comment } from '../src/components/ProjectBBS';
import { Building, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getREITsProducts } from '../src/lib/data/real-reits-products';

export default function IssuedREITsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        const data = await getREITsProducts();
        setProducts(data.map((p: any) => ({ ...p, comments: [] })));
      } catch (error) {
        console.error('加载REITs数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRealData();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            已发行REITs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看市场上已发行的REITs产品实时行情
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: any) => (
            <div key={product.id}>
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {product.name}
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
      </div>
    </MainLayout>
  );
}
