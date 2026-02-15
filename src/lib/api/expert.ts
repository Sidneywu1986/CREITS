/**
 * 专家系统 API 接口
 */

import { apiClient, ApiResponse } from './client';

/**
 * 专家类型
 */
export interface Expert {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  organization: string;
  bio: string;
  specialty: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating: number;
  reviewCount: number;
  postCount: number;
  followerCount: number;
  socialLinks?: {
    linkedin?: string;
    wechat?: string;
    email?: string;
  };
  createdAt: number;
}

/**
 * 专家留言类型
 */
export interface ExpertMessage {
  id: string;
  expertId: string;
  senderId: string;
  anonymousId: string;
  content: string;
  signature: string;
  isPublic: boolean;
  createdAt: number;
}

/**
 * 专家评价类型
 */
export interface ExpertReview {
  id: string;
  expertId: string;
  reviewerId: string;
  anonymousId: string;
  rating: number;
  content: string;
  signature: string;
  createdAt: number;
}

/**
 * 打赏记录类型
 */
export interface TipRecord {
  id: string;
  fromUserId: string;
  toExpertId: string;
  amount: number;
  message?: string;
  createdAt: number;
}

/**
 * 获取专家列表
 */
export async function getExperts(params: {
  page?: number;
  pageSize?: number;
  specialty?: string;
  sortBy?: 'rating' | 'followers' | 'latest';
}): Promise<ApiResponse<{ data: Expert[]; total: number }>> {
  return apiClient.get('/experts', {
    body: JSON.stringify(params),
  });
}

/**
 * 获取专家详情
 */
export async function getExpert(
  id: string
): Promise<ApiResponse<Expert>> {
  return apiClient.get(`/experts/${id}`);
}

/**
 * 获取专家留言
 */
export async function getExpertMessages(
  id: string,
  params: { page?: number; pageSize?: number; publicOnly?: boolean } = {}
): Promise<ApiResponse<{ data: ExpertMessage[]; total: number }>> {
  return apiClient.get(`/experts/${id}/messages`, {
    body: JSON.stringify(params),
  });
}

/**
 * 创建专家留言
 */
export async function createExpertMessage(
  id: string,
  params: { content: string; signature: string; isPublic: boolean }
): Promise<ApiResponse<ExpertMessage>> {
  return apiClient.post(`/experts/${id}/messages`, params);
}

/**
 * 获取专家评价
 */
export async function getExpertReviews(
  id: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<ApiResponse<{ data: ExpertReview[]; total: number }>> {
  return apiClient.get(`/experts/${id}/reviews`, {
    body: JSON.stringify(params),
  });
}

/**
 * 创建专家评价
 */
export async function createExpertReview(
  id: string,
  params: { rating: number; content: string; signature: string }
): Promise<ApiResponse<ExpertReview>> {
  return apiClient.post(`/experts/${id}/reviews`, params);
}

/**
 * 打赏专家
 */
export async function tipExpert(
  id: string,
  params: { amount: number; message?: string; signature: string }
): Promise<ApiResponse<TipRecord>> {
  return apiClient.post(`/experts/${id}/tip`, params);
}

/**
 * 关注专家
 */
export async function followExpert(id: string): Promise<ApiResponse<void>> {
  return apiClient.post(`/experts/${id}/follow`);
}

/**
 * 取消关注专家
 */
export async function unfollowExpert(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete(`/experts/${id}/follow`);
}

/**
 * 申请成为专家
 */
export async function applyExpert(params: {
  name: string;
  title: string;
  organization: string;
  bio: string;
  specialty: string[];
  signature: string;
}): Promise<ApiResponse<void>> {
  return apiClient.post('/experts/apply', params);
}
