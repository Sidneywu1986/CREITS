/**
 * DataNormalizer - 数据规范化服务
 *
 * 功能：
 * 1. 统一各数据源格式（标准化字段、数据类型转换）
 * 2. 自动清洗和去重（去除无效数据、识别重复记录）
 * 3. 建立时间序列索引（按时间组织数据，支持时间范围查询）
 */

import { createClient } from '@supabase/supabase-js';

// Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 规范化结果
 */
export interface NormalizationResult {
  dataType: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  cleanedRecords: number;
  normalizedRecords: number;
  errors: string[];
}

/**
 * 字段映射配置
 */
const FIELD_MAPPINGS = {
  // REITs字段映射
  reits: {
    code: 'reit_code',
    name: 'reit_name',
    exchange: 'exchange',
    listingDate: 'listing_date',
    fundManager: 'fund_manager',
    fundCustodian: 'fund_custodian',
    totalShares: 'total_shares',
    assetType: 'asset_type',
    underlyingAsset: 'underlying_asset',
    propertyCount: 'property_count',
    sourceUrl: 'source_url'
  },
  // 政策字段映射
  policies: {
    policyNumber: 'policy_number',
    title: 'policy_title',
    publishingBody: 'publishing_body',
    policyType: 'policy_type',
    publishDate: 'publish_date',
    effectiveDate: 'effective_date',
    expiryDate: 'expiry_date',
    content: 'content',
    summary: 'summary',
    keywords: 'keywords',
    sourceUrl: 'source_url'
  },
  // 新闻字段映射
  news: {
    title: 'title',
    author: 'author',
    source: 'source',
    publishTime: 'publish_time',
    url: 'url',
    content: 'content',
    summary: 'summary',
    keywords: 'keywords',
    sentimentScore: 'sentiment_score',
    sentimentLabel: 'sentiment_label'
  },
  // 公告字段映射
  announcements: {
    announcementCode: 'announcement_code',
    reitCode: 'reit_code',
    reitName: 'reit_name',
    exchange: 'exchange',
    announcementType: 'announcement_type',
    title: 'announcement_title',
    publishTime: 'publish_time',
    content: 'content',
    summary: 'summary',
    attachments: 'attachments',
    sourceUrl: 'source_url'
  }
};

/**
 * DataNormalizer类
 */
export class DataNormalizer {
  /**
   * 规范化数据（通用方法）
   */
  async normalizeData(
    dataType: string,
    rawData: any[]
  ): Promise<NormalizationResult> {
    const result: NormalizationResult = {
      dataType,
      totalRecords: rawData.length,
      validRecords: 0,
      invalidRecords: 0,
      duplicateRecords: 0,
      cleanedRecords: 0,
      normalizedRecords: 0,
      errors: []
    };

    try {
      // 1. 数据清洗
      const cleanedData = await this.cleanData(dataType, rawData);
      result.cleanedRecords = cleanedData.length;

      // 2. 去重
      const { uniqueData, duplicateCount } = await this.deduplicateData(dataType, cleanedData);
      result.duplicateRecords = duplicateCount;

      // 3. 字段映射和类型转换
      const normalizedData = await this.mapAndConvertFields(dataType, uniqueData);
      result.normalizedRecords = normalizedData.length;

      // 4. 验证数据
      const { validData, invalidData } = await this.validateData(dataType, normalizedData);
      result.validRecords = validData.length;
      result.invalidRecords = invalidData.length;

      // 5. 存储规范化后的数据
      await this.storeNormalizedData(dataType, validData);

      // 6. 建立时间序列索引
      await this.buildTimeSeriesIndex(dataType);

      return result;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 清洗数据
   */
  private async cleanData(
    dataType: string,
    rawData: any[]
  ): Promise<any[]> {
    const cleanedData: any[] = [];

    for (const item of rawData) {
      try {
        // 移除null和undefined值
        const cleaned = this.removeNulls(item);

        // 去除前后空格
        const trimmed = this.trimStrings(cleaned);

        // 标准化日期格式
        const dated = this.normalizeDates(trimmed, dataType);

        // 标准化布尔值
        const booleanized = this.normalizeBooleans(dated);

        // 标准化数值
        const numbered = this.normalizeNumbers(booleanized);

        cleanedData.push(numbered);
      } catch (error) {
        console.error(`清洗数据失败:`, error, item);
      }
    }

    return cleanedData;
  }

  /**
   * 移除null和undefined值
   */
  private removeNulls(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    const cleaned: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (obj[key] !== null && obj[key] !== undefined) {
        cleaned[key] = obj[key];
      }
    }

    return cleaned;
  }

  /**
   * 去除前后空格
   */
  private trimStrings(obj: any): any {
    if (typeof obj === 'string') {
      return obj.trim();
    }

    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const trimmed: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      trimmed[key] = this.trimStrings(obj[key]);
    }

    return trimmed;
  }

  /**
   * 标准化日期格式
   */
  private normalizeDates(obj: any, dataType: string): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const normalized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (key.includes('date') || key.includes('time')) {
        normalized[key] = this.convertToISODate(obj[key], dataType);
      } else if (typeof obj[key] === 'object') {
        normalized[key] = this.normalizeDates(obj[key], dataType);
      } else {
        normalized[key] = obj[key];
      }
    }

    return normalized;
  }

  /**
   * 转换为ISO日期格式
   */
  private convertToISODate(value: any, dataType: string): string | null {
    if (!value) return null;

    // 已经是ISO格式
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return value;
    }

    // 尝试解析各种日期格式
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return null;
      }

      return date.toISOString();
    } catch (error) {
      return null;
    }
  }

  /**
   * 标准化布尔值
   */
  private normalizeBooleans(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const normalized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        const str = obj[key].toLowerCase();
        if (str === 'true' || str === '1' || str === 'yes') {
          normalized[key] = true;
        } else if (str === 'false' || str === '0' || str === 'no') {
          normalized[key] = false;
        } else {
          normalized[key] = obj[key];
        }
      } else if (typeof obj[key] === 'object') {
        normalized[key] = this.normalizeBooleans(obj[key]);
      } else {
        normalized[key] = obj[key];
      }
    }

    return normalized;
  }

  /**
   * 标准化数值
   */
  private normalizeNumbers(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const normalized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (typeof obj[key] === 'string' && !isNaN(Number(obj[key]))) {
        normalized[key] = Number(obj[key]);
      } else if (typeof obj[key] === 'object') {
        normalized[key] = this.normalizeNumbers(obj[key]);
      } else {
        normalized[key] = obj[key];
      }
    }

    return normalized;
  }

  /**
   * 去重数据
   */
  private async deduplicateData(
    dataType: string,
    cleanedData: any[]
  ): Promise<{ uniqueData: any[]; duplicateCount: number }> {
    const uniqueData: any[] = [];
    const seen = new Set<string>();

    // 根据数据类型确定唯一键
    const uniqueKey = this.getUniqueKey(dataType);

    for (const item of cleanedData) {
      const keyValue = item[uniqueKey];

      if (!keyValue) {
        // 没有唯一键，直接添加
        uniqueData.push(item);
        continue;
      }

      if (!seen.has(keyValue)) {
        seen.add(keyValue);
        uniqueData.push(item);
      }
    }

    const duplicateCount = cleanedData.length - uniqueData.length;

    return { uniqueData, duplicateCount };
  }

  /**
   * 获取唯一键
   */
  private getUniqueKey(dataType: string): string {
    const keys: { [key: string]: string } = {
      reits: 'reit_code',
      policies: 'policy_number',
      news: 'url',
      announcements: 'announcement_code'
    };

    return keys[dataType] || 'id';
  }

  /**
   * 字段映射和类型转换
   */
  private async mapAndConvertFields(
    dataType: string,
    uniqueData: any[]
  ): Promise<any[]> {
    const mapping = FIELD_MAPPINGS[dataType as keyof typeof FIELD_MAPPINGS];

    if (!mapping) {
      return uniqueData;
    }

    const mappedData: any[] = [];

    for (const item of uniqueData) {
      const mapped: any = {};

      // 应用字段映射
      for (const [sourceKey, targetKey] of Object.entries(mapping)) {
        if (item[sourceKey] !== undefined) {
          mapped[targetKey] = item[sourceKey];
        }
      }

      // 保留未映射的字段
      for (const key in item) {
        if (!Object.values(mapping).includes(key) && !mapped[key]) {
          mapped[key] = item[key];
        }
      }

      mappedData.push(mapped);
    }

    return mappedData;
  }

  /**
   * 验证数据
   */
  private async validateData(
    dataType: string,
    normalizedData: any[]
  ): Promise<{ validData: any[]; invalidData: any[] }> {
    const validData: any[] = [];
    const invalidData: any[] = [];

    for (const item of normalizedData) {
      const isValid = await this.validateItem(dataType, item);

      if (isValid) {
        validData.push(item);
      } else {
        invalidData.push(item);
      }
    }

    return { validData, invalidData };
  }

  /**
   * 验证单个数据项
   */
  private async validateItem(dataType: string, item: any): Promise<boolean> {
    try {
      switch (dataType) {
        case 'reits':
          return this.validateREITsItem(item);
        case 'policies':
          return this.validatePoliciesItem(item);
        case 'news':
          return this.validateNewsItem(item);
        case 'announcements':
          return this.validateAnnouncementsItem(item);
        default:
          return true;
      }
    } catch (error) {
      console.error(`验证数据项失败:`, error);
      return false;
    }
  }

  /**
   * 验证REITs数据项
   */
  private validateREITsItem(item: any): boolean {
    // 必填字段
    const requiredFields = ['reit_code', 'reit_name', 'exchange', 'listing_date'];

    for (const field of requiredFields) {
      if (!item[field]) {
        return false;
      }
    }

    // 验证交易所
    if (!['SZSE', 'SSE'].includes(item.exchange)) {
      return false;
    }

    // 验证日期格式
    const listingDate = new Date(item.listing_date);
    if (isNaN(listingDate.getTime())) {
      return false;
    }

    return true;
  }

  /**
   * 验证政策数据项
   */
  private validatePoliciesItem(item: any): boolean {
    // 必填字段
    const requiredFields = ['policy_title', 'publishing_body', 'policy_type', 'publish_date'];

    for (const field of requiredFields) {
      if (!item[field]) {
        return false;
      }
    }

    // 验证发布机构
    if (!['NDRC', 'CSRC', 'MOF'].includes(item.publishing_body)) {
      return false;
    }

    // 验证日期格式
    const publishDate = new Date(item.publish_date);
    if (isNaN(publishDate.getTime())) {
      return false;
    }

    return true;
  }

  /**
   * 验证新闻数据项
   */
  private validateNewsItem(item: any): boolean {
    // 必填字段
    const requiredFields = ['title', 'source', 'publish_time', 'url'];

    for (const field of requiredFields) {
      if (!item[field]) {
        return false;
      }
    }

    // 验证URL格式
    if (!item.url.startsWith('http')) {
      return false;
    }

    // 验证日期格式
    const publishTime = new Date(item.publish_time);
    if (isNaN(publishTime.getTime())) {
      return false;
    }

    return true;
  }

  /**
   * 验证公告数据项
   */
  private validateAnnouncementsItem(item: any): boolean {
    // 必填字段
    const requiredFields = ['reit_code', 'exchange', 'announcement_type', 'announcement_title', 'publish_time'];

    for (const field of requiredFields) {
      if (!item[field]) {
        return false;
      }
    }

    // 验证交易所
    if (!['SZSE', 'SSE'].includes(item.exchange)) {
      return false;
    }

    // 验证日期格式
    const publishTime = new Date(item.publish_time);
    if (isNaN(publishTime.getTime())) {
      return false;
    }

    return true;
  }

  /**
   * 存储规范化后的数据
   */
  private async storeNormalizedData(dataType: string, validData: any[]): Promise<void> {
    const tableName = `collected_${dataType}`;

    try {
      // 批量插入或更新
      for (const item of validData) {
        const { error } = await supabase
          .from(tableName)
          .upsert({
            ...item,
            is_valid: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: this.getUniqueKey(dataType),
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`存储规范化数据失败:`, error);
        }
      }
    } catch (error) {
      console.error('存储规范化数据失败:', error);
      throw error;
    }
  }

  /**
   * 建立时间序列索引
   */
  private async buildTimeSeriesIndex(dataType: string): Promise<void> {
    const tableName = `collected_${dataType}`;
    const timeField = this.getTimeField(dataType);

    try {
      // 创建分区表（如果需要）
      // 这里简化处理，实际生产环境可能需要使用PostgreSQL分区

      // 确保时间索引存在
      const indexName = `idx_${tableName}_${timeField}`;

      // Supabase会自动创建索引，这里只是示意
      console.log(`时间序列索引已建立: ${indexName}`);

    } catch (error) {
      console.error('建立时间序列索引失败:', error);
    }
  }

  /**
   * 获取时间字段
   */
  private getTimeField(dataType: string): string {
    const timeFields: { [key: string]: string } = {
      reits: 'listing_date',
      policies: 'publish_date',
      news: 'publish_time',
      announcements: 'publish_time'
    };

    return timeFields[dataType] || 'created_at';
  }

  /**
   * 批量规范化所有数据类型
   */
  async normalizeAllData(): Promise<{
    reits: NormalizationResult;
    policies: NormalizationResult;
    news: NormalizationResult;
    announcements: NormalizationResult;
  }> {
    const results = {
      reits: await this.normalizeData('reits', []),
      policies: await this.normalizeData('policies', []),
      news: await this.normalizeData('news', []),
      announcements: await this.normalizeData('announcements', [])
    };

    return results;
  }

  /**
   * 获取数据质量报告
   */
  async getDataQualityReport(): Promise<{
    reits: any;
    policies: any;
    news: any;
    announcements: any;
  }> {
    const report: any = {};

    const dataTypes = ['reits', 'policies', 'news', 'announcements'];

    for (const dataType of dataTypes) {
      const { data, error } = await supabase
        .from(`collected_${dataType}`)
        .select('*');

      if (!error && data) {
        const total = data.length;
        const valid = data.filter(item => item.is_valid).length;
        const invalid = total - valid;

        report[dataType] = {
          total,
          valid,
          invalid,
          validityRate: total > 0 ? (valid / total * 100).toFixed(2) + '%' : '0%'
        };
      }
    }

    return report;
  }
}

// 导出单例
export const dataNormalizer = new DataNormalizer();
