/**
 * DataEncryptionService - 数据加密分级存储服务
 *
 * 功能：
 * 1. 实现三级存储策略（public明文、internal加密、敏感数据脱敏）
 * 2. 为不同的数据类型应用不同的加密策略
 * 3. 提供加密、解密、脱敏功能
 */

import * as crypto from 'crypto';

/**
 * 数据敏感度级别
 */
export enum DataSensitivity {
  PUBLIC = 'public',      // 公开数据：明文存储
  INTERNAL = 'internal',  // 内部数据：加密存储
  SENSITIVE = 'sensitive' // 敏感数据：加密存储 + 脱敏显示
}

/**
 * 数据类型
 */
export enum DataType {
  USER_IDENTIFY = 'user_identify',      // 用户身份信息（姓名、身份证等）
  USER_CONTACT = 'user_contact',        // 用户联系信息（电话、邮箱等）
  USER_BEHAVIOR = 'user_behavior',      // 用户行为数据
  FINANCIAL = 'financial',              // 财务数据
  PREDICTION = 'prediction',            // 预测数据
  KNOWLEDGE_GRAPH = 'knowledge_graph',  // 知识图谱数据
  POLICY_DATA = 'policy_data',          // 政策数据
  NEWS_DATA = 'news_data',              // 新闻数据
  MARKET_DATA = 'market_data',          // 市场数据
  SYSTEM_CONFIG = 'system_config'       // 系统配置
}

/**
 * 加密结果
 */
export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  algorithm: string;
}

/**
 * 脱敏结果
 */
export interface MaskedResult {
  maskedData: string;
  originalData: string;
  sensitivity: DataSensitivity;
}

/**
 * DataEncryptionService类
 */
export class DataEncryptionService {
  private static instance: DataEncryptionService;
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  private constructor() {
    // 从环境变量获取加密密钥，如果没有则使用默认密钥（仅用于开发环境）
    const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.key = Buffer.from(secretKey, 'hex').slice(0, 32);

    if (this.key.length !== 32) {
      throw new Error('加密密钥必须为32字节（256位）');
    }
  }

  static getInstance(): DataEncryptionService {
    if (!DataEncryptionService.instance) {
      DataEncryptionService.instance = new DataEncryptionService();
    }
    return DataEncryptionService.instance;
  }

  /**
   * 判断数据敏感度
   */
  determineSensitivity(dataType: DataType, context?: any): DataSensitivity {
    // 用户身份和联系信息：敏感
    if (
      dataType === DataType.USER_IDENTIFY ||
      dataType === DataType.USER_CONTACT
    ) {
      return DataSensitivity.SENSITIVE;
    }

    // 用户行为和财务数据：内部
    if (
      dataType === DataType.USER_BEHAVIOR ||
      dataType === DataType.FINANCIAL
    ) {
      return DataSensitivity.INTERNAL;
    }

    // 知识图谱、政策、新闻、市场数据：公开
    if (
      dataType === DataType.KNOWLEDGE_GRAPH ||
      dataType === DataType.POLICY_DATA ||
      dataType === DataType.NEWS_DATA ||
      dataType === DataType.MARKET_DATA
    ) {
      return DataSensitivity.PUBLIC;
    }

    // 预测数据：根据置信度判断
    if (dataType === DataType.PREDICTION) {
      // 如果预测涉及用户特定的投资建议，标记为内部
      if (context?.userId) {
        return DataSensitivity.INTERNAL;
      }
      return DataSensitivity.PUBLIC;
    }

    // 系统配置：内部
    if (dataType === DataType.SYSTEM_CONFIG) {
      return DataSensitivity.INTERNAL;
    }

    return DataSensitivity.PUBLIC;
  }

  /**
   * 加密数据
   */
  encrypt(data: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // 使用类型断言访问 getAuthTag 方法
      const authTag = (cipher as any).getAuthTag();

      // 组合 IV、加密数据和认证标签
      const encryptedData = `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;

      return {
        encryptedData,
        iv: iv.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      console.error('[DataEncryption] 加密失败:', error);
      throw error;
    }
  }

  /**
   * 解密数据
   */
  decrypt(encryptedData: string): string {
    try {
      // 分离 IV、加密数据和认证标签
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('加密数据格式错误');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const authTag = Buffer.from(parts[2], 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      // 使用类型断言访问 setAuthTag 方法
      (decipher as any).setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('[DataEncryption] 解密失败:', error);
      throw error;
    }
  }

  /**
   * 脱敏数据
   */
  mask(data: string, dataType: DataType, sensitivity: DataSensitivity): MaskedResult {
    // 公开数据不需要脱敏
    if (sensitivity === DataSensitivity.PUBLIC) {
      return {
        maskedData: data,
        originalData: data,
        sensitivity
      };
    }

    // 根据数据类型选择脱敏策略
    switch (dataType) {
      case DataType.USER_IDENTIFY:
        return this.maskIdentity(data, sensitivity);
      case DataType.USER_CONTACT:
        return this.maskContact(data, sensitivity);
      case DataType.USER_BEHAVIOR:
        return this.maskBehavior(data, sensitivity);
      case DataType.FINANCIAL:
        return this.maskFinancial(data, sensitivity);
      default:
        return this.maskDefault(data, sensitivity);
    }
  }

  /**
   * 脱敏身份信息
   */
  private maskIdentity(data: string, sensitivity: DataSensitivity): MaskedResult {
    // 姓名脱敏：保留首字，其余用*代替
    if (data.length <= 1) {
      return {
        maskedData: '*',
        originalData: data,
        sensitivity
      };
    }

    const masked = data[0] + '*'.repeat(data.length - 1);

    return {
      maskedData: masked,
      originalData: data,
      sensitivity
    };
  }

  /**
   * 脱敏联系信息
   */
  private maskContact(data: string, sensitivity: DataSensitivity): MaskedResult {
    // 电话号码脱敏：保留前3位和后4位
    if (data.length >= 7) {
      const masked = data.substring(0, 3) + '****' + data.substring(data.length - 4);
      return {
        maskedData: masked,
        originalData: data,
        sensitivity
      };
    }

    // 邮箱脱敏：保留首字符和@后域名
    if (data.includes('@')) {
      const [local, domain] = data.split('@');
      const masked = local[0] + '***@' + domain;
      return {
        maskedData: masked,
        originalData: data,
        sensitivity
      };
    }

    return this.maskDefault(data, sensitivity);
  }

  /**
   * 脱敏行为数据
   */
  private maskBehavior(data: string, sensitivity: DataSensitivity): MaskedResult {
    // 行为数据：仅显示前20%和后20%
    const length = data.length;
    const visibleLength = Math.ceil(length * 0.2);

    if (length <= 10) {
      return this.maskDefault(data, sensitivity);
    }

    const masked =
      data.substring(0, visibleLength) +
      '...' +
      data.substring(length - visibleLength);

    return {
      maskedData: masked,
      originalData: data,
      sensitivity
    };
  }

  /**
   * 脱敏财务数据
   */
  private maskFinancial(data: string, sensitivity: DataSensitivity): MaskedResult {
    // 财务数据：隐藏具体数值，仅显示范围
    const num = parseFloat(data);

    if (isNaN(num)) {
      return this.maskDefault(data, sensitivity);
    }

    const range = this.getNumberRange(num);
    return {
      maskedData: range,
      originalData: data,
      sensitivity
    };
  }

  /**
   * 获取数值范围
   */
  private getNumberRange(num: number): string {
    if (num < 1000) return '1k以下';
    if (num < 10000) return '1k-10k';
    if (num < 100000) return '10k-100k';
    if (num < 1000000) return '100k-1M';
    if (num < 10000000) return '1M-10M';
    return '10M以上';
  }

  /**
   * 默认脱敏
   */
  private maskDefault(data: string, sensitivity: DataSensitivity): MaskedResult {
    const masked = '*'.repeat(data.length);

    return {
      maskedData: masked,
      originalData: data,
      sensitivity
    };
  }

  /**
   * 加密对象中的敏感字段
   */
  encryptObject(obj: any, sensitivityMap: { [key: string]: DataSensitivity }): any {
    const encrypted = { ...obj };

    for (const [field, sensitivity] of Object.entries(sensitivityMap)) {
      if (sensitivity !== DataSensitivity.PUBLIC && encrypted[field]) {
        const value = typeof encrypted[field] === 'string'
          ? encrypted[field]
          : JSON.stringify(encrypted[field]);

        encrypted[field] = this.encrypt(value).encryptedData;
      }
    }

    return encrypted;
  }

  /**
   * 解密对象中的敏感字段
   */
  decryptObject(obj: any, sensitivityMap: { [key: string]: DataSensitivity }): any {
    const decrypted = { ...obj };

    for (const [field, sensitivity] of Object.entries(sensitivityMap)) {
      if (sensitivity !== DataSensitivity.PUBLIC && decrypted[field]) {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch (error) {
          console.error(`[DataEncryption] 解密字段 ${field} 失败:`, error);
        }
      }
    }

    return decrypted;
  }

  /**
   * 脱敏对象中的敏感字段
   */
  maskObject(
    obj: any,
    sensitivityMap: { [key: string]: { sensitivity: DataSensitivity; dataType: DataType } }
  ): any {
    const masked = { ...obj };

    for (const [field, config] of Object.entries(sensitivityMap)) {
      if (masked[field]) {
        const value = typeof masked[field] === 'string'
          ? masked[field]
          : JSON.stringify(masked[field]);

        const result = this.mask(value, config.dataType, config.sensitivity);
        masked[field] = result.maskedData;
      }
    }

    return masked;
  }

  /**
   * 存储数据（根据敏感度自动选择存储方式）
   */
  async storeData(
    data: string,
    dataType: DataType,
    context?: any
  ): Promise<{ storedData: string; sensitivity: DataSensitivity }> {
    const sensitivity = this.determineSensitivity(dataType, context);

    if (sensitivity === DataSensitivity.PUBLIC) {
      // 公开数据：直接存储
      return {
        storedData: data,
        sensitivity
      };
    } else {
      // 内部和敏感数据：加密存储
      const encrypted = this.encrypt(data);
      return {
        storedData: encrypted.encryptedData,
        sensitivity
      };
    }
  }

  /**
   * 读取数据（自动解密和脱敏）
   */
  async readData(
    data: string,
    dataType: DataType,
    sensitivity: DataSensitivity,
    showOriginal: boolean = false
  ): Promise<string> {
    if (sensitivity === DataSensitivity.PUBLIC) {
      // 公开数据：直接返回
      return data;
    }

    if (showOriginal) {
      // 显示原始数据：解密返回
      return this.decrypt(data);
    }

    // 隐藏原始数据：解密后脱敏返回
    const decrypted = this.decrypt(data);
    const masked = this.mask(decrypted, dataType, sensitivity);
    return masked.maskedData;
  }

  /**
   * 生成加密密钥
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 验证加密密钥格式
   */
  static validateEncryptionKey(key: string): boolean {
    try {
      const buffer = Buffer.from(key, 'hex');
      return buffer.length === 32;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const dataEncryptionService = DataEncryptionService.getInstance();

/**
 * 数据敏感度映射配置
 */
export const DATA_SENSITIVITY_CONFIG: {
  [key in DataType]: {
    defaultSensitivity: DataSensitivity;
    encryptionRequired: boolean;
    maskingRequired: boolean;
  };
} = {
  [DataType.USER_IDENTIFY]: {
    defaultSensitivity: DataSensitivity.SENSITIVE,
    encryptionRequired: true,
    maskingRequired: true
  },
  [DataType.USER_CONTACT]: {
    defaultSensitivity: DataSensitivity.SENSITIVE,
    encryptionRequired: true,
    maskingRequired: true
  },
  [DataType.USER_BEHAVIOR]: {
    defaultSensitivity: DataSensitivity.INTERNAL,
    encryptionRequired: true,
    maskingRequired: false
  },
  [DataType.FINANCIAL]: {
    defaultSensitivity: DataSensitivity.INTERNAL,
    encryptionRequired: true,
    maskingRequired: false
  },
  [DataType.PREDICTION]: {
    defaultSensitivity: DataSensitivity.PUBLIC,
    encryptionRequired: false,
    maskingRequired: false
  },
  [DataType.KNOWLEDGE_GRAPH]: {
    defaultSensitivity: DataSensitivity.PUBLIC,
    encryptionRequired: false,
    maskingRequired: false
  },
  [DataType.POLICY_DATA]: {
    defaultSensitivity: DataSensitivity.PUBLIC,
    encryptionRequired: false,
    maskingRequired: false
  },
  [DataType.NEWS_DATA]: {
    defaultSensitivity: DataSensitivity.PUBLIC,
    encryptionRequired: false,
    maskingRequired: false
  },
  [DataType.MARKET_DATA]: {
    defaultSensitivity: DataSensitivity.PUBLIC,
    encryptionRequired: false,
    maskingRequired: false
  },
  [DataType.SYSTEM_CONFIG]: {
    defaultSensitivity: DataSensitivity.INTERNAL,
    encryptionRequired: true,
    maskingRequired: false
  }
};
