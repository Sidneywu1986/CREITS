'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Shield, Plus, RefreshCw } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { usePermission } from '@/hooks/usePermission';

export default function PermissionManagementPage() {
  const router = useRouter();
  const { user, canRead, canUpdate } = usePermission();

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');

  // 加载角色列表
  const loadRoles = async () => {
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('加载角色失败:', error);
        return;
      }

      setRoles(data || []);

      // 默认选中第一个角色
      if (data && data.length > 0 && !selectedRole) {
        const roleData = data as any;
        setSelectedRole(roleData[0].id);
      }
    } catch (error) {
      console.error('加载角色失败:', error);
    }
  };

  // 加载选中角色的权限
  const loadPermissions = async () => {
    if (!selectedRole) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('role_id', selectedRole)
        .order('resource', { ascending: true });

      if (error) {
        console.error('加载权限失败:', error);
        return;
      }

      setPermissions(data || []);
    } catch (error) {
      console.error('加载权限失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加权限
  const addPermission = async (resource: string, action: string) => {
    if (!selectedRole) return;

    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      const { error } = await supabase.from('permissions').insert({
        role_id: selectedRole,
        resource,
        action,
      } as any);

      if (error) {
        console.error('添加权限失败:', error);
        return;
      }

      // 重新加载权限
      await loadPermissions();
    } catch (error) {
      console.error('添加权限失败:', error);
    }
  };

  // 删除权限
  const deletePermission = async (permissionId: string) => {
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (error) {
        console.error('删除权限失败:', error);
        return;
      }

      // 重新加载权限
      await loadPermissions();
    } catch (error) {
      console.error('删除权限失败:', error);
    }
  };

  useEffect(() => {
    if (user && canRead('system:roles' as any)) {
      loadRoles();
    }
  }, [user, canRead]);

  useEffect(() => {
    if (selectedRole) {
      loadPermissions();
    }
  }, [selectedRole]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!canRead('system:roles' as any)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h3 className="text-xl font-semibold text-white mb-2">
            权限不足
          </h3>
          <p className="text-slate-400">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }

  const selectedRoleData = roles.find((r) => r.id === selectedRole);

  return (
    <>
      <Head>
        <title>权限管理 - REITs智能助手</title>
        <meta name="description" content="管理角色和权限" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* 顶部导航栏 */}
        <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  返回
                </Button>
                <h1 className="text-2xl font-bold text-white">权限管理</h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRoles}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* 角色选择 */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-white">选择角色</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="请选择角色" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-white hover:bg-slate-700">
                      {role.name} ({role.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 权限列表 */}
          {selectedRoleData && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-white">
                  {selectedRoleData.name} 的权限
                </CardTitle>
                {canUpdate('system:roles' as any) && (
                  <Button size="sm" className="bg-[#667eea] hover:bg-[#667eea]/90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    添加权限
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : permissions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    暂无权限
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-slate-300">资源</TableHead>
                        <TableHead className="text-slate-300">操作</TableHead>
                        <TableHead className="text-slate-300">条件</TableHead>
                        <TableHead className="text-slate-300 text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="text-white">
                            {permission.resource}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {permission.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {permission.conditions || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {canUpdate('system:roles' as any) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePermission(permission.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                删除
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
