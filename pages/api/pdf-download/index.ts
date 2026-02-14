/**
 * PDF下载API路由
 * 提供PDF文件的下载和管理功能
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  downloadPDF,
  getDownloadRecords,
  getProductDownloads,
  deleteDownloadedPDF,
  cleanupOldDownloads,
  ensureDownloadsDirectory,
} from '@/lib/services/pdf-download-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 确保目录存在
  ensureDownloadsDirectory();

  // 处理不同的HTTP方法
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET /api/pdf-download
 * 获取下载记录
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code, action } = req.query;

    // 获取单个产品的下载记录
    if (code && typeof code === 'string') {
      const records = getProductDownloads(code);
      return res.status(200).json({
        total: records.length,
        data: records,
      });
    }

    // 清理过期文件
    if (action === 'cleanup') {
      const result = cleanupOldDownloads(30); // 清理30天前的文件
      return res.status(200).json(result);
    }

    // 获取所有下载记录
    const records = getDownloadRecords();
    return res.status(200).json({
      total: records.length,
      data: records,
    });
  } catch (error) {
    console.error('PDF Download API GET error:', error);
    return res.status(500).json({
      error: '获取下载记录失败',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/pdf-download
 * 下载PDF文件
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = req.body;

    // 参数验证
    if (!body.url || !body.code || !body.title) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['url', 'code', 'title'],
      });
    }

    const { url, code, name, title, type, publishDate } = body;

    // 下载PDF
    const result = await downloadPDF(
      url,
      code,
      name || '',
      title,
      type || '未知',
      publishDate || new Date().toISOString().split('T')[0]
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('PDF Download API POST error:', error);
    return res.status(500).json({
      error: '下载PDF失败',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * DELETE /api/pdf-download
 * 删除下载的PDF文件
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fileName } = req.query;

    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({
        error: '缺少文件名参数',
      });
    }

    const success = deleteDownloadedPDF(fileName);

    if (success) {
      return res.status(200).json({
        success: true,
        message: '文件删除成功',
      });
    } else {
      return res.status(404).json({
        error: '文件不存在或删除失败',
      });
    }
  } catch (error) {
    console.error('PDF Download API DELETE error:', error);
    return res.status(500).json({
      error: '删除文件失败',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
