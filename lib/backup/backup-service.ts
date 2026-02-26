import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export interface BackupMetadata {
  id: string
  filename: string
  tables: string[]
  size: number
  created_at: string
  status: 'pending' | 'completed' | 'failed'
  error?: string
}

export class BackupService {
  private supabase
  private encryptionKey: string
  private algorithm = 'aes-256-gcm'

  constructor() {
    this.supabase = createClient()
    this.encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || 'default-encryption-key-32-bytes-long'
  }

  // 生成加密密钥（确保32字节）
  private getEncryptionKey(): Buffer {
    return crypto.createHash('sha256').update(this.encryptionKey).digest()
  }

  // 加密数据
  private encrypt(data: string): { encrypted: string; iv: string; authTag: string } {
    const key = this.getEncryptionKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, key, iv)

    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  // 解密数据
  private decrypt(encrypted: string, iv: string, authTag: string): string {
    const key = this.getEncryptionKey()
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    )

    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // 备份单个表
  private async backupTable(tableName: string): Promise<string> {
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')

    if (error) {
      throw error
    }

    return JSON.stringify({
      table: tableName,
      data: data || [],
      timestamp: new Date().toISOString()
    }, null, 2)
  }

  // 创建完整备份
  async createBackup(): Promise<BackupMetadata> {
    const tables = [
      'users',
      'roles',
      'permissions',
      'audit_logs',
      'login_attempts',
      'security_alerts',
      'user_ip_whitelist'
    ]

    const backupId = crypto.randomUUID()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}-${backupId}.json`

    try {
      // 备份每个表
      const backupData: any[] = []
      for (const table of tables) {
        try {
          const tableData = await this.backupTable(table)
          backupData.push(JSON.parse(tableData))
        } catch (error) {
          console.error(`备份表 ${table} 失败:`, error)
        }
      }

      // 加密备份数据
      const jsonData = JSON.stringify(backupData, null, 2)
      const { encrypted, iv, authTag } = this.encrypt(jsonData)

      // 创建备份记录
      const { error: insertError } = await this.supabase
        .from('backup_metadata')
        .insert({
          id: backupId,
          filename,
          tables: tables,
          size: encrypted.length,
          encrypted_data: encrypted,
          iv: iv,
          auth_tag: authTag,
          status: 'completed',
          created_at: new Date().toISOString()
        })

      if (insertError) {
        throw insertError
      }

      return {
        id: backupId,
        filename,
        tables,
        size: encrypted.length,
        created_at: new Date().toISOString(),
        status: 'completed'
      }
    } catch (error: any) {
      console.error('创建备份失败:', error)

      // 记录失败状态
      await this.supabase
        .from('backup_metadata')
        .insert({
          id: backupId,
          filename,
          tables,
          size: 0,
          status: 'failed',
          error: error.message,
          created_at: new Date().toISOString()
        })

      throw error
    }
  }

  // 恢复备份
  async restoreBackup(backupId: string): Promise<void> {
    const { data: backupData, error } = await this.supabase
      .from('backup_metadata')
      .select('*')
      .eq('id', backupId)
      .single()

    if (error || !backupData) {
      throw new Error('备份不存在')
    }

    try {
      // 解密数据
      const decrypted = this.decrypt(
        backupData.encrypted_data,
        backupData.iv,
        backupData.auth_tag
      )

      const backupItems = JSON.parse(decrypted)

      // 恢复每个表的数据
      for (const item of backupItems) {
        if (item.table && item.data) {
          // 注意：这会覆盖现有数据，生产环境需要谨慎使用
          console.log(`恢复表 ${item.table}...`)
          // 实际恢复逻辑需要根据业务需求定制
        }
      }
    } catch (error) {
      console.error('恢复备份失败:', error)
      throw error
    }
  }

  // 删除过期备份（保留90天）
  async cleanupOldBackups(): Promise<number> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const { data, error } = await this.supabase
      .from('backup_metadata')
      .select('id, encrypted_data')
      .lt('created_at', ninetyDaysAgo.toISOString())

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      const ids = data.map(item => item.id)
      const { error: deleteError } = await this.supabase
        .from('backup_metadata')
        .delete()
        .in('id', ids)

      if (deleteError) {
        throw deleteError
      }

      return ids.length
    }

    return 0
  }

  // 获取备份列表
  async getBackupList(): Promise<BackupMetadata[]> {
    const { data, error } = await this.supabase
      .from('backup_metadata')
      .select('id, filename, tables, size, created_at, status, error')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    return (data || []) as BackupMetadata[]
  }

  // 获取备份统计
  async getBackupStats(): Promise<{
    total: number
    totalSize: number
    successful: number
    failed: number
    latestBackup: BackupMetadata | null
  }> {
    const { data, error } = await this.supabase
      .from('backup_metadata')
      .select('id, size, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const backups = data || []
    const total = backups.length
    const totalSize = backups.reduce((sum, b) => sum + (b.size || 0), 0)
    const successful = backups.filter(b => b.status === 'completed').length
    const failed = backups.filter(b => b.status === 'failed').length
    const latestBackup = backups[0] || null

    return {
      total,
      totalSize,
      successful,
      failed,
      latestBackup
    }
  }
}
