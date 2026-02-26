'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
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
import { Download, RefreshCw, Filter } from 'lucide-react';
import { AuditLogService, type AuditLog } from '@/lib/supabase/audit-log';
import { usePermission } from '@/hooks/usePermission';

export default function AuditLogsPage() {
  const { user, canRead } = usePermission();

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    resourceType: '',
    action: '',
    result: '',
  });

  const pageSize = 50;

  // 加载审计日志
  const loadLogs = async () => {
    try {
      setLoading(true);

      const { data, total } = await AuditLogService.query(
        filters,
        page,
        pageSize
      );

      setLogs(data);
      setTotal(total);
    } catch (error) {
      console.error('加载审计日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导出审计日志
  const exportLogs = async () => {
    try {
      const csv = await AuditLogService.export(filters);

      if (!csv) {
        alert('导出失败');
        return;
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出审计日志失败:', error);
      alert('导出失败');
    }
  };

  useEffect(() => {
    if (user && canRead('system:logs')) {
      loadLogs();
    }
  }, [user, canRead, page, filters]);

  if (!user || !canRead('system:logs')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            权限不足
          </h3>
          <p className="text-slate-400">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>审计日志 - REITs智能助手</title>
        <meta name="description" content="查看系统审计日志" />
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
                  onClick={() => window.history.back()}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  返回
                </Button>
                <h1 className="text-2xl font-bold text-white">审计日志</h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportLogs}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadLogs}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* 筛选条件 */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                筛选条件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">资源类型</Label>
                  <Input
                    placeholder="输入资源类型..."
                    value={filters.resourceType}
                    onChange={(e) =>
                      setFilters({ ...filters, resourceType: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">操作</Label>
                  <Input
                    placeholder="输入操作类型..."
                    value={filters.action}
                    onChange={(e) =>
                      setFilters({ ...filters, action: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">结果</Label>
                  <Input
                    placeholder="success / failure"
                    value={filters.result}
                    onChange={(e) =>
                      setFilters({ ...filters, result: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 border-blue-500/30">
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-300">总记录数</div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{total}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/30">
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-300">成功操作</div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {logs.filter((l) => l.result === 'success').length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500/20 to-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-300">失败操作</div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">
                  {logs.filter((l) => l.result === 'failure').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 日志列表 */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-white">日志列表</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  暂无日志记录
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-slate-300">时间</TableHead>
                        <TableHead className="text-slate-300">用户</TableHead>
                        <TableHead className="text-slate-300">操作</TableHead>
                        <TableHead className="text-slate-300">资源</TableHead>
                        <TableHead className="text-slate-300">结果</TableHead>
                        <TableHead className="text-slate-300">错误信息</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-slate-300">
                            {new Date(log.createdAt).toLocaleString('zh-CN')}
                          </TableCell>
                          <TableCell className="text-white">
                            {log.username}
                          </TableCell>
                          <TableCell className="text-white">
                            {log.action}
                          </TableCell>
                          <TableCell className="text-white">
                            {log.resourceType}
                            {log.resourceId && ` (${log.resourceId})`}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={log.result === 'success' ? 'default' : 'destructive'}
                              className={
                                log.result === 'success'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : ''
                              }
                            >
                              {log.result}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {log.errorMessage || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* 分页 */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                    <div className="text-sm text-slate-400">
                      共 {total} 条记录，第 {page} 页
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="border-slate-600 text-slate-300"
                      >
                        上一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page * pageSize >= total}
                        className="border-slate-600 text-slate-300"
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
