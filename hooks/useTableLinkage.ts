'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLinkages, getAllLinkedTables, LinkageConfig } from '@/lib/config/table-linkage'
import { getEncryptionService } from '@/lib/security/encryption'
import { AuditLogService } from '@/lib/supabase/audit-log-v2'

export interface LinkageData {
  table: string
  records: any[]
  loaded: boolean
  error?: string
}

export interface ConsistencyIssue {
  id: string
  sourceTable: string
  targetTable: string
  field: string
  expectedValue: number
  actualValue: number
  difference: number
  severity: 'error' | 'warning' | 'info'
  message: string
}

export interface TableLinkageOptions {
  mainTable: string
  mainRecordId: string
  autoLoad?: boolean
  enableConsistencyCheck?: boolean
}

/**
 * 八张表智能联动Hook
 * 支持自动加载关联表数据、一致性检查、联动更新
 */
export function useTableLinkage(options: TableLinkageOptions) {
  const { mainTable, mainRecordId, autoLoad = true, enableConsistencyCheck = true } = options
  const queryClient = useQueryClient()

  const [linkageData, setLinkageData] = useState<Record<string, LinkageData>>({})
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([])
  const [isChecking, setIsChecking] = useState(false)

  // 获取联动配置
  const linkages = getLinkages(mainTable)
  const linkedTables = getAllLinkedTables(mainTable)

  // 加载主表数据
  const {
    data: mainData,
    isLoading: mainLoading,
    error: mainError
  } = useQuery({
    queryKey: ['table', mainTable, mainRecordId],
    queryFn: async () => {
      const response = await fetch(`/api/reits/${mainTable}/${mainRecordId}`)
      if (!response.ok) throw new Error('加载主表数据失败')
      return response.json()
    },
    enabled: !!mainRecordId && autoLoad
  })

  // 加载所有关联表数据
  const loadLinkedTables = useCallback(async () => {
    const promises = linkedTables.map(async (table) => {
      try {
        const response = await fetch(`/api/reits/${table}?fund_code=${mainRecordId}`)
        if (!response.ok) throw new Error(`加载${table}失败`)
        const data = await response.json()

        setLinkageData(prev => ({
          ...prev,
          [table]: {
            table,
            records: Array.isArray(data) ? data : [data],
            loaded: true
          }
        }))
      } catch (error: any) {
        setLinkageData(prev => ({
          ...prev,
          [table]: {
            table,
            records: [],
            loaded: false,
            error: error.message
          }
        }))
      }
    })

    await Promise.all(promises)
  }, [linkedTables, mainRecordId])

  // 自动加载关联表
  useEffect(() => {
    if (mainData && autoLoad) {
      loadLinkedTables()
    }
  }, [mainData, autoLoad, loadLinkedTables])

  // 数据一致性检查
  const checkConsistency = useCallback(async () => {
    if (!mainData || !enableConsistencyCheck) return

    setIsChecking(true)
    const issues: ConsistencyIssue[] = []

    try {
      // 检查出租率一致性（产品 vs 运营）
      if (mainTable === 'reit_product_info') {
        const operational = linkageData['reit_operational_data']
        if (operational?.records?.[0]) {
          const opOccupancy = operational.records[0].occupancy_rate
          const productOccupancy = mainData.avg_occupancy || 0
          const diff = Math.abs(opOccupancy - productOccupancy)

          if (diff > 5) {
            issues.push({
              id: `occupancy-${Date.now()}`,
              sourceTable: mainTable,
              targetTable: 'reit_operational_data',
              field: 'occupancy_rate',
              expectedValue: productOccupancy,
              actualValue: opOccupancy,
              difference: diff,
              severity: diff > 10 ? 'error' : 'warning',
              message: `出租率不一致：产品表${productOccupancy}% vs 运营表${opOccupancy}%`
            })
          }
        }
      }

      // 检查债务比率一致性（财务 vs 风险）
      if (mainTable === 'reit_financial_metrics') {
        const risk = linkageData['reit_risk_metrics']
        if (risk?.records?.[0]) {
          const riskDebt = risk.records[0].debt_ratio
          const financialDebt = mainData.total_debt / mainData.total_assets * 100
          const diff = Math.abs(riskDebt - financialDebt)

          if (diff > 2) {
            issues.push({
              id: `debt-${Date.now()}`,
              sourceTable: mainTable,
              targetTable: 'reit_risk_metrics',
              field: 'debt_ratio',
              expectedValue: financialDebt,
              actualValue: riskDebt,
              difference: diff,
              severity: diff > 5 ? 'error' : 'warning',
              message: `债务比率不一致：财务表${financialDebt.toFixed(2)}% vs 风险表${riskDebt.toFixed(2)}%`
            })
          }
        }
      }

      // 检查NAV一致性（运营 vs 市场）
      if (mainTable === 'reit_operational_data') {
        const market = linkageData['reit_market_performance']
        if (market?.records?.[0] && mainData.nav_per_share) {
          const marketNAV = market.records[0].nav_per_share
          const operationalNAV = mainData.nav_per_share
          const diff = Math.abs(marketNAV - operationalNAV) / operationalNAV * 100

          if (diff > 1) {
            issues.push({
              id: `nav-${Date.now()}`,
              sourceTable: mainTable,
              targetTable: 'reit_market_performance',
              field: 'nav_per_share',
              expectedValue: operationalNAV,
              actualValue: marketNAV,
              difference: diff,
              severity: diff > 3 ? 'error' : 'warning',
              message: `NAV不一致：运营表${operationalNAV.toFixed(2)}元 vs 市场表${marketNAV.toFixed(2)}元`
            })
          }
        }
      }

      setConsistencyIssues(issues)

      // 如果有问题，记录到审计日志
      if (issues.length > 0) {
        const auditService = new AuditLogService()
        await auditService.log({
          userId: 'system', // 系统自动检查
          username: 'system',
          action: 'consistency_check',
          resourceType: mainTable,
          resourceId: mainRecordId,
          newValue: { issues },
          result: issues.some(i => i.severity === 'error') ? 'failure' : 'success'
        })
      }
    } catch (error) {
      console.error('一致性检查失败:', error)
    } finally {
      setIsChecking(false)
    }
  }, [mainData, mainTable, mainRecordId, linkageData, enableConsistencyCheck])

  // 自动触发一致性检查
  useEffect(() => {
    if (mainData && Object.keys(linkageData).length > 0) {
      checkConsistency()
    }
  }, [mainData, linkageData, checkConsistency])

  // 联动更新
  const updateLinkedTables = useMutation({
    mutationFn: async (updates: Record<string, any[]>) => {
      const encryptionService = getEncryptionService()

      const results = await Promise.all(
        Object.entries(updates).map(async ([table, records]) => {
          // 加密敏感数据
          const encryptedRecords = records.map(record => {
            if (record.sensitive_data) {
              const encrypted = encryptionService.createEncryptedData(
                JSON.stringify(record.sensitive_data)
              )
              return {
                ...record,
                sensitive_data_encrypted: encrypted.encrypted,
                sensitive_data_iv: encrypted.iv,
                sensitive_data_auth_tag: encrypted.authTag,
                sensitive_data: undefined // 移除原始敏感数据
              }
            }
            return record
          })

          const response = await fetch(`/api/reits/${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: encryptedRecords })
          })

          if (!response.ok) {
            throw new Error(`更新${table}失败`)
          }

          return response.json()
        })
      )

      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table', mainTable, mainRecordId] })
      linkedTables.forEach(table => {
        queryClient.invalidateQueries({ queryKey: ['table', table] })
      })
    }
  })

  return {
    // 数据
    mainData,
    linkageData,
    linkages,
    linkedTables,
    consistencyIssues,

    // 加载状态
    mainLoading,
    isAllLoaded: Object.values(linkageData).every(d => d.loaded),
    isChecking,

    // 操作
    loadLinkedTables,
    checkConsistency,
    updateLinkedTables: updateLinkedTables.mutate,
    isUpdating: updateLinkedTables.isPending,

    // 错误
    mainError
  }
}
