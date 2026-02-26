/**
 * 数据采集管道API
 *
 * 端点：POST /api/v1/data-collection/pipeline
 *
 * 功能：
 * 1. 启动外部数据采集
 * 2. 构建知识图谱
 * 3. 生成数据质量报告
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { externalDataCollector, DataType, CollectionType } from '@/lib/data-collection/external-collector';
import { knowledgeGraph } from '@/lib/knowledge-graph/graph-builder';
import { dataNormalizer } from '@/lib/data-collection/data-normalizer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 仅允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, dataType, collectionType } = req.body;

    // 验证API密钥
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // 这里应该验证API密钥是否有效
    // 简化示例，实际应用中需要查询数据库验证

    switch (action) {
      case 'collect':
        // 启动数据采集
        return await handleCollection(dataType, collectionType, res);

      case 'build-graph':
        // 构建知识图谱
        return await handleGraphBuild(res);

      case 'normalize':
        // 数据规范化
        return await handleNormalization(dataType, res);

      case 'report':
        // 生成数据质量报告
        return await handleReport(res);

      case 'full-pipeline':
        // 完整管道（采集 + 规范化 + 构建图谱）
        return await handleFullPipeline(res);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('数据采集管道错误:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * 处理数据采集
 */
async function handleCollection(
  dataType: string,
  collectionType: string,
  res: NextApiResponse
) {
  if (!dataType || !Object.values(DataType).includes(dataType as DataType)) {
    return res.status(400).json({ error: 'Invalid data type' });
  }

  const type = collectionType || CollectionType.INCREMENTAL;

  // 异步启动采集（不等待完成）
  externalDataCollector.startCollection(dataType as DataType, type as CollectionType)
    .then(result => {
      console.log(`采集完成: ${dataType}`, result);
    })
    .catch(error => {
      console.error(`采集失败: ${dataType}`, error);
    });

  // 立即返回响应
  res.status(200).json({
    success: true,
    message: 'Data collection started',
    dataType,
    collectionType: type,
    status: 'running'
  });
}

/**
 * 处理知识图谱构建
 */
async function handleGraphBuild(res: NextApiResponse) {
  try {
    const result = await knowledgeGraph.buildGraph();

    res.status(200).json({
      success: true,
      message: 'Knowledge graph built successfully',
      data: result
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 处理数据规范化
 */
async function handleNormalization(
  dataType: string,
  res: NextApiResponse
) {
  if (!dataType) {
    return res.status(400).json({ error: 'Data type required' });
  }

  try {
    // 获取原始数据
    const rawData = [];  // 这里应该从数据库获取原始数据

    const result = await dataNormalizer.normalizeData(dataType, rawData);

    res.status(200).json({
      success: true,
      message: 'Data normalized successfully',
      data: result
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 处理数据质量报告
 */
async function handleReport(res: NextApiResponse) {
  try {
    const report = await dataNormalizer.getDataQualityReport();

    res.status(200).json({
      success: true,
      message: 'Data quality report generated',
      data: report
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 处理完整管道
 */
async function handleFullPipeline(res: NextApiResponse) {
  try {
    const results = {
      collection: {},
      normalization: {},
      graph: null
    };

    // 1. 数据采集
    console.log('启动数据采集...');
    const collectionResults = await externalDataCollector.collectAll(CollectionType.INCREMENTAL);
    results.collection = collectionResults;

    // 2. 数据规范化
    console.log('启动数据规范化...');
    const normalizationResults = await dataNormalizer.normalizeAllData();
    results.normalization = normalizationResults;

    // 3. 构建知识图谱
    console.log('构建知识图谱...');
    const graphResult = await knowledgeGraph.buildGraph();
    results.graph = graphResult;

    res.status(200).json({
      success: true,
      message: 'Full pipeline completed',
      data: results
    });
  } catch (error) {
    throw error;
  }
}
