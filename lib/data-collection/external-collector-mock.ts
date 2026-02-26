/**
 * ExternalDataCollector - 模拟版本（用于测试）
 *
 * 当无法连接Supabase时使用内存模拟数据
 */

// 模拟数据
const MOCK_DATA = {
  reits: [
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
    },
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
    }
  ],
  policies: [
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
      related_reits: ['180101', '180102', '508000'],
      impact_level: 'high',
      impact_description: '扩大试点范围，影响所有REITs项目',
      source_url: 'https://www.ndrc.gov.cn/xxgk/zcfb/202107/t20210702_1286381.html'
    }
  ],
  news: [
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
    }
  ],
  announcements: [
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
    }
  ]
};

// 模拟数据库（内存存储）
const mockDatabase = {
  collected_reits: [] as any[],
  collected_policies: [] as any[],
  collected_news: [] as any[],
  collected_announcements: [] as any[],
  data_collection_logs: [] as any[],
  data_quality_metrics: [] as any[],
  graph_nodes: [] as any[],
  graph_edges: [] as any[]
};

export enum DataType {
  REITS = 'reits',
  POLICIES = 'policies',
  NEWS = 'news',
  ANNOUNCEMENTS = 'announcements'
}

export enum CollectionType {
  FULL = 'full',
  INCREMENTAL = 'incremental'
}

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

export class ExternalDataCollectorMock {
  private logId: string | null = null;

  async startCollection(
    dataType: DataType,
    collectionType: CollectionType = CollectionType.INCREMENTAL
  ): Promise<CollectionResult> {
    const startTime = new Date();

    console.log(`[MOCK] 开始采集 ${dataType} 数据...`);

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let result: {
        collected: number;
        updated: number;
        failed: number;
      };

      switch (dataType) {
        case DataType.REITS:
          result = this.collectREITs();
          break;
        case DataType.POLICIES:
          result = this.collectPolicies();
          break;
        case DataType.NEWS:
          result = this.collectNews();
          break;
        case DataType.ANNOUNCEMENTS:
          result = this.collectAnnouncements();
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

      console.log(`[MOCK] 采集完成: ${result.collected} 条记录`);

      return collectionResult;

    } catch (error) {
      const endTime = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(`[MOCK] 采集失败:`, errorMessage);

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

      throw error;
    }
  }

  private collectREITs() {
    mockDatabase.collected_reits = [...MOCK_DATA.reits];
    return { collected: MOCK_DATA.reits.length, updated: 0, failed: 0 };
  }

  private collectPolicies() {
    mockDatabase.collected_policies = [...MOCK_DATA.policies];
    return { collected: MOCK_DATA.policies.length, updated: 0, failed: 0 };
  }

  private collectNews() {
    mockDatabase.collected_news = [...MOCK_DATA.news];
    return { collected: MOCK_DATA.news.length, updated: 0, failed: 0 };
  }

  private collectAnnouncements() {
    mockDatabase.collected_announcements = [...MOCK_DATA.announcements];
    return { collected: MOCK_DATA.announcements.length, updated: 0, failed: 0 };
  }

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

  // 获取模拟数据库中的数据
  getMockDatabase() {
    return mockDatabase;
  }

  // 清空模拟数据库
  clearMockDatabase() {
    mockDatabase.collected_reits = [];
    mockDatabase.collected_policies = [];
    mockDatabase.collected_news = [];
    mockDatabase.collected_announcements = [];
  }
}

export const externalDataCollectorMock = new ExternalDataCollectorMock();
