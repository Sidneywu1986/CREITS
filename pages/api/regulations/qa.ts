/**
 * REITs法规智能问答API路由
 * 提供法规查询、问答、对比等功能
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  queryRegulationQa,
  getRegulationDetail,
  compareRegulations,
  getRegulationStatistics
} from '@/lib/services/regulation-qa-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 处理不同的HTTP方法
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET /api/regulations/qa
 * 获取法规统计信息、详情或对比
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { action, docId, docIds, aspect } = req.query;

    // 获取统计信息
    if (action === 'stats') {
      const stats = getRegulationStatistics();
      return res.status(200).json(stats);
    }

    // 获取法规详情
    if (action === 'detail' && docId) {
      const detail = await getRegulationDetail(docId as string);
      if (!detail) {
        return res.status(404).json({ error: '未找到该法规文档' });
      }
      return res.status(200).json(detail);
    }

    // 法规对比
    if (action === 'compare' && docIds) {
      const ids = (Array.isArray(docIds) ? docIds : [docIds]) as string[];
      if (ids.length < 2) {
        return res.status(400).json({
          error: '请至少选择两份法规进行对比'
        });
      }

      const comparison = await compareRegulations(
        ids,
        aspect as string | undefined
      );

      return res.status(200).json({ comparison });
    }

    // 默认返回统计信息
    const stats = getRegulationStatistics();
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Regulation QA GET API error:', error);
    return res.status(500).json({
      error: '法规服务异常',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * POST /api/regulations/qa
 * 法规智能问答
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { question, issuer, category, stream = false } = req.body;

    // 参数验证
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '请提供有效的问题' });
    }

    // 暂不支持流式响应，使用非流式问答
    const response = await queryRegulationQa({
      question,
      issuer,
      category,
      stream: false
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Regulation QA API error:', error);
    return res.status(500).json({
      error: '法规问答服务异常',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
