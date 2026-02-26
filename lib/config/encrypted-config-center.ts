import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getEncryptionService } from '@/lib/security/encryption'

/**
 * 加密配置中心
 * 用于存储和管理Agent模型权重、规则参数等敏感配置
 */
export class EncryptedConfigCenter {
  private supabase
  private encryptionService
  private configTable = 'encrypted_config'

  constructor() {
    this.supabase = createClient()
    this.encryptionService = getEncryptionService()
  }

  /**
   * 存储配置（加密）
   */
  async storeConfig(
    key: string,
    config: any,
    metadata?: {
      type?: string
      version?: string
      description?: string
    }
  ): Promise<void> {
    try {
      // 加密配置数据
      const encrypted = this.encryptionService.createEncryptedData(
        JSON.stringify(config)
      )

      // 检查是否已存在
      const { data: existing } = await this.supabase
        .from(this.configTable)
        .select('id')
        .eq('config_key', key)
        .single()

      if (existing) {
        // 更新
        await this.supabase
          .from(this.configTable)
          .update({
            encrypted_data: encrypted.encrypted,
            iv: encrypted.iv,
            auth_tag: encrypted.authTag,
            type: metadata?.type || 'unknown',
            version: metadata?.version || '1.0',
            description: metadata?.description,
            updated_at: new Date().toISOString()
          })
          .eq('config_key', key)
      } else {
        // 插入
        await this.supabase
          .from(this.configTable)
          .insert({
            config_key: key,
            encrypted_data: encrypted.encrypted,
            iv: encrypted.iv,
            auth_tag: encrypted.authTag,
            type: metadata?.type || 'unknown',
            version: metadata?.version || '1.0',
            description: metadata?.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error(`存储配置失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 读取配置（解密）
   */
  async loadConfig<T = any>(key: string): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.configTable)
        .select('encrypted_data, iv, auth_tag')
        .eq('config_key', key)
        .single()

      if (error || !data) {
        return null
      }

      // 解密配置
      const decrypted = this.encryptionService.decrypt({
        encrypted_data: data.encrypted_data,
        iv: data.iv,
        auth_tag: data.auth_tag
      })

      return JSON.parse(decrypted) as T
    } catch (error) {
      console.error(`加载配置失败 [${key}]:`, error)
      return null
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(key: string): Promise<void> {
    try {
      await this.supabase
        .from(this.configTable)
        .delete()
        .eq('config_key', key)
    } catch (error) {
      console.error(`删除配置失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 列出所有配置键
   */
  async listConfigs(type?: string): Promise<Array<{
    key: string
    type: string
    version: string
    description: string | null
    updated_at: string
  }>> {
    try {
      let query = this.supabase
        .from(this.configTable)
        .select('config_key, type, version, description, updated_at')
        .order('updated_at', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      if (error || !data) {
        return []
      }

      return data.map(item => ({
        key: item.config_key,
        type: item.type,
        version: item.version,
        description: item.description,
        updated_at: item.updated_at
      }))
    } catch (error) {
      console.error('列出配置失败:', error)
      return []
    }
  }

  /**
   * 版本控制：保存新版本
   */
  async saveVersion(
    key: string,
    config: any,
    version: string,
    metadata?: {
      type?: string
      description?: string
    }
  ): Promise<void> {
    // 保存当前版本到历史
    const currentConfig = await this.loadConfig(key)
    if (currentConfig) {
      const currentMeta = await this.getConfigMetadata(key)
      await this.storeConfig(
        `${key}_v${currentMeta?.version || '1.0'}`,
        currentConfig,
        {
          type: 'version_history',
          description: `历史版本: ${currentMeta?.version}`,
          version: currentMeta?.version || '1.0'
        }
      )
    }

    // 保存新版本
    await this.storeConfig(key, config, {
      ...metadata,
      version
    })
  }

  /**
   * 获取配置元数据
   */
  private async getConfigMetadata(key: string): Promise<{
    type: string
    version: string
    description: string | null
  } | null> {
    const { data } = await this.supabase
      .from(this.configTable)
      .select('type, version, description')
      .eq('config_key', key)
      .single()

    return data
  }
}

// 单例实例
let configCenterInstance: EncryptedConfigCenter | null = null

/**
 * 获取配置中心实例
 */
export function getConfigCenter(): EncryptedConfigCenter {
  if (!configCenterInstance) {
    configCenterInstance = new EncryptedConfigCenter()
  }
  return configCenterInstance
}

/**
 * 初始化默认配置
 */
export async function initializeDefaultConfigs() {
  const configCenter = getConfigCenter()

  // Agent审批规则配置
  await configCenter.storeConfig('agent_approval_rules', {
    occupancy: {
      min: 70,
      optimal: 90,
      auto_approve: true
    },
    debt_ratio: {
      max: 60,
      warning: 50,
      auto_approve: false
    },
    nav_growth: {
      min_growth: 0,
      min_dividend: 3,
      auto_approve: true
    }
  }, {
    type: 'agent_rules',
    version: '1.0',
    description: '智能审批Agent的规则配置'
  })

  // Agent权重配置（示例，实际应从模型文件加载）
  await configCenter.storeConfig('agent_model_weights', {
    rule_based: 0.6,
    consistency_check: 0.3,
    risk_assessment: 0.1
  }, {
    type: 'agent_weights',
    version: '1.0',
    description: 'Agent决策模型的权重配置'
  })

  console.log('默认配置初始化完成')
}
