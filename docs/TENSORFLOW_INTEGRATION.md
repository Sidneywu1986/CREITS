# TensorFlow.js 集成文档

## 概述

TensorFlow.js 是一个用于在浏览器和 Node.js 中进行机器学习的库。本项目集成了 TensorFlow.js，实现了以下功能：

1. **模型定义**: 支持估值、政策影响、新闻情感、风险评估四种模型类型
2. **模型训练**: 实现完整的训练流程，包括数据预处理、模型训练、模型评估
3. **早停机制**: 防止过拟合
4. **模型保存和加载**: 支持模型持久化

## 安装依赖

```bash
pnpm add @tensorflow/tfjs @tensorflow/tfjs-node
```

## 核心模块

### 1. ModelService (`lib/tensorflow/model-service.ts`)

模型定义和管理服务。

#### 支持的模型类型

- **估值模型 (Valuation)**: REITs 资产价值预测
- **政策影响模型 (Policy Impact)**: 政策对 REITs 的影响评估
- **新闻情感模型 (News Sentiment)**: 新闻情感分析
- **风险评估模型 (Risk Assessment)**: 风险等级评估

#### 支持的架构

- Dense (全连接层)
- LSTM (长短期记忆网络)
- GRU (门控循环单元)
- CNN (卷积神经网络)
- Transformer (自注意力机制)

#### 主要方法

```typescript
// 创建估值模型
const model = await tensorflowModelService.createValuationModel(inputSize);

// 创建政策影响模型（LSTM）
const model = await tensorflowModelService.createPolicyImpactModel(inputSize, 'lstm');

// 预测
const prediction = await tensorflowModelService.predict('valuation', input);

// 批量预测
const predictions = await tensorflowModelService.predictBatch('valuation', inputs);

// 保存模型
await tensorflowModelService.saveModel('valuation', '/path/to/model');

// 加载模型
await tensorflowModelService.loadModel('valuation', '/path/to/model');

// 获取模型摘要
const summary = tensorflowModelService.getModelSummary('valuation');

// 删除模型
tensorflowModelService.deleteModel('valuation');

// 清理所有模型
tensorflowModelService.disposeAllModels();
```

### 2. TrainingService (`lib/tensorflow/training-service.ts`)

训练流程服务。

#### 训练配置

```typescript
interface TrainingConfig {
  modelName: string;
  epochs: number;
  batchSize: number;
  validationSplit: number;
  shuffle: boolean;
  earlyStoppingPatience?: number;
  earlyStoppingMinDelta?: number;
  callbacks?: tf.Callback[];
}
```

#### 主要方法

```typescript
// 训练估值模型
const result = await tensorflowTrainingService.trainValuationModel(
  { inputs, outputs },
  { epochs: 100, batchSize: 32, validationSplit: 0.2 }
);

// 训练政策影响模型
const result = await tensorflowTrainingService.trainPolicyImpactModel(data, config);

// 训练新闻情感模型
const result = await tensorflowTrainingService.trainNewsSentimentModel(data, config);

// 训练风险评估模型
const result = await tensorflowTrainingService.trainRiskAssessmentModel(data, config);

// 评估模型
const evaluation = await tensorflowTrainingService.evaluateModel('valuation', testInputs, testOutputs);

// 预测
const predictions = await tensorflowTrainingService.predict('valuation', inputs);

// 数据预处理 - 标准化
const normalized = tensorflowTrainingService.normalizeData(data);

// 数据预处理 - 归一化
const minMaxNormalized = tensorflowTrainingService.minMaxNormalizeData(data);

// 保存模型
await tensorflowTrainingService.saveTrainedModel('valuation', '/path/to/model');

// 加载模型
await tensorflowTrainingService.loadTrainedModel('valuation', '/path/to/model');
```

## 使用示例

### 示例1: 训练估值模型

```typescript
import { tensorflowTrainingService } from '@/lib/tensorflow/training-service';

// 准备数据
const inputs = [
  [0.8, 0.7, 0.9, 0.6, 0.8, 0.5, 0.7, 0.6, 0.8, 0.7],
  [0.9, 0.8, 0.7, 0.9, 0.6, 0.7, 0.8, 0.5, 0.9, 0.8]
];

const outputs = [
  [0.75],
  [0.82]
];

// 训练模型
const result = await tensorflowTrainingService.trainValuationModel(
  { inputs, outputs },
  {
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    earlyStoppingPatience: 15,
    earlyStoppingMinDelta: 0.001
  }
);

console.log('训练完成:', result);
console.log('最终 Loss:', result.finalLoss);
console.log('最终 Accuracy:', result.finalAccuracy);
```

### 示例2: 预测

```typescript
import { tensorflowTrainingService } from '@/lib/tensorflow/training-service';

// 训练模型（如果还未训练）
await tensorflowTrainingService.trainValuationModel(data, config);

// 进行预测
const testInputs = [[0.5, 0.6, 0.7, 0.8, 0.9, 0.4, 0.3, 0.2, 0.1, 0.5]];
const predictions = await tensorflowTrainingService.predict('valuation', testInputs);

console.log('预测结果:', predictions);
```

### 示例3: 评估模型

```typescript
import { tensorflowTrainingService } from '@/lib/tensorflow/training-service';

// 准备测试数据
const testInputs = [[...], [...]];
const testOutputs = [[...], [...]];

// 评估模型
const evaluation = await tensorflowTrainingService.evaluateModel(
  'valuation',
  testInputs,
  testOutputs
);

console.log('评估结果:', evaluation);
console.log('Loss:', evaluation.loss);
console.log('Accuracy:', evaluation.accuracy);
```

### 示例4: 数据预处理

```typescript
import { tensorflowTrainingService } from '@/lib/tensorflow/training-service';

// 原始数据
const rawData = [
  [1, 2, 3, 4, 5],
  [10, 20, 30, 40, 50],
  [100, 200, 300, 400, 500]
];

// 标准化
const normalized = tensorflowTrainingService.normalizeData(rawData);
console.log('标准化数据:', normalized);

// 归一化 (0-1)
const minMaxNormalized = tensorflowTrainingService.minMaxNormalizeData(rawData);
console.log('归一化数据 (0-1):', minMaxNormalized);
```

## 测试

运行测试脚本：

```bash
# 使用 ts-node
pnpm add -D ts-node
npx ts-node scripts/test-tensorflow.ts

# 或使用 tsx
pnpm add -D tsx
npx tsx scripts/test-tensorflow.ts
```

测试脚本会执行以下操作：

1. 创建估值模型
2. 训练模型
3. 进行预测
4. 评估模型
5. 保存和加载模型
6. 数据预处理

## 集成到智能进化闭环

### 后端 API (Next.js API Route)

```typescript
// app/api/model/train/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { tensorflowTrainingService } from '@/lib/tensorflow/training-service';

export async function POST(request: NextRequest) {
  try {
    const { modelType, data, config } = await request.json();

    let result;

    switch (modelType) {
      case 'valuation':
        result = await tensorflowTrainingService.trainValuationModel(data, config);
        break;
      case 'policy_impact':
        result = await tensorflowTrainingService.trainPolicyImpactModel(data, config);
        break;
      case 'news_sentiment':
        result = await tensorflowTrainingService.trainNewsSentimentModel(data, config);
        break;
      case 'risk_assessment':
        result = await tensorflowTrainingService.trainRiskAssessmentModel(data, config);
        break;
      default:
        throw new Error(`不支持的模型类型: ${modelType}`);
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 前端调用

```typescript
// 训练模型
const response = await fetch('/api/model/train', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    modelType: 'valuation',
    data: { inputs, outputs },
    config: { epochs: 100, batchSize: 32 }
  })
});

const { success, result } = await response.json();
```

## 数据采集与模型训练

### 数据采集流程

1. **政策数据采集**:
   - 使用 Coze Web Search 搜索最新的 REITs 政策
   - 使用 Coze LLM 解析政策内容并提取影响

2. **新闻数据采集**:
   - 使用 Coze Web Search 搜索 REITs 相关新闻
   - 使用 Coze LLM 进行情感分析

3. **REITs 数据采集**:
   - 采集深交所、上交所的 REITs 数据
   - 提取价格、成交量、资产价值等指标

### 模型训练流程

```typescript
// 1. 数据采集
const policies = await webSearchService.searchPolicies();
const news = await webSearchService.searchNews();

// 2. 数据解析
const policyImpacts = await llmService.analyzePolicyImpacts(policies);
const newsSentiments = await llmService.analyzeNewsSentiments(news);

// 3. 数据准备
const inputs = prepareInputs(policyImpacts, newsSentiments, reitsData);
const outputs = prepareOutputs(reitsData);

// 4. 数据预处理
const normalizedInputs = tensorflowTrainingService.normalizeData(inputs);
const normalizedOutputs = tensorflowTrainingService.normalizeData(outputs);

// 5. 训练模型
const result = await tensorflowTrainingService.trainValuationModel(
  { inputs: normalizedInputs, outputs: normalizedOutputs },
  { epochs: 100, batchSize: 32, earlyStoppingPatience: 15 }
);

// 6. 保存模型
await tensorflowTrainingService.saveTrainedModel('valuation', '/models/valuation');
```

## 性能优化

### 1. 批量预测

使用批量预测提高效率：

```typescript
const predictions = await tensorflowModelService.predictBatch('valuation', inputs);
```

### 2. 模型持久化

训练后立即保存模型，避免重复训练：

```typescript
await tensorflowTrainingService.saveTrainedModel('valuation', '/models/valuation');
```

### 3. 内存管理

及时清理不需要的模型和 tensor：

```typescript
// 清理特定模型
tensorflowModelService.deleteModel('valuation');

// 清理所有模型
tensorflowModelService.disposeAllModels();
```

### 4. 早停机制

使用早停机制防止过拟合：

```typescript
{
  epochs: 200,
  earlyStoppingPatience: 20,
  earlyStoppingMinDelta: 0.0005
}
```

## 注意事项

1. **数据质量**: 确保 training data 和 validation data 没有重叠
2. **特征选择**: 选择与目标变量相关的特征
3. **超参数调优**: 根据数据特点调整 epochs、batchSize 等参数
4. **过拟合**: 使用 validation split 监控验证集性能
5. **内存管理**: 及时清理不需要的模型和 tensor

## 故障排查

### 问题: 模型训练失败

**可能原因**:
- 数据格式不正确
- 输入/输出维度不匹配
- 模型架构定义错误

**解决方案**:
1. 检查数据格式
2. 验证输入/输出维度
3. 查看错误日志

### 问题: 预测结果不准确

**可能原因**:
- 训练数据不足
- 特征选择不当
- 模型架构不合适
- 过拟合

**解决方案**:
1. 增加训练数据
2. 调整特征
3. 尝试不同的模型架构
4. 使用早停机制

### 问题: 内存溢出

**可能原因**:
- batch size 太大
- 数据集太大
- 未及时清理 tensor

**解决方案**:
1. 减小 batch size
2. 分批训练
3. 及时清理 tensor

## 参考资料

- [TensorFlow.js 官方文档](https://www.tensorflow.org/js)
- [TensorFlow.js 教程](https://www.tensorflow.org/js/tutorials)
- [深度学习基础知识](https://www.tensorflow.org/resources/learn-ml/basics-of-deep-learning)
