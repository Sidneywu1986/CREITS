/**
 * TensorFlowModelService - TensorFlow.js 模型定义服务
 *
 * 功能：
 * 1. 定义神经网络模型架构
 * 2. 模型序列化和反序列化
 * 3. 模型评估和预测
 */

import * as tf from '@tensorflow/tfjs';

/**
 * 模型类型
 */
export enum ModelType {
  VALUATION = 'valuation',           // 估值模型
  POLICY_IMPACT = 'policy_impact',   // 政策影响模型
  NEWS_SENTIMENT = 'news_sentiment', // 新闻情感模型
  RISK_ASSESSMENT = 'risk_assessment' // 风险评估模型
}

/**
 * 模型架构类型
 */
export enum ModelArchitecture {
  DENSE = 'dense',           // 全连接网络
  LSTM = 'lstm',             // LSTM网络
  GRU = 'gru',               // GRU网络
  CNN = 'cnn',               // 卷积网络
  TRANSFORMER = 'transformer' // Transformer
}

/**
 * 模型配置
 */
export interface ModelConfig {
  type: ModelType;
  architecture: ModelArchitecture;
  inputShape: number[];
  outputShape: number[];
  layers?: LayerConfig[];
  optimizer: OptimizerConfig;
  loss: string;
  metrics: string[];
}

/**
 * 层配置
 */
export interface LayerConfig {
  type: 'dense' | 'lstm' | 'gru' | 'conv2d' | 'maxPooling2d' | 'dropout' | 'batchNormalization';
  units?: number;
  activation?: string;
  filters?: number;
  kernelSize?: number[];
  poolSize?: number[];
  rate?: number;
}

/**
 * 优化器配置
 */
export interface OptimizerConfig {
  type: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
  learningRate?: number;
  beta1?: number;
  beta2?: number;
  momentum?: number;
  decay?: number;
}

/**
 * 训练历史
 */
export interface TrainingHistory {
  loss: number[];
  accuracy: number[];
  valLoss: number[];
  valAccuracy: number[];
}

/**
 * 模型评估结果
 */
export interface ModelEvaluation {
  loss: number;
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mse?: number;
  mae?: number;
}

/**
 * TensorFlowModelService类
 */
export class TensorFlowModelService {
  private static instance: TensorFlowModelService;
  private models: Map<string, tf.LayersModel>;
  private modelConfigs: Map<string, ModelConfig>;

  private constructor() {
    this.models = new Map();
    this.modelConfigs = new Map();
  }

  static getInstance(): TensorFlowModelService {
    if (!TensorFlowModelService.instance) {
      TensorFlowModelService.instance = new TensorFlowModelService();
    }
    return TensorFlowModelService.instance;
  }

  /**
   * 创建估值模型
   */
  async createValuationModel(inputSize: number = 10): Promise<tf.LayersModel> {
    console.log(`[TensorFlow] 创建估值模型，输入大小: ${inputSize}`);

    const config: ModelConfig = {
      type: ModelType.VALUATION,
      architecture: ModelArchitecture.DENSE,
      inputShape: [inputSize],
      outputShape: [1],
      layers: [
        { type: 'dense', units: 64, activation: 'relu' },
        { type: 'dropout', rate: 0.3 },
        { type: 'batchNormalization' },
        { type: 'dense', units: 32, activation: 'relu' },
        { type: 'dropout', rate: 0.2 },
        { type: 'dense', units: 16, activation: 'relu' },
        { type: 'dense', units: 1, activation: 'linear' }
      ],
      optimizer: {
        type: 'adam',
        learningRate: 0.001
      },
      loss: 'mse',
      metrics: ['mae']
    };

    return await this.createModel('valuation', config);
  }

  /**
   * 创建政策影响模型
   */
  async createPolicyImpactModel(inputSize: number = 20): Promise<tf.LayersModel> {
    console.log(`[TensorFlow] 创建政策影响模型，输入大小: ${inputSize}`);

    const config: ModelConfig = {
      type: ModelType.POLICY_IMPACT,
      architecture: ModelArchitecture.DENSE,
      inputShape: [inputSize],
      outputShape: [1],
      layers: [
        { type: 'dense', units: 128, activation: 'relu' },
        { type: 'batchNormalization' },
        { type: 'dense', units: 64, activation: 'relu' },
        { type: 'dropout', rate: 0.4 },
        { type: 'dense', units: 32, activation: 'relu' },
        { type: 'dense', units: 1, activation: 'sigmoid' }
      ],
      optimizer: {
        type: 'adam',
        learningRate: 0.0005
      },
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    };

    return await this.createModel('policy_impact', config);
  }

  /**
   * 创建新闻情感模型
   */
  async createNewsSentimentModel(inputSize: number = 50): Promise<tf.LayersModel> {
    console.log(`[TensorFlow] 创建新闻情感模型，输入大小: ${inputSize}`);

    const config: ModelConfig = {
      type: ModelType.NEWS_SENTIMENT,
      architecture: ModelArchitecture.GRU,
      inputShape: [inputSize, 1],
      outputShape: [3],
      layers: [
        { type: 'gru', units: 64, activation: 'tanh', returnSequences: true },
        { type: 'dropout', rate: 0.3 },
        { type: 'gru', units: 32, activation: 'tanh' },
        { type: 'dense', units: 16, activation: 'relu' },
        { type: 'dense', units: 3, activation: 'softmax' }
      ],
      optimizer: {
        type: 'adam',
        learningRate: 0.001
      },
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    };

    return await this.createModel('news_sentiment', config);
  }

  /**
   * 创建风险评估模型
   */
  async createRiskAssessmentModel(inputSize: number = 15): Promise<tf.LayersModel> {
    console.log(`[TensorFlow] 创建风险评估模型，输入大小: ${inputSize}`);

    const config: ModelConfig = {
      type: ModelType.RISK_ASSESSMENT,
      architecture: ModelArchitecture.DENSE,
      inputShape: [inputSize],
      outputShape: [1],
      layers: [
        { type: 'dense', units: 64, activation: 'relu' },
        { type: 'batchNormalization' },
        { type: 'dense', units: 32, activation: 'relu' },
        { type: 'dropout', rate: 0.3 },
        { type: 'dense', units: 16, activation: 'relu' },
        { type: 'dense', units: 1, activation: 'sigmoid' }
      ],
      optimizer: {
        type: 'adam',
        learningRate: 0.001
      },
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    };

    return await this.createModel('risk_assessment', config);
  }

  /**
   * 创建模型
   */
  private async createModel(name: string, config: ModelConfig): Promise<tf.LayersModel> {
    console.log(`[TensorFlow] 创建模型: ${name}`);

    const model = tf.sequential({ name });

    // 添加输入层
    model.add(tf.layers.inputLayer({ inputShape: config.inputShape }));

    // 添加隐藏层
    if (config.layers) {
      for (const layerConfig of config.layers) {
        const layer = this.createLayer(layerConfig);
        if (layer) {
          model.add(layer);
        }
      }
    }

    // 编译模型
    const optimizer = this.createOptimizer(config.optimizer);
    model.compile({
      optimizer,
      loss: config.loss,
      metrics: config.metrics
    });

    // 保存模型和配置
    this.models.set(name, model);
    this.modelConfigs.set(name, config);

    console.log(`[TensorFlow] 模型创建成功: ${name}`);

    return model;
  }

  /**
   * 创建层
   */
  private createLayer(config: LayerConfig): tf.layers.Layer | null {
    switch (config.type) {
      case 'dense':
        return tf.layers.dense({
          units: config.units || 32,
          activation: config.activation || 'relu'
        });

      case 'lstm':
        return tf.layers.lstm({
          units: config.units || 64,
          activation: config.activation || 'tanh',
          returnSequences: false
        });

      case 'gru':
        return tf.layers.gru({
          units: config.units || 64,
          activation: config.activation || 'tanh',
          returnSequences: false
        });

      case 'conv2d':
        return tf.layers.conv2d({
          filters: config.filters || 32,
          kernelSize: config.kernelSize || [3, 3],
          activation: config.activation || 'relu'
        });

      case 'maxPooling2d':
        return tf.layers.maxPooling2d({
          poolSize: config.poolSize || [2, 2]
        });

      case 'dropout':
        return tf.layers.dropout({
          rate: config.rate || 0.5
        });

      case 'batchNormalization':
        return tf.layers.batchNormalization();

      default:
        console.error(`[TensorFlow] 未知的层类型: ${config.type}`);
        return null;
    }
  }

  /**
   * 创建优化器
   */
  private createOptimizer(config: OptimizerConfig): tf.Optimizer {
    switch (config.type) {
      case 'adam':
        return tf.train.adam(
          config.learningRate || 0.001,
          config.beta1 || 0.9,
          config.beta2 || 0.999
        );

      case 'sgd':
        return tf.train.sgd(config.learningRate || 0.01, config.momentum || 0.9);

      case 'rmsprop':
        return tf.train.rmsprop(config.learningRate || 0.001);

      case 'adagrad':
        return tf.train.adagrad(config.learningRate || 0.01);

      default:
        return tf.train.adam(config.learningRate || 0.001);
    }
  }

  /**
   * 获取模型
   */
  getModel(name: string): tf.LayersModel | undefined {
    return this.models.get(name);
  }

  /**
   * 获取模型配置
   */
  getModelConfig(name: string): ModelConfig | undefined {
    return this.modelConfigs.get(name);
  }

  /**
   * 保存模型
   */
  async saveModel(name: string, path: string): Promise<void> {
    const model = this.models.get(name);

    if (!model) {
      throw new Error(`模型不存在: ${name}`);
    }

    console.log(`[TensorFlow] 保存模型: ${name} -> ${path}`);
    await model.save(`file://${path}`);
  }

  /**
   * 加载模型
   */
  async loadModel(name: string, path: string): Promise<tf.LayersModel> {
    console.log(`[TensorFlow] 加载模型: ${name} <- ${path}`);

    const model = await tf.loadLayersModel(`file://${path}`);
    this.models.set(name, model);

    return model;
  }

  /**
   * 删除模型
   */
  deleteModel(name: string): void {
    const model = this.models.get(name);

    if (model) {
      model.dispose();
      this.models.delete(name);
      this.modelConfigs.delete(name);
      console.log(`[TensorFlow] 模型已删除: ${name}`);
    }
  }

  /**
   * 预测
   */
  async predict(name: string, input: tf.Tensor | number[][]): Promise<tf.Tensor> {
    const model = this.models.get(name);

    if (!model) {
      throw new Error(`模型不存在: ${name}`);
    }

    // 如果输入是数组，转换为tensor
    if (!tf.isTensor(input)) {
      input = tf.tensor2d(input);
    }

    return await model.predict(input) as tf.Tensor;
  }

  /**
   * 批量预测
   */
  async predictBatch(name: string, inputs: number[][]): Promise<number[][]> {
    const model = this.models.get(name);

    if (!model) {
      throw new Error(`模型不存在: ${name}`);
    }

    const tensor = tf.tensor2d(inputs);
    const predictions = await model.predict(tensor) as tf.Tensor;

    const result = await predictions.array() as number[][];
    tensor.dispose();
    predictions.dispose();

    return result;
  }

  /**
   * 获取模型摘要
   */
  getModelSummary(name: string): string {
    const model = this.models.get(name);

    if (!model) {
      throw new Error(`模型不存在: ${name}`);
    }

    // 创建一个字符串缓冲区来捕获模型摘要
    let summary = '';
    const originalLog = console.log;

    console.log = (message: string) => {
      summary += message + '\n';
    };

    model.summary();

    console.log = originalLog;

    return summary;
  }

  /**
   * 获取所有模型名称
   */
  getModelNames(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * 清理所有模型
   */
  disposeAllModels(): void {
    console.log('[TensorFlow] 清理所有模型');

    for (const [name, model] of this.models) {
      model.dispose();
    }

    this.models.clear();
    this.modelConfigs.clear();
  }
}

// 导出单例
export const tensorflowModelService = TensorFlowModelService.getInstance();
