/**
 * 加密模块统一导出
 *
 * 包含 BBS 签名和书密码加密功能
 */

// BBS 签名
export {
  BBSSignatureManager,
  getBBSManager,
  resetBBSInstance,
  type BBSKeypair,
  type BBSSignature,
  type BBSProof,
} from './bbs-signature';

// 书密码
export {
  BookCipher,
  createBookCipherFromFile,
  generateRandomPositions,
  type KeyPosition,
  type BookCipherOptions,
} from './book-cipher';

// 加密常量
export const ENCRYPTION_CONSTANTS = {
  // 书密码最小字符数
  MIN_BOOK_CHARS: 1000,

  // 密钥位置数量
  KEY_POSITION_COUNT: 32,

  // 最大页码
  MAX_PAGE: 1000,

  // 最大行号
  MAX_LINE: 100,

  // 最大列号
  MAX_COLUMN: 80,
} as const;

/**
 * 加密工具类
 */
export class EncryptionUtils {
  /**
   * 生成随机字符串
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成 UUID
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 哈希字符串（SHA-256）
   */
  static async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Base64 编码
   */
  static toBase64(input: string): string {
    return btoa(input);
  }

  /**
   * Base64 解码
   */
  static fromBase64(input: string): string {
    return atob(input);
  }
}
