/**
 * 书密码加密系统
 *
 * 使用 Web Crypto API 实现基于书籍内容的加密方案
 * 原理：
 * 1. 用户上传一本书（txt/pdf文件）
 * 2. 从书中提取足够多的字符作为密钥源
 * 3. 使用 (页码, 行号, 列号) 生成加密密钥
 * 4. 使用 AES-GCM 算法进行加密/解密
 */

export class BookCipher {
  private bookContent: string;
  private keyCache: Map<string, CryptoKey> = new Map();

  constructor(bookContent: string) {
    this.bookContent = bookContent;
  }

  /**
   * 从书的内容中提取字符序列作为密钥源
   * @param positions 位置数组 [{page, line, column}, ...]
   * @returns 提取的字符序列
   */
  private extractKeySource(positions: KeyPosition[]): string {
    const chars: string[] = [];

    for (const pos of positions) {
      // 模拟从书籍中提取字符（实际实现需要根据书籍格式解析）
      const charIndex = (pos.page * 1000 + pos.line * 50 + pos.column) % this.bookContent.length;
      const char = this.bookContent[charIndex] || 'A'; // 默认字符
      chars.push(char);
    }

    return chars.join('');
  }

  /**
   * 从提取的字符生成 AES 密钥
   * @param keySource 密钥源字符串
   * @returns CryptoKey
   */
  private async deriveKey(keySource: string): Promise<CryptoKey> {
    // 检查缓存
    if (this.keyCache.has(keySource)) {
      return this.keyCache.get(keySource)!;
    }

    // 使用 PBKDF2 派生密钥
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(keySource),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // 添加盐值（固定值，实际应用中应该随机）
    const salt = encoder.encode('REITs-BBS-BOOK-CIPHER-SALT');

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // 缓存密钥
    this.keyCache.set(keySource, key);

    return key;
  }

  /**
   * 加密数据
   * @param plaintext 明文
   * @param positions 密钥位置
   * @returns 加密结果（Base64编码）
   */
  async encrypt(plaintext: string, positions: KeyPosition[]): Promise<string> {
    const keySource = this.extractKeySource(positions);
    const key = await this.deriveKey(keySource);

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 加密
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    // 组合 IV 和密文
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // 转换为 Base64
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * 解密数据
   * @param ciphertext 密文（Base64编码）
   * @param positions 密钥位置
   * @returns 解密后的明文
   */
  async decrypt(ciphertext: string, positions: KeyPosition[]): Promise<string> {
    const keySource = this.extractKeySource(positions);
    const key = await this.deriveKey(keySource);

    // 解码 Base64
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

    // 分离 IV 和密文
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * 验证书籍内容是否足够加密
   * @param minChars 最小字符数
   * @returns 是否足够
   */
  isBookContentSufficient(minChars: number = 1000): boolean {
    return this.bookContent.length >= minChars;
  }

  /**
   * 清理密钥缓存
   */
  clearKeyCache(): void {
    this.keyCache.clear();
  }
}

/**
 * 密钥位置类型
 */
export interface KeyPosition {
  page: number;
  line: number;
  column: number;
}

/**
 * 书密码选项
 */
export interface BookCipherOptions {
  bookFile: File;
  positions: KeyPosition[];
}

/**
 * 从文件创建书密码实例
 */
export async function createBookCipherFromFile(file: File): Promise<BookCipher> {
  const text = await file.text();
  return new BookCipher(text);
}

/**
 * 生成随机密钥位置
 */
export function generateRandomPositions(count: number, maxPage: number, maxLine: number, maxColumn: number): KeyPosition[] {
  const positions: KeyPosition[] = [];

  for (let i = 0; i < count; i++) {
    positions.push({
      page: Math.floor(Math.random() * maxPage),
      line: Math.floor(Math.random() * maxLine),
      column: Math.floor(Math.random() * maxColumn),
    });
  }

  return positions;
}
