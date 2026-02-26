/**
 * API: 智能进化闭环
 *
 * 提供以下功能：
 * 1. 自我进化：提取特征、优化权重
 * 2. 知识反馈：记录预测、更新实际值、重训练
 * 3. 数据加密：加密、解密、脱敏
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  selfEvolutionService,
  AgentType
} from '@/lib/intelligent-evolution/self-evolution';
import {
  knowledgeFeedbackLoopService
} from '@/lib/intelligent-evolution/knowledge-feedback-loop';
import {
  dataEncryptionService,
  DataSensitivity,
  DataType
} from '@/lib/intelligent-evolution/data-encryption';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 验证请求方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { action } = req.body;

    switch (action) {
      // ==================== 自我进化 ====================
      case 'evolve':
        return await handleEvolve(req, res);

      case 'evolve_all':
        return await handleEvolveAll(req, res);

      case 'get_weight_report':
        return await handleGetWeightReport(req, res);

      // ==================== 知识反馈闭环 ====================
      case 'record_prediction':
        return await handleRecordPrediction(req, res);

      case 'update_actual_value':
        return await handleUpdateActualValue(req, res);

      case 'start_retraining':
        return await handleStartRetraining(req, res);

      case 'get_model_versions':
        return await handleGetModelVersions(req, res);

      case 'rollback_version':
        return await handleRollbackVersion(req, res);

      case 'get_training_logs':
        return await handleGetTrainingLogs(req, res);

      case 'get_prediction_stats':
        return await handleGetPredictionStats(req, res);

      // ==================== 数据加密 ====================
      case 'encrypt_data':
        return await handleEncryptData(req, res);

      case 'decrypt_data':
        return await handleDecryptData(req, res);

      case 'mask_data':
        return await handleMaskData(req, res);

      case 'determine_sensitivity':
        return await handleDetermineSensitivity(req, res);

      default:
        return res.status(400).json({ error: '未知操作' });
    }
  } catch (error) {
    console.error('[IntelligentEvolution API] 错误:', error);
    return res.status(500).json({
      error: '服务器内部错误',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// ==================== 自我进化处理函数 ====================

/**
 * 处理自我进化
 */
async function handleEvolve(req: NextApiRequest, res: NextApiResponse) {
  const { agentType, reitCode } = req.body;

  if (!agentType || !Object.values(AgentType).includes(agentType)) {
    return res.status(400).json({ error: '无效的Agent类型' });
  }

  const result = await selfEvolutionService.evolve(agentType, reitCode);

  return res.status(200).json({
    success: true,
    data: result
  });
}

/**
 * 处理批量进化所有Agent
 */
async function handleEvolveAll(req: NextApiRequest, res: NextApiResponse) {
  const results = await selfEvolutionService.evolveAllAgents();

  return res.status(200).json({
    success: true,
    data: results
  });
}

/**
 * 获取权重报告
 */
async function handleGetWeightReport(req: NextApiRequest, res: NextApiResponse) {
  const { agentType } = req.body;

  if (!agentType || !Object.values(AgentType).includes(agentType)) {
    return res.status(400).json({ error: '无效的Agent类型' });
  }

  const report = await selfEvolutionService.getWeightReport(agentType);

  return res.status(200).json({
    success: true,
    data: report
  });
}

// ==================== 知识反馈闭环处理函数 ====================

/**
 * 记录预测
 */
async function handleRecordPrediction(req: NextApiRequest, res: NextApiResponse) {
  const {
    agentType,
    agentId,
    predictionType,
    targetReitCode,
    targetDate,
    predictedValue,
    predictedRange,
    confidence,
    modelVersion,
    inputFeatures,
    userHash,
    sessionId
  } = req.body;

  if (!agentType || !Object.values(AgentType).includes(agentType)) {
    return res.status(400).json({ error: '无效的Agent类型' });
  }

  if (!targetReitCode || !predictedValue || !modelVersion) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const predictionId = await knowledgeFeedbackLoopService.recordPrediction({
    agentType,
    agentId: agentId || `${agentType}_default`,
    predictionType: predictionType || 'default',
    targetReitCode,
    targetDate: targetDate ? new Date(targetDate) : new Date(),
    predictedValue,
    predictedRange,
    confidence: confidence || 0.5,
    modelVersion,
    inputFeatures: inputFeatures || {},
    userHash,
    sessionId
  });

  return res.status(200).json({
    success: true,
    data: { predictionId }
  });
}

/**
 * 更新实际值
 */
async function handleUpdateActualValue(req: NextApiRequest, res: NextApiResponse) {
  const { predictionId, actualValue, actualRange } = req.body;

  if (!predictionId || actualValue === undefined) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  await knowledgeFeedbackLoopService.updateActualValue({
    predictionId,
    actualValue,
    actualRange
  });

  return res.status(200).json({
    success: true,
    message: '实际值更新成功'
  });
}

/**
 * 开始重训练
 */
async function handleStartRetraining(req: NextApiRequest, res: NextApiResponse) {
  const { agentType, baseModelVersion } = req.body;

  if (!agentType || !Object.values(AgentType).includes(agentType)) {
    return res.status(400).json({ error: '无效的Agent类型' });
  }

  const trainingLogId = await knowledgeFeedbackLoopService.startRetraining(
    agentType,
    baseModelVersion
  );

  return res.status(200).json({
    success: true,
    data: { trainingLogId }
  });
}

/**
 * 获取模型版本历史
 */
async function handleGetModelVersions(req: NextApiRequest, res: NextApiResponse) {
  const { agentType } = req.body;

  if (!agentType || !Object.values(AgentType).includes(agentType)) {
    return res.status(400).json({ error: '无效的Agent类型' });
  }

  const versions = await knowledgeFeedbackLoopService.getModelVersionHistory(agentType);

  return res.status(200).json({
    success: true,
    data: versions
  });
}

/**
 * 回滚到指定版本
 */
async function handleRollbackVersion(req: NextApiRequest, res: NextApiResponse) {
  const { agentType, targetVersion } = req.body;

  if (!agentType || !Object.values(AgentType).includes(agentType)) {
    return res.status(400).json({ error: '无效的Agent类型' });
  }

  if (!targetVersion) {
    return res.status(400).json({ error: '缺少目标版本' });
  }

  await knowledgeFeedbackLoopService.rollbackToVersion(agentType, targetVersion);

  return res.status(200).json({
    success: true,
    message: '版本回滚成功'
  });
}

/**
 * 获取训练日志
 */
async function handleGetTrainingLogs(req: NextApiRequest, res: NextApiResponse) {
  const { agentType, limit } = req.body;

  const logs = await knowledgeFeedbackLoopService.getTrainingLogs(
    agentType as AgentType,
    limit || 20
  );

  return res.status(200).json({
    success: true,
    data: logs
  });
}

/**
 * 获取预测统计
 */
async function handleGetPredictionStats(req: NextApiRequest, res: NextApiResponse) {
  const { agentType, days } = req.body;

  if (!agentType || !Object.values(AgentType).includes(agentType)) {
    return res.status(400).json({ error: '无效的Agent类型' });
  }

  const stats = await knowledgeFeedbackLoopService.getPredictionStatistics(
    agentType,
    days || 30
  );

  return res.status(200).json({
    success: true,
    data: stats
  });
}

// ==================== 数据加密处理函数 ====================

/**
 * 加密数据
 */
async function handleEncryptData(req: NextApiRequest, res: NextApiResponse) {
  const { data, dataType, context } = req.body;

  if (!data || !dataType || !Object.values(DataType).includes(dataType)) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const result = await dataEncryptionService.storeData(data, dataType, context);

  return res.status(200).json({
    success: true,
    data: result
  });
}

/**
 * 解密数据
 */
async function handleDecryptData(req: NextApiRequest, res: NextApiResponse) {
  const { encryptedData, dataType, sensitivity, showOriginal } = req.body;

  if (!encryptedData || !dataType || !sensitivity) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const decrypted = await dataEncryptionService.readData(
    encryptedData,
    dataType,
    sensitivity,
    showOriginal || false
  );

  return res.status(200).json({
    success: true,
    data: { decryptedData: decrypted }
  });
}

/**
 * 脱敏数据
 */
async function handleMaskData(req: NextApiRequest, res: NextApiResponse) {
  const { data, dataType, sensitivity } = req.body;

  if (!data || !dataType || !sensitivity) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const masked = dataEncryptionService.mask(data, dataType, sensitivity);

  return res.status(200).json({
    success: true,
    data: masked
  });
}

/**
 * 判断数据敏感度
 */
async function handleDetermineSensitivity(req: NextApiRequest, res: NextApiResponse) {
  const { dataType, context } = req.body;

  if (!dataType || !Object.values(DataType).includes(dataType)) {
    return res.status(400).json({ error: '无效的数据类型' });
  }

  const sensitivity = dataEncryptionService.determineSensitivity(dataType, context);

  return res.status(200).json({
    success: true,
    data: { sensitivity }
  });
}
