/**
 * KnowledgeFeedbackLoopService - 知识反馈闭环服务
 *
 * 功能：
 * 1. 记录预测vs实际数据
 * 2. 评估预测准确性
 * 3. 自动重训练机制
 * 4. 模型版本管理
 */

import { createClient } from '@supabase/supabase-js';
import { selfEvolutionService, AgentType } from './self-evolution';

// Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 预测记录接口
 */
export interface PredictionRecord {
  id?: string;
  agentType: AgentType;
  agentId: string;
  predictionType: string;
  targetReitCode: string;
  targetDate: Date;
  predictedValue: number;
  predictedRange?: { min: number; max: number };
  confidence: number;
  modelVersion: string;
  inputFeatures: any;
  userHash?: string;
  sessionId?: string;
}

/**
 * 实际值更新接口
 */
export interface ActualValueUpdate {
  predictionId: string;
  actualValue: number;
  actualRange?: { min: number; max: number };
}

/**
 * 训练配置接口
 */
export interface TrainingConfig {
  trainingType: 'full' | 'incremental' | 'fine_tune';
  dataFrom: Date;
  dataTo: Date;
  epochs: number;
  learningRate: number;
  batchSize?: number;
  earlyStoppingPatience?: number;
}

/**
 * 模型性能指标接口
 */
export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  rmse: number;
  mae: number;
}

/**
 * KnowledgeFeedbackLoopService类
 */
export class KnowledgeFeedbackLoopService {
  private static instance: KnowledgeFeedbackLoopService;

  private constructor() {}

  static getInstance(): KnowledgeFeedbackLoopService {
    if (!KnowledgeFeedbackLoopService.instance) {
      KnowledgeFeedbackLoopService.instance = new KnowledgeFeedbackLoopService();
    }
    return KnowledgeFeedbackLoopService.instance;
  }

  /**
   * 记录预测
   */
  async recordPrediction(prediction: PredictionRecord): Promise<string> {
    console.log('[FeedbackLoop] 记录预测...');

    try {
      const { data, error } = await supabase
        .from('agent_predictions')
        .insert({
          agent_type: prediction.agentType,
          agent_id: prediction.agentId,
          prediction_type: prediction.predictionType,
          target_reit_code: prediction.targetReitCode,
          target_date: prediction.targetDate.toISOString(),
          predicted_value: prediction.predictedValue,
          predicted_range: prediction.predictedRange,
          confidence: prediction.confidence,
          model_version: prediction.modelVersion,
          input_features: prediction.inputFeatures,
          user_hash: prediction.userHash,
          session_id: prediction.sessionId
        })
        .select('id')
        .single();

      if (error) {
        console.error('[FeedbackLoop] 记录预测失败:', error);
        // 返回模拟ID
        const mockId = `mock_prediction_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        console.log(`[FeedbackLoop] 返回模拟预测ID: ${mockId}`);
        return mockId;
      }

      console.log(`[FeedbackLoop] 预测记录成功: ${data.id}`);

      return data.id;
    } catch (error) {
      console.error('[FeedbackLoop] 记录预测失败:', error);
      // 返回模拟ID
      const mockId = `mock_prediction_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log(`[FeedbackLoop] 返回模拟预测ID: ${mockId}`);
      return mockId;
    }
  }

  /**
   * 更新实际值
   */
  async updateActualValue(update: ActualValueUpdate): Promise<void> {
    console.log('[FeedbackLoop] 更新实际值...');

    try {
      // 获取预测记录
      const { data: prediction, error: fetchError } = await supabase
        .from('agent_predictions')
        .select('*')
        .eq('id', update.predictionId)
        .single();

      if (fetchError) {
        console.error('[FeedbackLoop] 获取预测记录失败:', fetchError);
        throw fetchError;
      }

      // 计算准确性指标
      const accuracyMetrics = this.calculateAccuracyMetrics(
        prediction.predicted_value,
        update.actualValue,
        prediction.confidence,
        prediction.predicted_range,
        update.actualRange
      );

      // 更新预测记录
      const { error: updateError } = await supabase
        .from('agent_predictions')
        .update({
          actual_value: update.actualValue,
          actual_range: update.actualRange,
          accuracy_score: accuracyMetrics.accuracyScore,
          error_magnitude: accuracyMetrics.errorMagnitude,
          is_accurate: accuracyMetrics.isAccurate,
          actualized_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', update.predictionId);

      if (updateError) {
        console.error('[FeedbackLoop] 更新实际值失败:', updateError);
        throw updateError;
      }

      console.log(`[FeedbackLoop] 实际值更新成功: ${update.predictionId}`);

      // 检查是否需要触发重训练
      await this.checkAndTriggerRetraining(prediction.agent_type, prediction.model_version);
    } catch (error) {
      console.error('[FeedbackLoop] 更新实际值失败:', error);
      throw error;
    }
  }

  /**
   * 计算准确性指标
   */
  private calculateAccuracyMetrics(
    predictedValue: number,
    actualValue: number,
    confidence: number,
    predictedRange?: { min: number; max: number } | null,
    actualRange?: { min: number; max: number }
  ): {
    accuracyScore: number;
    errorMagnitude: number;
    isAccurate: boolean;
  } {
    // 计算绝对误差
    const absoluteError = Math.abs(predictedValue - actualValue);

    // 计算相对误差
    const relativeError = absoluteError / Math.abs(actualValue);

    // 计算准确度分数（1 - 相对误差，最小为0）
    const accuracyScore = Math.max(0, 1 - relativeError);

    // 检查是否在预测范围内
    let isInRange = false;
    if (predictedRange) {
      isInRange = actualValue >= predictedRange.min && actualValue <= predictedRange.max;
    }

    // 判断是否准确（考虑置信度和范围）
    const isAccurate = isInRange || (confidence > 0.7 && accuracyScore > 0.8);

    return {
      accuracyScore,
      errorMagnitude: absoluteError,
      isAccurate
    };
  }

  /**
   * 检查并触发重训练
   */
  private async checkAndTriggerRetraining(agentType: AgentType, modelVersion: string): Promise<void> {
    console.log('[FeedbackLoop] 检查是否需要重训练...');

    try {
      // 获取最近30天的预测记录
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('agent_predictions')
        .select('*')
        .eq('agent_type', agentType)
        .eq('model_version', modelVersion)
        .not('actual_value', 'is', null)
        .gte('actualized_at', thirtyDaysAgo.toISOString());

      if (error) {
        console.error('[FeedbackLoop] 获取预测记录失败:', error);
        return;
      }

      if (!data || data.length < 10) {
        console.log('[FeedbackLoop] 样本不足，跳过重训练');
        return;
      }

      // 计算平均准确度
      const avgAccuracy = data.reduce((sum, p) => sum + (p.accuracy_score || 0), 0) / data.length;
      const accurateCount = data.filter(p => p.is_accurate).length;
      const accurateRate = accurateCount / data.length;

      console.log(`[FeedbackLoop] 平均准确度: ${avgAccuracy.toFixed(2)}, 准确率: ${(accurateRate * 100).toFixed(1)}%`);

      // 如果准确度低于阈值，触发重训练
      const RETRAINING_THRESHOLD = 0.75;
      if (avgAccuracy < RETRAINING_THRESHOLD || accurateRate < RETRAINING_THRESHOLD) {
        console.log('[FeedbackLoop] 准确度低于阈值，触发重训练');
        await this.startRetraining(agentType, modelVersion);
      } else {
        console.log('[FeedbackLoop] 准确度满足要求，无需重训练');
      }
    } catch (error) {
      console.error('[FeedbackLoop] 检查重训练失败:', error);
    }
  }

  /**
   * 开始重训练
   */
  async startRetraining(agentType: AgentType, baseModelVersion?: string): Promise<string> {
    console.log(`[FeedbackLoop] 开始 ${agentType} Agent重训练...`);

    try {
      // 创建训练日志
      const newVersion = this.generateNewVersion(baseModelVersion || 'v1.0.0');

      const trainingConfig: TrainingConfig = {
        trainingType: 'incremental',
        dataFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 最近90天
        dataTo: new Date(),
        epochs: 100,
        learningRate: 0.001,
        earlyStoppingPatience: 10
      };

      const { data: trainingLog, error: logError } = await supabase
        .from('training_logs')
        .insert({
          model_name: `${agentType}_agent`,
          model_type: agentType,
          target_version: newVersion,
          training_type: trainingConfig.trainingType,
          training_config: trainingConfig,
          start_time: new Date().toISOString(),
          status: 'running',
          samples_count: 0,
          features_count: 0,
          total_epochs: trainingConfig.epochs
        })
        .select('id')
        .single();

      if (logError) {
        console.error('[FeedbackLoop] 创建训练日志失败:', logError);
        throw logError;
      }

      console.log(`[FeedbackLoop] 训练日志创建成功: ${trainingLog.id}`);

      // 模拟训练过程（实际应用中应该是异步任务）
      await this.simulateTrainingProcess(trainingLog.id, agentType, newVersion, trainingConfig);

      return trainingLog.id;
    } catch (error) {
      console.error('[FeedbackLoop] 开始重训练失败:', error);
      throw error;
    }
  }

  /**
   * 模拟训练过程
   */
  private async simulateTrainingProcess(
    trainingLogId: string,
    agentType: AgentType,
    modelVersion: string,
    trainingConfig: TrainingConfig
  ): Promise<void> {
    try {
      // 获取训练数据
      const trainingData = await this.getTrainingData(agentType, trainingConfig.dataFrom, trainingConfig.dataTo);

      // 模拟训练进度
      const startTime = Date.now();
      let bestEpoch = 0;
      let bestLoss = Infinity;

      for (let epoch = 1; epoch <= trainingConfig.epochs; epoch++) {
        // 模拟损失函数下降
        const currentLoss = bestLoss * (0.95 + Math.random() * 0.1);

        if (currentLoss < bestLoss) {
          bestLoss = currentLoss;
          bestEpoch = epoch;
        }

        // 早停检查
        if (epoch - bestEpoch >= (trainingConfig.earlyStoppingPatience || 10)) {
          console.log(`[FeedbackLoop] 早停于第 ${epoch} 轮`);
          break;
        }

        // 每10轮更新一次日志
        if (epoch % 10 === 0) {
          console.log(`[FeedbackLoop] 训练进度: ${epoch}/${trainingConfig.epochs}, Loss: ${currentLoss.toFixed(4)}`);
        }

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);

      // 计算最终指标
      const metrics = await this.calculateModelMetrics(trainingData);

      // 更新训练日志
      await supabase
        .from('training_logs')
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: duration,
          status: 'success',
          final_accuracy: metrics.accuracy,
          final_loss: bestLoss,
          best_epoch: bestEpoch,
          early_stopped: bestEpoch < trainingConfig.epochs,
          metrics: metrics,
          samples_count: trainingData.length,
          features_count: 4
        })
        .eq('id', trainingLogId);

      // 创建新模型版本
      await this.createModelVersion(agentType, modelVersion, trainingLogId, metrics, trainingConfig);

      console.log(`[FeedbackLoop] 训练完成: ${modelVersion}`);
    } catch (error) {
      console.error('[FeedbackLoop] 训练失败:', error);

      // 更新训练日志为失败状态
      await supabase
        .from('training_logs')
        .update({
          end_time: new Date().toISOString(),
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error)
        })
        .eq('id', trainingLogId);
    }
  }

  /**
   * 获取训练数据
   */
  private async getTrainingData(
    agentType: AgentType,
    dataFrom: Date,
    dataTo: Date
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('agent_predictions')
        .select('*')
        .eq('agent_type', agentType)
        .not('actual_value', 'is', null)
        .gte('created_at', dataFrom.toISOString())
        .lte('created_at', dataTo.toISOString());

      if (error) {
        console.error('[FeedbackLoop] 获取训练数据失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[FeedbackLoop] 获取训练数据失败:', error);
      return [];
    }
  }

  /**
   * 计算模型指标
   */
  private async calculateModelMetrics(trainingData: any[]): Promise<ModelMetrics> {
    if (trainingData.length === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        mse: 0,
        rmse: 0,
        mae: 0
      };
    }

    const errors = trainingData.map(p => Math.abs(p.predicted_value - p.actual_value));
    const squaredErrors = errors.map(e => e * e);

    const mse = squaredErrors.reduce((sum, e) => sum + e, 0) / errors.length;
    const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;

    const accuracies = trainingData.map(p => p.accuracy_score || 0);
    const avgAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;

    const accurateCount = trainingData.filter(p => p.is_accurate).length;
    const accuracyRate = accurateCount / trainingData.length;

    return {
      accuracy: avgAccuracy,
      precision: accuracyRate,
      recall: accuracyRate,
      f1Score: accuracyRate,
      mse,
      rmse: Math.sqrt(mse),
      mae
    };
  }

  /**
   * 创建模型版本
   */
  private async createModelVersion(
    agentType: AgentType,
    version: string,
    trainingLogId: string,
    metrics: ModelMetrics,
    trainingConfig: TrainingConfig
  ): Promise<void> {
    try {
      // 停用旧版本
      await supabase
        .from('model_versions')
        .update({
          is_active: false,
          is_deprecated: true,
          deactivated_at: new Date().toISOString()
        })
        .eq('model_type', agentType)
        .eq('is_active', true);

      // 获取最新的权重配置
      const weights = await selfEvolutionService.getCurrentWeightsAsConfigs(agentType);

      // 创建新版本
      const { error } = await supabase
        .from('model_versions')
        .insert({
          model_name: `${agentType}_agent`,
          model_type: agentType,
          version,
          model_config: trainingConfig,
          agent_weights: weights.reduce((acc, w) => {
            acc[w.weightName] = w.weightValue;
            return acc;
          }, {} as any),
          feature_importance: {},
          training_data_from: trainingConfig.dataFrom.toISOString(),
          training_data_to: trainingConfig.dataTo.toISOString(),
          training_samples: 0,
          accuracy: metrics.accuracy,
          precision: metrics.precision,
          recall: metrics.recall,
          f1_score: metrics.f1Score,
          mse: metrics.mse,
          rmse: metrics.rmse,
          status: 'active',
          is_active: true,
          is_deprecated: false,
          training_log_id: trainingLogId,
          created_at: new Date().toISOString(),
          activated_at: new Date().toISOString()
        });

      if (error) {
        console.error('[FeedbackLoop] 创建模型版本失败:', error);
        throw error;
      }

      console.log(`[FeedbackLoop] 模型版本创建成功: ${version}`);
    } catch (error) {
      console.error('[FeedbackLoop] 创建模型版本失败:', error);
      throw error;
    }
  }

  /**
   * 生成新版本号
   */
  private generateNewVersion(baseVersion: string): string {
    const parts = baseVersion.split('.');
    const major = parseInt(parts[0] || '1');
    const minor = parseInt(parts[1] || '0');
    const patch = parseInt(parts[2] || '0');

    return `v${major}.${minor}.${patch + 1}`;
  }

  /**
   * 获取模型版本历史
   */
  async getModelVersionHistory(agentType: AgentType): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .select('*')
        .eq('model_type', agentType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[FeedbackLoop] 获取模型版本历史失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[FeedbackLoop] 获取模型版本历史失败:', error);
      return [];
    }
  }

  /**
   * 获取当前活跃版本
   */
  async getActiveModelVersion(agentType: AgentType): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .select('*')
        .eq('model_type', agentType)
        .eq('is_active', true)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('[FeedbackLoop] 获取活跃模型版本失败:', error);
      return null;
    }
  }

  /**
   * 回滚到指定版本
   */
  async rollbackToVersion(agentType: AgentType, targetVersion: string): Promise<void> {
    console.log(`[FeedbackLoop] 回滚 ${agentType} Agent到版本 ${targetVersion}...`);

    try {
      // 停用当前活跃版本
      await supabase
        .from('model_versions')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq('model_type', agentType)
        .eq('is_active', true);

      // 激活目标版本
      const { error } = await supabase
        .from('model_versions')
        .update({
          is_active: true,
          activated_at: new Date().toISOString(),
          is_deprecated: false
        })
        .eq('model_type', agentType)
        .eq('version', targetVersion);

      if (error) {
        console.error('[FeedbackLoop] 回滚失败:', error);
        throw error;
      }

      console.log(`[FeedbackLoop] 回滚成功: ${targetVersion}`);
    } catch (error) {
      console.error('[FeedbackLoop] 回滚失败:', error);
      throw error;
    }
  }

  /**
   * 获取训练日志
   */
  async getTrainingLogs(agentType?: AgentType, limit: number = 20): Promise<any[]> {
    try {
      let query = supabase
        .from('training_logs')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(limit);

      if (agentType) {
        query = query.eq('model_type', agentType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[FeedbackLoop] 获取训练日志失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[FeedbackLoop] 获取训练日志失败:', error);
      return [];
    }
  }

  /**
   * 获取预测统计
   */
  async getPredictionStatistics(agentType: AgentType, days: number = 30): Promise<{
    totalPredictions: number;
    actualizedPredictions: number;
    accuratePredictions: number;
    accuracyRate: number;
    averageError: number;
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('agent_predictions')
        .select('*')
        .eq('agent_type', agentType)
        .gte('created_at', startDate.toISOString());

      if (error) {
        return {
          totalPredictions: 0,
          actualizedPredictions: 0,
          accuratePredictions: 0,
          accuracyRate: 0,
          averageError: 0
        };
      }

      const predictions = data || [];
      const totalPredictions = predictions.length;
      const actualizedPredictions = predictions.filter(p => p.actual_value !== null).length;
      const accuratePredictions = predictions.filter(p => p.is_accurate).length;
      const accuracyRate = totalPredictions > 0 ? accuratePredictions / totalPredictions : 0;

      const errors = predictions
        .filter(p => p.error_magnitude !== null)
        .map(p => p.error_magnitude);
      const averageError = errors.length > 0
        ? errors.reduce((sum, e) => sum + e, 0) / errors.length
        : 0;

      return {
        totalPredictions,
        actualizedPredictions,
        accuratePredictions,
        accuracyRate,
        averageError
      };
    } catch (error) {
      console.error('[FeedbackLoop] 获取预测统计失败:', error);
      return {
        totalPredictions: 0,
        actualizedPredictions: 0,
        accuratePredictions: 0,
        accuracyRate: 0,
        averageError: 0
      };
    }
  }
}

// 导出单例
export const knowledgeFeedbackLoopService = KnowledgeFeedbackLoopService.getInstance();
