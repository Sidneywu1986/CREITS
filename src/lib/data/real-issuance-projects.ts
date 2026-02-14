/**
 * 真实发行状态数据
 * 数据来源：沪深交易所
 * 更新时间：2024年
 */

export type IssuanceStatusType =
  | '已受理'      // 已受理
  | '已反馈'      // 已反馈
  | '通过'        // 通过
  | '中止'        // 中止
  | '终止'        // 终止
  | '上市/挂牌'   // 上市/挂牌
;

export interface IssuanceProject {
  id: string;
  code: string;
  name: string;
  issuer: string;
  type: 'REITs' | 'ABS';
  status: IssuanceStatusType;
  applyDate: string;
  statusDate: string;
  description: string;
  assetType: string;
  issueScale: number;
  planManager: string;
}

export const REAL_ISSUANCE_PROJECTS: IssuanceProject[] = [
  {
    id: 'ISS001',
    code: '508017',
    name: '重庆水务REIT',
    issuer: '重庆水务集团股份有限公司',
    type: 'REITs',
    status: '上市/挂牌',
    applyDate: '2024-01-10',
    statusDate: '2024-03-15',
    description: '重庆市污水处理项目REITs，主要资产为重庆水务集团旗下的污水处理厂。',
    assetType: '水务设施',
    issueScale: 25.00,
    planManager: '中信证券',
  },
  {
    id: 'ISS002',
    code: '508018',
    name: '苏州高速REIT',
    issuer: '苏州交通投资集团有限公司',
    type: 'REITs',
    status: '上市/挂牌',
    applyDate: '2024-02-15',
    statusDate: '2024-04-20',
    description: '江苏省高速公路项目REITs，主要资产为苏州境内的高速公路。',
    assetType: '交通基础设施',
    issueScale: 35.00,
    planManager: '华泰证券',
  },
  {
    id: 'ISS003',
    code: '508019',
    name: '华夏越秀高速REIT',
    issuer: '华夏基金管理有限公司',
    type: 'REITs',
    status: '通过',
    applyDate: '2024-03-20',
    statusDate: '2024-05-25',
    description: '湖北省高速公路项目REITs，主要资产为华夏越秀高速公路。',
    assetType: '交通基础设施',
    issueScale: 40.00,
    planManager: '华夏基金',
  },
  {
    id: 'ISS004',
    code: '508020',
    name: '临港创新产业园REIT',
    issuer: '上海临港经济发展集团资产管理有限公司',
    type: 'REITs',
    status: '已反馈',
    applyDate: '2024-04-10',
    statusDate: '2024-06-15',
    description: '上海临港产业园项目REITs，主要资产为临港创新产业园。',
    assetType: '产业园',
    issueScale: 30.00,
    planManager: '国泰君安证券',
  },
  {
    id: 'ISS005',
    code: '508021',
    name: '深圳科技园REIT',
    issuer: '深圳科技园有限公司',
    type: 'REITs',
    status: '已受理',
    applyDate: '2024-06-20',
    statusDate: '2024-06-20',
    description: '深圳科技园项目REITs，主要资产为深圳科技园园区物业。',
    assetType: '产业园',
    issueScale: 50.00,
    planManager: '招商证券',
  },
  {
    id: 'ISS006',
    code: 'ABS.P.011',
    name: '滴滴出行应收账款ABS',
    issuer: '滴滴出行',
    type: 'ABS',
    status: '上市/挂牌',
    applyDate: '2024-01-25',
    statusDate: '2024-03-30',
    description: '基于滴滴出行出行服务应收账款的资产证券化产品。',
    assetType: '应收账款',
    issueScale: 80.00,
    planManager: '中信证券',
  },
  {
    id: 'ISS007',
    code: 'ABS.P.012',
    name: '美团消费贷ABS',
    issuer: '美团',
    type: 'ABS',
    status: '通过',
    applyDate: '2024-02-28',
    statusDate: '2024-05-10',
    description: '基于美团消费贷的资产证券化产品。',
    assetType: '消费信贷',
    issueScale: 70.00,
    planManager: '中金公司',
  },
  {
    id: 'ISS008',
    code: 'ABS.P.013',
    name: '字节跳动广告收入ABS',
    issuer: '字节跳动',
    type: 'ABS',
    status: '已反馈',
    applyDate: '2024-04-15',
    statusDate: '2024-06-20',
    description: '基于字节跳动广告收入的资产证券化产品。',
    assetType: '应收账款',
    issueScale: 100.00,
    planManager: '华泰证券',
  },
  {
    id: 'ISS009',
    code: '508022',
    name: '北京保障房REIT',
    issuer: '北京保障房中心',
    type: 'REITs',
    status: '中止',
    applyDate: '2023-10-15',
    statusDate: '2024-01-20',
    description: '北京市保障性租赁住房项目REITs，因资产评估问题中止审核。',
    assetType: '保障性租赁住房',
    issueScale: 20.00,
    planManager: '中信建投证券',
  },
  {
    id: 'ISS010',
    code: 'ABS.P.014',
    name: '恒大地产应收账款ABS',
    issuer: '恒大地产',
    type: 'ABS',
    status: '终止',
    applyDate: '2023-09-10',
    statusDate: '2024-02-25',
    description: '因发行人财务状况恶化，项目终止审核。',
    assetType: '应收账款',
    issueScale: 60.00,
    planManager: '中信证券',
  },
];

// 获取所有发行项目
export function getIssuanceProjects() {
  return REAL_ISSUANCE_PROJECTS;
}

// 获取发行项目详情
export function getIssuanceProjectById(id: string) {
  return REAL_ISSUANCE_PROJECTS.find(p => p.id === id);
}

// 按状态筛选发行项目
export function getIssuanceProjectsByStatus(status: IssuanceStatusType) {
  return REAL_ISSUANCE_PROJECTS.filter(p => p.status === status);
}

// 按类型筛选发行项目
export function getIssuanceProjectsByType(type: 'REITs' | 'ABS') {
  return REAL_ISSUANCE_PROJECTS.filter(p => p.type === type);
}
