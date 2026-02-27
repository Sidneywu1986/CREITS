'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Database, RefreshCw, Table } from 'lucide-react';
import { toast } from 'sonner';

export default function DatabaseManagementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [tableStats, setTableStats] = useState<any[]>([]);
  const [initResult, setInitResult] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('/api/database/status');
      const data = await response.json();

      if (data.connected) {
        setConnectionStatus('connected');
        setTableStats(data.tables || []);
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      toast.error('连接失败', {
        description: '无法连接到数据库',
      });
    }
  };

  const initializeDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/init', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setInitResult(data);
        toast.success('初始化成功', {
          description: 'Schema 已解析，请在 Supabase 控制台执行 SQL 语句',
        });
      } else {
        toast.error('初始化失败', {
          description: data.error || '未知错误',
        });
      }
    } catch (error) {
      toast.error('请求失败', {
        description: '无法连接到服务器',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tableList = [
    { name: 'reit_product_info', description: '产品基本信息', rows: 0 },
    { name: 'reit_property_base', description: '底层资产通用信息', rows: 0 },
    { name: 'reit_property_equity_ops', description: '产权类运营数据', rows: 0 },
    { name: 'reit_property_concession_ops', description: '经营权类运营数据', rows: 0 },
    { name: 'reit_financial_metrics', description: '财务指标', rows: 0 },
    { name: 'reit_valuation', description: '估值信息', rows: 0 },
    { name: 'reit_risk_compliance', description: '风险合规', rows: 0 },
    { name: 'reit_market_stats', description: '市场表现', rows: 0 },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据库管理</h1>
          <p className="text-muted-foreground">管理 REITs 数据库的表结构和数据</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={checkConnection} disabled={connectionStatus === 'checking'}>
            <RefreshCw className={`mr-2 h-4 w-4 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
            刷新状态
          </Button>
        </div>
      </div>

      {/* 连接状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            数据库连接状态
          </CardTitle>
          <CardDescription>当前数据库连接状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {connectionStatus === 'connected' ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-lg font-semibold text-green-600">已连接</span>
                <Badge variant="outline" className="ml-2">Supabase</Badge>
              </>
            ) : connectionStatus === 'checking' ? (
              <>
                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                <span className="text-lg font-semibold text-blue-600">检查中...</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-red-600" />
                <span className="text-lg font-semibold text-red-600">未连接</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="tables">数据表</TabsTrigger>
          <TabsTrigger value="init">初始化</TabsTrigger>
          <TabsTrigger value="query">数据查询</TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">数据表数量</CardTitle>
                <Table className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">核心业务表</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">数据库类型</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Supabase</div>
                <p className="text-xs text-muted-foreground">基于 PostgreSQL</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">架构版本</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v1.0</div>
                <p className="text-xs text-muted-foreground">REITs 专业数据库</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>数据库架构说明</CardTitle>
              <CardDescription>REITs 数据库采用专业设计，包含 8 张核心表</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                数据库涵盖 REITs 产品的全生命周期数据，包括：
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>产品信息</strong>：REITs 基金的基本信息</li>
                <li><strong>资产信息</strong>：底层资产的地理位置、权证、土地信息</li>
                <li><strong>运营数据</strong>：产权类和经营权类资产的运营指标</li>
                <li><strong>财务指标</strong>：FFO、可供分配金额、分派率等</li>
                <li><strong>估值信息</strong>：评估价值、折现率、资本化率</li>
                <li><strong>风险合规</strong>：监管状态、诉讼、ESG 评分</li>
                <li><strong>市场表现</strong>：股价、成交量、投资者结构</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据表 */}
        <TabsContent value="tables" className="space-y-4">
          <div className="grid gap-4">
            {tableList.map((table) => (
              <Card key={table.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    {table.name}
                  </CardTitle>
                  <CardDescription>{table.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">数据行数：</span>
                    <Badge variant="outline">{table.rows}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 初始化 */}
        <TabsContent value="init" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>数据库初始化</CardTitle>
              <CardDescription>
                执行 SQL 脚本以创建所有数据表
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">初始化步骤：</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>点击"解析 Schema"按钮，系统将解析 SQL 脚本</li>
                  <li>登录 Supabase 控制台</li>
                  <li>进入 SQL Editor</li>
                  <li>复制 <code className="bg-background px-1 py-0.5 rounded">database/schema.sql</code> 文件内容</li>
                  <li>粘贴到 SQL Editor 并执行</li>
                </ol>
              </div>

              <Button onClick={initializeDatabase} disabled={isLoading}>
                {isLoading ? '解析中...' : '解析 Schema'}
              </Button>

              {initResult && (
                <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950">
                  <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">解析成功</h4>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    共解析 {initResult.tables?.length || 0} 张表
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300">
                    {initResult.tables?.map((table: string, idx: number) => (
                      <li key={idx}>{table}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据查询 */}
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>快速查询</CardTitle>
              <CardDescription>执行常用的数据库查询</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Button variant="outline" onClick={() => window.open('/api/database/query/products', '_blank')}>
                  查询所有 REITs 产品
                </Button>
                <Button variant="outline" onClick={() => window.open('/api/database/query/assets', '_blank')}>
                  查询所有底层资产
                </Button>
                <Button variant="outline" onClick={() => window.open('/api/database/query/metrics', '_blank')}>
                  查询最新财务指标
                </Button>
                <Button variant="outline" onClick={() => window.open('/api/database/query/market', '_blank')}>
                  查询市场表现数据
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
