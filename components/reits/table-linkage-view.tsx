'use client';

import { useTableLinkage } from '@/hooks/useTableLinkage';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, X, Table2, ArrowRight } from 'lucide-react';

export function TableLinkageView({
  sourceTable,
  sourceId,
}: {
  sourceTable: string;
  sourceId: string;
}) {
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const {
    linkageState,
    enableLinkage,
    disableLinkage,
    getAvailableLinkages,
    hasActiveLinkage,
  } = useTableLinkage();

  const availableLinkages = getAvailableLinkages(sourceTable);

  const handleEnableLinkage = () => {
    if (selectedTarget) {
      enableLinkage(sourceTable, sourceId, selectedTarget);
    }
  };

  return (
    <Card className="mt-4 border-slate-700 bg-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            <Table2 className="h-5 w-5 text-blue-400" />
            表格联动视图
          </CardTitle>
          {hasActiveLinkage() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={disableLinkage}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {!hasActiveLinkage() && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                选择目标表格
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableLinkages.map((linkage) => (
                  <button
                    key={linkage.table}
                    onClick={() => setSelectedTarget(linkage.table)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${
                        selectedTarget === linkage.table
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                      }
                    `}
                  >
                    <div className="font-medium text-sm">{linkage.label}</div>
                    <div className="text-xs text-slate-500 mt-1 capitalize">
                      {linkage.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedTarget && (
              <div className="flex justify-center">
                <Button
                  onClick={handleEnableLinkage}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  加载关联数据
                </Button>
              </div>
            )}
          </div>
        )}

        {hasActiveLinkage() && linkageState && (
          <div className="space-y-3">
            {linkageState.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : linkageState.error ? (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                {linkageState.error}
              </div>
            ) : linkageState.data.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-slate-400">
                  找到 {linkageState.data.length} 条关联记录
                </div>
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        {Object.keys(linkageState.data[0]).map((key) => (
                          <th key={key} className="px-3 py-2 text-left font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-400">
                      {linkageState.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/50">
                          {Object.values(row).map((value, cellIdx) => (
                            <td key={cellIdx} className="px-3 py-2">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                无关联数据
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
