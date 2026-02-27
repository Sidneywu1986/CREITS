'use client';

import { useState, useCallback, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { loadUserPermissions } from '@/lib/supabase/auth';
import type { Role, Resource, Action } from '@/config/rbac';

export interface User {
  id: string;
  username: string;
  email: string;
  roleId: string;
  roleName: string;
  roleCode: Role;
  permissions: string[];
}

// 角色标签
const roleLabels: Record<Role, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  editor: '编辑',
  viewer: '查看者',
  guest: '访客',
};

// 资源标签
const resourceLabels: Record<Resource, string> = {
  'reits:product': 'REITs产品信息',
  'reits:property': 'REITs资产信息',
  'reits:financial': 'REITs财务指标',
  'reits:operational': 'REITs运营数据',
  'reits:market': 'REITs市场表现',
  'reits:investor': 'REITs投资者结构',
  'reits:dividend': 'REITs收益分配',
  'reits:risk': 'REITs风险指标',
  'reits:all': 'REITs全部数据',
  'abs:data': 'ABS数据中心',
  'system:users': '系统用户管理',
  'system:logs': '系统日志',
  'system:settings': '系统设置',
};

// 动作标签
const actionLabels: Record<Action, string> = {
  create: '创建',
  read: '查看',
  update: '更新',
  delete: '删除',
  export: '导出',
};

export function usePermission() {
  const [user, setUser] = useState<User | null>(() => {
    // 从 localStorage 读取用户信息
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // 设置当前用户
  const setCurrentUser = useCallback((userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  }, []);

  // 从Supabase刷新用户权限
  const refreshPermissions = useCallback(async () => {
    if (!user?.roleId) return;

    setLoading(true);
    try {
      const permissions = await loadUserPermissions(user.roleId);
      setCurrentUser({ ...user, permissions });
    } catch (error) {
      console.error('刷新权限失败:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setCurrentUser]);

  // 清除当前用户
  const clearCurrentUser = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }, []);

  // 从Supabase加载用户信息
  const loadUserFromSupabase = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        clearCurrentUser();
        return null;
      }

      // 检查Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        clearCurrentUser();
        return null;
      }

      // 从自定义users表获取用户详情
      const { data: userData, error } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        console.error('加载用户数据失败:', error);
        return null;
      }

      // 类型断言
      const user = userData as any;

      // 加载权限
      const permissions = await loadUserPermissions(user.role_id);

      const userObj: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.role_id,
        roleName: user.roles?.name || '',
        roleCode: user.roles?.code || 'guest',
        permissions,
      };

      setCurrentUser(userObj);
      return userObj;
    } catch (error) {
      console.error('从Supabase加载用户失败:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearCurrentUser, setCurrentUser]);

  // 检查当前用户是否具有某个权限
  const checkPermission = useCallback(
    (resource: Resource, action: Action): boolean => {
      if (!user || !user.permissions) return false;

      const permissionKey = `${resource}:${action}`;
      return user.permissions.includes(permissionKey);
    },
    [user]
  );

  // 检查当前用户是否为管理员
  const isCurrentUserAdmin = useCallback((): boolean => {
    if (!user) return false;
    return user.roleCode === 'super_admin' || user.roleCode === 'admin';
  }, [user]);

  // 检查当前用户是否具有某个角色的权限
  const hasRole = useCallback(
    (role: Role): boolean => {
      if (!user) return false;
      return user.roleCode === role;
    },
    [user]
  );

  // 检查当前用户是否具有多个角色中的任意一个
  const hasAnyRole = useCallback(
    (roles: Role[]): boolean => {
      if (!user) return false;
      return roles.includes(user.roleCode);
    },
    [user]
  );

  // 获取当前用户的角色标签
  const getRoleLabel = useCallback((): string => {
    if (!user) return '未登录';
    return roleLabels[user.roleCode] || user.roleCode;
  }, [user]);

  // 获取当前用户的所有权限
  const getCurrentPermissions = useCallback(() => {
    if (!user) return [];
    return user.permissions || [];
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

  // 组件挂载时尝试从Supabase加载用户信息
  useEffect(() => {
    // 如果localStorage中没有用户信息，尝试从Supabase加载
    if (!user) {
      loadUserFromSupabase();
    }
  }, [user, loadUserFromSupabase]);

  // 监听Supabase认证状态变化
  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.warn('Supabase client not initialized, skipping auth state change listener');
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        clearCurrentUser();
      } else if (!user) {
        // 如果没有本地用户但有Supabase session，加载用户信息
        await loadUserFromSupabase();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadUserFromSupabase, clearCurrentUser]);

  return {
    user,
    loading,
    setCurrentUser,
    clearCurrentUser,
    loadUserFromSupabase,
    refreshPermissions,
    checkPermission,
    isCurrentUserAdmin,
    hasRole,
    hasAnyRole,
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

// 重新导出类型
export type { Resource, Action } from '@/config/rbac';
