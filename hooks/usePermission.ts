'use client';

import { useState, useCallback } from 'react';
import { Role, Resource, Action, hasPermission, isAdmin, getRolePermissions, roleLabels, resourceLabels, actionLabels } from '@/config/rbac';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export function usePermission() {
  const [user, setUser] = useState<User | null>(() => {
    // 从 localStorage 读取用户信息（实际应用中应该从认证系统获取）
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  });

  // 设置当前用户
  const setCurrentUser = useCallback((user: User) => {
    setUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, []);

  // 清除当前用户
  const clearCurrentUser = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }, []);

  // 检查当前用户是否具有某个权限
  const checkPermission = useCallback(
    (resource: Resource, action: Action): boolean => {
      if (!user) return false;
      return hasPermission(user.role, resource, action);
    },
    [user]
  );

  // 检查当前用户是否为管理员
  const isCurrentUserAdmin = useCallback((): boolean => {
    if (!user) return false;
    return isAdmin(user.role);
  }, [user]);

  // 检查当前用户是否具有某个角色的权限
  const hasRole = useCallback(
    (role: Role): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  // 检查当前用户是否具有多个角色中的任意一个
  const hasAnyRole = useCallback(
    (roles: Role[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // 检查当前用户是否具有所有指定的角色
  const hasAllRoles = useCallback(
    (roles: Role[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // 获取当前用户的角色标签
  const getRoleLabel = useCallback((): string => {
    if (!user) return '未登录';
    return roleLabels[user.role] || user.role;
  }, [user]);

  // 获取当前用户的所有权限
  const getCurrentPermissions = useCallback(() => {
    if (!user) return [];
    return getRolePermissions(user.role);
  }, [user]);

  // 检查是否可以创建
  const canCreate = useCallback(
    (resource: Resource): boolean => {
      return checkPermission(resource, 'create');
    },
    [checkPermission]
  );

  // 检查是否可以读取
  const canRead = useCallback(
    (resource: Resource): boolean => {
      return checkPermission(resource, 'read');
    },
    [checkPermission]
  );

  // 检查是否可以更新
  const canUpdate = useCallback(
    (resource: Resource): boolean => {
      return checkPermission(resource, 'update');
    },
    [checkPermission]
  );

  // 检查是否可以删除
  const canDelete = useCallback(
    (resource: Resource): boolean => {
      return checkPermission(resource, 'delete');
    },
    [checkPermission]
  );

  // 检查是否可以导出
  const canExport = useCallback(
    (resource: Resource): boolean => {
      return checkPermission(resource, 'export');
    },
    [checkPermission]
  );

  return {
    user,
    setCurrentUser,
    clearCurrentUser,
    checkPermission,
    isCurrentUserAdmin,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getRoleLabel,
    getCurrentPermissions,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    // 导出常量
    roleLabels,
    resourceLabels,
    actionLabels,
  };
}
