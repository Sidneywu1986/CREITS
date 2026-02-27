import { createClient } from '@/lib/supabase/server'
import { AuditLogService } from '@/lib/supabase/audit-log-v2'

/**
 * 一致性规则
 */
export interface ConsistencyRule {
  id: string
  name: string
  description: string
  tables: string[]
  fields: string[]
  check: (data: any) => { passed: boolean; message: string; severity: 'error' | 'warning' | 'info' }
}

/**
 * 一致性违规
 */
export interface ConsistencyViolation {
  id: string
  ruleId: string
  ruleName: string
  severity: 'error' | 'warning' | 'info'
  message: string
  tables: string[]
  resourceId?: string
  timestamp: string
  resolved: boolean
}

/**
 * 数据一致性检查服务
 */
export class ConsistencyChecker {
  private supabase
  private auditService

  constructor() {
    this.supabase = createClient()
    this.auditService = new AuditLogService()
  }

  /**
   * 获取所有规则
   */
  getRules(): ConsistencyRule[] {
    return [
      {
        id: 'occupancy-consistency',
        name: '出租率一致性',
        description: '产品表和运营表的出租率应该一致',
        tables: ['reit_product_info', 'reit_operational_data'],
        fields: ['avg_occupancy', 'occupancy_rate'],
        check: (data: any) => {
          const diff = Math.abs((data.product_occupancy || 0) - (data.occupancy || 0))
          if (diff > 10) {
            return {
              passed: false,
              message: `出租率差异过大：${diff.toFixed(2)}%`,
              severity: 'error'
            }
          } else if (diff > 5) {
            return {
              passed: false,
              message: `出租率差异：${diff.toFixed(2)}%`,
              severity: 'warning'
            }
          }
          return { passed: true, message: '出租率一致', severity: 'info' }
        }
      },
      {
        id: 'debt-ratio-consistency',
        name: '债务比率一致性',
        description: '财务表和风险表的债务比率应该一致',
        tables: ['reit_financial_metrics', 'reit_risk_metrics'],
        fields: ['debt_ratio'],
        check: (data: any) => {
          const diff = Math.abs((data.financial_debt || 0) - (data.risk_debt || 0))
          if (diff > 5) {
            return {
              passed: false,
              message: `债务比率差异过大：${diff.toFixed(2)}%`,
              severity: 'error'
            }
          } else if (diff > 2) {
            return {
              passed: false,
              message: `债务比率差异：${diff.toFixed(2)}%`,
              severity: 'warning'
            }
          }
          return { passed: true, message: '债务比率一致', severity: 'info' }
        }
      },
      {
        id: 'nav-consistency',
        name: 'NAV一致性',
        description: '运营表和市场表的NAV应该一致',
        tables: ['reit_operational_data', 'reit_market_performance'],
        fields: ['nav_per_share'],
        check: (data: any) => {
          const diff = Math.abs((data.operational_nav || 0) - (data.market_nav || 0))
          const percentageDiff = (diff / Math.max(data.operational_nav || 1, data.market_nav || 1)) * 100
          if (percentageDiff > 3) {
            return {
              passed: false,
              message: `NAV差异过大：${percentageDiff.toFixed(2)}%`,
              severity: 'error'
            }
          } else if (percentageDiff > 1) {
            return {
              passed: false,
              message: `NAV差异：${percentageDiff.toFixed(2)}%`,
              severity: 'warning'
            }
          }
          return { passed: true, message: 'NAV一致', severity: 'info' }
        }
      }
    ]
  }

  /**
   * 检查单个记录
   */
  async checkRecord(table: string, recordId: string): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = []

    // 获取记录
    const { data: record, error } = await this.supabase
      .from(table)
      .select('*')
      .eq('id', recordId)
      .single()

    if (error || !record) {
      console.error(`获取记录失败 [${table}]:`, error)
      return violations
    }

    // 获取关联记录
    const fundCode = record.fund_code
    if (!fundCode) {
      return violations
    }

    // 应用所有规则
    const rules = this.getRules()

    for (const rule of rules) {
      if (!rule.tables.includes(table)) {
        continue
      }

      // 获取关联表数据
      const otherTable = rule.tables.find(t => t !== table)
      if (!otherTable) continue

      const { data: relatedRecords } = await this.supabase
        .from(otherTable)
        .select('*')
        .eq('fund_code', fundCode)
        .limit(1)

      if (!relatedRecords || relatedRecords.length === 0) {
        continue
      }

      const relatedRecord = relatedRecords[0]

      // 构建检查数据
      const checkData = this.buildCheckData(table, otherTable, record, relatedRecord)

      // 执行检查
      const result = rule.check(checkData)

      if (!result.passed) {
        violations.push({
          id: `${rule.id}-${recordId}-${Date.now()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: result.severity,
          message: result.message,
          tables: rule.tables,
          resourceId: recordId,
          timestamp: new Date().toISOString(),
          resolved: false
        })
      }
    }

    return violations
  }

  /**
   * 全量检查
   */
  async fullCheck(tables: string[] = ['reit_product_info']): Promise<ConsistencyViolation[]> {
    const allViolations: ConsistencyViolation[] = []

    for (const table of tables) {
      // 获取所有记录
      const { data: records } = await this.supabase
        .from(table)
        .select('id, fund_code')

      if (!records) continue

      // 检查每条记录
      for (const record of records) {
        const violations = await this.checkRecord(table, record.id)
        allViolations.push(...violations)
      }
    }

    // 记录检查结果
    if (allViolations.length > 0) {
      await this.auditService.log({
        userId: 'system',
        username: 'system',
        action: 'consistency_check',
        resourceType: 'full_check',
        newValue: { violationCount: allViolations.length },
        result: 'success'
      })
    }

    return allViolations
  }

  /**
   * 构建检查数据
   */
  private buildCheckData(
    table1: string,
    table2: string,
    record1: any,
    record2: any
  ): any {
    const data: any = {}

    // 根据表名映射字段
    if (table1 === 'reit_product_info' && table2 === 'reit_operational_data') {
      data.product_occupancy = record1.avg_occupancy
      data.occupancy = record2.occupancy_rate
    }

    if (table1 === 'reit_financial_metrics' && table2 === 'reit_risk_metrics') {
      data.financial_debt = (record1.total_debt / record1.total_assets) * 100
      data.risk_debt = record2.debt_ratio
    }

    if (table1 === 'reit_operational_data' && table2 === 'reit_market_performance') {
      data.operational_nav = record1.nav_per_share
      data.market_nav = record2.nav_per_share
    }

    return data
  }

  /**
   * 获取所有违规记录
   */
  async getViolations(resolved: boolean = false): Promise<ConsistencyViolation[]> {
    // 从数据库获取（需要创建consistency_violations表）
    // 这里暂时返回空数组
    return []
  }

  /**
   * 标记违规为已解决
   */
  async markResolved(violationId: string): Promise<void> {
    // 更新数据库
  }

  /**
   * 获取检查结果摘要（静态方法）
   */
  static getSummary(results: any[]): {
    total: number;
    errors: number;
    warnings: number;
    info: number;
    infos: number;
    passed: number;
    failed: number;
  } {
    const errors = results.filter(r => r.severity === 'error' || (!r.passed && r.severity === 'error')).length;
    const warnings = results.filter(r => r.severity === 'warning').length;
    const info = results.filter(r => r.severity === 'info').length;
    
    return {
      total: results.length,
      errors,
      warnings,
      info,
      infos: info, // 别名
      passed: results.filter(r => r.passed).length,
      failed: results.length - results.filter(r => r.passed).length,
    };
  }

  /**
   * 获取失败的结果（静态方法）
   */
  static getFailedResults(results: any[]): any[] {
    return results.filter(r => !r.passed || r.severity === 'error' || r.severity === 'warning');
  }

  /**
   * 导出报告（静态方法）
   */
  static exportReport(results: any[], table: string): string {
    const summary = ConsistencyChecker.getSummary(results);
    const timestamp = new Date().toISOString();
    
    let report = `# 数据一致性检查报告\n\n`;
    report += `**生成时间**: ${timestamp}\n`;
    report += `**检查表**: ${table}\n\n`;
    report += `## 摘要\n\n`;
    report += `- 总检查项: ${summary.total}\n`;
    report += `- 错误: ${summary.errors}\n`;
    report += `- 警告: ${summary.warnings}\n`;
    report += `- 信息: ${summary.info}\n`;
    report += `- 通过: ${summary.passed}\n`;
    report += `- 失败: ${summary.failed}\n\n`;
    
    if (summary.failed > 0) {
      const failedResults = ConsistencyChecker.getFailedResults(results);
      report += `## 失败项\n\n`;
      failedResults.forEach((r, i) => {
        report += `${i + 1}. **${r.rule?.name || '未知规则'}**\n`;
        report += `   - 消息: ${r.message}\n`;
        if (r.resourceId) report += `   - 资源ID: ${r.resourceId}\n`;
        if (r.rule?.description) report += `   - 描述: ${r.rule.description}\n`;
        report += `   - 严重性: ${r.severity || 'unknown'}\n`;
        report += `\n`;
      });
    }
    
    return report;
  }
}
