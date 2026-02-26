import CryptoJS from 'crypto-js';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

/**
 * AES-256 加密工具类
 * 使用 PBKDF2 派生密钥，GCM 模式加密
 */
export class AES256 {
  private static readonly KEY_SIZE = 256; // 密钥长度（位）
  private static readonly IV_SIZE = 128; // IV 长度（位）
  private static readonly SALT_SIZE = 128; // 盐值长度（位）
  private static readonly ITERATIONS = 10000; // PBKDF2 迭代次数

  /**
   * 从密码派生密钥
   */
  private static deriveKey(
    password: string,
    salt: string
  ): CryptoJS.WordArray {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: AES256.KEY_SIZE / 32,
      iterations: AES256.ITERATIONS,
    });
  }

  /**
   * 加密数据
   */
  public static encrypt(plaintext: string, password: string): EncryptedData {
    // 生成随机盐值
    const salt = CryptoJS.lib.WordArray.random(AES256.SALT_SIZE / 8).toString();

    // 派生密钥
    const key = this.deriveKey(password, salt);

    // 生成随机IV
    const iv = CryptoJS.lib.WordArray.random(AES256.IV_SIZE / 8).toString();

    // 加密
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.Pkcs7,
    });

    return {
      ciphertext: encrypted.toString(),
      iv,
      salt,
    };
  }

  /**
   * 解密数据
   */
  public static decrypt(
    encryptedData: EncryptedData,
    password: string
  ): string {
    // 派生密钥
    const key = this.deriveKey(password, encryptedData.salt);

    // 解密
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData.ciphertext,
      key,
      {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // 返回解密后的明文
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * 加密对象
   */
  public static encryptObject(
    obj: any,
    password: string
  ): EncryptedData {
    const plaintext = JSON.stringify(obj);
    return this.encrypt(plaintext, password);
  }

  /**
   * 解密对象
   */
  public static decryptObject<T = any>(
    encryptedData: EncryptedData,
    password: string
  ): T {
    const plaintext = this.decrypt(encryptedData, password);
    return JSON.parse(plaintext);
  }

  /**
   * 生成随机密码
   */
  public static generatePassword(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }
    return password;
  }

  /**
   * 生成加密哈希（用于密码验证）
   */
  public static hashPassword(password: string, salt?: string): string {
    const actualSalt = salt || CryptoJS.lib.WordArray.random(128 / 8).toString();
    const hash = CryptoJS.PBKDF2(password, actualSalt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
    return `${actualSalt}:${hash}`;
  }

  /**
   * 验证密码
   */
  public static verifyPassword(
    password: string,
    storedHash: string
  ): boolean {
    const [salt, hash] = storedHash.split(':');
    const computedHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
    return computedHash === hash;
  }
}
