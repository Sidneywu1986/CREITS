/**
 * IndexedDB 封装
 *
 * 用于存储用户凭证、书本文件和其他加密相关数据
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * 数据库 Schema
 */
interface REITsBBSDB extends DBSchema {
  // 用户凭证存储
  userCredentials: {
    key: string; // userId
    value: {
      userId: string;
      publicKey: string;
      secretKey: string;
      anonymousId: string;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-anonymous-id': string };
  };

  // 书本文件存储
  books: {
    key: string; // bookId
    value: {
      bookId: string;
      name: string;
      content: string;
      size: number;
      uploadedAt: number;
      fingerprint: string;
    };
    indexes: { 'by-fingerprint': string };
  };

  // 密钥位置存储
  keyPositions: {
    key: string; // positionId
    value: {
      positionId: string;
      userId: string;
      bookId: string;
      positions: Array<{ page: number; line: number; column: number }>;
      createdAt: number;
    };
    indexes: { 'by-user': string; 'by-book': string };
  };

  // 缓存存储
  cache: {
    key: string; // cacheKey
    value: {
      key: string;
      value: any;
      expiresAt: number;
      createdAt: number;
    };
    indexes: { 'by-expires': number };
  };
}

/**
 * 数据库名称
 */
const DB_NAME = 'REITs-BBS-DB';
const DB_VERSION = 1;

/**
 * IndexedDB 管理器
 */
export class IndexedDBManager {
  private db: IDBPDatabase<REITsBBSDB> | null = null;
  private isInitialized = false;

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDB<REITsBBSDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // 用户凭证存储
          if (!db.objectStoreNames.contains('userCredentials')) {
            const userStore = db.createObjectStore('userCredentials', {
              keyPath: 'userId',
            });
            userStore.createIndex('by-anonymous-id', 'anonymousId', {
              unique: true,
            });
          }

          // 书本文件存储
          if (!db.objectStoreNames.contains('books')) {
            const bookStore = db.createObjectStore('books', {
              keyPath: 'bookId',
            });
            bookStore.createIndex('by-fingerprint', 'fingerprint', {
              unique: false,
            });
          }

          // 密钥位置存储
          if (!db.objectStoreNames.contains('keyPositions')) {
            const positionStore = db.createObjectStore('keyPositions', {
              keyPath: 'positionId',
            });
            positionStore.createIndex('by-user', 'userId', {
              unique: false,
            });
            positionStore.createIndex('by-book', 'bookId', {
              unique: false,
            });
          }

          // 缓存存储
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', {
              keyPath: 'key',
            });
            cacheStore.createIndex('by-expires', 'expiresAt', {
              unique: false,
            });
          }
        },
      });

      this.isInitialized = true;
      console.log('[IndexedDB] Database initialized');
    } catch (error) {
      console.error('[IndexedDB] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * 保存用户凭证
   */
  async saveUserCredentials(credential: {
    userId: string;
    publicKey: string;
    secretKey: string;
    anonymousId: string;
  }): Promise<void> {
    await this.ensureInitialized();

    const now = Date.now();
    const data = {
      ...credential,
      createdAt: now,
      updatedAt: now,
    };

    await this.db!.put('userCredentials', data);
    console.log('[IndexedDB] User credentials saved:', credential.userId);
  }

  /**
   * 获取用户凭证
   */
  async getUserCredentials(userId: string): Promise<{
    userId: string;
    publicKey: string;
    secretKey: string;
    anonymousId: string;
  } | null> {
    await this.ensureInitialized();

    const credential = await this.db!.get('userCredentials', userId);
    return credential || null;
  }

  /**
   * 根据匿名ID获取用户凭证
   */
  async getUserCredentialsByAnonymousId(
    anonymousId: string
  ): Promise<{
    userId: string;
    publicKey: string;
    secretKey: string;
    anonymousId: string;
  } | null> {
    await this.ensureInitialized();

    const credential = await this.db!
      .getFromIndex('userCredentials', 'by-anonymous-id', anonymousId);
    return credential || null;
  }

  /**
   * 保存书本文件
   */
  async saveBook(book: {
    bookId: string;
    name: string;
    content: string;
    size: number;
    fingerprint: string;
  }): Promise<void> {
    await this.ensureInitialized();

    const data = {
      ...book,
      uploadedAt: Date.now(),
    };

    await this.db!.put('books', data);
    console.log('[IndexedDB] Book saved:', book.bookId);
  }

  /**
   * 获取书本文件
   */
  async getBook(bookId: string): Promise<{
    bookId: string;
    name: string;
    content: string;
    size: number;
    fingerprint: string;
  } | null> {
    await this.ensureInitialized();

    const book = await this.db!.get('books', bookId);
    return book || null;
  }

  /**
   * 获取所有书本文件
   */
  async getAllBooks(): Promise<
    Array<{
      bookId: string;
      name: string;
      content: string;
      size: number;
      fingerprint: string;
    }>
  > {
    await this.ensureInitialized();

    return await this.db!.getAll('books');
  }

  /**
   * 删除书本文件
   */
  async deleteBook(bookId: string): Promise<void> {
    await this.ensureInitialized();

    await this.db!.delete('books', bookId);
    console.log('[IndexedDB] Book deleted:', bookId);
  }

  /**
   * 保存密钥位置
   */
  async saveKeyPosition(position: {
    positionId: string;
    userId: string;
    bookId: string;
    positions: Array<{ page: number; line: number; column: number }>;
  }): Promise<void> {
    await this.ensureInitialized();

    const data = {
      ...position,
      createdAt: Date.now(),
    };

    await this.db!.put('keyPositions', data);
    console.log('[IndexedDB] Key position saved:', position.positionId);
  }

  /**
   * 获取密钥位置
   */
  async getKeyPosition(positionId: string): Promise<{
    positionId: string;
    userId: string;
    bookId: string;
    positions: Array<{ page: number; line: number; column: number }>;
  } | null> {
    await this.ensureInitialized();

    const position = await this.db!.get('keyPositions', positionId);
    return position || null;
  }

  /**
   * 获取用户的所有密钥位置
   */
  async getUserKeyPositions(userId: string): Promise<
    Array<{
      positionId: string;
      userId: string;
      bookId: string;
      positions: Array<{ page: number; line: number; column: number }>;
    }>
  > {
    await this.ensureInitialized();

    return await this.db!.getAllFromIndex('keyPositions', 'by-user', userId);
  }

  /**
   * 缓存数据
   */
  async setCache(key: string, value: any, ttl: number = 3600000): Promise<void> {
    await this.ensureInitialized();

    const now = Date.now();
    const data = {
      key,
      value,
      expiresAt: now + ttl,
      createdAt: now,
    };

    await this.db!.put('cache', data);
  }

  /**
   * 获取缓存数据
   */
  async getCache<T = any>(key: string): Promise<T | null> {
    await this.ensureInitialized();

    const cache = await this.db!.get('cache', key);

    if (!cache) return null;

    // 检查是否过期
    if (Date.now() > cache.expiresAt) {
      await this.db!.delete('cache', key);
      return null;
    }

    return cache.value as T;
  }

  /**
   * 删除缓存
   */
  async deleteCache(key: string): Promise<void> {
    await this.ensureInitialized();

    await this.db!.delete('cache', key);
  }

  /**
   * 清理过期缓存
   */
  async cleanExpiredCache(): Promise<void> {
    await this.ensureInitialized();

    const now = Date.now();
    const tx = this.db!.transaction('cache', 'readwrite');
    const index = tx.store.index('by-expires');

    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
    console.log('[IndexedDB] Expired cache cleaned');
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('[IndexedDB] Database closed');
    }
  }

  /**
   * 清空数据库
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    const tx = this.db!.transaction(
      ['userCredentials', 'books', 'keyPositions', 'cache'],
      'readwrite'
    );

    await Promise.all([
      tx.objectStore('userCredentials').clear(),
      tx.objectStore('books').clear(),
      tx.objectStore('keyPositions').clear(),
      tx.objectStore('cache').clear(),
    ]);

    await tx.done;
    console.log('[IndexedDB] Database cleared');
  }
}

/**
 * 单例实例
 */
let dbInstance: IndexedDBManager | null = null;

/**
 * 获取 IndexedDB 管理器实例
 */
export async function getIndexedDB(): Promise<IndexedDBManager> {
  if (!dbInstance) {
    dbInstance = new IndexedDBManager();
  }

  if (!dbInstance['isInitialized']) {
    await dbInstance.init();
  }

  return dbInstance;
}

/**
 * 重置实例（用于测试）
 */
export function resetIndexedDBInstance(): void {
  dbInstance = null;
}
