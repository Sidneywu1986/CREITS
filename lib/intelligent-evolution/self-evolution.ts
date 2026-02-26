/**
 * SelfEvolutionService - 自我进化服务
 *
 * 功能：
 * 1. 从 graph_edges 中提取"政策→REITs"影响数据
 * 2. 从 node_events 中提取新闻情感分数
 * 3. 用真实数据优化 Agent 权重配置
 */

import { createClient } from '@supabase/supabase-js';

// Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Agent类型枚举
 */
export enum AgentType {
  VALUATION = 'valuation',
  POLICY = 'policy',
  NEWS = 'news',
  RISK = 'risk'
}

/**
 * 特征类型枚举
 */
export enum FeatureType {
  POLICY_IMPACT = 'policy_impact',
  NEWS_SENTIMENT = 'news_sentiment',
  MARKET_TREND = 'market_trend',
  FUNDAMENTAL = 'fundamental'
}

/**
 * 特征数据接口
 */
export interface FeatureData {
  reitCode: string;
  policyImpact: number;
  newsSentiment: number;
  marketTrend: number;
  fundamental: number;
  timestamp: Date;
}

/**
 * 权重配置接口
 */
export interface WeightConfig {
  weightName: string;
  weightValue: number;
  weightDescription: string;
  sourceType: 'manual' | 'auto' | 'learned';
}

/**
 * SelfEvolutionService类
 */
export class SelfEvolutionService {
  private static instance: SelfEvolutionService;

  private constructor() {}

  static getInstance(): SelfEvolutionService {
    if (!SelfEvolutionService.instance) {
      SelfEvolutionService.instance = new SelfEvolutionService();
    }
    return SelfEvolutionService.instance;
  }

  /**
   * 提取特征数据
   */
  async extractFeatures(reitCode?: string, days?: number): Promise<FeatureData[]> {
    console.log('[SelfEvolution] 开始提取特征数据...');

    try {
      const featureDataMap = new Map<string, FeatureData>();

      // 1. 提取政策影响数据
      await this.extractPolicyImpact(featureDataMap, reitCode);

      // 2. 提取新闻情感数据
      await this.extractNewsSentiment(featureDataMap, reitCode);

      // 3. 提取市场趋势数据（模拟）
      await this.extractMarketTrend(featureDataMap, reitCode);

      // 4. 提取基本面数据（模拟）
      await this.extractFundamental(featureDataMap, reitCode);

      const features = Array.from(featureDataMap.values());

      console.log(`[SelfEvolution] 特征提取完成: ${features.length} 条`);

      return features;
    } catch (error) {
      console.error('[SelfEvolution] 特征提取失败:', error);
      throw error;
    }
  }

  /**
   * 提取政策影响数据
   */
  private async extractPolicyImpact(
    featureDataMap: Map<string, FeatureData>,
    reitCode?: string
  ): Promise<void> {
    try {
      // 从 graph_edges 表查询政策→REITs关系
      let query = supabase
        .from('graph_edges')
        .select(`
          strength,
          confidence,
          source_node!inner (
            node_type,
            node_code,
            properties
          ),
          target_node!inner (
            node_type,
            node_code,
            properties
          )
        `)
        .eq('edge_type', 'affects')
        .eq('source_node.node_type', 'policy')
        .eq('target_node.node_type', 'reit')
        .gt('strength', 0);

      if (reitCode) {
        query = query.eq('target_node.node_code', reitCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[SelfEvolution] 提取政策影响失败:', error);
        return;
      }

      // 聚合数据
      for (const edge of data || []) {
        // target_node 可能是数组或对象
        const targetNode = Array.isArray(edge.target_node) ? edge.target_node[0] : edge.target_node;
        const targetCode = targetNode?.node_code;
        if (!targetCode) continue;

        const strength = edge.strength || 0;
        const confidence = edge.confidence || 1;

        if (!featureDataMap.has(targetCode)) {
          featureDataMap.set(targetCode, {
            reitCode: targetCode,
            policyImpact: strength * confidence,
            newsSentiment: 0,
            marketTrend: 0,
            fundamental: 0,
            timestamp: new Date()
          });
        } else {
          const feature = featureDataMap.get(targetCode)!;
          feature.policyImpact = Math.max(feature.policyImpact, strength * confidence);
        }
      }

      console.log(`[SelfEvolution] 政策影响提取完成`);
    } catch (error) {
      console.error('[SelfEvolution] 提取政策影响失败:', error);
    }
  }

  /**
   * 提取新闻情感数据
   */
  private async extractNewsSentiment(
    featureDataMap: Map<string, FeatureData>,
    reitCode?: string
  ): Promise<void> {
    try {
      // 从 node_events 表查询新闻事件
      let query = supabase
        .from('node_events')
        .select('*')
        .eq('event_type', 'news');

      if (reitCode) {
        query = query.contains('affected_reits', [reitCode]);
      }

      const { data, error } = await query
        .gte('event_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('event_time', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[SelfEvolution] 提取新闻情感失败:', error);
        return;
      }

      // 聚合数据
      for (const event of data || []) {
        const affectedReits = event.affected_reits || [];
        const sentiment = event.sentiment_score || 0;

        for (const code of affectedReits) {
          if (featureDataMap.has(code)) {
            const feature = featureDataMap.get(code)!;
            // 使用最近7天的平均情感分数
            feature.newsSentiment = (feature.newsSentiment + sentiment) / 2;
          }
        }
      }

      console.log(`[SelfEvolution] 新闻情感提取完成`);
    } catch (error) {
      console.error('[SelfEvolution] 提取新闻情感失败:', error);
    }
  }

  /**
   * 提取市场趋势数据（模拟）
   */
  private async extractMarketTrend(
    featureDataMap: Map<string, FeatureData>,
    reitCode?: string
  ): Promise<void> {
    try {
      // 模拟市场趋势数据
      // 实际应用中应该从市场数据API获取

      featureDataMap.forEach((feature, code) => {
        if (reitCode && code !== reitCode) {
          return;
        }

        // 模拟市场趋势（-1到1之间）
        feature.marketTrend = Math.random() * 2 - 1;
      });

      console.log(`[SelfEvolution] 市场趋势提取完成`);
    } catch (error) {
      console.error('[SelfEvolution] 提取市场趋势失败:', error);
    }
  }

  /**
   * 提取基本面数据（模拟）
   */
  private async extractFundamental(
    featureDataMap: Map<string, FeatureData>,
    reitCode?: string
  ): Promise<void> {
    try {
      // 模拟基本面数据
      // 实际应用中应该从财务数据获取

      featureDataMap.forEach((feature, code) => {
        if (reitCode && code !== reitCode) {
          return;
        }

        // 模拟基本面评分（0到1之间）
        feature.fundamental = Math.random();
      });

      console.log(`[SelfEvolution] 基本面提取完成`);
    } catch (error) {
      console.error('[SelfEvolution] 提取基本面失败:', error);
    }
  }

  /**
   * 优化Agent权重配置
   */
  async optimizeAgentWeights(
    agentType: AgentType,
    features: FeatureData[]
  ): Promise<WeightConfig[]> {
    console.log(`[SelfEvolution] 开始优化 ${agentType} Agent权重...`);

    try {
      // 1. 获取当前权重配置
      const currentWeights = await this.getCurrentWeights(agentType);

      // 2. 分析特征重要性
      const featureImportance = await this.calculateFeatureImportance(features);

      // 3. 计算新的权重
      const optimizedWeights = this.calculateOptimizedWeights(
        currentWeights,
        featureImportance
      );

      // 4. 更新权重配置
      await this.updateWeights(agentType, optimizedWeights);

      console.log(`[SelfEvolution] 权重优化完成`);

      return optimizedWeights;
    } catch (error) {
      console.error('[SelfEvolution] 权重优化失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前权重配置
   */
  private async getCurrentWeights(agentType: AgentType): Promise<Map<string, number>> {
    try {
      const { data, error } = await supabase
        .from('agent_weights')
        .select('*')
        .eq('agent_type', agentType);

      if (error) {
        console.error('[SelfEvolution] 获取当前权重失败:', error);
        return new Map();
      }

      const weights = new Map<string, number>();

      for (const item of data || []) {
        weights.set(item.weight_name, item.weight_value);
      }

      return weights;
    } catch (error) {
      console.error('[SelfEvolution] 获取当前权重失败:', error);
      return new Map();
    }
  }

  /**
   * 计算特征重要性
   */
  private async calculateFeatureImportance(
    features: FeatureData[]
  ): Promise<Map<string, number>> {
    try {
      const importance = new Map<string, number>();

      if (features.length === 0) {
        return importance;
      }

      // 计算各特征的方差
      const policyImpacts = features.map(f => f.policyImpact);
      const newsSentiments = features.map(f => f.newsSentiment);
      const marketTrends = features.map(f => f.marketTrend);
      const fundamentals = features.map(f => f.fundamental);

      const policyImpactVar = this.calculateVariance(policyImpacts);
      const newsSentimentVar = this.calculateVariance(newsSentiments);
      const marketTrendVar = this.calculateVariance(marketTrends);
      const fundamentalVar = this.calculateVariance(fundamentals);

      const totalVar = policyImpactVar + newsSentimentVar + marketTrendVar + fundamentalVar;

      // 归一化
      if (totalVar > 0) {
        importance.set(FeatureType.POLICY_IMPACT, policyImpactVar / totalVar);
        importance.set(FeatureType.NEWS_SENTIMENT, newsSentimentVar / totalVar);
        importance.set(FeatureType.MARKET_TREND, marketTrendVar / totalVar);
        importance.set(FeatureType.FUNDAMENTAL, fundamentalVar / totalVar);
      }

      console.log(`[SelfEvolution] 特征重要性计算完成:`, Object.fromEntries(importance));

      return importance;
    } catch (error) {
      console.error('[SelfEvolution] 计算特征重要性失败:', error);
      return new Map();
    }
  }

  /**
   * 计算方差
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return variance;
  }

  /**
   * 计算优化后的权重
   */
  private calculateOptimizedWeights(
    currentWeights: Map<string, number>,
    featureImportance: Map<string, number>
  ): WeightConfig[] {
    const optimizedWeights: WeightConfig[] = [];

    const weightNames = Array.from(currentWeights.keys());

    for (const weightName of weightNames) {
      const currentValue = currentWeights.get(weightName) || 0;
      const importance = featureImportance.get(weightName) || 0;

      // 使用加权平均更新权重
      const alpha = 0.3; // 学习率
      const newValue = (1 - alpha) * currentValue + alpha * importance;

      optimizedWeights.push({
        weightName,
        weightValue: newValue,
        weightDescription: `${weightName}权重（自动优化）`,
        sourceType: 'auto'
      });
    }

    // 归一化权重
    const total = optimizedWeights.reduce((sum, w) => sum + w.weightValue, 0);
    if (total > 0) {
      for (const weight of optimizedWeights) {
        weight.weightValue = weight.weightValue / total;
      }
    }

    return optimizedWeights;
  }

  /**
   * 更新权重配置
   */
  private async updateWeights(
    agentType: AgentType,
    weights: WeightConfig[]
  ): Promise<void> {
    try {
      for (const weight of weights) {
        await supabase
          .from('agent_weights')
          .upsert({
            agent_type: agentType,
            weight_name: weight.weightName,
            weight_value: weight.weightValue,
            weight_description: weight.weightDescription,
            source_type: weight.sourceType,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'agent_type,weight_name',
            ignoreDuplicates: false
          });
      }

      console.log(`[SelfEvolution] 权重配置已更新`);
    } catch (error) {
      console.error('[SelfEvolution] 更新权重失败:', error);
      throw error;
    }
  }

  /**
   * 执行自我进化
   */
  async evolve(agentType: AgentType, reitCode?: string): Promise<{
    featuresExtracted: number;
    weightsOptimized: number;
    oldWeights: WeightConfig[];
    newWeights: WeightConfig[];
  }> {
    console.log(`[SelfEvolution] 开始 ${agentType} Agent自我进化...`);

    try {
      // 1. 提取特征数据
      const features = await this.extractFeatures(reitCode);

      // 2. 获取优化前的权重
      const oldWeights = await this.getCurrentWeightsAsConfigs(agentType);

      // 3. 优化权重配置
      const newWeights = await this.optimizeAgentWeights(agentType, features);

      console.log(`[SelfEvolution] 自我进化完成`);

      return {
        featuresExtracted: features.length,
        weightsOptimized: newWeights.length,
        oldWeights,
        newWeights
      };
    } catch (error) {
      console.error('[SelfEvolution] 自我进化失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前权重配置（返回配置对象）
   */
  public async getCurrentWeightsAsConfigs(agentType: AgentType): Promise<WeightConfig[]> {
    try {
      const { data, error } = await supabase
        .from('agent_weights')
        .select('*')
        .eq('agent_type', agentType);

      if (error) {
        return [];
      }

      return (data || []).map(item => ({
        weightName: item.weight_name,
        weightValue: item.weight_value,
        weightDescription: item.weight_description,
        sourceType: item.source_type
      }));
    } catch (error) {
      console.error('[SelfEvolution] 获取当前权重配置失败:', error);
      return [];
    }
  }

  /**
   * 批量进化所有Agent
   */
  async evolveAllAgents(): Promise<{
    [key: string]: {
      featuresExtracted: number;
      weightsOptimized: number;
    };
  }> {
    console.log('[SelfEvolution] 开始批量进化所有Agent...');

    const results: { [key: string]: any } = {};

    for (const agentType of Object.values(AgentType)) {
      try {
        const result = await this.evolve(agentType);
        results[agentType] = {
          featuresExtracted: result.featuresExtracted,
          weightsOptimized: result.weightsOptimized
        };
      } catch (error) {
        console.error(`[SelfEvolution] ${agentType} Agent进化失败:`, error);
        results[agentType] = {
          featuresExtracted: 0,
          weightsOptimized: 0,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    console.log('[SelfEvolution] 批量进化完成');

    return results;
  }

  /**
   * 获取Agent权重报告
   */
  async getWeightReport(agentType: AgentType): Promise<{
    agentType: string;
    weights: WeightConfig[];
    lastUpdated: Date;
  }> {
    try {
      const { data, error } = await supabase
        .from('agent_weights')
        .select('*')
        .eq('agent_type', agentType)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[SelfEvolution] 获取权重报告失败:', error);
        // 返回默认权重配置
        return {
          agentType,
          weights: this.getDefaultWeights(agentType),
          lastUpdated: new Date()
        };
      }

      const weights = (data || []).map(item => ({
        weightName: item.weight_name,
        weightValue: item.weight_value,
        weightDescription: item.weight_description,
        sourceType: item.source_type
      }));

      const lastUpdated = weights.length > 0
        ? new Date(data![0].updated_at)
        : new Date();

      return {
        agentType,
        weights,
        lastUpdated
      };
    } catch (error) {
      console.error('[SelfEvolution] 获取权重报告失败:', error);
      // 返回默认权重配置
      return {
        agentType,
        weights: this.getDefaultWeights(agentType),
        lastUpdated: new Date()
      };
    }
  }

  /**
   * 获取默认权重配置
   */
  private getDefaultWeights(agentType: AgentType): WeightConfig[] {
    const defaults: Record<AgentType, WeightConfig[]> = {
      [AgentType.VALUATION]: [
        { weightName: 'policy_impact', weightValue: 0.3, weightDescription: '政策影响权重', sourceType: 'manual' },
        { weightName: 'news_sentiment', weightValue: 0.25, weightDescription: '新闻情感权重', sourceType: 'manual' },
        { weightName: 'market_trend', weightValue: 0.25, weightDescription: '市场趋势权重', sourceType: 'manual' },
        { weightName: 'fundamental', weightValue: 0.2, weightDescription: '基本面权重', sourceType: 'manual' }
      ],
      [AgentType.POLICY]: [
        { weightName: 'policy_impact', weightValue: 0.5, weightDescription: '政策影响权重', sourceType: 'manual' },
        { weightName: 'news_sentiment', weightValue: 0.3, weightDescription: '新闻情感权重', sourceType: 'manual' },
        { weightName: 'market_trend', weightValue: 0.2, weightDescription: '市场趋势权重', sourceType: 'manual' }
      ],
      [AgentType.NEWS]: [
        { weightName: 'sentiment', weightValue: 0.4, weightDescription: '情感权重', sourceType: 'manual' },
        { weightName: 'relevance', weightValue: 0.3, weightDescription: '相关性权重', sourceType: 'manual' },
        { weightName: 'timeliness', weightValue: 0.3, weightDescription: '时效性权重', sourceType: 'manual' }
      ],
      [AgentType.RISK]: [
        { weightName: 'policy_risk', weightValue: 0.3, weightDescription: '政策风险权重', sourceType: 'manual' },
        { weightName: 'market_risk', weightValue: 0.3, weightDescription: '市场风险权重', sourceType: 'manual' },
        { weightName: 'credit_risk', weightValue: 0.2, weightDescription: '信用风险权重', sourceType: 'manual' },
        { weightName: 'operational_risk', weightValue: 0.2, weightDescription: '运营风险权重', sourceType: 'manual' }
      ]
    };

    return defaults[agentType] || [];
  }
}

// 导出单例
export const selfEvolutionService = SelfEvolutionService.getInstance();
