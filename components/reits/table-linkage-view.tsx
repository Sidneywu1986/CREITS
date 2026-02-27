'use client';

import { useTableLinkage } from '@/hooks/useTableLinkage';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Table2, AlertCircle } from 'lucide-react';

export function TableLinkageView({
  sourceTable,
  sourceId,
}: {
  sourceTable: string;
  sourceId: string;
}) {
  const {
    mainData,
    linkageData,
    linkages,
    linkedTables,
    consistencyIssues,
    mainLoading,
    isAllLoaded,
    isChecking,
    isUpdating,
    loadLinkedTables,
    checkConsistency,
    mainError,
  } = useTableLinkage({
    mainTable: sourceTable,
    mainRecordId: sourceId,
    autoLoad: true,
    enableConsistencyCheck: true,
  });

  // 初始加载关联表
  useEffect(() => {
    if (sourceId && !isAllLoaded) {
      loadLinkedTables();
    }
  }, [sourceId, isAllLoaded, loadLinkedTables]);

  // 获取可用联动配置
  const availableLinkages = linkages.filter(
    (linkage) => !linkedTables.includes(linkage.table)
  );

  // 获取已激活的联动
  const activeLinkages = linkages.filter((linkage) =>
    linkedTables.includes(linkage.table)
  );

  const handleRefresh = () => {
    loadLinkedTables();
  };

  const handleCheckConsistency = () => {
    checkConsistency();
  };

  return (
    <Card className="mt-4 border-slate-700 bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
          <Table2 className="h-5 w-5 text-blue-400" />
          表格联动视图
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {mainLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span className="text-slate-400">加载主表数据...</span>
          </div>
        ) : mainError ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {mainError instanceof Error ? mainError.message : String(mainError)}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 主表数据摘要 */}
            {mainData && (
              <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3">
                <div className="text-sm font-medium text-slate-300 mb-2">
                  主表: {sourceTable}
                </div>
                <div className="text-xs text-slate-400">
                  记录ID: {sourceId}
                </div>
              </div>
            )}

            {/* 已激活的联动 */}
            {activeLinkages.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-300">
                  已关联表格 ({activeLinkages.length})
                </div>
                {activeLinkages.map((linkage) => {
                  const tableData = linkageData[linkage.table];
                  return (
                    <div
                      key={linkage.table}
                      className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden"
                    >
                      <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-300">
                          {linkage.table}
                        </div>
                        {tableData?.loaded ? (
                          <span className="text-xs text-green-400">
                            已加载 {tableData.records?.length || 0} 条
                          </span>
                        ) : tableData?.error ? (
                          <span className="text-xs text-red-400">
                            加载失败
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            未加载
                          </span>
                        )}
                      </div>
                      {!tableData?.loaded ? (
                        tableData?.error ? (
                          <div className="p-3 text-sm text-red-400">
                            {tableData.error}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-slate-500 text-sm">
                            无数据
                          </div>
                        )
                      ) : tableData.records && tableData.records.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-800/50 text-slate-400">
                              <tr>
                                {Object.keys(tableData.records[0]).map((key) => (
                                  <th key={key} className="px-3 py-2 text-left">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-slate-400">
                              {tableData.records.slice(0, 5).map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-700/30">
                                  {Object.values(row).map((value, cellIdx) => (
                                    <td key={cellIdx} className="px-3 py-2">
                                      {String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {tableData.records.length > 5 && (
                            <div className="px-3 py-2 text-xs text-slate-500 text-center">
                              还有 {tableData.records.length - 5} 条记录...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          无数据
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 可用联动 */}
            {availableLinkages.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-300">
                  可关联表格
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableLinkages.map((linkage) => (
                    <div
                      key={linkage.table}
                      className="p-3 rounded-lg border border-slate-700 bg-slate-900/30 text-slate-400"
                    >
                      <div className="font-medium text-sm">
                        {linkage.table}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 capitalize">
                        {linkage.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 一致性检查结果 */}
            {consistencyIssues.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  一致性问题 ({consistencyIssues.length})
                </div>
                {consistencyIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      issue.severity === 'error'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    }`}
                  >
                    <div className="text-sm font-medium">{issue.message}</div>
                    <div className="text-xs mt-1 opacity-80">
                      {issue.sourceTable} → {issue.targetTable}: {issue.field}
                      (期望: {issue.expectedValue}, 实际: {issue.actualValue})
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleRefresh}
                disabled={isUpdating}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    更新中...
                  </>
                ) : (
                  '刷新数据'
                )}
              </button>
              <button
                onClick={handleCheckConsistency}
                disabled={isChecking}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    检查中...
                  </>
                ) : (
                  '检查一致性'
                )}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
