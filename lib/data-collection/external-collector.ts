/**
 * ExternalDataCollector - 外部数据采集服务
 *
 * 负责采集四类数据资产：
 * 1. REITs基础数据（深交所/上交所公募REITs平台）
 * 2. 政策文件（发改委/证监会官网）
 * 3. 财经新闻（国内新闻API）
 * 4. 交易所公告（深交所/上交所公告系统）
 */

import { createClient } from '@supabase/supabase-js';

// 配置
const CONFIG = {
  // REITs数据源
  REITS: {
    SZSE: {
      baseUrl: 'https://www.szse.cn/api/reit',
      listEndpoint: '/list',
      detailEndpoint: '/detail'
    },
    SSE: {
      baseUrl: 'https://www.sse.com.cn/api/reit',
      listEndpoint: '/list',
      detailEndpoint: '/detail'
    }
  },
  // 政策数据源
  POLICIES: {
    NDRC: {
      baseUrl: 'https://www.ndrc.gov.cn',
      listEndpoint: '/xxgk/zcfb',
      detailEndpoint: '/xxgk/zcfb/detail'
    },
    CSRC: {
      baseUrl: 'https://www.csrc.gov.cn',
      listEndpoint: '/pub/newsite/zjhxwfc',
      detailEndpoint: '/pub/newsite/zjhxwfc/detail'
    }
  },
  // 新闻数据源（示例API）
  NEWS: {
    // 使用Web Search技能获取新闻
    apiEndpoint: '/api/v1/web-search'
  },
  // 公告数据源
  ANNOUNCEMENTS: {
    SZSE: {
      baseUrl: 'https://www.szse.cn/api/disclosure',
      listEndpoint: '/announcement',
      detailEndpoint: '/detail'
    },
    SSE: {
      baseUrl: 'https://www.sse.com.cn/api/disclosure',
      listEndpoint: '/announcement',
      detailEndpoint: '/detail'
    }
  }
};

// 数据类型枚举
export enum DataType {
  REITS = 'reits',
  POLICIES = 'policies',
  NEWS = 'news',
  ANNOUNCEMENTS = 'announcements'
}

// 采集类型枚举
export enum CollectionType {
  FULL = 'full',           // 全量采集
  INCREMENTAL = 'incremental'  // 增量采集
}

// 采集结果
export interface CollectionResult {
  dataType: DataType;
  collectionType: CollectionType;
  startTime: Date;
  endTime: Date;
  status: 'running' | 'success' | 'failed';
  recordsCollected: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorMessage?: string;
  details?: any;
}

// Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ExternalDataCollector类
 */
export class ExternalDataCollector {
  private logId: string | null = null;

  /**
   * 启动数据采集
   */
  async startCollection(
    dataType: DataType,
    collectionType: CollectionType = CollectionType.INCREMENTAL
  ): Promise<CollectionResult> {
    const startTime = new Date();

    // 创建采集日志
    this.logId = await this.createCollectionLog(dataType, collectionType, startTime);

    try {
      let result: {
        collected: number;
        updated: number;
        failed: number;
      };

      // 根据数据类型执行采集
      switch (dataType) {
        case DataType.REITS:
          result = await this.collectREITs(collectionType);
          break;
        case DataType.POLICIES:
          result = await this.collectPolicies(collectionType);
          break;
        case DataType.NEWS:
          result = await this.collectNews(collectionType);
          break;
        case DataType.ANNOUNCEMENTS:
          result = await this.collectAnnouncements(collectionType);
          break;
        default:
          throw new Error(`未知的数据类型: ${dataType}`);
      }

      const endTime = new Date();
      const collectionResult: CollectionResult = {
        dataType,
        collectionType,
        startTime,
        endTime,
        status: 'success',
        recordsCollected: result.collected,
        recordsUpdated: result.updated,
        recordsFailed: result.failed,
        details: result
      };

      // 更新采集日志
      await this.updateCollectionLog(this.logId!, collectionResult);

      // 更新数据质量指标
      await this.updateDataQualityMetrics(dataType);

      return collectionResult;

    } catch (error) {
      const endTime = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);

      const collectionResult: CollectionResult = {
        dataType,
        collectionType,
        startTime,
        endTime,
        status: 'failed',
        recordsCollected: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errorMessage
      };

      // 更新采集日志
      await this.updateCollectionLog(this.logId!, collectionResult);

      throw error;
    }
  }

  /**
   * 采集REITs数据
   */
  private async collectREITs(
    collectionType: CollectionType
  ): Promise<{ collected: number; updated: number; failed: number }> {
    let collected = 0;
    let updated = 0;
    let failed = 0;

    try {
      // 模拟：从深交所和上交所获取REITs数据
      // 实际应用中需要调用真实的API接口

      // 深交所REITs（示例数据）
      const szseREITs = [
        {
          reit_code: '180101',
          reit_name: '首钢绿能',
          exchange: 'SZSE',
          listing_date: '2021-06-21',
          fund_manager: '中航基金',
          fund_custodian: '工商银行',
          total_shares: 10.0,
          asset_type: 'infrastructure',
          underlying_asset: '垃圾焚烧发电项目',
          property_count: 2,
          source_url: 'https://www.szse.cn/api/reit/180101'
        },
        {
          reit_code: '180102',
          reit_name: '蛇口产园',
          exchange: 'SZSE',
          listing_date: '2021-06-21',
          fund_manager: '博时基金',
          fund_custodian: '招商银行',
          total_shares: 9.0,
          asset_type: 'infrastructure',
          underlying_asset: '产业园项目',
          property_count: 4,
          source_url: 'https://www.szse.cn/api/reit/180102'
        }
      ];

      // 上交所REITs（示例数据）
      const sseREITs = [
        {
          reit_code: '508000',
          reit_name: '张江REIT',
          exchange: 'SSE',
          listing_date: '2021-06-21',
          fund_manager: '华安基金',
          fund_custodian: '建设银行',
          total_shares: 10.0,
          asset_type: 'park',
          underlying_asset: '高科技园区',
          property_count: 3,
          source_url: 'https://www.sse.com.cn/api/reit/508000'
        },
        {
          reit_code: '508001',
          reit_name: '浙江杭徽',
          exchange: 'SSE',
          listing_date: '2021-06-21',
          fund_manager: '平安基金',
          fund_custodian: '农业银行',
          total_shares: 5.0,
          asset_type: 'infrastructure',
          underlying_asset: '高速公路',
          property_count: 1,
          source_url: 'https://www.sse.com.cn/api/reit/508001'
        }
      ];

      const allREITs = [...szseREITs, ...sseREITs];

      // 存储到数据库
      for (const reit of allREITs) {
        try {
          const { error: upsertError } = await supabase
            .from('collected_reits')
            .upsert({
              ...reit,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'reit_code',
              ignoreDuplicates: false
            });

          if (upsertError) {
            failed++;
            console.error(`插入REITs失败 ${reit.reit_code}:`, upsertError);
          } else {
            collected++;
          }
        } catch (error) {
          failed++;
          console.error(`处理REITs失败 ${reit.reit_code}:`, error);
        }
      }

    } catch (error) {
      console.error('采集REITs数据失败:', error);
      throw error;
    }

    return { collected, updated, failed };
  }

  /**
   * 采集政策数据
   */
  private async collectPolicies(
    collectionType: CollectionType
  ): Promise<{ collected: number; updated: number; failed: number }> {
    let collected = 0;
    let updated = 0;
    let failed = 0;

    try {
      // 模拟：从发改委和证监会获取政策数据
      const policies = [
        {
          policy_number: '发改投资〔2021〕958号',
          policy_title: '关于进一步做好基础设施领域不动产投资信托基金试点工作的通知',
          publishing_body: 'NDRC',
          policy_type: 'notice',
          publish_date: '2021-07-02',
          effective_date: '2021-07-02',
          content: '为贯彻落实党中央、国务院关于深化投融资体制改革、降低企业杠杆率、防范化解金融风险的决策部署...',
          summary: '进一步推进REITs试点工作，扩大试点范围',
          keywords: ['REITs', '基础设施', '投资', '试点'],
          related_reits: ['180101', '180102', '508000', '508001'],
          impact_level: 'high',
          impact_description: '扩大试点范围，影响所有REITs项目',
          source_url: 'https://www.ndrc.gov.cn/xxgk/zcfb/202107/t20210702_1286381.html'
        },
        {
          policy_number: '证监会公告〔2021〕31号',
          policy_title: '公开募集基础设施证券投资基金指引（试行）',
          publishing_body: 'CSRC',
          policy_type: 'guideline',
          publish_date: '2021-01-29',
          effective_date: '2021-01-29',
          content: '为规范公开募集基础设施证券投资基金设立、运作等相关活动，保护投资者合法权益...',
          summary: 'REITs基金运作指引',
          keywords: ['REITs', '公募基金', '基础设施', '监管'],
          related_reits: ['180101', '180102', '508000', '508001'],
          impact_level: 'high',
          impact_description: '规范REITs基金运作',
          source_url: 'https://www.csrc.gov.cn/pub/newsite/zjhxwfc/202101/t20210129_391838.html'
        }
      ];

      // 存储到数据库
      for (const policy of policies) {
        try {
          const { error: upsertError } = await supabase
            .from('collected_policies')
            .upsert({
              ...policy,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'policy_number',
              ignoreDuplicates: false
            });

          if (upsertError) {
            failed++;
            console.error(`插入政策失败 ${policy.policy_number}:`, upsertError);
          } else {
            collected++;
          }
        } catch (error) {
          failed++;
          console.error(`处理政策失败 ${policy.policy_number}:`, error);
        }
      }

    } catch (error) {
      console.error('采集政策数据失败:', error);
      throw error;
    }

    return { collected, updated, failed };
  }

  /**
   * 采集新闻数据
   */
  private async collectNews(
    collectionType: CollectionType
  ): Promise<{ collected: number; updated: number; failed: number }> {
    let collected = 0;
    let updated = 0;
    let failed = 0;

    try {
      // 模拟：从新闻API获取数据
      // 实际应用中需要调用真实的新闻API或使用Web Search技能

      const news = [
        {
          title: '首钢绿能REITs表现优异 年化收益率达8.5%',
          author: '财新记者',
          source: 'caixin',
          publish_time: new Date().toISOString(),
          url: 'https://www.caixin.com/2024-01-15/reits-performance.html',
          content: '首钢绿能REITs自上市以来表现优异，截至2023年底年化收益率达8.5%...',
          summary: '首钢绿能REITs表现优异',
          keywords: ['首钢绿能', 'REITs', '收益率'],
          related_reits: ['180101'],
          related_stocks: ['000001'],
          sentiment_score: 0.8,
          sentiment_label: 'positive'
        },
        {
          title: 'REITs市场持续扩容 基础设施REITs试点范围扩大',
          author: '第一财经',
          source: 'yicai',
          publish_time: new Date().toISOString(),
          url: 'https://www.yicai.com/news/reits-expansion.html',
          content: '2023年REITs市场持续扩容，基础设施REITs试点范围进一步扩大...',
          summary: 'REITs市场扩容',
          keywords: ['REITs', '扩容', '基础设施'],
          related_reits: ['180101', '180102', '508000', '508001'],
          related_stocks: [],
          sentiment_score: 0.6,
          sentiment_label: 'positive'
        }
      ];

      // 存储到数据库
      for (const item of news) {
        try {
          const { error: upsertError } = await supabase
            .from('collected_news')
            .upsert({
              ...item,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'url',
              ignoreDuplicates: false
            });

          if (upsertError) {
            failed++;
            console.error(`插入新闻失败 ${item.url}:`, upsertError);
          } else {
            collected++;
          }
        } catch (error) {
          failed++;
          console.error(`处理新闻失败 ${item.url}:`, error);
        }
      }

    } catch (error) {
      console.error('采集新闻数据失败:', error);
      throw error;
    }

    return { collected, updated, failed };
  }

  /**
   * 采集公告数据
   */
  private async collectAnnouncements(
    collectionType: CollectionType
  ): Promise<{ collected: number; updated: number; failed: number }> {
    let collected = 0;
    let updated = 0;
    let failed = 0;

    try {
      // 模拟：从交易所公告系统获取数据
      const announcements = [
        {
          announcement_code: 'SZSE-2024-001',
          reit_code: '180101',
          reit_name: '首钢绿能',
          exchange: 'SZSE',
          announcement_type: 'dividend',
          announcement_title: '关于2023年度收益分配的公告',
          publish_time: new Date().toISOString(),
          content: '首钢绿能REITs基金2023年度收益分配方案：每10份基金份额分配现金红利0.50元...',
          summary: '2023年度收益分配公告',
          attachments: ['https://www.szse.cn/disclosure/announcement/180101/2024-001.pdf'],
          source_url: 'https://www.szse.cn/disclosure/announcement/2024-001.html'
        },
        {
          announcement_code: 'SSE-2024-001',
          reit_code: '508000',
          reit_name: '张江REIT',
          exchange: 'SSE',
          announcement_type: 'mkt_status',
          announcement_title: '关于基金份额持有人大会召开情况的公告',
          publish_time: new Date().toISOString(),
          content: '张江REIT基金份额持有人大会已于2024年1月15日召开...',
          summary: '持有人大会召开公告',
          attachments: ['https://www.sse.com.cn/disclosure/announcement/508000/2024-001.pdf'],
          source_url: 'https://www.sse.com.cn/disclosure/announcement/2024-001.html'
        }
      ];

      // 存储到数据库
      for (const announcement of announcements) {
        try {
          const { error: upsertError } = await supabase
            .from('collected_announcements')
            .upsert({
              ...announcement,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'announcement_code',
              ignoreDuplicates: false
            });

          if (upsertError) {
            failed++;
            console.error(`插入公告失败 ${announcement.announcement_code}:`, upsertError);
          } else {
            collected++;
          }
        } catch (error) {
          failed++;
          console.error(`处理公告失败 ${announcement.announcement_code}:`, error);
        }
      }

    } catch (error) {
      console.error('采集公告数据失败:', error);
      throw error;
    }

    return { collected, updated, failed };
  }

  /**
   * 创建采集日志
   */
  private async createCollectionLog(
    dataType: DataType,
    collectionType: CollectionType,
    startTime: Date
  ): Promise<string> {
    const { data, error } = await supabase
      .from('data_collection_logs')
      .insert({
        data_type: dataType,
        collection_type: collectionType,
        start_time: startTime.toISOString(),
        status: 'running'
      })
      .select('id')
      .single();

    if (error) {
      console.error('创建采集日志失败:', error);
      throw error;
    }

    return data.id;
  }

  /**
   * 更新采集日志
   */
  private async updateCollectionLog(
    logId: string,
    result: CollectionResult
  ): Promise<void> {
    const { error } = await supabase
      .from('data_collection_logs')
      .update({
        end_time: result.endTime.toISOString(),
        status: result.status,
        records_collected: result.recordsCollected,
        records_updated: result.recordsUpdated,
        records_failed: result.recordsFailed,
        error_message: result.errorMessage,
        details: result.details
      })
      .eq('id', logId);

    if (error) {
      console.error('更新采集日志失败:', error);
    }
  }

  /**
   * 更新数据质量指标
   */
  private async updateDataQualityMetrics(dataType: DataType): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    let tableName = '';
    switch (dataType) {
      case DataType.REITS:
        tableName = 'collected_reits';
        break;
      case DataType.POLICIES:
        tableName = 'collected_policies';
        break;
      case DataType.NEWS:
        tableName = 'collected_news';
        break;
      case DataType.ANNOUNCEMENTS:
        tableName = 'collected_announcements';
        break;
    }

    // 获取数据质量统计
    const { data: stats, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: false });

    if (error) {
      console.error('获取数据质量统计失败:', error);
      return;
    }

    const totalRecords = stats?.length || 0;
    const validRecords = stats?.filter(item => item.is_valid).length || 0;
    const invalidRecords = totalRecords - validRecords;
    const dataCompleteness = totalRecords > 0 ? (validRecords / totalRecords) * 100 : 0;

    // 更新数据质量指标
    await supabase
      .from('data_quality_metrics')
      .upsert({
        data_type: dataType,
        metric_date: today,
        total_records: totalRecords,
        valid_records: validRecords,
        invalid_records: invalidRecords,
        duplicate_records: 0, // 需要去重逻辑
        missing_values: {},
        data_completeness: parseFloat(dataCompleteness.toFixed(2)),
        last_check_time: new Date().toISOString()
      }, {
        onConflict: 'data_type,metric_date',
        ignoreDuplicates: false
      });
  }

  /**
   * 获取采集配置
   */
  async getCollectionConfig(dataType: DataType): Promise<any> {
    const { data, error } = await supabase
      .from('data_collection_config')
      .select('*')
      .eq('data_type', dataType);

    if (error) {
      console.error('获取采集配置失败:', error);
      throw error;
    }

    const config: any = {};
    data?.forEach(item => {
      config[item.config_key] = item.config_value;
    });

    return config;
  }

  /**
   * 批量采集所有数据类型
   */
  async collectAll(collectionType: CollectionType = CollectionType.INCREMENTAL): Promise<{
    reits: CollectionResult;
    policies: CollectionResult;
    news: CollectionResult;
    announcements: CollectionResult;
  }> {
    const results = {
      reits: await this.startCollection(DataType.REITS, collectionType),
      policies: await this.startCollection(DataType.POLICIES, collectionType),
      news: await this.startCollection(DataType.NEWS, collectionType),
      announcements: await this.startCollection(DataType.ANNOUNCEMENTS, collectionType)
    };

    return results;
  }
}

// 导出单例
export const externalDataCollector = new ExternalDataCollector();
