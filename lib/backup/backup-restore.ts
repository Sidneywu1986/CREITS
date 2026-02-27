import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { AuditLogService } from '@/lib/supabase/audit-log-v2'

/**
 * 备份元数据
 */
export interface BackupMetadata {
  id: string
  timestamp: string
  type: 'full' | 'incremental'
  size: number
  tables: string[]
  checksum: string
  status: 'completed' | 'failed' | 'verifying'
  createdBy: string
}

/**
 * 备份清单
 */
export interface BackupManifest {
  metadata: BackupMetadata
  tables: Record<string, {
    count: number
    checksum: string
  }>
}

/**
 * 恢复结果
 */
export interface RestoreResult {
  success: boolean
  restoredTables: string[]
  failedTables: string[]
  timestamp: string
  duration: number
  checksum: string
}

/**
 * 备份验证结果
 */
export interface BackupVerificationResult {
  valid: boolean
  checksumMatch: boolean
  tablesIntegrity: Record<string, boolean>
  issues: string[]
}

/**
 * 数据库中的备份记录
 */
interface BackupRecord {
  id: string
  timestamp: string
  type: 'full' | 'incremental'
  size: number
  tables: string[]
  checksum: string
  status: 'completed' | 'failed' | 'verifying'
  created_by: string
}

/**
 * 自动化备份恢复服务
 */
export class BackupRestoreService {
  private _supabase: any = null
  private _auditService: any = null
  private backupStoragePath: string

  private get supabase() {
    if (!this._supabase) {
      try {
        this._supabase = createClient()
      } catch (error) {
        console.warn('Failed to create Supabase client:', error)
        this._supabase = null
      }
    }
    return this._supabase
  }

  private get auditService() {
    if (!this._auditService) {
      try {
        this._auditService = new AuditLogService()
      } catch (error) {
        console.warn('Failed to create audit service:', error)
        this._auditService = null
      }
    }
    return this._auditService
  }

  constructor() {
    this.backupStoragePath = process.env.BACKUP_STORAGE_PATH || '/tmp/backups'
  }

  /**
   * 创建完整备份
   */
  async createFullBackup(userId: string, username: string): Promise<BackupMetadata> {
    const backupId = crypto.randomUUID()
    const timestamp = new Date().toISOString()
    const tables = [
      'users',
      'reit_product_info',
      'reit_property_base',
      'reit_property_equity_ops',
      'reit_property_concession_ops',
      'reit_financial_metrics',
      'reit_valuation',
      'reit_risk_compliance',
      'reit_market_stats',
      'agent_feedback',
      'audit_logs',
      'encrypted_config'
    ]

    console.log(`开始创建完整备份: ${backupId}`)

    const manifest: BackupManifest = {
      metadata: {
        id: backupId,
        timestamp,
        type: 'full',
        size: 0,
        tables,
        checksum: '',
        status: 'verifying',
        createdBy: username
      },
      tables: {}
    }

    try {
      // 备份每个表
      for (const table of tables) {
        console.log(`备份表: ${table}`)

        const { data, error } = await this.supabase
          .from(table)
          .select('*')

        if (error) {
          throw new Error(`备份表${table}失败: ${error.message}`)
        }

        const tableData = data || []
        const checksum = this.calculateChecksum(tableData)

        manifest.tables[table] = {
          count: tableData.length,
          checksum
        }

        // 保存表数据到文件
        await this.saveTableData(backupId, table, tableData)
      }

      // 计算总大小和校验和
      const size = await this.calculateBackupSize(backupId)
      const checksum = this.calculateChecksum(manifest)

      manifest.metadata.size = size
      manifest.metadata.checksum = checksum
      manifest.metadata.status = 'completed'

      // 保存清单文件
      await this.saveManifest(backupId, manifest)

      // 记录到数据库
      await this.saveBackupRecord(manifest)

      // 记录审计日志
      await this.auditService.log({
        userId,
        username,
        action: 'backup_created',
        resourceType: 'backup',
        resourceId: backupId,
        oldValue: null,
        newValue: {
          type: 'full',
          size,
          tables: tables.length
        },
        result: 'success'
      })

      console.log(`备份完成: ${backupId}`)

      return manifest.metadata
    } catch (error: any) {
      manifest.metadata.status = 'failed'
      console.error('备份失败:', error)

      await this.auditService.log({
        userId,
        username,
        action: 'backup_failed',
        resourceType: 'backup',
        resourceId: backupId,
        oldValue: null,
        newValue: { error: error.message },
        result: 'failure'
      })

      throw error
    }
  }

  /**
   * 恢复备份
   */
  async restoreBackup(
    backupId: string,
    userId: string,
    username: string,
    dryRun: boolean = false
  ): Promise<RestoreResult> {
    const startTime = Date.now()

    console.log(`开始恢复备份: ${backupId} (dryRun=${dryRun})`)

    // 加载备份清单
    const manifest = await this.loadManifest(backupId)
    if (!manifest) {
      throw new Error('备份清单不存在')
    }

    const result: RestoreResult = {
      success: false,
      restoredTables: [],
      failedTables: [],
      timestamp: new Date().toISOString(),
      duration: 0,
      checksum: ''
    }

    try {
      // 验证备份
      const verification = await this.verifyBackup(backupId)
      if (!verification.valid) {
        throw new Error(`备份验证失败: ${verification.issues.join(', ')}`)
      }

      // 恢复每个表
      for (const [tableName, tableInfo] of Object.entries(manifest.tables)) {
        console.log(`恢复表: ${tableName}`)

        try {
          // 加载表数据
          const tableData = await this.loadTableData(backupId, tableName)

          if (dryRun) {
            // 演练模式：只验证不恢复
            console.log(`[DRY RUN] 跳过恢复表: ${tableName} (${tableData.length}条记录)`)
            result.restoredTables.push(tableName)
          } else {
            // 清空目标表
            const { error: deleteError } = await this.supabase
              .from(tableName)
              .delete()
              .neq('id', crypto.randomUUID()) // 删除所有记录

            if (deleteError) {
              throw new Error(`清空表${tableName}失败: ${deleteError.message}`)
            }

            // 插入备份数据（分批）
            const batchSize = 100
            for (let i = 0; i < tableData.length; i += batchSize) {
              const batch = tableData.slice(i, i + batchSize)
              const { error: insertError } = await this.supabase
                .from(tableName)
                .insert(batch)

              if (insertError) {
                throw new Error(`插入数据到表${tableName}失败: ${insertError.message}`)
              }
            }

            console.log(`恢复表${tableName}成功: ${tableData.length}条记录`)
            result.restoredTables.push(tableName)
          }
        } catch (error: any) {
          console.error(`恢复表${tableName}失败:`, error)
          result.failedTables.push(tableName)
        }
      }

      result.success = result.failedTables.length === 0
      result.duration = Date.now() - startTime
      result.checksum = manifest.metadata.checksum

      // 记录审计日志
      await this.auditService.log({
        userId,
        username,
        action: dryRun ? 'backup_drill' : 'backup_restored',
        resourceType: 'backup',
        resourceId: backupId,
        oldValue: null,
        newValue: {
          success: result.success,
          restoredTables: result.restoredTables.length,
          failedTables: result.failedTables.length,
          duration: result.duration
        },
        result: result.success ? 'success' : 'failure'
      })

      console.log(`恢复完成: ${backupId}, 耗时: ${result.duration}ms`)

      return result
    } catch (error: any) {
      result.duration = Date.now() - startTime

      await this.auditService.log({
        userId,
        username,
        action: dryRun ? 'backup_drill_failed' : 'backup_restore_failed',
        resourceType: 'backup',
        resourceId: backupId,
        oldValue: null,
        newValue: { error: error.message },
        result: 'failure'
      })

      throw error
    }
  }

  /**
   * 验证备份
   */
  async verifyBackup(backupId: string): Promise<BackupVerificationResult> {
    console.log(`验证备份: ${backupId}`)

    const manifest = await this.loadManifest(backupId)
    if (!manifest) {
      return {
        valid: false,
        checksumMatch: false,
        tablesIntegrity: {},
        issues: ['备份清单不存在']
      }
    }

    const result: BackupVerificationResult = {
      valid: true,
      checksumMatch: true,
      tablesIntegrity: {},
      issues: []
    }

    // 验证清单校验和
    const calculatedChecksum = this.calculateChecksum(manifest)
    if (calculatedChecksum !== manifest.metadata.checksum) {
      result.checksumMatch = false
      result.valid = false
      result.issues.push('清单校验和不匹配')
    }

    // 验证每个表的完整性
    for (const [tableName, tableInfo] of Object.entries(manifest.tables)) {
      try {
        const tableData = await this.loadTableData(backupId, tableName)
        const calculatedChecksum = this.calculateChecksum(tableData)

        if (calculatedChecksum !== tableInfo.checksum) {
          result.tablesIntegrity[tableName] = false
          result.valid = false
          result.issues.push(`表${tableName}数据校验和不匹配`)
        } else if (tableData.length !== tableInfo.count) {
          result.tablesIntegrity[tableName] = false
          result.valid = false
          result.issues.push(`表${tableName}记录数不匹配: 期望${tableInfo.count}, 实际${tableData.length}`)
        } else {
          result.tablesIntegrity[tableName] = true
        }
      } catch (error: any) {
        result.tablesIntegrity[tableName] = false
        result.valid = false
        result.issues.push(`验证表${tableName}失败: ${error.message}`)
      }
    }

    console.log(`验证完成: ${backupId}, valid=${result.valid}`)

    return result
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
  }

  /**
   * 保存表数据
   */
  private async saveTableData(
    backupId: string,
    tableName: string,
    data: any[]
  ): Promise<void> {
    const fs = require('fs').promises
    const path = require('path')

    const backupDir = path.join(this.backupStoragePath, backupId)
    await fs.mkdir(backupDir, { recursive: true })

    const filePath = path.join(backupDir, `${tableName}.json`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  }

  /**
   * 加载表数据
   */
  private async loadTableData(
    backupId: string,
    tableName: string
  ): Promise<any[]> {
    const fs = require('fs').promises
    const path = require('path')

    const filePath = path.join(this.backupStoragePath, backupId, `${tableName}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  }

  /**
   * 保存清单
   */
  private async saveManifest(
    backupId: string,
    manifest: BackupManifest
  ): Promise<void> {
    const fs = require('fs').promises
    const path = require('path')

    const backupDir = path.join(this.backupStoragePath, backupId)
    const filePath = path.join(backupDir, 'manifest.json')
    await fs.writeFile(filePath, JSON.stringify(manifest, null, 2))
  }

  /**
   * 加载清单
   */
  private async loadManifest(
    backupId: string
  ): Promise<BackupManifest | null> {
    const fs = require('fs').promises
    const path = require('path')

    const filePath = path.join(this.backupStoragePath, backupId, 'manifest.json')

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  /**
   * 计算备份大小
   */
  private async calculateBackupSize(backupId: string): Promise<number> {
    const fs = require('fs').promises
    const path = require('path')

    const backupDir = path.join(this.backupStoragePath, backupId)
    let size = 0

    try {
      const files = await fs.readdir(backupDir)
      for (const file of files) {
        const filePath = path.join(backupDir, file)
        const stats = await fs.stat(filePath)
        size += stats.size
      }
    } catch {}

    return size
  }

  /**
   * 保存备份记录到数据库
   */
  private async saveBackupRecord(manifest: BackupManifest): Promise<void> {
    await this.supabase.from('backups').insert({
      id: manifest.metadata.id,
      timestamp: manifest.metadata.timestamp,
      type: manifest.metadata.type,
      size: manifest.metadata.size,
      tables: manifest.tables,
      checksum: manifest.metadata.checksum,
      status: manifest.metadata.status,
      created_by: manifest.metadata.createdBy
    })
  }

  /**
   * 获取备份列表
   */
  async getBackups(): Promise<BackupMetadata[]> {
    const { data, error } = await this.supabase
      .from('backups')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) {
      throw new Error(`获取备份列表失败: ${error.message}`)
    }

    return (data || []).map((record: BackupRecord) => ({
      id: record.id,
      timestamp: record.timestamp,
      type: record.type,
      size: record.size,
      tables: record.tables,
      checksum: record.checksum,
      status: record.status,
      createdBy: record.created_by
    }))
  }

  /**
   * 删除备份
   */
  async deleteBackup(
    backupId: string,
    userId: string,
    username: string
  ): Promise<void> {
    const fs = require('fs').promises
    const path = require('path')

    const backupDir = path.join(this.backupStoragePath, backupId)

    // 删除文件
    await fs.rm(backupDir, { recursive: true, force: true })

    // 删除数据库记录
    await this.supabase.from('backups').delete().eq('id', backupId)

    // 记录审计日志
    await this.auditService.log({
      userId,
      username,
      action: 'backup_deleted',
      resourceType: 'backup',
      resourceId: backupId,
      oldValue: null,
      newValue: null,
      result: 'success'
    })
  }
}
