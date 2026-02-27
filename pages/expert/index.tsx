/**
 * 专家列表页面
 *
 * 展示所有已认证的专家，支持按专业领域筛选、排序
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare, Users, Search, Briefcase } from 'lucide-react';

import { getExperts, type Expert } from '@/lib/api/expert';
import { QUERY_KEYS } from '@/lib/api';

export default function ExpertListPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'followers' | 'latest'>('rating');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // 获取专家列表
  const { data: expertsData, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.experts, currentPage, sortBy, selectedSpecialty, searchKeyword],
    queryFn: () =>
      getExperts({
        page: currentPage,
        pageSize: 12,
        specialty: selectedSpecialty === 'all' ? undefined : selectedSpecialty,
        sortBy,
      }),
    placeholderData: (previousData) => previousData,
  });

  const experts = expertsData?.data?.data || [];
  const total = expertsData?.data?.total || 0;

  const allSpecialties = Array.from(
    new Set(experts.flatMap((expert) => expert.specialty))
  ).slice(0, 10);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* 页面头部 */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">专家智库</h1>
        <p className="text-muted-foreground">
          与行业专家互动，获取专业见解
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="搜索专家姓名、机构、专业领域..."
            className="pl-10"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* 筛选和排序 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <TabsList>
            <TabsTrigger value="rating">评分最高</TabsTrigger>
            <TabsTrigger value="followers">关注最多</TabsTrigger>
            <TabsTrigger value="latest">最新入驻</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedSpecialty === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedSpecialty('all')}
          >
            全部
          </Badge>
          {allSpecialties.map((specialty) => (
            <Badge
              key={specialty}
              variant={selectedSpecialty === specialty ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedSpecialty(specialty)}
            >
              {specialty}
            </Badge>
          ))}
        </div>
      </div>

      {/* 专家列表 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : experts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <Card key={expert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={expert.avatar} alt={expert.name} />
                    <AvatarFallback className="text-lg">
                      {expert.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{expert.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {expert.title} · {expert.organization}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 专业领域 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">专业领域</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expert.specialty.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {expert.specialty.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.specialty.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 评分 */}
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(expert.rating)}
                    <span className="text-xs text-muted-foreground">
                      ({expert.reviewCount} 条评价)
                    </span>
                  </div>
                </div>

                {/* 简介 */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {expert.bio}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{expert.followerCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{expert.postCount}</span>
                  </div>
                </div>
                <Link href={`/expert/${expert.id}`}>
                  <Button size="sm">查看详情</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">暂无专家</p>
          </CardContent>
        </Card>
      )}

      {/* 分页 */}
      {total > 12 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            上一页
          </Button>
          <span className="flex items-center px-4">
            第 {currentPage} / {Math.ceil(total / 12)} 页
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= Math.ceil(total / 12)}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
