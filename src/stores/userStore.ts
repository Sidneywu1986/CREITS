/**
 * 用户状态管理
 *
 * 使用 Zustand 管理用户登录状态、凭证、积分等信息
 * 支持持久化到 localStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * 用户凭证类型
 */
export interface UserCredentials {
  userId: string;
  anonymousId: string;
  publicKey: string;
  createdAt: number;
}

/**
 * 积分变动记录类型
 */
export interface PointsTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'tip' | 'receive_tip' | 'reward' | 'penalty';
  amount: number;
  balance: number;
  description: string;
  relatedUserId?: string;
  relatedPostId?: string;
  createdAt: number;
}

/**
 * 用户状态类型
 */
interface UserState {
  // 用户基本信息
  user: UserCredentials | null;
  isLoggedIn: boolean;

  // 积分信息
  points: number;
  pointsHistory: PointsTransaction[];

  // 书本文件
  bookId: string | null;
  keyPositionId: string | null;

  // 操作
  login: (credentials: UserCredentials) => void;
  logout: () => void;
  updatePoints: (amount: number, type: PointsTransaction['type'], description: string, meta?: { relatedUserId?: string; relatedPostId?: string }) => void;
  setBook: (bookId: string) => void;
  setKeyPosition: (positionId: string) => void;
  clearBook: () => void;
  clearKeyPosition: () => void;
  addPointsTransaction: (transaction: PointsTransaction) => void;
  loadPointsHistory: (history: PointsTransaction[]) => void;
}

/**
 * 创建用户状态管理器
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isLoggedIn: false,
      points: 0,
      pointsHistory: [],
      bookId: null,
      keyPositionId: null,

      // 登录
      login: (credentials) => {
        set({
          user: credentials,
          isLoggedIn: true,
        });
      },

      // 登出
      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          points: 0,
          pointsHistory: [],
          bookId: null,
          keyPositionId: null,
        });
      },

      // 更新积分
      updatePoints: (amount, type, description, meta) => {
        const currentPoints = get().points;
        const newBalance = currentPoints + amount;

        const transaction: PointsTransaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          type,
          amount,
          balance: newBalance,
          description,
          relatedUserId: meta?.relatedUserId,
          relatedPostId: meta?.relatedPostId,
          createdAt: Date.now(),
        };

        set((state) => ({
          points: newBalance,
          pointsHistory: [transaction, ...state.pointsHistory],
        }));
      },

      // 设置当前使用的书本
      setBook: (bookId) => {
        set({ bookId });
      },

      // 设置当前使用的密钥位置
      setKeyPosition: (positionId) => {
        set({ keyPositionId: positionId });
      },

      // 清除书本
      clearBook: () => {
        set({ bookId: null });
      },

      // 清除密钥位置
      clearKeyPosition: () => {
        set({ keyPositionId: null });
      },

      // 添加积分变动记录
      addPointsTransaction: (transaction) => {
        set((state) => ({
          points: transaction.balance,
          pointsHistory: [transaction, ...state.pointsHistory],
        }));
      },

      // 加载积分历史记录
      loadPointsHistory: (history) => {
        set({
          pointsHistory: history,
          points: history.length > 0 ? history[0].balance : 0,
        });
      },
    }),
    {
      name: 'reits-bbs-user-storage',
      storage: createJSONStorage(() => localStorage),
      // 只持久化部分数据
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        points: state.points,
        pointsHistory: state.pointsHistory.slice(0, 100), // 只保存最近100条
        bookId: state.bookId,
        keyPositionId: state.keyPositionId,
      }),
    }
  )
);

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => useUserStore.getState().user;

/**
 * 获取用户积分
 */
export const getUserPoints = () => useUserStore.getState().points;

/**
 * 检查是否已登录
 */
export const isLoggedIn = () => useUserStore.getState().isLoggedIn;

/**
 * 获取当前匿名ID
 */
export const getAnonymousId = () => useUserStore.getState().user?.anonymousId;

/**
 * 获取当前公钥
 */
export const getPublicKey = () => useUserStore.getState().user?.publicKey;
