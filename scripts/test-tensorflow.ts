/**
 * TensorFlow.js 集成测试示例
 *
 * 运行方式：
 * ts-node scripts/test-tensorflow.ts
 * 或
 * npx tsx scripts/test-tensorflow.ts
 */

import { tensorflowModelService } from '../lib/tensorflow/model-service';
import { tensorflowTrainingService } from '../lib/tensorflow/training-service';

/**
 * 生成模拟数据
 */
function generateMockData(samples: number = 1000, inputSize: number = 10): {
  inputs: number[][];
  outputs: number[][];
} {
  const inputs: number[][] = [];
  const outputs: number[][] = [];

  for (let i = 0; i < samples; i++) {
    const input: number[] = [];
    for (let j = 0; j < inputSize; j++) {
      input.push(Math.random());
    }

    // 简单的线性关系 + 噪声
    const output = input.reduce((sum, val, idx) => sum + val * (idx + 1), 0) / inputSize + (Math.random() - 0.5) * 0.1;

    inputs.push(input);
    outputs.push([output]);
  }

  return { inputs, outputs };
}

/**
 * 测试1: 创建估值模型
 */
async function test1CreateValuationModel() {
  console.log('\n========== 测试1: 创建估值模型 ==========');

  try {
    const model = await tensorflowModelService.createValuationModel(10);
    console.log('✅ 估值模型创建成功');

    const summary = tensorflowModelService.getModelSummary('valuation');
    console.log('\n模型摘要:');
    console.log(summary);

    return true;
  } catch (error) {
    console.error('❌ 估值模型创建失败:', error);
    return false;
  }
}

/**
 * 测试2: 训练估值模型
 */
async function test2TrainValuationModel() {
  console.log('\n========== 测试2: 训练估值模型 ==========');

  try {
    // 生成模拟数据
    const { inputs, outputs } = generateMockData(1000, 10);

    // 训练模型
    const result = await tensorflowTrainingService.trainValuationModel({
      inputs,
      outputs
    }, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      earlyStoppingPatience: 10
    });

    console.log('\n✅ 训练完成');
    console.log(`最终 Loss: ${result.finalLoss.toFixed(6)}`);
    console.log(`最终 Accuracy: ${result.finalAccuracy.toFixed(4)}`);
    console.log(`训练耗时: ${(result.trainingTime / 1000).toFixed(2)} 秒`);
    console.log(`早停: ${result.stoppedEarly ? '是' : '否'}`);

    return true;
  } catch (error) {
    console.error('❌ 训练失败:', error);
    return false;
  }
}

/**
 * 测试3: 预测
 */
async function test3Predict() {
  console.log('\n========== 测试3: 预测 ==========');

  try {
    // 生成测试数据
    const testInputs: number[][] = [
      [0.5, 0.6, 0.7, 0.8, 0.9, 0.4, 0.3, 0.2, 0.1, 0.5],
      [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    ];

    const predictions = await tensorflowTrainingService.predict('valuation', testInputs);

    console.log('\n✅ 预测成功');
    console.log('输入:', testInputs);
    console.log('预测输出:', predictions);

    return true;
  } catch (error) {
    console.error('❌ 预测失败:', error);
    return false;
  }
}

/**
 * 测试4: 评估模型
 */
async function test4EvaluateModel() {
  console.log('\n========== 测试4: 评估模型 ==========');

  try {
    // 生成测试数据
    const { inputs, outputs } = generateMockData(200, 10);

    const evaluation = await tensorflowTrainingService.evaluateModel('valuation', inputs, outputs);

    console.log('\n✅ 评估成功');
    console.log('评估结果:', evaluation);

    return true;
  } catch (error) {
    console.error('❌ 评估失败:', error);
    return false;
  }
}

/**
 * 测试5: 保存和加载模型
 */
async function test5SaveAndLoadModel() {
  console.log('\n========== 测试5: 保存和加载模型 ==========');

  try {
    const modelPath = '/tmp/tf-models/valuation';

    // 保存模型
    console.log('保存模型...');
    await tensorflowTrainingService.saveTrainedModel('valuation', modelPath);
    console.log('✅ 模型保存成功');

    // 删除模型
    console.log('删除当前模型...');
    tensorflowModelService.deleteModel('valuation');
    console.log('✅ 模型删除成功');

    // 加载模型
    console.log('加载模型...');
    await tensorflowTrainingService.loadTrainedModel('valuation', modelPath);
    console.log('✅ 模型加载成功');

    // 验证加载的模型
    const testInputs = [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]];
    const predictions = await tensorflowTrainingService.predict('valuation', testInputs);
    console.log('预测结果:', predictions);

    return true;
  } catch (error) {
    console.error('❌ 保存/加载失败:', error);
    return false;
  }
}

/**
 * 测试6: 数据预处理
 */
async function test6DataPreprocessing() {
  console.log('\n========== 测试6: 数据预处理 ==========');

  try {
    const rawData: number[][] = [
      [1, 2, 3, 4, 5],
      [10, 20, 30, 40, 50],
      [100, 200, 300, 400, 500]
    ];

    console.log('原始数据:', rawData);

    // 标准化
    const normalized = tensorflowTrainingService.normalizeData(rawData);
    console.log('标准化数据:', normalized);

    // 归一化
    const minMaxNormalized = tensorflowTrainingService.minMaxNormalizeData(rawData);
    console.log('归一化数据 (0-1):', minMaxNormalized);

    console.log('✅ 数据预处理成功');

    return true;
  } catch (error) {
    console.error('❌ 数据预处理失败:', error);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('==========================================');
  console.log('  TensorFlow.js 集成测试');
  console.log('==========================================');

  const results: { [key: string]: boolean } = {};

  // 运行所有测试
  results['test1'] = await test1CreateValuationModel();
  results['test2'] = await test2TrainValuationModel();
  results['test3'] = await test3Predict();
  results['test4'] = await test4EvaluateModel();
  results['test5'] = await test5SaveAndLoadModel();
  results['test6'] = await test6DataPreprocessing();

  // 清理所有模型
  console.log('\n========== 清理 ==========');
  tensorflowModelService.disposeAllModels();
  console.log('✅ 所有模型已清理');

  // 输出测试结果
  console.log('\n==========================================');
  console.log('  测试结果汇总');
  console.log('==========================================');

  let passed = 0;
  let failed = 0;

  for (const [test, success] of Object.entries(results)) {
    const status = success ? '✅ 通过' : '❌ 失败';
    console.log(`${test}: ${status}`);

    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n==========================================');
  console.log(`总计: ${passed} 通过, ${failed} 失败`);
  console.log('==========================================');

  process.exit(failed > 0 ? 1 : 0);
}

// 运行测试
main().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
