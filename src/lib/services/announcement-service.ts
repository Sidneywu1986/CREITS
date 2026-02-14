/**
 * 交易所公告查询服务
 * 提供上交所和深交所REITs公告查询功能
 */

export interface Announcement {
  id: string;
  code: string;
  name: string;
  title: string;
  type: '招募说明书' | '基金合同' | '发售公告' | '定期报告' | '临时公告' | '扩募公告' | '收益分配';
  publishDate: string;
  downloadUrl: string;
  exchange: 'SSE' | 'SZSE';
}

export interface ExchangeAnnouncementQuery {
  code: string;
  name?: string;
  exchange: 'SSE' | 'SZSE';
  announcementType?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 判断产品所属交易所
 */
export function getExchangeByCode(code: string): 'SSE' | 'SZSE' {
  // 上交所REITs代码以50开头
  if (code.startsWith('50')) {
    return 'SSE';
  }
  // 深交所REITs代码以18或30开头
  if (code.startsWith('18') || code.startsWith('30')) {
    return 'SZSE';
  }
  return 'SSE'; // 默认上交所
}

/**
 * 获取上交所公告查询URL
 */
export function getSSEAnnouncementUrl(code: string, name?: string): string {
  const baseUrl = 'https://www.sse.com.cn/disclosure/announcement/';
  // 上交所公募REITs公告页面
  return `${baseUrl}c/#!/announcementTypeQuery?isShow=true&securityCode=${code}`;
}

/**
 * 获取深交所公告查询URL
 */
export function getSZSEAnnouncementUrl(code: string, name?: string): string {
  const baseUrl = 'https://www.szse.cn/disclosure/announcement/notice/index.html';
  // 深交所公告正文页面
  return `${baseUrl}?stockCode=${code}`;
}

/**
 * 获取交易所公告查询链接
 */
export function getAnnouncementQueryLink(code: string, name?: string): {
  url: string;
  exchange: 'SSE' | 'SZSE';
  exchangeName: string;
} {
  const exchange = getExchangeByCode(code);
  const exchangeName = exchange === 'SSE' ? '上海证券交易所' : '深圳证券交易所';
  const url = exchange === 'SSE'
    ? getSSEAnnouncementUrl(code, name)
    : getSZSEAnnouncementUrl(code, name);

  return { url, exchange, exchangeName };
}

/**
 * 公告类型映射
 */
export const ANNOUNCEMENT_TYPES = {
  PROSPECTUS: '招募说明书',
  CONTRACT: '基金合同',
  OFFERING: '发售公告',
  QUARTERLY: '季度报告',
  ANNUAL: '年度报告',
  TEMPORARY: '临时公告',
  EXPANSION: '扩募公告',
  DIVIDEND: '收益分配',
} as const;

/**
 * 按时间线整理的公告类型顺序
 */
export const ANNOUNCEMENT_TIMELINE = [
  ANNOUNCEMENT_TYPES.PROSPECTUS,
  ANNOUNCEMENT_TYPES.CONTRACT,
  ANNOUNCEMENT_TYPES.OFFERING,
  ANNOUNCEMENT_TYPES.QUARTERLY,
  ANNOUNCEMENT_TYPES.ANNUAL,
  ANNOUNCEMENT_TYPES.TEMPORARY,
  ANNOUNCEMENT_TYPES.EXPANSION,
  ANNOUNCEMENT_TYPES.DIVIDEND,
];

/**
 * 获取公告类型图标
 */
export function getAnnouncementTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    [ANNOUNCEMENT_TYPES.PROSPECTUS]: '📋',
    [ANNOUNCEMENT_TYPES.CONTRACT]: '📄',
    [ANNOUNCEMENT_TYPES.OFFERING]: '📢',
    [ANNOUNCEMENT_TYPES.QUARTERLY]: '📊',
    [ANNOUNCEMENT_TYPES.ANNUAL]: '📈',
    [ANNOUNCEMENT_TYPES.TEMPORARY]: '⚡',
    [ANNOUNCEMENT_TYPES.EXPANSION]: '📦',
    [ANNOUNCEMENT_TYPES.DIVIDEND]: '💰',
  };
  return iconMap[type] || '📄';
}

/**
 * 获取公告类型描述
 */
export function getAnnouncementTypeDescription(type: string): string {
  const descMap: Record<string, string> = {
    [ANNOUNCEMENT_TYPES.PROSPECTUS]: '包含产品基本信息、投资风险、投资价值分析等',
    [ANNOUNCEMENT_TYPES.CONTRACT]: '基金合同、托管协议等重要法律文件',
    [ANNOUNCEMENT_TYPES.OFFERING]: '发售公告、份额发售公告等',
    [ANNOUNCEMENT_TYPES.QUARTERLY]: '季度报告、季度运营情况报告',
    [ANNOUNCEMENT_TYPES.ANNUAL]: '年度报告、年度资产运营报告',
    [ANNOUNCEMENT_TYPES.TEMPORARY]: '重大事项公告、临时报告',
    [ANNOUNCEMENT_TYPES.EXPANSION]: '扩募方案、新购入资产公告',
    [ANNOUNCEMENT_TYPES.DIVIDEND]: '收益分配方案、分红公告',
  };
  return descMap[type] || '其他公告';
}

/**
 * 模拟公告查询结果（实际应用中应调用交易所API）
 * 注意：这是示例数据，实际需要对接交易所API
 */
export function queryAnnouncements(query: ExchangeAnnouncementQuery): Announcement[] {
  const { code, name, exchange } = query;

  // 这里返回示例公告数据
  // 实际应用中应调用交易所API获取真实数据
  const sampleAnnouncements: Announcement[] = [
    {
      id: `${code}-001`,
      code,
      name: name || 'REITs产品',
      title: `${name || code}公开募集证券投资基金招募说明书`,
      type: '招募说明书',
      publishDate: '2021-06-01',
      downloadUrl: exchange === 'SSE'
        ? `https://www.sse.com.cn/disclosure/announcement/c/${code}/001.pdf`
        : `https://www.szse.cn/disclosure/announcement/${code}/001.pdf`,
      exchange,
    },
    {
      id: `${code}-002`,
      code,
      name: name || 'REITs产品',
      title: `${name || code}公开募集证券投资基金基金合同`,
      type: '基金合同',
      publishDate: '2021-06-05',
      downloadUrl: exchange === 'SSE'
        ? `https://www.sse.com.cn/disclosure/announcement/c/${code}/002.pdf`
        : `https://www.szse.cn/disclosure/announcement/${code}/002.pdf`,
      exchange,
    },
  ];

  return sampleAnnouncements;
}

/**
 * 获取基金列表页面URL
 */
export function getFundListUrl(exchange: 'SSE' | 'SZSE'): string {
  if (exchange === 'SSE') {
    return 'https://www.sse.com.cn/assortment/fund/etf/list/';
  } else {
    return 'https://www.szse.cn/market/product/fund/index.html';
  }
}
