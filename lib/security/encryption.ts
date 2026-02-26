import crypto from 'crypto'

/**
 * 数据加密服务
 * 用于加密存储敏感数据（如2FA密钥、密码等）
 */
export class DataEncryptionService {
  private encryptionKey: Buffer
  private algorithm = 'aes-256-gcm'

  constructor() {
    // 从环境变量获取加密密钥，如果没有则使用默认值（生产环境必须配置）
    const key = process.env.DATA_ENCRYPTION_KEY || process.env.BACKUP_ENCRYPTION_KEY || 'default-key-change-in-production-32bytes'
    this.encryptionKey = crypto.createHash('sha256').update(key).digest()
  }

  /**
   * 加密数据
   * @param data 明文数据
   * @returns 加密结果（包含密文、IV、AuthTag）
   */
  encrypt(data: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv)

    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  /**
   * 解密数据
   * @param encrypted 加密后的密文
   * @param iv 初始化向量
   * @param authTag 认证标签
   * @returns 明文数据
   */
  decrypt(encrypted: string, iv: string, authTag: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(iv, 'hex')
    )

    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  /**
   * 加密对象（将对象序列化为JSON后加密）
   */
  encryptObject(obj: any): { encrypted: string; iv: string; authTag: string } {
    return this.encrypt(JSON.stringify(obj))
  }

  /**
   * 解密对象（解密后反序列化为对象）
   */
  decryptObject<T>(encrypted: string, iv: string, authTag: string): T {
    const json = this.decrypt(encrypted, iv, authTag)
    return JSON.parse(json) as T
  }

  /**
   * 生成加密版本的数据对象（用于存储）
   */
  createEncryptedData(data: string): {
    encrypted_data: string
    iv: string
    auth_tag: string
  } {
    const result = this.encrypt(data)
    return {
      encrypted_data: result.encrypted,
      iv: result.iv,
      auth_tag: result.authTag
    }
  }

  /**
   * 从加密数据对象中解密
   */
  decryptFromData(encryptedData: {
    encrypted_data: string
    iv: string
    auth_tag: string
  }): string {
    return this.decrypt(
      encryptedData.encrypted_data,
      encryptedData.iv,
      encryptedData.auth_tag
    )
  }
}

// 单例实例
let encryptionServiceInstance: DataEncryptionService | null = null

/**
 * 获取加密服务实例（单例模式）
 */
export function getEncryptionService(): DataEncryptionService {
  if (!encryptionServiceInstance) {
    encryptionServiceInstance = new DataEncryptionService()
  }
  return encryptionServiceInstance
}
