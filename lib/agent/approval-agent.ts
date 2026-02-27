import { getConfigCenter } from '@/lib/config/encrypted-config-center'
import { AuditLogService } from '@/lib/supabase/audit-log-v2'

/**
 * 审批决策
 */
export interface ApprovalDecision {
  action: 'auto_approve' | 'need_review' | 'auto_reject'
  confidence: number // 0-100
  reason: string
  suggestions?: string[]
  assignedTo?: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * 审批上下文
 */
export interface ApprovalContext {
  table: string
  data: any
  userId: string
  role: string
  department?: string
  timestamp: string
}

/**
 * 智能审批Agent
 * 基于规则引擎和权重配置自动分析审批请求
 */
export class ApprovalAgent {
  private configCenter
  private auditService

  constructor() {
    this.configCenter = getConfigCenter()
    this.auditService = new AuditLogService()
  }

  /**
   * 分析审批请求
   */
  async analyze(context: ApprovalContext): Promise<ApprovalDecision> {
    try {
      // 1. 加载规则配置
      const rules = await this.configCenter.loadConfig('agent_approval_rules')

      if (!rules) {
        throw new Error('审批规则配置未找到')
      }

      // 2. 加载权重配置
      const weights = await this.configCenter.loadConfig('agent_model_weights') || {
        rule_based: 0.6,
        consistency_check: 0.3,
        risk_assessment: 0.1
      }

      // 3. 规则评估
      const ruleDecision = this.evaluateRules(context, rules)

      // 4. 一致性检查
      const consistencyScore = await this.checkConsistency(context)

      // 5. 风险评估
      const riskScore = this.assessRisk(context)

      // 6. 综合决策
      const finalDecision = this.makeDecision(
        ruleDecision,
        consistencyScore,
        riskScore,
        weights
      )

      // 7. 记录决策日志（脱敏）
      await this.auditService.log({
        userId: context.userId,
        username: 'agent',
        action: 'agent_decision',
        resourceType: context.table,
        newValue: {
          context: this.sanitizeContext(context),
          decision: {
            action: finalDecision.action,
            confidence: finalDecision.confidence,
            reason: finalDecision.reason,
            riskLevel: finalDecision.riskLevel
          }
        },
        result: finalDecision.action === 'auto_reject' ? 'failure' : 'success'
      })

      return finalDecision
    } catch (error) {
      console.error('Agent分析失败:', error)
      return {
        action: 'need_review',
        confidence: 50,
        reason: 'Agent分析失败，需要人工审核',
        suggestions: ['检查系统配置', '联系技术支持']
      }
    }
  }

  /**
   * 规则评估
   */
  private evaluateRules(
    context: ApprovalContext,
    rules: any
  ): { action: string; confidence: number; reason: string } {
    const { table, data } = context

    // 出租率规则
    if (table === 'reit_operational_data' && rules.occupancy) {
      const occupancy = data.occupancy_rate

      if (occupancy >= rules.occupancy.optimal) {
        return {
          action: 'auto_approve',
          confidence: 95,
          reason: `出租率${occupancy}%处于优秀水平`
        }
      }

      if (occupancy < rules.occupancy.min) {
        return {
          action: 'need_review',
          confidence: 80,
          reason: `出租率${occupancy}%低于最低要求${rules.occupancy.min}%`,
          riskLevel: 'high'
        } as ApprovalDecision
      }

      return {
        action: rules.occupancy.auto_approve ? 'auto_approve' : 'need_review',
        confidence: 85,
        reason: `出租率${occupancy}%在合理区间`
      }
    }

    // 债务比率规则
    if (table === 'reit_financial_metrics' && rules.debt_ratio) {
      const totalDebt = data.total_debt || 0
      const totalAssets = data.total_assets || 1
      const debtRatio = (totalDebt / totalAssets) * 100

      if (debtRatio > rules.debt_ratio.max) {
        return {
          action: 'auto_reject',
          confidence: 90,
          reason: `债务比率${debtRatio.toFixed(2)}%超过最大限制${rules.debt_ratio.max}%`,
          riskLevel: 'critical'
        } as ApprovalDecision
      }

      if (debtRatio > rules.debt_ratio.warning) {
        return {
          action: 'need_review',
          confidence: 75,
          reason: `债务比率${debtRatio.toFixed(2)}%接近警戒线`,
          riskLevel: 'high'
        } as ApprovalDecision
      }

      return {
        action: 'auto_approve',
        confidence: 85,
        reason: `债务比率${debtRatio.toFixed(2)}%在安全范围内`
      }
    }

    // 默认规则
    return {
      action: 'need_review',
      confidence: 60,
      reason: '未找到适用规则，需要人工审核'
    }
  }

  /**
   * 一致性检查
   */
  private async checkConsistency(context: ApprovalContext): Promise<number> {
    // 模拟一致性检查（实际应该检查关联表数据）
    const { table, data } = context

    // 检查关键字段是否合理
    let consistencyScore = 100

    if (table === 'reit_operational_data') {
      if (data.occupancy_rate < 0 || data.occupancy_rate > 100) {
        consistencyScore -= 50
      }
      if (data.rent_growth_rate && (data.rent_growth_rate < -50 || data.rent_growth_rate > 50)) {
        consistencyScore -= 30
      }
    }

    if (table === 'reit_financial_metrics') {
      if (data.nav_per_share < 0) {
        consistencyScore -= 100
      }
    }

    return Math.max(0, consistencyScore)
  }

  /**
   * 风险评估
   */
  private assessRisk(context: ApprovalContext): number {
    // 模拟风险评估（实际应该根据历史数据评估）
    const { table, data } = context

    let riskScore = 0

    // 大额变更增加风险
    if (data.amount && data.amount > 10000000) {
      riskScore += 30
    }

    // 关键指标异常增加风险
    if (table === 'reit_operational_data' && data.occupancy_rate < 50) {
      riskScore += 40
    }

    return Math.min(100, riskScore)
  }

  /**
   * 综合决策
   */
  private makeDecision(
    ruleDecision: any,
    consistencyScore: number,
    riskScore: number,
    weights: any
  ): ApprovalDecision {
    const ruleScore = weights.rule_based * ruleDecision.confidence
    const consistencyWeighted = weights.consistency_check * consistencyScore
    const riskWeighted = weights.risk_assessment * (100 - riskScore)

    const totalScore = ruleScore + consistencyWeighted + riskWeighted

    // 根据总分决定
    if (ruleDecision.action === 'auto_reject') {
      return {
        action: 'auto_reject',
        confidence: ruleDecision.confidence,
        reason: ruleDecision.reason,
        riskLevel: 'critical',
        suggestions: ['降低债务比率', '提供额外风险担保']
      } as ApprovalDecision
    }

    if (totalScore >= 80) {
      return {
        action: 'auto_approve',
        confidence: Math.round(totalScore),
        reason: '符合所有审批规则',
        riskLevel: 'low'
      } as ApprovalDecision
    }

    if (totalScore >= 60) {
      return {
        action: 'need_review',
        confidence: Math.round(totalScore),
        reason: '部分指标需要人工核实',
        riskLevel: 'medium',
        suggestions: ['核实关键指标', '检查关联数据']
      } as ApprovalDecision
    }

    return {
      action: 'need_review',
      confidence: Math.round(totalScore),
      reason: '存在潜在风险，建议人工审核',
      riskLevel: 'high',
      suggestions: ['详细审查', '风险评估']
    } as ApprovalDecision
  }

  /**
   * 脱敏处理上下文
   */
  private sanitizeContext(context: ApprovalContext): any {
    // 移除敏感字段
    const sanitized: any = {
      table: context.table,
      userId: context.userId,
      role: context.role,
      timestamp: context.timestamp
    }

    // 添加脱敏后的数据
    if (context.data) {
      // 只保留非敏感字段
      const safeFields = ['fund_code', 'fund_name', 'occupancy_rate', 'nav_per_share']
      sanitized.data = {}

      safeFields.forEach(field => {
        if (context.data[field] !== undefined) {
          sanitized.data[field] = context.data[field]
        }
      })
    }

    return sanitized
  }

  /**
   * 更新规则配置
   */
  async updateRules(rules: any, version: string): Promise<void> {
    await this.configCenter.saveVersion(
      'agent_approval_rules',
      rules,
      version,
      {
        type: 'agent_rules',
        description: '更新审批规则配置'
      }
    )
  }

  /**
   * 获取当前规则
   */
  async getCurrentRules(): Promise<any> {
    return await this.configCenter.loadConfig('agent_approval_rules')
  }
}
