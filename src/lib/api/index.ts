/**
 * TanStack Query 配置
 */

import { QueryClient, QueryCache } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * 创建 QueryClient 实例
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5分钟后数据过期
        staleTime: 5 * 60 * 1000,
        // 10分钟后数据被移除缓存
        gcTime: 10 * 60 * 1000,
        // 窗口获得焦点时重新获取数据
        refetchOnWindowFocus: true,
        // 重试次数
        retry: 1,
        // 重试延迟
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // 突变错误时不重试
        retry: 0,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        console.error('[Query Error]', error);
        toast.error('数据加载失败', {
          description: error instanceof Error ? error.message : '未知错误',
        });
      },
    }),
  });
}

/**
 * 默认 QueryKey 前缀
 */
export const QUERY_KEYS = {
  // 用户相关
  user: ['user'] as const,
  userPoints: ['user', 'points'] as const,
  userPointsHistory: ['user', 'points', 'history'] as const,

  // BBS 相关
  bbsPosts: ['bbs', 'posts'] as const,
  bbsPost: (id: string) => ['bbs', 'posts', id] as const,
  bbsComments: (postId: string) => ['bbs', 'posts', postId, 'comments'] as const,
  bbsCategories: ['bbs', 'categories'] as const,

  // 专家相关
  experts: ['experts'] as const,
  expert: (id: string) => ['experts', id] as const,
  expertMessages: (id: string) => ['experts', id, 'messages'] as const,
  expertPosts: (id: string) => ['experts', id, 'posts'] as const,
  expertReviews: (id: string) => ['experts', id, 'reviews'] as const,

  // 积分相关
  rechargeOrders: ['points', 'recharge', 'orders'] as const,
  withdrawRequests: ['points', 'withdraw', 'requests'] as const,

  // 书本相关
  books: ['books'] as const,
  book: (id: string) => ['books', id] as const,

  // 密钥位置相关
  keyPositions: ['keyPositions'] as const,
  keyPosition: (id: string) => ['keyPositions', id] as const,
} as const;
