import { NextApiRequest, NextApiResponse } from 'next'
import { BackupService } from '@/lib/backup/backup-service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' })
  }

  try {
    const service = new BackupService()
    const stats = await service.getBackupStats()

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    console.error('获取备份统计失败:', error)
    res.status(500).json({
      success: false,
      error: error.message || '获取备份统计失败'
    })
  }
}
