import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { getEncryptionService } from './encryption'

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export class TwoFactorService {
  // 生成2FA密钥
  generateSecret(username: string): string {
    const secret = speakeasy.generateSecret({
      name: `REITs智能助手 (${username})`,
      issuer: 'REITs智能助手'
    })

    return secret.base32!
  }

  // 生成二维码
  async generateQRCode(secret: string, username: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: `REITs智能助手 (${username})`,
      issuer: 'REITs智能助手',
      encoding: 'base32'
    })

    try {
      const qrCode = await QRCode.toDataURL(otpauthUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0B1E33',
          light: '#ffffff'
        }
      })
      return qrCode
    } catch (error) {
      console.error('生成二维码失败:', error)
      throw new Error('二维码生成失败')
    }
  }

  // 验证OTP
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // 允许前后2个时间窗口的验证码
    })
  }

  // 生成备份码
  generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      codes.push(speakeasy.generateSecretLength(10).base32!.substring(0, 8))
    }
    return codes
  }

  // 完整的2FA设置
  async setupTwoFactor(username: string): Promise<TwoFactorSetup> {
    const secret = this.generateSecret(username)
    const qrCode = await this.generateQRCode(secret, username)
    const backupCodes = this.generateBackupCodes()

    return {
      secret,
      qrCode,
      backupCodes
    }
  }

  // 验证备份码
  verifyBackupCode(providedCode: string, storedCodes: string[]): boolean {
    return storedCodes.includes(providedCode)
  }

  // 移除已使用的备份码
  removeBackupCode(usedCode: string, storedCodes: string[]): string[] {
    return storedCodes.filter(code => code !== usedCode)
  }

  // 加密2FA密钥用于存储
  encryptSecret(secret: string): {
    encrypted_data: string
    iv: string
    auth_tag: string
  } {
    const encryptionService = getEncryptionService()
    return encryptionService.createEncryptedData(secret)
  }

  // 解密2FA密钥
  decryptSecret(encryptedData: {
    encrypted_data: string
    iv: string
    auth_tag: string
  }): string {
    const encryptionService = getEncryptionService()
    return encryptionService.decryptFromData(encryptedData)
  }
}
