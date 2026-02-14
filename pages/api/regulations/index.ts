/**
 * REITs法规管理API路由
 * 提供法规文档的CRUD操作和检索功能
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  regulationsKnowledgeBase,
  queryRegulations,
  getRegulationById,
  getRegulationStats
} from '@/lib/data/regulations-knowledge-base';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 处理不同的HTTP方法
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET /api/regulations
 * 获取法规列表
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { issuer, category, keyword, action, docId } = req.query;

    // 获取统计信息
    if (action === 'stats') {
      const stats = getRegulationStats();
      return res.status(200).json(stats);
    }

    // 获取法规分类
    if (action === 'categories') {
      const categories = Array.from(
        new Set(regulationsKnowledgeBase.map(doc => doc.category))
      );
      const issuers = Array.from(
        new Set(regulationsKnowledgeBase.map(doc => doc.issuer))
      );
      return res.status(200).json({ categories, issuers });
    }

    // 获取单个法规详情
    if (action === 'detail' && docId) {
      const doc = getRegulationById(docId as string);
      if (!doc) {
        return res.status(404).json({ error: '未找到该法规文档' });
      }
      return res.status(200).json(doc);
    }

    // 获取法规列表（支持筛选和搜索）
    console.log('Query params:', { issuer, category, keyword });
    const query = {
      issuer: issuer ? (Array.isArray(issuer) ? issuer : [issuer]) : undefined,
      category: category ? (Array.isArray(category) ? category : [category]) : undefined,
      keyword: keyword as string | undefined
    };
    console.log('Query object:', query);

    const results = queryRegulations(query);
    console.log('Results count:', results.length);

    return res.status(200).json({
      total: results.length,
      data: results
    });
  } catch (error) {
    console.error('Regulations API GET error:', error);
    return res.status(500).json({
      error: '获取法规列表失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * POST /api/regulations
 * 添加新的法规文档（预留接口）
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = req.body;

    // 参数验证
    if (!body.title || !body.issuer || !body.category) {
      return res.status(400).json({
        error: '请提供完整的法规信息（title, issuer, category）'
      });
    }

    // 生成新文档ID
    const newDoc = {
      id: `REG-CUSTOM-${Date.now()}`,
      ...body,
      lastUpdated: new Date().toISOString()
    };

    // TODO: 实际项目中应该保存到数据库
    // 这里只是模拟返回

    return res.status(201).json({
      message: '法规文档添加成功',
      data: newDoc
    });
  } catch (error) {
    console.error('Regulations API POST error:', error);
    return res.status(500).json({
      error: '添加法规文档失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * PUT /api/regulations
 * 更新法规文档（预留接口）
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = req.body;

    // 参数验证
    if (!body.id) {
      return res.status(400).json({
        error: '请提供法规文档ID'
      });
    }

    // TODO: 实际项目中应该更新数据库
    // 这里只是模拟返回

    return res.status(200).json({
      message: '法规文档更新成功',
      data: body
    });
  } catch (error) {
    console.error('Regulations API PUT error:', error);
    return res.status(500).json({
      error: '更新法规文档失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * DELETE /api/regulations
 * 删除法规文档（预留接口）
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { docId } = req.query;

    if (!docId) {
      return res.status(400).json({
        error: '请提供法规文档ID'
      });
    }

    // TODO: 实际项目中应该从数据库删除
    // 这里只是模拟返回

    return res.status(200).json({
      message: '法规文档删除成功',
      docId
    });
  } catch (error) {
    console.error('Regulations API DELETE error:', error);
    return res.status(500).json({
      error: '删除法规文档失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
