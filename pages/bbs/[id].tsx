/**
 * BBS 帖子详情页面
 *
 * 展示帖子详情、评论列表，支持点赞、评论
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Eye, Heart, MessageSquare, Clock, ArrowLeft, Send } from 'lucide-react';

import {
  getPost,
  getComments,
  createComment,
  likePost,
  unlikePost,
  type BBSPost,
  type BBSComment,
} from '@/lib/api/bbs';
import { getBBSManager } from '@/lib/encryption';
import { useUserStore } from '@/stores/userStore';
import { QUERY_KEYS } from '@/lib/api';

export default function BBSPostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoggedIn } = useUserStore();

  const [commentContent, setCommentContent] = useState('');
  const [isSigningComment, setIsSigningComment] = useState(false);

  // 获取帖子详情
  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: QUERY_KEYS.bbsPost(params.id),
    queryFn: () => getPost(params.id),
  });

  // 获取评论列表
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: QUERY_KEYS.bbsComments(params.id),
    queryFn: () => getComments(params.id, { pageSize: 50 }),
  });

  // 点赞帖子
  const likeMutation = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bbsPost(params.id) });
    },
  });

  // 取消点赞
  const unlikeMutation = useMutation({
    mutationFn: unlikePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bbsPost(params.id) });
    },
  });

  // 创建评论
  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; signature: string }) =>
      createComment(params.id, data),
    onSuccess: () => {
      toast.success('评论发布成功');
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bbsComments(params.id) });
    },
    onError: (error: any) => {
      toast.error('评论发布失败', {
        description: error.message || '未知错误',
      });
    },
  });

  const post = postData?.data;
  const comments = commentsData?.data?.data || [];

  // 格式化时间
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 处理点赞
  const handleLike = () => {
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }
    likeMutation.mutate(params.id);
  };

  // 处理评论签名
  const handleSignComment = async () => {
    if (!commentContent.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    setIsSigningComment(true);
    try {
      const bbsManager = await getBBSManager();
      const signature = await bbsManager.sign(commentContent);
      createCommentMutation.mutate({
        content: commentContent.trim(),
        signature: signature.signature,
      });
    } catch (error: any) {
      toast.error('签名生成失败', {
        description: error.message || '未知错误',
      });
    } finally {
      setIsSigningComment(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      {/* 帖子内容 */}
      {postLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : post ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{post.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
              <Badge variant="outline">{post.category}</Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(post.createdAt)}
              </span>
              <span>{post.anonymousId.substring(0, 8)}...</span>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="py-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {post.content}
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                >
                  <Heart className="h-4 w-4" />
                  <span className="ml-1">{post.likes}</span>
                </Button>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      ) : null}

      {/* 评论区域 */}
      <Card>
        <CardHeader>
          <CardTitle>评论 ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 发表评论 */}
          {isLoggedIn ? (
            <div className="space-y-3">
              <Label htmlFor="comment">发表评论</Label>
              <Textarea
                id="comment"
                placeholder="写下你的评论..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSignComment}
                  disabled={!commentContent.trim() || isSigningComment || createCommentMutation.isPending}
                >
                  {isSigningComment ? '签名中...' : createCommentMutation.isPending ? '发布中...' : '发布评论'}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground mb-2">
                登录后可以发表评论
              </p>
              <Link href="/">
                <Button size="sm">去登录</Button>
              </Link>
            </div>
          )}

          <Separator />

          {/* 评论列表 */}
          {commentsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {comment.anonymousId.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.anonymousId.substring(0, 8)}...
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无评论，快来发表第一条评论吧
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
