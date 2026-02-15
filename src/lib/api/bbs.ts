/**
 * BBS API 接口
 */

import { apiClient, ApiResponse } from './client';

/**
 * 帖子类型
 */
export interface BBSPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  anonymousId: string;
  signature: string;
  proof?: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  commentCount: number;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isLocked: boolean;
}

/**
 * 评论类型
 */
export interface BBSComment {
  id: string;
  postId: string;
  authorId: string;
  anonymousId: string;
  content: string;
  signature: string;
  parentId?: string;
  likes: number;
  createdAt: number;
  isDeleted: boolean;
}

/**
 * 分类类型
 */
export interface BBSCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  icon?: string;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'latest' | 'hot' | 'most_viewed';
  category?: string;
  tag?: string;
  keyword?: string;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 发帖参数
 */
export interface CreatePostParams {
  title: string;
  content: string;
  signature: string;
  proof?: string;
  category: string;
  tags?: string[];
}

/**
 * 发表评论参数
 */
export interface CreateCommentParams {
  content: string;
  signature: string;
  parentId?: string;
}

/**
 * 获取帖子列表
 */
export async function getPosts(
  params: PaginationParams = {}
): Promise<ApiResponse<PaginatedResponse<BBSPost>>> {
  return apiClient.get('/bbs/posts', {
    body: JSON.stringify(params),
  });
}

/**
 * 获取帖子详情
 */
export async function getPost(
  id: string
): Promise<ApiResponse<BBSPost>> {
  return apiClient.get(`/bbs/posts/${id}`);
}

/**
 * 创建帖子
 */
export async function createPost(
  params: CreatePostParams
): Promise<ApiResponse<BBSPost>> {
  return apiClient.post('/bbs/posts', params);
}

/**
 * 更新帖子
 */
export async function updatePost(
  id: string,
  params: Partial<CreatePostParams>
): Promise<ApiResponse<BBSPost>> {
  return apiClient.put(`/bbs/posts/${id}`, params);
}

/**
 * 删除帖子
 */
export async function deletePost(
  id: string
): Promise<ApiResponse<void>> {
  return apiClient.delete(`/bbs/posts/${id}`);
}

/**
 * 获取帖子评论
 */
export async function getComments(
  postId: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<ApiResponse<PaginatedResponse<BBSComment>>> {
  return apiClient.get(`/bbs/posts/${postId}/comments`, {
    body: JSON.stringify(params),
  });
}

/**
 * 创建评论
 */
export async function createComment(
  postId: string,
  params: CreateCommentParams
): Promise<ApiResponse<BBSComment>> {
  return apiClient.post(`/bbs/posts/${postId}/comments`, params);
}

/**
 * 删除评论
 */
export async function deleteComment(
  postId: string,
  commentId: string
): Promise<ApiResponse<void>> {
  return apiClient.delete(`/bbs/posts/${postId}/comments/${commentId}`);
}

/**
 * 点赞帖子
 */
export async function likePost(id: string): Promise<ApiResponse<void>> {
  return apiClient.post(`/bbs/posts/${id}/like`);
}

/**
 * 取消点赞帖子
 */
export async function unlikePost(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete(`/bbs/posts/${id}/like`);
}

/**
 * 获取分类列表
 */
export async function getCategories(): Promise<ApiResponse<BBSCategory[]>> {
  return apiClient.get('/bbs/categories');
}
