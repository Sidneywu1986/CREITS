/**
 * IntelligentEvolutionService - 智能进化闭环服务
 *
 * 功能：
 * 1. 数据采集（Web Search）
 * 2. 数据分析（LLM）
 * 3. 模型训练（TensorFlow.js）
 * 4. 模型评估
 * 5. 自动进化
 */

import { CozeWebSearchService, SearchType } from '../coze-integration/web-search-service';
import { cozeLLMService, AnalysisType } from '../coze-integration/llm-service';
import { tensorflowTrainingService } from '../tensorflow/training-service';

// 获取单例实例
const webSearchService = CozeWebSearchService.getInstance();

/**
 * 进化任务类型
 */
export enum EvolutionTaskType {
  VALUATION = 'valuation',
  POLICY_IMPACT = 'policy_impact',
  NEWS_SENTIMENT = 'news_sentiment',
  RISK_ASSESSMENT = 'risk_assessment'
}

/**
 * 进化任务配置
 */
export interface EvolutionTaskConfig {
  taskType: EvolutionTaskType;
  dataSources: string[];
  modelType?: string;
  trainingConfig?: any;
  schedule?: string;
}

/**
 * 进化任务结果
 */
export interface EvolutionTaskResult {
  taskType: EvolutionTaskType;
  success: boolean;
  dataCount: number;
  analysisCount: number;
  trainingResult?: any;
  evaluationResult?: any;
  timestamp: number;
  error?: string;
}

/**
 * 智能进化服务
 */
export class IntelligentEvolutionService {
  private static instance: IntelligentEvolutionService;
  private evolutionHistory: Map<EvolutionTaskType, EvolutionTaskResult[]>;

  private constructor() {
    this.evolutionHistory = new Map();
  }

  static getInstance(): IntelligentEvolutionService {
    if (!IntelligentEvolutionService.instance) {
      IntelligentEvolutionService.instance = new IntelligentEvolutionService();
    }
    return IntelligentEvolutionService.instance;
  }

  /**
   * 执行估值模型进化
   */
  async evolveValuationModel(config?: Partial<EvolutionTaskConfig>): Promise<EvolutionTaskResult> {
    console.log('[IntelligentEvolution] 开始执行估值模型进化...');

    try {
      // 1. 数据采集
      console.log('[IntelligentEvolution] 步骤 1: 数据采集');
      const policies = await webSearchService.searchPolicies({
        keywords: ['REITs', '估值', '政策'],
        count: 20,
        timeRange: '1m'
      });

      const news = await webSearchService.searchNews({
        keywords: ['REITs', '估值', '市场分析'],
        count: 30,
        timeRange: '1m'
      });

      const dataCount = policies.results.length + news.results.length;
      console.log(`[IntelligentEvolution] 采集到 ${dataCount} 条数据`);

      // 2. 数据分析
      console.log('[IntelligentEvolution] 步骤 2: 数据分析');
      const policyImpacts = await cozeLLMService.batchAnalyze(
        policies.results.map((p: any) => ({
          text: p.snippet || '',
          title: p.title,
          type: AnalysisType.POLICY_IMPACT
        }))
      );

      const newsSentiments = await cozeLLMService.batchAnalyze(
        news.results.map((n: any) => ({
          text: n.snippet || '',
          title: n.title,
          type: AnalysisType.NEWS_SENTIMENT
        }))
      );

      const analysisCount = policyImpacts.length + newsSentiments.length;
      console.log(`[IntelligentEvolution] 分析了 ${analysisCount} 条数据`);

      // 3. 准备训练数据
      console.log('[IntelligentEvolution] 步骤 3: 准备训练数据');
      const trainingData = this.prepareValuationTrainingData(
        policyImpacts,
        newsSentiments,
        policies.results,
        news.results
      );

      // 4. 训练模型
      console.log('[IntelligentEvolution] 步骤 4: 训练模型');
      const trainingResult = await tensorflowTrainingService.trainValuationModel(
        trainingData,
        {
          epochs: 100,
          batchSize: 32,
          validationSplit: 0.2,
          earlyStoppingPatience: 15
        }
      );

      console.log(`[IntelligentEvolution] 模型训练完成，Loss: ${trainingResult.finalLoss.toFixed(6)}`);

      // 5. 评估模型
      console.log('[IntelligentEvolution] 步骤 5: 评估模型');
      const evaluationResult = await tensorflowTrainingService.evaluateModel(
        'valuation',
        trainingData.inputs.slice(0, 20),
        trainingData.outputs.slice(0, 20)
      );

      // 6. 保存模型
      console.log('[IntelligentEvolution] 步骤 6: 保存模型');
      await tensorflowTrainingService.saveTrainedModel('valuation', '/models/valuation');

      // 7. 记录结果
      const result: EvolutionTaskResult = {
        taskType: EvolutionTaskType.VALUATION,
        success: true,
        dataCount,
        analysisCount,
        trainingResult,
        evaluationResult,
        timestamp: Date.now()
      };

      this.addToHistory(result);
      console.log('[IntelligentEvolution] 估值模型进化完成');

      return result;
    } catch (error) {
      console.error('[IntelligentEvolution] 估值模型进化失败:', error);

      const result: EvolutionTaskResult = {
        taskType: EvolutionTaskType.VALUATION,
        success: false,
        dataCount: 0,
        analysisCount: 0,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.addToHistory(result);
      return result;
    }
  }

  /**
   * 执行政策影响模型进化
   */
  async evolvePolicyImpactModel(config?: Partial<EvolutionTaskConfig>): Promise<EvolutionTaskResult> {
    console.log('[IntelligentEvolution] 开始执行政策影响模型进化...');

    try {
      // 1. 数据采集
      console.log('[IntelligentEvolution] 步骤 1: 数据采集');
      const policies = await webSearchService.searchPolicies({
        keywords: ['REITs', '政策', '监管'],
        count: 30,
        timeRange: '1m'
      });

      const dataCount = policies.results.length;
      console.log(`[IntelligentEvolution] 采集到 ${dataCount} 条数据`);

      // 2. 数据分析
      console.log('[IntelligentEvolution] 步骤 2: 数据分析');
      const policyImpacts = await cozeLLMService.batchAnalyze(
        policies.results.map((p: any) => ({
          text: p.snippet || '',
          title: p.title,
          type: AnalysisType.POLICY_IMPACT
        }))
      );

      const analysisCount = policyImpacts.length;
      console.log(`[IntelligentEvolution] 分析了 ${analysisCount} 条数据`);

      // 3. 准备训练数据
      console.log('[IntelligentEvolution] 步骤 3: 准备训练数据');
      const trainingData = this.preparePolicyImpactTrainingData(policyImpacts, policies.results);

      // 4. 训练模型
      console.log('[IntelligentEvolution] 步骤 4: 训练模型');
      const trainingResult = await tensorflowTrainingService.trainPolicyImpactModel(
        trainingData,
        {
          epochs: 150,
          batchSize: 32,
          validationSplit: 0.2,
          earlyStoppingPatience: 20
        }
      );

      console.log(`[IntelligentEvolution] 模型训练完成，Loss: ${trainingResult.finalLoss.toFixed(6)}`);

      // 5. 评估模型
      console.log('[IntelligentEvolution] 步骤 5: 评估模型');
      const evaluationResult = await tensorflowTrainingService.evaluateModel(
        'policy_impact',
        trainingData.inputs.slice(0, 10),
        trainingData.outputs.slice(0, 10)
      );

      // 6. 保存模型
      console.log('[IntelligentEvolution] 步骤 6: 保存模型');
      await tensorflowTrainingService.saveTrainedModel('policy_impact', '/models/policy_impact');

      // 7. 记录结果
      const result: EvolutionTaskResult = {
        taskType: EvolutionTaskType.POLICY_IMPACT,
        success: true,
        dataCount,
        analysisCount,
        trainingResult,
        evaluationResult,
        timestamp: Date.now()
      };

      this.addToHistory(result);
      console.log('[IntelligentEvolution] 政策影响模型进化完成');

      return result;
    } catch (error) {
      console.error('[IntelligentEvolution] 政策影响模型进化失败:', error);

      const result: EvolutionTaskResult = {
        taskType: EvolutionTaskType.POLICY_IMPACT,
        success: false,
        dataCount: 0,
        analysisCount: 0,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.addToHistory(result);
      return result;
    }
  }

  /**
   * 执行新闻情感模型进化
   */
  async evolveNewsSentimentModel(config?: Partial<EvolutionTaskConfig>): Promise<EvolutionTaskResult> {
    console.log('[IntelligentEvolution] 开始执行新闻情感模型进化...');

    try {
      // 1. 数据采集
      console.log('[IntelligentEvolution] 步骤 1: 数据采集');
      const news = await webSearchService.searchNews({
        keywords: ['REITs', '市场', '新闻'],
        count: 50,
        timeRange: '1m'
      });

      const dataCount = news.results.length;
      console.log(`[IntelligentEvolution] 采集到 ${dataCount} 条数据`);

      // 2. 数据分析
      console.log('[IntelligentEvolution] 步骤 2: 数据分析');
      const newsSentiments = await cozeLLMService.batchAnalyze(
        news.results.map((n: any) => ({
          text: n.snippet || '',
          title: n.title,
          type: AnalysisType.NEWS_SENTIMENT
        }))
      );

      const analysisCount = newsSentiments.length;
      console.log(`[IntelligentEvolution] 分析了 ${analysisCount} 条数据`);

      // 3. 准备训练数据
      console.log('[IntelligentEvolution] 步骤 3: 准备训练数据');
      const trainingData = this.prepareNewsSentimentTrainingData(newsSentiments, news.results);

      // 4. 训练模型
      console.log('[IntelligentEvolution] 步骤 4: 训练模型');
      const trainingResult = await tensorflowTrainingService.trainNewsSentimentModel(
        trainingData,
        {
          epochs: 100,
          batchSize: 32,
          validationSplit: 0.2,
          earlyStoppingPatience: 15
        }
      );

      console.log(`[IntelligentEvolution] 模型训练完成，Loss: ${trainingResult.finalLoss.toFixed(6)}`);

      // 5. 评估模型
      console.log('[IntelligentEvolution] 步骤 5: 评估模型');
      const evaluationResult = await tensorflowTrainingService.evaluateModel(
        'news_sentiment',
        trainingData.inputs.slice(0, 20),
        trainingData.outputs.slice(0, 20)
      );

      // 6. 保存模型
      console.log('[IntelligentEvolution] 步骤 6: 保存模型');
      await tensorflowTrainingService.saveTrainedModel('news_sentiment', '/models/news_sentiment');

      // 7. 记录结果
      const result: EvolutionTaskResult = {
        taskType: EvolutionTaskType.NEWS_SENTIMENT,
        success: true,
        dataCount,
        analysisCount,
        trainingResult,
        evaluationResult,
        timestamp: Date.now()
      };

      this.addToHistory(result);
      console.log('[IntelligentEvolution] 新闻情感模型进化完成');

      return result;
    } catch (error) {
      console.error('[IntelligentEvolution] 新闻情感模型进化失败:', error);

      const result: EvolutionTaskResult = {
        taskType: EvolutionTaskType.NEWS_SENTIMENT,
        success: false,
        dataCount: 0,
        analysisCount: 0,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.addToHistory(result);
      return result;
    }
  }

  /**
   * 执行风险评估模型进化
   */
  async evolveRiskAssessmentModel(config?: Partial<EvolutionTaskConfig>): Promise<EvolutionTaskResult> {
    console.log('[IntelligentEvolution] 开始执行风险评估模型进化...');

    try {
      // 1. 数据采集
      console.log('[IntelligentEvolution] 步骤 1: 数据采集');
      const policies = await webSearchService.searchPolicies({
        keywords: ['REITs', '风险', '监管'],
        count: 20,
        timeRange: '1m'
      });

      const news = await webSearchService.searchNews({
        keywords: ['REITs', '风险', '评级'],
        count: 30,
        timeRange: '1m'
      });

      const dataCount = policies.results.length + news.results.length;
      console.log(`[IntelligentEvolution] 采集到 ${dataCount} 条数据`);

      // 2. 数据分析
      console.log('[IntelligentEvolution] 步骤 2: 数据分析');
      const policyImpacts = await cozeLLMService.batchAnalyze(
        policies.results.map((p: any) => ({
          text: p.snippet || '',
          title: p.title,
          type: AnalysisType.POLICY_IMPACT
        }))
      );

      const newsSentiments = await cozeLLMService.batchAnalyze(
        news.results.map((n: any) => ({
          text: n.snippet || '',
          title: n.title,
          type: AnalysisType.NEWS_SENTIMENT
        }))
      );

      const analysisCount = policyImpacts.length + newsSentiments.length;
      console.log(`[IntelligentEvolution] 分析了 ${analysisCount} 条数据`);

      // 3. 准备训练数据
      console.log('[IntelligentEvolution] 步骤 3: 准备训练数据');
      const trainingData = this.prepareRiskAssessmentTrainingData(
        policyImpacts,
        newsSentiments,
        policies.results,
        news.results
      );

      // 4. 训练模型
      console.log('[IntelligentEvolution] 步骤 4: 训练模型');
      const trainingResult = await tensorflowTrainingService.trainRiskAssessmentModel(
        trainingData,
        {
          epochs: 100,
          batchSize: 32,
          validationSplit: 0.2,
          earlyStoppingPatience: 15
        }
      );

      console.log(`[IntelligentEvolution] 模型训练完成，Loss: ${trainingResult.finalLoss.toFixed(6)}`);

      // 5. 评估模型
      console.log('[IntelligentEvolution] 步骤 5: 评估模型');
      const evaluationResult = await tensorflowTrainingService.evaluateModel(
        'risk_assessment',
        trainingData.inputs.slice(0, 20),
        trainingData.outputs.slice(0, 20)
      );

      // 6. 保存模型
      console.log('[IntelligentEvolution] 步骤 6: 保存模型');
      await tensorflowTrainingService.saveTrainedModel('risk_assessment', '/models/risk_assessment');

      // 7. 记录结果
      const result: EvolutionTaskResult = {
        taskType: EvolutionTaskType.RISK_ASSESSMENT,
        success: true,
        dataCount,
        analysisCount,
        trainingResult,
        evaluationResult,
        timestamp: Date.now()
      };

      this.addToHistory(result);
      console.log('[IntelligentEvolution] 风险评估模型进化完成');

      return result;
    } catch (error) {
      console.error('[IntelligentEvolution] 风险评估模型进化失败:', error);

      const result: EvolutionTaskResult = {
        taskType: EvolutionTaskType.RISK_ASSESSMENT,
        success: false,
        dataCount: 0,
        analysisCount: 0,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.addToHistory(result);
      return result;
    }
  }

  /**
   * 准备估值训练数据
   */
  private prepareValuationTrainingData(
    policyImpacts: any[],
    newsSentiments: any[],
    policies: any[],
    news: any[]
  ): { inputs: number[][], outputs: number[][] } {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    // 简化的训练数据生成
    const minLen = Math.min(policyImpacts.length, newsSentiments.length);

    for (let i = 0; i < minLen; i++) {
      const impact = policyImpacts[i];
      const sentiment = newsSentiments[i];

      // 输入特征：政策影响分数、情感分数、发布时间（模拟）
      const input: number[] = [
        (impact?.impactScore || 0 + 1) / 2,  // 归一化到 0-1
        (sentiment?.score || 0 + 1) / 2,     // 归一化到 0-1
        Math.random()  // 时间特征（模拟）
      ];

      // 输出：估值分数（模拟）
      const output: number[] = [
        (input[0] * 0.5 + input[1] * 0.5)  // 简化的估值公式
      ];

      inputs.push(input);
      outputs.push(output);
    }

    return { inputs, outputs };
  }

  /**
   * 准备政策影响训练数据
   */
  private preparePolicyImpactTrainingData(policyImpacts: any[], policies: any[]): { inputs: number[][], outputs: number[][] } {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    for (let i = 0; i < policyImpacts.length; i++) {
      const impact = policyImpacts[i];

      // 输入特征：政策文本长度、重要性等级（编码）、站点权威度（模拟）
      const input: number[] = [
        (policies[i]?.snippet?.length || 0) / 500,  // 归一化文本长度
        impact?.impactLevel === 'high' ? 1 : impact?.impactLevel === 'medium' ? 0.5 : 0,
        (policies[i]?.authorityLevel || 0.5)  // 权威度
      ];

      // 输出：影响分数
      const output: number[] = [
        (impact?.impactScore || 0 + 1) / 2  // 归一化到 0-1
      ];

      inputs.push(input);
      outputs.push(output);
    }

    return { inputs, outputs };
  }

  /**
   * 准备新闻情感训练数据
   */
  private prepareNewsSentimentTrainingData(newsSentiments: any[], news: any[]): { inputs: number[][], outputs: number[][] } {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    for (let i = 0; i < newsSentiments.length; i++) {
      const sentiment = newsSentiments[i];

      // 输入特征：新闻文本长度、情感类型（编码）、置信度
      const input: number[] = [
        (news[i]?.snippet?.length || 0) / 300,  // 归一化文本长度
        sentiment?.sentiment === 'positive' ? 1 : sentiment?.sentiment === 'negative' ? 0 : 0.5,
        sentiment?.confidence || 0.5
      ];

      // 输出：情感分数
      const output: number[] = [
        (sentiment?.score || 0 + 1) / 2  // 归一化到 0-1
      ];

      inputs.push(input);
      outputs.push(output);
    }

    return { inputs, outputs };
  }

  /**
   * 准备风险评估训练数据
   */
  private prepareRiskAssessmentTrainingData(
    policyImpacts: any[],
    newsSentiments: any[],
    policies: any[],
    news: any[]
  ): { inputs: number[][], outputs: number[][] } {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    const minLen = Math.min(policyImpacts.length, newsSentiments.length);

    for (let i = 0; i < minLen; i++) {
      const impact = policyImpacts[i];
      const sentiment = newsSentiments[i];

      // 输入特征：政策影响分数、情感分数、政策重要性、新闻置信度
      const input: number[] = [
        (impact?.impactScore || 0 + 1) / 2,
        (sentiment?.score || 0 + 1) / 2,
        impact?.impactLevel === 'high' ? 1 : impact?.impactLevel === 'medium' ? 0.5 : 0,
        sentiment?.confidence || 0.5
      ];

      // 输出：风险等级（0-1，1表示高风险）
      const output: number[] = [
        Math.max(0, Math.min(1, 0.5 - input[0] * 0.3 + input[1] * 0.2 + input[2] * 0.3))
      ];

      inputs.push(input);
      outputs.push(output);
    }

    return { inputs, outputs };
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(result: EvolutionTaskResult): void {
    const history = this.evolutionHistory.get(result.taskType) || [];
    history.push(result);

    // 只保留最近 10 条记录
    if (history.length > 10) {
      history.shift();
    }

    this.evolutionHistory.set(result.taskType, history);
  }

  /**
   * 获取历史记录
   */
  getHistory(taskType?: EvolutionTaskType): EvolutionTaskResult[] {
    if (taskType) {
      return this.evolutionHistory.get(taskType) || [];
    }

    // 返回所有历史记录
    const allResults: EvolutionTaskResult[] = [];
    for (const history of this.evolutionHistory.values()) {
      allResults.push(...history);
    }

    return allResults.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取最新结果
   */
  getLatestResult(taskType: EvolutionTaskType): EvolutionTaskResult | null {
    const history = this.evolutionHistory.get(taskType);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }
}

// 导出单例
export const intelligentEvolutionService = IntelligentEvolutionService.getInstance();
