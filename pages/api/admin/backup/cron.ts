import { NextApiRequest, NextApiResponse } from 'next'
import { BackupService } from '@/lib/backup/backup-service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 验证cron密钥（防止未授权访问）
  const cronKey = req.headers['x-cron-key']

  if (cronKey !== process.env.CRON_SECRET_KEY) {
    return res.status(403).json({ error: '未授权' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' })
  }

  try {
    console.log('开始定时备份...')

    const service = new BackupService()

    // 创建备份
    const backup = await service.createBackup()
    console.log(`备份创建成功: ${backup.filename}`)

    // 清理过期备份（保留90天）
    const cleanedCount = await service.cleanupOldBackups()
    console.log(`清理了 ${cleanedCount} 个过期备份`)

    res.status(200).json({
      success: true,
      message: '定时备份完成',
      data: {
        backup,
        cleanedCount
      }
    })
  } catch (error: any) {
    console.error('定时备份失败:', error)
    res.status(500).json({
      success: false,
      error: error.message || '定时备份失败'
    })
  }
}
