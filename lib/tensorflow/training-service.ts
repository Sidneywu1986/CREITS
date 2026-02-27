/**
 * TensorFlowTrainingService - TensorFlow.js 训练流程服务
 *
 * 功能：
 * 1. 数据预处理
 * 2. 模型训练
 * 3. 模型评估
 * 4. 早停机制
 */

import * as tf from '@tensorflow/tfjs';
import { tensorflowModelService, ModelType } from './model-service';

/**
 * 训练配置
 */
export interface TrainingConfig {
  modelName: string;
  epochs: number;
  batchSize: number;
  validationSplit: number;
  shuffle: boolean;
  earlyStoppingPatience?: number;
  earlyStoppingMinDelta?: number;
  callbacks?: tf.Callback[];
}

/**
 * 数据集
 */
export interface Dataset {
  inputs: number[][];
  outputs: number[][];
  validationInputs?: number[][];
  validationOutputs?: number[][];
}

/**
 * 训练结果
 */
export interface TrainingResult {
  model: string;
  success: boolean;
  epochs: number;
  finalLoss: number;
  finalAccuracy: number;
  history: {
    loss: number[];
    accuracy: number[];
    valLoss: number[];
    valAccuracy: number[];
  };
  trainingTime: number;
  stoppedEarly: boolean;
  bestEpoch: number;
}

/**
 * EarlyStopping回调
 */
class EarlyStoppingCallback extends tf.Callback {
  private patience: number;
  private minDelta: number;
  private bestLoss: number;
  private bestEpoch: number = 0;
  private bestWeights: tf.NamedTensorMap | null = null;
  private wait: number = 0;
  private stoppedEpoch: number = 0;
  private stopped: boolean = false;

  constructor(patience: number = 10, minDelta: number = 0.001) {
    super();
    this.patience = patience;
    this.minDelta = minDelta;
    this.bestLoss = Infinity;
  }

  async onEpochEnd(epoch: number, logs: tf.Logs): Promise<void> {
    const currentLoss = logs.loss;

    if (currentLoss === undefined) {
      return;
    }

    if (currentLoss < this.bestLoss - this.minDelta) {
      this.bestLoss = currentLoss;
      this.wait = 0;
      this.bestEpoch = epoch;
    } else {
      this.wait += 1;

      if (this.wait >= this.patience) {
        this.stopped = true;
        this.stoppedEpoch = epoch;
        console.log(`[EarlyStopping] 早停于第 ${epoch} 轮`);
      }
    }
  }

  async onTrainEnd(logs?: tf.Logs): Promise<void> {
    if (this.stopped) {
      console.log(`[EarlyStopping] 训练提前停止，最佳轮次: ${this.bestEpoch}`);
    }
  }

  shouldStop(): boolean {
    return this.stopped;
  }
}

/**
 * TensorFlowTrainingService类
 */
export class TensorFlowTrainingService {
  private static instance: TensorFlowTrainingService;
  private trainingSessions: Map<string, tf.LayersModel>;

  private constructor() {
    this.trainingSessions = new Map();
  }

  static getInstance(): TensorFlowTrainingService {
    if (!TensorFlowTrainingService.instance) {
      TensorFlowTrainingService.instance = new TensorFlowTrainingService();
    }
    return TensorFlowTrainingService.instance;
  }

  /**
   * 训练估值模型
   */
  async trainValuationModel(
    data: Dataset,
    config?: Partial<TrainingConfig>
  ): Promise<TrainingResult> {
    console.log('[TensorFlow] 开始训练估值模型...');

    const model = await tensorflowModelService.createValuationModel(data.inputs[0].length);
    const trainingConfig: TrainingConfig = {
      modelName: 'valuation',
      epochs: config?.epochs || 100,
      batchSize: config?.batchSize || 32,
      validationSplit: config?.validationSplit || 0.2,
      shuffle: config?.shuffle !== false,
      earlyStoppingPatience: config?.earlyStoppingPatience || 15,
      earlyStoppingMinDelta: config?.earlyStoppingMinDelta || 0.001,
      callbacks: config?.callbacks || []
    };

    return await this.trainModel(model, data, trainingConfig);
  }

  /**
   * 训练政策影响模型
   */
  async trainPolicyImpactModel(
    data: Dataset,
    config?: Partial<TrainingConfig>
  ): Promise<TrainingResult> {
    console.log('[TensorFlow] 开始训练政策影响模型...');

    const model = await tensorflowModelService.createPolicyImpactModel(data.inputs[0].length);
    const trainingConfig: TrainingConfig = {
      modelName: 'policy_impact',
      epochs: config?.epochs || 150,
      batchSize: config?.batchSize || 32,
      validationSplit: config?.validationSplit || 0.2,
      shuffle: config?.shuffle !== false,
      earlyStoppingPatience: config?.earlyStoppingPatience || 20,
      earlyStoppingMinDelta: config?.earlyStoppingMinDelta || 0.0005,
      callbacks: config?.callbacks || []
    };

    return await this.trainModel(model, data, trainingConfig);
  }

  /**
   * 训练新闻情感模型
   */
  async trainNewsSentimentModel(
    data: Dataset,
    config?: Partial<TrainingConfig>
  ): Promise<TrainingResult> {
    console.log('[TensorFlow] 开始训练新闻情感模型...');

    const model = await tensorflowModelService.createNewsSentimentModel(data.inputs[0].length);
    const trainingConfig: TrainingConfig = {
      modelName: 'news_sentiment',
      epochs: config?.epochs || 100,
      batchSize: config?.batchSize || 32,
      validationSplit: config?.validationSplit || 0.2,
      shuffle: config?.shuffle !== false,
      earlyStoppingPatience: config?.earlyStoppingPatience || 15,
      earlyStoppingMinDelta: config?.earlyStoppingMinDelta || 0.001,
      callbacks: config?.callbacks || []
    };

    return await this.trainModel(model, data, trainingConfig);
  }

  /**
   * 训练风险评估模型
   */
  async trainRiskAssessmentModel(
    data: Dataset,
    config?: Partial<TrainingConfig>
  ): Promise<TrainingResult> {
    console.log('[TensorFlow] 开始训练风险评估模型...');

    const model = await tensorflowModelService.createRiskAssessmentModel(data.inputs[0].length);
    const trainingConfig: TrainingConfig = {
      modelName: 'risk_assessment',
      epochs: config?.epochs || 100,
      batchSize: config?.batchSize || 32,
      validationSplit: config?.validationSplit || 0.2,
      shuffle: config?.shuffle !== false,
      earlyStoppingPatience: config?.earlyStoppingPatience || 15,
      earlyStoppingMinDelta: config?.earlyStoppingMinDelta || 0.001,
      callbacks: config?.callbacks || []
    };

    return await this.trainModel(model, data, trainingConfig);
  }

  /**
   * 训练模型
   */
  private async trainModel(
    model: tf.LayersModel,
    data: Dataset,
    config: TrainingConfig
  ): Promise<TrainingResult> {
    console.log(`[TensorFlow] 开始训练模型: ${config.modelName}`);
    console.log(`[TensorFlow] 训练数据: ${data.inputs.length} 条`);
    console.log(`[TensorFlow] 配置: ${config.epochs} 轮, batch size ${config.batchSize}`);

    const startTime = Date.now();

    // 准备数据
    const inputs = tf.tensor2d(data.inputs);
    const outputs = tf.tensor2d(data.outputs);

    // 准备验证数据
    let validationData: [tf.Tensor, tf.Tensor] | undefined;
    if (data.validationInputs && data.validationOutputs) {
      validationData = [
        tf.tensor2d(data.validationInputs),
        tf.tensor2d(data.validationOutputs)
      ];
    }

    // 准备回调
    const callbacks: tf.Callback[] = config.callbacks ? [...config.callbacks] : [];

    // 添加早停回调
    if (config.earlyStoppingPatience && config.earlyStoppingPatience > 0) {
      const earlyStopping = new EarlyStoppingCallback(
        config.earlyStoppingPatience,
        config.earlyStoppingMinDelta
      );
      callbacks.push(earlyStopping as any);
    }

    // 训练历史
    const history: any = {
      loss: [],
      accuracy: [],
      valLoss: [],
      valAccuracy: []
    };

    // 自定义回调用于记录历史
    const historyCallback: any = {
      onEpochEnd: async (epoch: number, logs: tf.Logs) => {
        if (logs.loss !== undefined) {
          history.loss.push(logs.loss);
        }
        if (logs.accuracy !== undefined) {
          history.accuracy.push(logs.accuracy);
        }
        if (logs.val_loss !== undefined) {
          history.valLoss.push(logs.val_loss);
        }
        if (logs.val_accuracy !== undefined) {
          history.valAccuracy.push(logs.val_accuracy);
        }

        // 每10轮打印一次进度
        if ((epoch + 1) % 10 === 0) {
          console.log(`[TensorFlow] Epoch ${epoch + 1}/${config.epochs} - loss: ${logs.loss?.toFixed(6)}`);
        }
      }
    };
    callbacks.push(historyCallback);

    try {
      // 开始训练
      const trainingResult = await model.fit(inputs, outputs, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: validationData ? 0 : config.validationSplit,
        validationData: validationData,
        shuffle: config.shuffle,
        callbacks: callbacks
      });

      const endTime = Date.now();
      const trainingTime = endTime - startTime;

      // 获取最终指标
      const finalLoss = history.loss[history.loss.length - 1] || 0;
      const finalAccuracy = history.accuracy[history.accuracy.length - 1] || 0;

      // 检查是否早停
      const earlyStopping = callbacks.find(cb => cb instanceof EarlyStoppingCallback) as EarlyStoppingCallback;
      const stoppedEarly = earlyStopping?.shouldStop() || false;
      const bestEpoch = (earlyStopping as any)?.bestEpoch || trainingResult.history.epochs.length - 1;

      console.log(`[TensorFlow] 训练完成: ${config.modelName}`);
      console.log(`[TensorFlow] 最终 Loss: ${finalLoss.toFixed(6)}`);
      console.log(`[TensorFlow] 最终 Accuracy: ${finalAccuracy.toFixed(4)}`);
      console.log(`[TensorFlow] 训练耗时: ${(trainingTime / 1000).toFixed(2)} 秒`);
      console.log(`[TensorFlow] 早停: ${stoppedEarly ? '是' : '否'}`);
      console.log(`[TensorFlow] 最佳轮次: ${bestEpoch + 1}`);

      // 清理tensor
      inputs.dispose();
      outputs.dispose();
      if (validationData) {
        validationData[0].dispose();
        validationData[1].dispose();
      }

      return {
        model: config.modelName,
        success: true,
        epochs: trainingResult.history.epochs.length,
        finalLoss,
        finalAccuracy,
        history,
        trainingTime,
        stoppedEarly,
        bestEpoch
      };
    } catch (error) {
      console.error(`[TensorFlow] 训练失败: ${config.modelName}`, error);

      // 清理tensor
      inputs.dispose();
      outputs.dispose();
      if (validationData) {
        validationData[0].dispose();
        validationData[1].dispose();
      }

      throw error;
    }
  }

  /**
   * 评估模型
   */
  async evaluateModel(
    modelName: string,
    inputs: number[][],
    outputs: number[][]
  ): Promise<{
    loss: number;
    accuracy?: number;
    mae?: number;
    mse?: number;
  }> {
    console.log(`[TensorFlow] 评估模型: ${modelName}`);

    const model = tensorflowModelService.getModel(modelName);

    if (!model) {
      throw new Error(`模型不存在: ${modelName}`);
    }

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    const evaluation = await model.evaluate(inputTensor, outputTensor) as unknown as number[];

    const result: any = {};

    if (Array.isArray(evaluation)) {
      const metrics = model.metricsNames || [];
      metrics.forEach((name, index) => {
        result[name] = evaluation[index];
      });
    } else {
      result.loss = evaluation;
    }

    // 清理tensor
    inputTensor.dispose();
    outputTensor.dispose();

    console.log(`[TensorFlow] 评估结果:`, result);

    return result;
  }

  /**
   * 预测
   */
  async predict(modelName: string, inputs: number[][]): Promise<number[][]> {
    const model = tensorflowModelService.getModel(modelName);

    if (!model) {
      throw new Error(`模型不存在: ${modelName}`);
    }

    const predictions = await tensorflowModelService.predictBatch(modelName, inputs);

    return predictions;
  }

  /**
   * 数据预处理 - 标准化
   */
  normalizeData(data: number[][]): number[][] {
    if (data.length === 0 || data[0].length === 0) {
      return data;
    }

    // 计算每个特征的均值和标准差
    const numFeatures = data[0].length;
    const means: number[] = new Array(numFeatures).fill(0);
    const stds: number[] = new Array(numFeatures).fill(0);

    // 计算均值
    for (let i = 0; i < numFeatures; i++) {
      const values = data.map(row => row[i]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      means[i] = mean;

      // 计算标准差
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      stds[i] = Math.sqrt(variance);
    }

    // 标准化
    return data.map(row =>
      row.map((val, i) => {
        const std = stds[i] || 1;
        return (val - means[i]) / std;
      })
    );
  }

  /**
   * 数据预处理 - 归一化（0-1）
   */
  minMaxNormalizeData(data: number[][]): number[][] {
    if (data.length === 0 || data[0].length === 0) {
      return data;
    }

    const numFeatures = data[0].length;
    const mins: number[] = new Array(numFeatures).fill(Infinity);
    const maxs: number[] = new Array(numFeatures).fill(-Infinity);

    // 找到最小值和最大值
    for (let i = 0; i < numFeatures; i++) {
      const values = data.map(row => row[i]);
      mins[i] = Math.min(...values);
      maxs[i] = Math.max(...values);
    }

    // 归一化
    return data.map(row =>
      row.map((val, i) => {
        const range = maxs[i] - mins[i] || 1;
        return (val - mins[i]) / range;
      })
    );
  }

  /**
   * 保存模型
   */
  async saveTrainedModel(modelName: string, path: string): Promise<void> {
    await tensorflowModelService.saveModel(modelName, path);
  }

  /**
   * 加载模型
   */
  async loadTrainedModel(modelName: string, path: string): Promise<void> {
    await tensorflowModelService.loadModel(modelName, path);
  }
}

// 导出单例
export const tensorflowTrainingService = TensorFlowTrainingService.getInstance();
