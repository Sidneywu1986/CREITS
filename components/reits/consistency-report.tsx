'use client';

import { ConsistencyCheckResult } from '@/config/consistency-rules';
import { ConsistencyChecker } from '@/lib/consistency/checker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Info, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ConsistencyReportProps {
  results: ConsistencyCheckResult[];
  table: string;
  recordId?: string;
}

export function ConsistencyReport({ results, table, recordId }: ConsistencyReportProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const summary = ConsistencyChecker.getSummary(results);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const exportReport = () => {
    const report = ConsistencyChecker.exportReport(results, table);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consistency-report-${table}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string): 'default' | 'destructive' | 'outline' => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'outline';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const failedResults = ConsistencyChecker.getFailedResults(results);

  return (
    <Card className="border-slate-700 bg-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            {summary.failed === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            数据一致性检查报告
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportReport}
            className="text-slate-400 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-3 space-y-4">
        {/* 摘要统计 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-2xl font-bold text-white">{summary.total}</div>
            <div className="text-xs text-slate-400">总检查数</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{summary.passed}</div>
            <div className="text-xs text-slate-400">通过</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{summary.failed}</div>
            <div className="text-xs text-slate-400">失败</div>
          </div>
        </div>

        {/* 错误、警告、信息统计 */}
        {summary.failed > 0 && (
          <div className="flex gap-2">
            {summary.errors > 0 && (
              <Badge variant="destructive" className="text-sm">
                {summary.errors} 错误
              </Badge>
            )}
            {summary.warnings > 0 && (
              <Badge variant="outline" className="text-sm text-yellow-400 border-yellow-500/50">
                {summary.warnings} 警告
              </Badge>
            )}
            {summary.infos > 0 && (
              <Badge variant="default" className="text-sm text-blue-400 bg-blue-500/20 border-blue-500/50">
                {summary.infos} 信息
              </Badge>
            )}
          </div>
        )}

        {/* 失败项详情 */}
        {failedResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">失败项详情</div>
            <div className="space-y-2">
              {failedResults.map((result, index) => {
                const itemId = `${result.rule.id}-${index}`;
                const isExpanded = expandedItems.has(itemId);

                return (
                  <div
                    key={itemId}
                    className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpand(itemId)}
                      className="w-full p-3 flex items-start gap-3 text-left hover:bg-slate-700/50 transition-colors"
                    >
                      {getSeverityIcon(result.rule.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-200">
                            {result.rule.name}
                          </span>
                          <Badge
                            variant={getSeverityBadgeVariant(result.rule.severity)}
                            className="text-xs"
                          >
                            {result.rule.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400 truncate">
                          {result.message}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400 mt-1" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 mt-1" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 ml-7 border-t border-slate-700/50 pt-3">
                        <div className="text-sm text-slate-400 mb-2">
                          <span className="font-medium text-slate-300">描述：</span>
                          {result.rule.description}
                        </div>
                        <div className="bg-slate-800 rounded p-2 mt-2 overflow-x-auto">
                          <pre className="text-xs text-slate-400">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 全部通过 */}
        {summary.failed === 0 && summary.total > 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-green-400">
            <CheckCircle2 className="h-16 w-16 mb-3" />
            <div className="text-lg font-medium">所有检查通过</div>
            <div className="text-sm text-slate-400">数据符合一致性要求</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
