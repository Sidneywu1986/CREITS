'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DatabaseTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSummary(null);

    try {
      // 动态导入测试模块
      const testModule = await import('@/tests/database.test');
      const results = await testModule.runAllTests();

      setTestResults(results.results || []);
      setSummary({
        total: results.total,
        passed: results.passed,
        failed: results.failed,
      });
    } catch (error: any) {
      console.error('测试执行出错:', error);
      alert(`测试执行出错: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据库测试</h1>
          <p className="text-muted-foreground">运行数据库功能测试以验证服务层</p>
        </div>
        <Button onClick={runTests} disabled={isRunning}>
          <Play className={`mr-2 h-4 w-4 ${isRunning ? 'animate-pulse' : ''}`} />
          {isRunning ? '测试运行中...' : '运行测试'}
        </Button>
      </div>

      {/* 测试总结 */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>测试总结</CardTitle>
            <CardDescription>所有测试的执行结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-muted-foreground">总测试数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                <div className="text-sm text-muted-foreground">通过</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-muted-foreground">失败</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">通过率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试详情</CardTitle>
            <CardDescription>每个测试的执行结果</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      result.passed ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                    }`}
                  >
                    {result.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{result.name}</div>
                        <Badge variant={result.passed ? 'default' : 'destructive'}>
                          {result.passed ? '通过' : '失败'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                      {result.duration && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {result.duration}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 初始状态 */}
      {testResults.length === 0 && !isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-16 w-16 text-muted-foreground mb-4" />
            <div className="text-lg font-semibold mb-2">准备就绪</div>
            <div className="text-sm text-muted-foreground mb-4">点击上方按钮开始运行数据库测试</div>
            <div className="text-xs text-muted-foreground">
              测试将覆盖产品查询、资产查询、财务指标、市场表现等功能
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
