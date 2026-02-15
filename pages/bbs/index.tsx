/**
 * BBS 列表页面
 *
 * 展示所有帖子，支持分类、标签、搜索、排序
 */

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Eye, Heart, Clock, Search } from 'lucide-react';
import { getPosts, getCategories, type PaginationParams } from '@/lib/api/bbs';
import { QUERY_KEYS } from '@/lib/api';

export default function BBSIndexPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'most_viewed'>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // 获取分类列表
  const { data: categories } = useQuery({
    queryKey: QUERY_KEYS.bbsCategories,
    queryFn: getCategories,
  });

  // 获取帖子列表
  const { data: postsData, isLoading } = useQuery({
    queryKey: [
      ...QUERY_KEYS.bbsPosts,
      currentPage,
      sortBy,
      selectedCategory,
      searchKeyword,
    ],
    queryFn: () =>
      getPosts({
        page: currentPage,
        pageSize: 20,
        sortBy,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        keyword: searchKeyword || undefined,
      }),
    keepPreviousData: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSortChange = (value: 'latest' | 'hot' | 'most_viewed') => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* 页面头部 */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">匿名论坛</h1>
        <p className="text-muted-foreground">
          匿名讨论，真实发声。REITs 行业交流社区
        </p>
      </div>

      {/* 搜索和操作栏 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="搜索帖子、标签..."
              className="pl-10"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Tabs value={sortBy} onValueChange={handleSortChange}>
            <TabsList>
              <TabsTrigger value="latest">最新</TabsTrigger>
              <TabsTrigger value="hot">热门</TabsTrigger>
              <TabsTrigger value="most_viewed">浏览最多</TabsTrigger>
            </TabsList>
          </Tabs>

          <Link href="/bbs/new">
            <Button>发帖</Button>
          </Link>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="mb-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full md:w-auto justify-start h-auto flex-wrap">
            <TabsTrigger value="all">全部</TabsTrigger>
            {categories?.data?.map((category) => (
              <TabsTrigger key={category.id} value={category.slug}>
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.postCount}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 帖子列表 */}
      <div className="space-y-4">
        {isLoading ? (
          // 加载状态
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardFooter>
            </Card>
          ))
        ) : postsData?.data?.data && postsData.data.data.length > 0 ? (
          // 帖子列表
          postsData.data.data.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/bbs/${post.id}`}>
                      <CardTitle className="text-xl hover:text-primary cursor-pointer">
                        {post.isPinned && <span className="text-red-500 mr-2">[置顶]</span>}
                        {post.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{post.category}</Badge>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.createdAt)}
                      </span>
                      <span>·</span>
                      <span>{post.anonymousId.substring(0, 8)}...</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.commentCount}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          // 空状态
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">暂无帖子</p>
              <Link href="/bbs/new">
                <Button>发布第一条帖子</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 分页 */}
      {postsData?.data && postsData.data.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            上一页
          </Button>
          <span className="flex items-center px-4">
            第 {currentPage} / {postsData.data.totalPages} 页
          </span>
          <Button
            variant="outline"
            disabled={currentPage === postsData.data.totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
