/**
 * 积分系统 API 接口
 */

import { apiClient, ApiResponse } from './client';
import { PointsTransaction } from '@/stores/userStore';

/**
 * 充值订单类型
 */
export interface RechargeOrder {
  id: string;
  userId: string;
  amount: number;
  points: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paymentMethod: 'alipay' | 'wechat' | 'bank_transfer';
  qrCode?: string;
  expiresAt: number;
  createdAt: number;
  paidAt?: number;
}

/**
 * 提现请求类型
 */
export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  bankAccount: string;
  bankName: string;
  accountName: string;
  reason?: string;
  createdAt: number;
  processedAt?: number;
}

/**
 * 获取积分余额
 */
export async function getPointsBalance(): Promise<ApiResponse<{ balance: number }>> {
  return apiClient.get('/points/balance');
}

/**
 * 获取积分历史记录
 */
export async function getPointsHistory(params: {
  page?: number;
  pageSize?: number;
  type?: PointsTransaction['type'];
}): Promise<ApiResponse<{ data: PointsTransaction[]; total: number }>> {
  return apiClient.get('/points/history', {
    body: JSON.stringify(params),
  });
}

/**
 * 创建充值订单
 */
export async function createRechargeOrder(params: {
  amount: number;
  paymentMethod: RechargeOrder['paymentMethod'];
}): Promise<ApiResponse<RechargeOrder>> {
  return apiClient.post('/points/recharge', params);
}

/**
 * 获取充值订单
 */
export async function getRechargeOrder(
  orderId: string
): Promise<ApiResponse<RechargeOrder>> {
  return apiClient.get(`/points/recharge/${orderId}`);
}

/**
 * 取消充值订单
 */
export async function cancelRechargeOrder(
  orderId: string
): Promise<ApiResponse<void>> {
  return apiClient.delete(`/points/recharge/${orderId}`);
}

/**
 * 创建提现请求
 */
export async function createWithdrawRequest(params: {
  amount: number;
  bankAccount: string;
  bankName: string;
  accountName: string;
  signature: string;
}): Promise<ApiResponse<WithdrawRequest>> {
  return apiClient.post('/points/withdraw', params);
}

/**
 * 获取提现请求
 */
export async function getWithdrawRequest(
  requestId: string
): Promise<ApiResponse<WithdrawRequest>> {
  return apiClient.get(`/points/withdraw/${requestId}`);
}

/**
 * 获取我的提现请求列表
 */
export async function getMyWithdrawRequests(params: {
  page?: number;
  pageSize?: number;
  status?: WithdrawRequest['status'];
}): Promise<ApiResponse<{ data: WithdrawRequest[]; total: number }>> {
  return apiClient.get('/points/withdraw/my', {
    body: JSON.stringify(params),
  });
}
