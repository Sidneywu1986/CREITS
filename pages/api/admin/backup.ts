import { NextApiRequest, NextApiResponse } from 'next'
import { BackupService } from '@/lib/backup/backup-service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // 手动创建备份
    try {
      const service = new BackupService()
      const backup = await service.createBackup()

      res.status(200).json({
        success: true,
        data: backup,
        message: '备份创建成功'
      })
    } catch (error: any) {
      console.error('创建备份失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || '创建备份失败'
      })
    }
  } else if (req.method === 'GET') {
    // 获取备份列表
    try {
      const service = new BackupService()
      const backups = await service.getBackupList()

      res.status(200).json({
        success: true,
        data: backups
      })
    } catch (error: any) {
      console.error('获取备份列表失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || '获取备份列表失败'
      })
    }
  } else {
    res.status(405).json({ error: '方法不允许' })
  }
}
