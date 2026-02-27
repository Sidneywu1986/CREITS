import { NextApiRequest, NextApiResponse } from 'next'
import { BackupRestoreService } from '@/lib/backup/backup-restore'
import { createClient } from '@/lib/supabase/server'

/**
 * 备份恢复管理API
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 认证
  const supabase = createClient()
  if (!supabase) {
    return res.status(500).json({ error: '数据库连接失败' })
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: '未授权' })
  }

  // 获取用户信息
  const { data: userData } = await supabase
    .from('users')
    .select('username, role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' })
  }

  const service = new BackupRestoreService()

  if (req.method === 'POST') {
    // 创建备份
    try {
      const backup = await service.createFullBackup(user.id, userData.username)

      res.status(200).json({
        success: true,
        backup
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  } else if (req.method === 'GET') {
    // 获取备份列表
    try {
      const backups = await service.getBackups()

      res.status(200).json({ backups })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PATCH') {
    // 恢复备份
    try {
      const { backupId, dryRun } = req.body

      if (!backupId) {
        return res.status(400).json({ error: '缺少backupId参数' })
      }

      const result = await service.restoreBackup(
        backupId,
        user.id,
        userData.username,
        dryRun || false
      )

      res.status(200).json({
        success: true,
        result
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  } else if (req.method === 'DELETE') {
    // 删除备份
    try {
      const { backupId } = req.query

      if (!backupId) {
        return res.status(400).json({ error: '缺少backupId参数' })
      }

      await service.deleteBackup(backupId as string, user.id, userData.username)

      res.status(200).json({ success: true })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: '方法不允许' })
  }
}
