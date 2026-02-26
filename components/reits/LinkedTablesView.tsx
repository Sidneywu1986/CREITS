'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, CheckCircle, Link2 } from 'lucide-react'
import { useTableLinkage } from '@/hooks/useTableLinkage'
import { LinkageData, ConsistencyIssue } from '@/hooks/useTableLinkage'

interface LinkedTablesViewProps {
  mainTable: string
  mainRecordId: string
}

export function LinkedTablesView({ mainTable, mainRecordId }: LinkedTablesViewProps) {
  const {
    linkageData,
    linkages,
    consistencyIssues,
    mainLoading,
    isAllLoaded,
    isChecking,
    loadLinkedTables,
    checkConsistency,
    mainError
  } = useTableLinkage({
    mainTable,
    mainRecordId,
    autoLoad: true,
    enableConsistencyCheck: true
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'warning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'info': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const getTableTypeColor = (type: string) => {
    switch (type) {
      case 'one-to-one': return 'bg-purple-500/20 text-purple-300'
      case 'one-to-many': return 'bg-blue-500/20 text-blue-300'
      case 'many-to-many': return 'bg-green-500/20 text-green-300'
      default: return 'bg-slate-500/20 text-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-400" />
            八张表智能联动
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {mainTable} 的关联表数据实时联动
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLinkedTables}
            disabled={mainLoading}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${mainLoading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConsistency}
            disabled={isChecking || !isAllLoaded}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            检查一致性
          </Button>
        </div>
      </div>

      {/* 一致性问题 */}
      {consistencyIssues.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-300 flex items-center gap-2 text-base">
              <AlertCircle className="w-5 h-5" />
              发现 {consistencyIssues.length} 个数据一致性问题
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {consistencyIssues.map(issue => (
              <div key={issue.id} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{issue.message}</span>
                      <Badge variant="outline" className="text-xs">
                        {issue.severity}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/70">
                      差异值: {issue.difference.toFixed(2)}
                      {issue.severity === 'error' && ' (需要修复)'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 无一致性问题时显示 */}
      {isAllLoaded && consistencyIssues.length === 0 && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300">所有数据一致性良好</span>
          </CardContent>
        </Card>
      )}

      {/* 关联表列表 */}
      <div className="space-y-3">
        {Object.entries(linkageData).map(([table, data]) => (
          <Card key={table} className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-white text-base">
                    {table}
                  </CardTitle>
                  <Badge className={getTableTypeColor('one-to-many')}>
                    1对多
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-white/70">
                    {data.records.length} 条记录
                  </Badge>
                </div>

                {data.error && (
                  <Badge variant="outline" className="border-red-500/30 text-red-400">
                    加载失败
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {data.loaded ? (
                data.records.length > 0 ? (
                  <div className="space-y-2">
                    {data.records.slice(0, 3).map((record: any, index: number) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                        <div className="text-sm text-white/80 font-mono">
                          {JSON.stringify(record, null, 2)}
                        </div>
                      </div>
                    ))}
                    {data.records.length > 3 && (
                      <div className="text-center text-sm text-white/60 py-2">
                        还有 {data.records.length - 3} 条记录...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-white/40 text-sm">
                    暂无数据
                  </div>
                )
              ) : (
                <div className="text-center py-4 text-white/60 text-sm">
                  加载中...
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {mainError && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 text-red-300">
              加载主表数据失败: {mainError.message}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
