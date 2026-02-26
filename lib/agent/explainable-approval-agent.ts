import { createClient } from '@/lib/supabase/server'
import { AuditLogService } from '@/lib/supabase/audit-log-v2'
import { EncryptedConfigCenter } from '@/lib/config/encrypted-config-center'

/**
 * 评分维度
 */
export interface ScoreDimension {
  id: string
  name: string
  weight: number
  score: number
  details: string[]
  threshold?: number
}

/**
 * 决策理由
 */
export interface DecisionReason {
  category: string
  reasoning: string
  evidence: string[]
  confidence: number
}

/**
 * 可解释的审批决策
 */
export interface ExplainableDecision {
  action: 'approve' | 'reject' | 'review'
  finalScore: number
  confidence: number
  reasons: DecisionReason[]
  dimensions: ScoreDimension[]
  suggestions: string[]
  timestamp: string
}

/**
 * 人工反馈
 */
export interface HumanFeedback {
  decisionId: string
  humanDecision: 'approve' | 'reject' | 'review'
  reason: string
  corrected: boolean
  timestamp: string
}

/**
 * 增强版智能审批Agent（可解释性）
 */
export class ExplainableApprovalAgent {
  private configCenter
  private auditService

  constructor() {
    this.configCenter = new EncryptedConfigCenter()
    this.auditService = new AuditLogService()
  }

  /**
   * 分析并生成可解释的决策
   */
  async analyze(context: any): Promise<ExplainableDecision> {
    // 加载评分权重配置
    const weights = await this.loadWeights()

    // 计算各维度得分
    const dimensions = await this.calculateDimensions(context, weights)

    // 计算最终得分
    const finalScore = this.calculateFinalScore(dimensions)

    // 生成决策
    const action = this.makeDecision(finalScore, dimensions)

    // 生成决策理由
    const reasons = await this.generateReasons(context, dimensions, action)

    // 生成建议
    const suggestions = await this.generateSuggestions(context, dimensions, action)

    // 计算置信度
    const confidence = this.calculateConfidence(dimensions, finalScore)

    const decision: ExplainableDecision = {
      action,
      finalScore,
      confidence,
      reasons,
      dimensions,
      suggestions,
      timestamp: new Date().toISOString()
    }

    // 记录决策（脱敏）
    await this.logDecision(context, decision)

    return decision
  }

  /**
   * 加载评分权重
   */
  private async loadWeights(): Promise<Record<string, number>> {
    const weightsConfig = await this.configCenter.getConfig('approval_weights')
    return weightsConfig || {
      financial_health: 0.30,
      risk_level: 0.25,
      market_performance: 0.20,
      compliance_status: 0.15,
      operational_stability: 0.10
    }
  }

  /**
   * 计算各维度得分
   */
  private async calculateDimensions(
    context: any,
    weights: Record<string, number>
  ): Promise<ScoreDimension[]> {
    const dimensions: ScoreDimension[] = []

    // 财务健康度
    dimensions.push({
      id: 'financial_health',
      name: '财务健康度',
      weight: weights.financial_health || 0.30,
      score: this.calculateFinancialScore(context),
      details: this.getFinancialDetails(context),
      threshold: 70
    })

    // 风险等级
    dimensions.push({
      id: 'risk_level',
      name: '风险等级',
      weight: weights.risk_level || 0.25,
      score: this.calculateRiskScore(context),
      details: this.getRiskDetails(context),
      threshold: 75
    })

    // 市场表现
    dimensions.push({
      id: 'market_performance',
      name: '市场表现',
      weight: weights.market_performance || 0.20,
      score: this.calculateMarketScore(context),
      details: this.getMarketDetails(context),
      threshold: 70
    })

    // 合规状态
    dimensions.push({
      id: 'compliance_status',
      name: '合规状态',
      weight: weights.compliance_status || 0.15,
      score: this.calculateComplianceScore(context),
      details: this.getComplianceDetails(context),
      threshold: 85
    })

    // 运营稳定性
    dimensions.push({
      id: 'operational_stability',
      name: '运营稳定性',
      weight: weights.operational_stability || 0.10,
      score: this.calculateOperationalScore(context),
      details: this.getOperationalDetails(context),
      threshold: 75
    })

    return dimensions
  }

  /**
   * 计算财务健康度得分
   */
  private calculateFinancialScore(context: any): number {
    const financial = context.data?.financial_metrics || {}
    let score = 70 // 基础分

    // 负债率评分（越低越好）
    const debtRatio = financial.debt_ratio || 0
    if (debtRatio < 40) score += 15
    else if (debtRatio < 60) score += 5
    else if (debtRatio > 80) score -= 20

    // 现金流评分
    const cashFlow = financial.cash_flow_ratio || 1
    if (cashFlow > 1.2) score += 10
    else if (cashFlow < 0.8) score -= 15

    // 盈利能力
    const profitability = financial.profit_margin || 0
    if (profitability > 0.15) score += 5
    else if (profitability < 0) score -= 20

    return Math.min(100, Math.max(0, score))
  }

  /**
   * 计算风险等级得分
   */
  private calculateRiskScore(context: any): number {
    const risk = context.data?.risk_compliance || {}
    let score = 75 // 基础分

    // 风险等级
    const riskLevel = risk.risk_level || 'medium'
    if (riskLevel === 'low') score += 15
    else if (riskLevel === 'high') score -= 25

    // 流动性比率
    const liquidity = risk.liquidity_ratio || 1
    if (liquidity > 1.5) score += 10
    else if (liquidity < 1.0) score -= 15

    // 信用风险
    const creditRisk = risk.credit_score || 700
    if (creditRisk > 750) score += 5
    else if (creditRisk < 650) score -= 10

    return Math.min(100, Math.max(0, score))
  }

  /**
   * 计算市场表现得分
   */
  private calculateMarketScore(context: any): number {
    const market = context.data?.market_stats || {}
    let score = 70 // 基础分

    // NAV增长
    const navGrowth = market.nav_growth || 0
    if (navGrowth > 0.1) score += 15
    else if (navGrowth < 0) score -= 10

    // 交易活跃度
    const volume = market.trading_volume || 0
    if (volume > 10000000) score += 5

    // 溢价率
    const premium = market.premium_rate || 0
    if (premium > 0.05) score += 10
    else if (premium < -0.05) score -= 10

    return Math.min(100, Math.max(0, score))
  }

  /**
   * 计算合规状态得分
   */
  private calculateComplianceScore(context: any): number {
    const compliance = context.data?.risk_compliance || {}
    let score = 85 // 基础分

    // 合规状态
    if (compliance.compliance_status === 'compliant') score += 10
    else if (compliance.compliance_status === 'non_compliant') score -= 40

    // 历史违规
    const violations = compliance.violation_count || 0
    if (violations === 0) score += 5
    else score -= violations * 5

    return Math.min(100, Math.max(0, score))
  }

  /**
   * 计算运营稳定性得分
   */
  private calculateOperationalScore(context: any): number {
    const ops = context.data?.operational_data || {}
    let score = 75 // 基础分

    // 出租率
    const occupancy = ops.occupancy_rate || 0
    if (occupancy > 0.95) score += 15
    else if (occupancy > 0.90) score += 5
    else if (occupancy < 0.85) score -= 15

    // 收租率
    const collection = ops.collection_rate || 0
    if (collection > 0.98) score += 10

    return Math.min(100, Math.max(0, score))
  }

  /**
   * 获取财务详情
   */
  private getFinancialDetails(context: any): string[] {
    const financial = context.data?.financial_metrics || {}
    const details = []

    const debtRatio = (financial.debt_ratio * 100).toFixed(1)
    details.push(`资产负债率：${debtRatio}%`)

    const cashFlow = financial.cash_flow_ratio?.toFixed(2) || 'N/A'
    details.push(`现金流比率：${cashFlow}`)

    const profitability = (financial.profit_margin * 100).toFixed(1)
    details.push(`利润率：${profitability}%`)

    return details
  }

  /**
   * 获取风险详情
   */
  private getRiskDetails(context: any): string[] {
    const risk = context.data?.risk_compliance || {}
    const details = []

    details.push(`风险等级：${risk.risk_level || 'medium'}`)

    const liquidity = risk.liquidity_ratio?.toFixed(2) || 'N/A'
    details.push(`流动性比率：${liquidity}`)

    const creditScore = risk.credit_score || 'N/A'
    details.push(`信用评分：${creditScore}`)

    return details
  }

  /**
   * 获取市场详情
   */
  private getMarketDetails(context: any): string[] {
    const market = context.data?.market_stats || {}
    const details = []

    const navGrowth = ((market.nav_growth || 0) * 100).toFixed(1)
    details.push(`NAV增长率：${navGrowth}%`)

    const premium = ((market.premium_rate || 0) * 100).toFixed(1)
    details.push(`溢价率：${premium}%`)

    return details
  }

  /**
   * 获取合规详情
   */
  private getComplianceDetails(context: any): string[] {
    const compliance = context.data?.risk_compliance || {}
    const details = []

    details.push(`合规状态：${compliance.compliance_status || 'unknown'}`)

    const violations = compliance.violation_count || 0
    details.push(`历史违规次数：${violations}`)

    return details
  }

  /**
   * 获取运营详情
   */
  private getOperationalDetails(context: any): string[] {
    const ops = context.data?.operational_data || {}
    const details = []

    const occupancy = ((ops.occupancy_rate || 0) * 100).toFixed(1)
    details.push(`出租率：${occupancy}%`)

    const collection = ((ops.collection_rate || 0) * 100).toFixed(1)
    details.push(`收租率：${collection}%`)

    return details
  }

  /**
   * 计算最终得分
   */
  private calculateFinalScore(dimensions: ScoreDimension[]): number {
    let totalWeight = 0
    let weightedScore = 0

    for (const dim of dimensions) {
      weightedScore += dim.score * dim.weight
      totalWeight += dim.weight
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0
  }

  /**
   * 做出决策
   */
  private makeDecision(
    finalScore: number,
    dimensions: ScoreDimension[]
  ): 'approve' | 'reject' | 'review' {
    // 检查是否有任何维度严重低于阈值
    const criticalFailures = dimensions.filter(
      d => d.score < (d.threshold || 70) - 20
    )

    if (criticalFailures.length > 0) {
      return 'reject'
    }

    // 根据最终得分决策
    if (finalScore >= 80) {
      return 'approve'
    } else if (finalScore >= 60) {
      return 'review'
    } else {
      return 'reject'
    }
  }

  /**
   * 生成决策理由
   */
  private async generateReasons(
    context: any,
    dimensions: ScoreDimension[],
    action: string
  ): Promise<DecisionReason[]> {
    const reasons: DecisionReason[] = []

    // 总体评估
    reasons.push({
      category: '总体评估',
      reasoning: `综合得分${dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length}分，${action === 'approve' ? '符合' : action === 'review' ? '基本符合' : '不符合'}审批标准`,
      evidence: dimensions.map(d => `${d.name}：${d.score}分`),
      confidence: 0.85
    })

    // 优势分析
    const strengths = dimensions.filter(d => d.score >= 80)
    if (strengths.length > 0) {
      reasons.push({
        category: '优势分析',
        reasoning: `在${strengths.map(d => d.name).join('、')}方面表现突出`,
        evidence: strengths.flatMap(d => d.details),
        confidence: 0.90
      })
    }

    // 不足分析
    const weaknesses = dimensions.filter(d => d.score < 70)
    if (weaknesses.length > 0) {
      reasons.push({
        category: '不足分析',
        reasoning: `在${weaknesses.map(d => d.name).join('、')}方面有待改善`,
        evidence: weaknesses.flatMap(d => d.details),
        confidence: 0.85
      })
    }

    return reasons
  }

  /**
   * 生成建议
   */
  private async generateSuggestions(
    context: any,
    dimensions: ScoreDimension[],
    action: string
  ): Promise<string[]> {
    const suggestions: string[] = []

    if (action === 'reject') {
      const weaknesses = dimensions.filter(d => d.score < 60)
      weaknesses.forEach(dim => {
        suggestions.push(`建议改善${dim.name}，当前得分${dim.score}分`)
      })
    } else if (action === 'review') {
      suggestions.push('建议人工复核，重点关注风险指标')
      suggestions.push('可考虑附加条件审批')
    } else {
      suggestions.push('建议直接通过审批')
    }

    return suggestions
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    dimensions: ScoreDimension[],
    finalScore: number
  ): number {
    const variance = dimensions.reduce((sum, d) => {
      return sum + Math.pow(d.score - finalScore, 2)
    }, 0) / dimensions.length

    const stdDev = Math.sqrt(variance)
    const confidence = 1 - (stdDev / 100)

    return Math.min(0.95, Math.max(0.5, confidence))
  }

  /**
   * 记录决策（脱敏）
   */
  private async logDecision(
    context: any,
    decision: ExplainableDecision
  ): Promise<void> {
    await this.auditService.log({
      userId: context.userId,
      username: context.username,
      action: 'agent_approval_decision',
      resourceType: 'reit_approval',
      resourceId: context.data?.fund_code || context.data?.reit_code,
      oldValue: null,
      newValue: {
        action: decision.action,
        score: decision.finalScore,
        confidence: decision.confidence
      },
      result: 'success'
    })
  }

  /**
   * 接收人工反馈
   */
  async receiveFeedback(feedback: HumanFeedback): Promise<void> {
    // 记录反馈
    await this.auditService.log({
      userId: feedback.decisionId,
      username: 'human_reviewer',
      action: 'human_feedback',
      resourceType: 'agent_decision',
      resourceId: feedback.decisionId,
      oldValue: null,
      newValue: {
        decision: feedback.humanDecision,
        reason: feedback.reason
      },
      result: 'success'
    })

    // 保存反馈用于模型优化
    await this.saveFeedback(feedback)
  }

  /**
   * 保存反馈
   */
  private async saveFeedback(feedback: HumanFeedback): Promise<void> {
    const supabase = createClient()

    await supabase.from('agent_feedback').insert({
      decision_id: feedback.decisionId,
      human_decision: feedback.humanDecision,
      reason: feedback.reason,
      corrected: feedback.corrected,
      timestamp: feedback.timestamp
    })
  }
}
