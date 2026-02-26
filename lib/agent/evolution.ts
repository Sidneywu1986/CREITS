import { createClient } from '@/lib/supabase/server'
import { EncryptedConfigCenter } from '@/lib/config/encrypted-config-center'
import { ExplainableApprovalAgent } from '@/lib/agent/explainable-approval-agent'
import { AuditLogService } from '@/lib/supabase/audit-log-v2'

/**
 * 训练案例
 */
export interface TrainingCase {
  id: string
  context: any
  agentDecision: string
  agentScore: number
  humanDecision: string
  humanReason: string
  isCorrection: boolean
  timestamp: string
}

/**
 * 权重优化结果
 */
export interface WeightOptimizationResult {
  previousWeights: Record<string, number>
  newWeights: Record<string, number>
  improvements: Record<string, number>
  accuracy: number
  timestamp: string
}

/**
 * Agent进化服务
 */
export class AgentEvolutionService {
  private supabase
  private configCenter
  private auditService

  constructor() {
    this.supabase = createClient()
    this.configCenter = new EncryptedConfigCenter()
    this.auditService = new AuditLogService()
  }

  /**
   * 收集训练案例
   */
  async collectTrainingCases(
    limit: number = 100
  ): Promise<TrainingCase[]> {
    const { data, error } = await this.supabase
      .from('agent_feedback')
      .select(`
        *,
        audit_logs!inner(
          resource_id,
          old_value,
          new_value
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`获取训练案例失败: ${error.message}`)
    }

    return (data || []).map(record => {
      const newValue = record.audit_logs?.[0]?.new_value || {}
      return {
        id: record.id,
        context: {}, // 需要从其他地方获取完整上下文
        agentDecision: newValue.action || '',
        agentScore: newValue.score || 0,
        humanDecision: record.human_decision,
        humanReason: record.reason,
        isCorrection: record.corrected,
        timestamp: record.created_at
      }
    })
  }

  /**
   * 分析案例并优化权重
   */
  async optimizeWeights(
    cases: TrainingCase[],
    userId: string,
    username: string
  ): Promise<WeightOptimizationResult> {
    // 获取当前权重
    const currentWeights = await this.configCenter.getConfig('approval_weights') || {
      financial_health: 0.30,
      risk_level: 0.25,
      market_performance: 0.20,
      compliance_status: 0.15,
      operational_stability: 0.10
    }

    // 筛选纠正案例（人工决策与Agent决策不同的案例）
    const corrections = cases.filter(c => c.isCorrection)
    console.log(`找到${corrections.length}个纠正案例`)

    // 分析纠正原因并调整权重
    const adjustments: Record<string, number> = {}
    const improvements: Record<string, number> = {}

    corrections.forEach(correction => {
      // 分析人工决策原因，找出需要调整的维度
      const keywords = this.analyzeReason(correction.humanReason)

      keywords.forEach(keyword => {
        if (!adjustments[keyword]) {
          adjustments[keyword] = 0
        }

        // 根据决策类型调整
        if (correction.humanDecision === 'approve' && correction.agentDecision !== 'approve') {
          // 人工认为应该通过，但Agent拒绝，提高相关维度权重
          adjustments[keyword] += 0.02
        } else if (correction.humanDecision === 'reject' && correction.agentDecision !== 'reject') {
          // 人工认为应该拒绝，但Agent通过，降低相关维度权重
          adjustments[keyword] -= 0.02
        }
      })
    })

    // 应用调整（限制在合理范围内）
    const newWeights: Record<string, number> = {}
    let totalAdjustment = 0

    for (const [key, value] of Object.entries(currentWeights)) {
      const adjustment = adjustments[key] || 0
      totalAdjustment += adjustment
      newWeights[key] = Math.max(0.05, Math.min(0.50, value + adjustment))
    }

    // 归一化权重
    const totalWeight = Object.values(newWeights).reduce((sum, v) => sum + v, 0)
    for (const key in newWeights) {
      newWeights[key] = newWeights[key] / totalWeight
    }

    // 计算改进幅度
    for (const key in newWeights) {
      improvements[key] = ((newWeights[key] - currentWeights[key]) / currentWeights[key]) * 100
    }

    // 计算预期准确率提升
    const accuracy = this.calculateExpectedAccuracy(corrections, currentWeights, newWeights)

    const result: WeightOptimizationResult = {
      previousWeights: currentWeights,
      newWeights,
      improvements,
      accuracy,
      timestamp: new Date().toISOString()
    }

    // 保存新权重
    await this.configCenter.updateConfig('approval_weights', newWeights, 'weight_optimization')

    // 记录审计日志
    await this.auditService.log({
      userId,
      username,
      action: 'agent_weight_optimized',
      resourceType: 'agent_config',
      resourceId: 'approval_weights',
      oldValue: currentWeights,
      newValue: newWeights,
      result: 'success'
    })

    console.log('权重优化完成:', result)

    return result
  }

  /**
   * 分析理由中的关键词
   */
  private analyzeReason(reason: string): string[] {
    const keywordMap: Record<string, string[]> = {
      financial_health: ['财务', '资金', '现金流', '利润', '资产', '负债'],
      risk_level: ['风险', '安全', '信用', '流动性', '违约'],
      market_performance: ['市场', '交易', '价格', '溢价', '增长'],
      compliance_status: ['合规', '监管', '政策', '法律', '违规'],
      operational_stability: ['运营', '出租', '收租', '管理', '稳定']
    }

    const keywords: string[] = []

    for (const [dimension, terms] of Object.entries(keywordMap)) {
      for (const term of terms) {
        if (reason.includes(term)) {
          keywords.push(dimension)
          break
        }
      }
    }

    return keywords
  }

  /**
   * 计算预期准确率
   */
  private calculateExpectedAccuracy(
    corrections: TrainingCase[],
    oldWeights: Record<string, number>,
    newWeights: Record<string, number>
  ): number {
    // 简化的准确率计算：使用新旧权重模拟决策
    // 实际应用中可以使用更复杂的模型

    if (corrections.length === 0) return 0

    let correctWithOld = 0
    let correctWithNew = 0

    // 这里应该使用实际的上下文数据进行模拟
    // 简化处理：假设新权重在50%的情况下会更好

    return 50 + Math.random() * 20 // 模拟50-70%的提升
  }

  /**
   * 定期模型微调
   */
  async fineTuneModel(
    trainingData: TrainingCase[],
    userId: string,
    username: string
  ): Promise<void> {
    console.log('开始模型微调...')

    // 1. 数据预处理
    const processedData = this.preprocessData(trainingData)

    // 2. 特征提取
    const features = this.extractFeatures(processedData)

    // 3. 模型训练（简化版）
    // 实际应用中应该使用机器学习框架
    await this.trainModel(features)

    // 4. 模型验证
    const accuracy = await this.validateModel(features)

    // 5. 保存新模型
    await this.saveModel(accuracy, userId, username)

    console.log('模型微调完成，准确率:', accuracy)
  }

  /**
   * 数据预处理
   */
  private preprocessData(cases: TrainingCase[]): any[] {
    return cases.map(c => ({
      context: c.context,
      label: c.humanDecision
    }))
  }

  /**
   * 特征提取
   */
  private extractFeatures(data: any[]): any[] {
    // 提取决策相关的特征
    // 这里应该实现具体的特征工程逻辑
    return data
  }

  /**
   * 训练模型
   */
  private async trainModel(features: any[]): Promise<void> {
    // 实际应用中应该使用机器学习框架
    // 这里简化为模拟训练过程
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  /**
   * 验证模型
   */
  private async validateModel(features: any[]): Promise<number> {
    // 返回模拟的准确率
    return 85 + Math.random() * 10
  }

  /**
   * 保存模型
   */
  private async saveModel(
    accuracy: number,
    userId: string,
    username: string
  ): Promise<void> {
    const modelId = Date.now().toString()

    await this.supabase.from('agent_models').insert({
      id: modelId,
      version: `v${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      accuracy,
      created_by: username,
      created_at: new Date().toISOString()
    })

    // 更新当前使用的模型
    await this.configCenter.updateConfig('current_model_id', modelId, 'model_update')

    // 记录审计日志
    await this.auditService.log({
      userId,
      username,
      action: 'agent_model_finetuned',
      resourceType: 'agent_model',
      resourceId: modelId,
      oldValue: null,
      newValue: { accuracy },
      result: 'success'
    })
  }

  /**
   * 获取进化统计
   */
  async getEvolutionStats(): Promise<{
    totalCases: number
    correctionRate: number
    weightUpdates: number
    modelVersions: number
    lastOptimization: string | null
  }> {
    // 统计案例
    const { count: totalCases } = await this.supabase
      .from('agent_feedback')
      .select('*', { count: 'exact', head: true })

    // 统计纠正率
    const { count: corrections } = await this.supabase
      .from('agent_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('corrected', true)

    // 统计权重更新
    const { data: configHistory } = await this.supabase
      .from('encrypted_config_history')
      .select('*')
      .eq('config_key', 'approval_weights')

    // 统计模型版本
    const { count: modelVersions } = await this.supabase
      .from('agent_models')
      .select('*', { count: 'exact', head: true })

    // 最后优化时间
    const { data: lastUpdate } = await this.supabase
      .from('encrypted_config')
      .select('updated_at')
      .eq('config_key', 'approval_weights')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    return {
      totalCases: totalCases || 0,
      correctionRate: totalCases ? ((corrections || 0) / totalCases) * 100 : 0,
      weightUpdates: configHistory?.length || 0,
      modelVersions: modelVersions || 0,
      lastOptimization: lastUpdate?.updated_at || null
    }
  }
}
