/**
 * BBS 发帖页面
 *
 * 创建新帖子，支持 BBS 签名和零知识证明
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { createPost, getCategories } from '@/lib/api/bbs';
import { getBBSManager, type BBSSignature } from '@/lib/encryption';
import { useUserStore } from '@/stores/userStore';
import { QUERY_KEYS } from '@/lib/api';

export default function NewPostPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useUserStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [isSigning, setIsSigning] = useState(false);
  const [signature, setSignature] = useState<BBSSignature | null>(null);

  // 获取分类列表
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: QUERY_KEYS.bbsCategories,
    queryFn: getCategories,
  });

  // 创建帖子
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      toast.success('帖子发布成功');
      router.push(`/bbs/${data.data.id}`);
    },
    onError: (error: any) => {
      toast.error('发布失败', {
        description: error.message || '未知错误',
      });
    },
  });

  // 检查登录状态
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">请先登录后再发帖</p>
            <Button onClick={() => router.push('/')}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // 生成签名
  const handleSign = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('请先填写标题和内容');
      return;
    }

    setIsSigning(true);
    try {
      const bbsManager = await getBBSManager();
      const message = `${title}\n${content}`;
      const sig = await bbsManager.sign(message);
      setSignature(sig);
      toast.success('签名生成成功');
    } catch (error: any) {
      toast.error('签名生成失败', {
        description: error.message || '未知错误',
      });
    } finally {
      setIsSigning(false);
    }
  };

  // 提交帖子
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast.error('请选择分类');
      return;
    }

    if (!signature) {
      toast.error('请先生成签名');
      return;
    }

    createPostMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      signature: signature.signature,
      category,
      tags,
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">发布新帖子</h1>
        <p className="text-muted-foreground mt-2">
          填写帖子内容并生成 BBS 签名，确保匿名性和真实性
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                placeholder="请输入帖子标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {title.length} / 100
              </p>
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <Label htmlFor="category">分类 *</Label>
              {categoriesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.data?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* 内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">内容 *</Label>
              <Textarea
                id="content"
                placeholder="请输入帖子内容（支持 Markdown）"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                maxLength={10000}
              />
              <p className="text-xs text-muted-foreground">
                {content.length} / 10,000
              </p>
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="添加标签（按回车或点击添加）"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  添加
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag}
                      <span className="ml-1">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 签名 */}
            <div className="space-y-2">
              <Label>BBS 签名</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={signature ? 'default' : 'outline'}
                  onClick={handleSign}
                  disabled={isSigning || !!signature}
                >
                  {isSigning ? '生成中...' : signature ? '已签名' : '生成签名'}
                </Button>
                {signature && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSignature(null)}
                  >
                    重新签名
                  </Button>
                )}
              </div>
              {signature && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs font-mono break-all text-muted-foreground">
                    {signature.signature.substring(0, 64)}...
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                生成签名后，您的帖子将使用 BBS 签名算法加密，确保匿名性和真实性
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!signature || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? '发布中...' : '发布帖子'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
