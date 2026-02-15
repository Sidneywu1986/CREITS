/**
 * 专家详情页面
 *
 * 展示专家详情、留言、评价，支持打赏
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { Star, MessageSquare, Users, Briefcase, ArrowLeft, Gift, Send } from 'lucide-react';

import {
  getExpert,
  getExpertMessages,
  createExpertMessage,
  getExpertReviews,
  createExpertReview,
  tipExpert,
  type Expert,
  type ExpertMessage,
  type ExpertReview,
} from '@/lib/api/expert';
import { getBBSManager } from '@/lib/encryption';
import { useUserStore } from '@/stores/userStore';
import { QUERY_KEYS } from '@/lib/api';

export default function ExpertDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoggedIn, points } = useUserStore();

  const [messageContent, setMessageContent] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');

  // 获取专家详情
  const { data: expertData, isLoading: expertLoading } = useQuery({
    queryKey: QUERY_KEYS.expert(params.id),
    queryFn: () => getExpert(params.id),
  });

  // 获取专家留言
  const { data: messagesData } = useQuery({
    queryKey: QUERY_KEYS.expertMessages(params.id),
    queryFn: () => getExpertMessages(params.id, { pageSize: 20 }),
  });

  // 获取专家评价
  const { data: reviewsData } = useQuery({
    queryKey: QUERY_KEYS.expertReviews(params.id),
    queryFn: () => getExpertReviews(params.id, { pageSize: 20 }),
  });

  // 创建留言
  const createMessageMutation = useMutation({
    mutationFn: (data: { content: string; signature: string; isPublic: boolean }) =>
      createExpertMessage(params.id, data),
    onSuccess: () => {
      toast.success('留言发送成功');
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expertMessages(params.id) });
    },
    onError: (error: any) => {
      toast.error('留言发送失败', {
        description: error.message || '未知错误',
      });
    },
  });

  // 创建评价
  const createReviewMutation = useMutation({
    mutationFn: (data: { rating: number; content: string; signature: string }) =>
      createExpertReview(params.id, data),
    onSuccess: () => {
      toast.success('评价提交成功');
      setReviewContent('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expertReviews(params.id) });
    },
    onError: (error: any) => {
      toast.error('评价提交失败', {
        description: error.message || '未知错误',
      });
    },
  });

  // 打赏专家
  const tipMutation = useMutation({
    mutationFn: (data: { amount: number; message?: string; signature: string }) =>
      tipExpert(params.id, data),
    onSuccess: (data) => {
      toast.success(`打赏成功，感谢您对专家的支持！`);
      setTipAmount('');
      setTipMessage('');
      queryClient.invalidateQueries({ queryKey: ['user', 'points'] });
    },
    onError: (error: any) => {
      toast.error('打赏失败', {
        description: error.message || '未知错误',
      });
    },
  });

  const expert = expertData?.data;
  const messages = messagesData?.data?.data || [];
  const reviews = reviewsData?.data?.data || [];

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }

    if (!messageContent.trim()) {
      toast.error('请输入留言内容');
      return;
    }

    try {
      const bbsManager = await getBBSManager();
      const signature = await bbsManager.sign(messageContent);
      createMessageMutation.mutate({
        content: messageContent.trim(),
        signature: signature.signature,
        isPublic: true,
      });
    } catch (error: any) {
      toast.error('签名生成失败', {
        description: error.message || '未知错误',
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }

    if (!reviewContent.trim()) {
      toast.error('请输入评价内容');
      return;
    }

    try {
      const bbsManager = await getBBSManager();
      const signature = await bbsManager.sign(`${reviewRating}\n${reviewContent}`);
      createReviewMutation.mutate({
        rating: reviewRating,
        content: reviewContent.trim(),
        signature: signature.signature,
      });
    } catch (error: any) {
      toast.error('签名生成失败', {
        description: error.message || '未知错误',
      });
    }
  };

  const handleTip = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }

    const amount = parseInt(tipAmount);
    if (!amount || amount <= 0) {
      toast.error('请输入有效的打赏金额');
      return;
    }

    if (amount > points) {
      toast.error('积分余额不足');
      return;
    }

    try {
      const bbsManager = await getBBSManager();
      const signature = await bbsManager.sign(`${amount}\n${tipMessage || ''}`);
      tipMutation.mutate({
        amount,
        message: tipMessage.trim() || undefined,
        signature: signature.signature,
      });
    } catch (error: any) {
      toast.error('签名生成失败', {
        description: error.message || '未知错误',
      });
    }
  };

  if (expertLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-5xl text-center">
        <p className="text-muted-foreground">专家不存在</p>
        <Button onClick={() => router.back()} className="mt-4">
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      {/* 专家信息卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={expert.avatar} alt={expert.name} />
              <AvatarFallback className="text-3xl">
                {expert.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{expert.name}</CardTitle>
                  <CardDescription className="text-base">
                    {expert.title} · {expert.organization}
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2">
                      <Gift className="h-5 w-5" />
                      打赏专家
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>打赏专家</DialogTitle>
                      <DialogDescription>
                        感谢专家的分享，您的支持是我们前进的动力
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">打赏积分</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="请输入打赏积分"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          当前可用积分: {points}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="message">留言（可选）</Label>
                        <Textarea
                          id="message"
                          placeholder="写点什么给专家..."
                          value={tipMessage}
                          onChange={(e) => setTipMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleTip} disabled={tipMutation.isPending}>
                        {tipMutation.isPending ? '打赏中...' : '确认打赏'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mt-4 flex items-center gap-6">
                {renderStars(expert.rating)}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{expert.followerCount} 关注</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{expert.reviewCount} 评价</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="py-6 space-y-4">
          {/* 专业领域 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">专业领域</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {expert.specialty.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* 个人简介 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">个人简介</span>
            </div>
            <p className="text-muted-foreground">{expert.bio}</p>
          </div>
        </CardContent>
      </Card>

      {/* 留言和评价 */}
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages">留言板</TabsTrigger>
          <TabsTrigger value="reviews">用户评价</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>专家留言</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 发表留言 */}
              {isLoggedIn ? (
                <div className="space-y-3">
                  <Label htmlFor="message">留言</Label>
                  <Textarea
                    id="message"
                    placeholder="写下你的留言..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || createMessageMutation.isPending}
                    >
                      {createMessageMutation.isPending ? '发送中...' : '发送留言'}
                      <Send className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    登录后可以给专家留言
                  </p>
                  <Link href="/">
                    <Button size="sm">去登录</Button>
                  </Link>
                </div>
              )}

              <Separator />

              {/* 留言列表 */}
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {message.anonymousId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {message.anonymousId.substring(0, 8)}...
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无留言
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>用户评价</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 发表评价 */}
              {isLoggedIn ? (
                <div className="space-y-4">
                  <div>
                    <Label>评分</Label>
                    <div className="mt-2">
                      {renderStars(reviewRating, true, setReviewRating)}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="review">评价内容</Label>
                    <Textarea
                      id="review"
                      placeholder="写下你的评价..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={!reviewContent.trim() || createReviewMutation.isPending}
                    >
                      {createReviewMutation.isPending ? '提交中...' : '提交评价'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    登录后可以评价专家
                  </p>
                  <Link href="/">
                    <Button size="sm">去登录</Button>
                  </Link>
                </div>
              )}

              <Separator />

              {/* 评价列表 */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {review.anonymousId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {review.anonymousId.substring(0, 8)}...
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        {renderStars(review.rating)}
                        <p className="text-sm mt-2">{review.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无评价
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
