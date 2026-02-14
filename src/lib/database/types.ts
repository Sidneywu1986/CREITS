/**
 * REITs数据库类型定义
 * 对应数据库 schema.sql 中的8张表
 */

// =====================================================
// 1. 产品基本信息表类型
// =====================================================
export interface REITProductInfo {
  reit_code: string; // 基金代码 (主键，如：508000.SH)
  reit_short_name: string; // 基金简称
  fund_manager: string; // 基金管理人
  asset_manager?: string; // 资产支持证券管理人
  operator?: string; // 运营管理机构
  listing_date?: Date; // 上市日期
  fund_size?: number; // 基金总份额（亿份）
  total_assets?: number; // 募集规模/基金总资产（亿元）
  asset_type_national?: string; // 发改委大类
  asset_type_csrc?: string; // 证监会/资产类型
  product_structure?: string; // 产品结构说明
  duration_years?: number; // 存续期限（年）
  leverage_ratio?: number; // 基金杠杆率（%）
  info_disclosure_officer?: string; // 信息披露事务负责人
  disclosure_contact?: string; // 信息披露联系方式
  created_at?: Date;
  updated_at?: Date;
}

// =====================================================
// 2. 底层资产通用信息表类型
// =====================================================
export interface REITPropertyBase {
  property_id: string; // 资产唯一标识
  reit_code: string; // 所属REITs代码
  property_name: string; // 资产名称
  location_province?: string; // 所在省份
  location_city?: string; // 所在城市
  location_district?: string; // 所在区域/商圈
  asset_address?: string; // 具体地址
  gross_floor_area?: number; // 总建筑面积（平方米）
  land_area?: number; // 占地面积（平方米）
  land_right_type?: string; // 土地权属类型
  land_expiry_date?: Date; // 土地使用权到期日
  year_built?: number; // 建成年份
  year_acquired?: number; // 购入年份
  certificate_number?: string; // 权证编号
  asset_encumbrance?: string; // 资产权利限制
  effective_date: Date; // 生效日期
  expiration_date?: Date; // 失效日期
}

// =====================================================
// 3. 产权类资产运营数据表类型
// =====================================================
export interface REITPropertyEquityOps {
  property_id: string; // 资产唯一标识
  report_date: Date; // 报告期
  rentable_area?: number; // 可出租面积（平方米）
  occupancy_rate?: number; // 出租率（%）
  average_rent?: number; // 平均租金（元/平方米/月）
  rental_income?: number; // 租金收入（万元）
  other_income?: number; // 其他经营收入（万元）
  total_operating_income?: number; // 总经营收入（万元）
  top_tenant_name?: string; // 前十大租户名称（JSON格式）
  top_tenant_ratio?: number; // 最大租户占比（%）
  top5_tenant_ratio?: number; // 前五大租户合计占比（%）
  wale?: number; // 加权平均租期（年）
  lease_expiry_1yr?: number; // 1年内到期租约占比（%）
  lease_expiry_2yr?: number; // 1-2年到期租约占比（%）
  lease_expiry_3yr?: number; // 2-3年到期租约占比（%）
  lease_expiry_3plus?: number; // 3年以上到期租约占比（%）
  renewal_rate?: number; // 租约续签率（%）
  num_units?: number; // 保障房套（间）数
  storage_capacity?: number; // 仓储容量（立方米/吨）
}

// =====================================================
// 4. 经营权类资产运营数据表类型
// =====================================================
export interface REITPropertyConcessionOps {
  property_id: string; // 资产唯一标识
  report_date: Date; // 报告期
  // 高速公路专用
  traffic_volume_avg_daily?: number; // 日均车流量（辆次）
  traffic_volume_total?: number; // 总车流量（万辆次）
  toll_rate_avg?: number; // 平均收费标准（元/车公里）
  toll_income?: number; // 通行费收入（万元）
  // 能源/环保专用
  processing_capacity?: number; // 处理能力
  actual_processing?: number; // 实际处理量
  tariff?: number; // 结算单价（元/单位）
  operating_revenue?: number; // 运营收入（万元）
  // 通用字段
  remaining_concession_years?: number; // 特许经营权剩余年限
  concession_expiry_date?: Date; // 特许经营权到期日
  major_maintenance_date?: Date; // 最近大修日期
  next_major_maintenance_date?: Date; // 下次计划大修日期
  maintenance_reserve?: number; // 大修准备金余额（万元）
}

// =====================================================
// 5. 财务与估值指标表类型
// =====================================================
export interface REITFinancialMetrics {
  reit_code: string; // 基金代码
  report_date: Date; // 报告期
  report_type?: string; // 报告类型（年报/中报/季报）
  // 利润表
  total_revenue?: number; // 营业总收入（万元）
  operating_cost?: number; // 营业成本（万元）
  gross_profit?: number; // 毛利润（万元）
  admin_expense?: number; // 管理费用（万元）
  financial_expense?: number; // 财务费用（万元）
  net_profit?: number; // 净利润（万元）
  ebitda?: number; // 息税折旧摊销前利润（万元）
  // REITs专用指标
  ffo?: number; // 营运现金流FFO（万元）
  affo?: number; // 调整后营运现金流AFFO（万元）
  available_for_distribution?: number; // 可供分配金额（万元）
  actual_distribution?: number; // 实际分红总额（万元）
  distribution_per_share?: number; // 每份分红（元）
  distribution_yield?: number; // 现金分派率（%）
  // 资产负债表
  total_assets_balance?: number; // 总资产（万元）
  total_liabilities?: number; // 总负债（万元）
  net_assets?: number; // 净资产（万元）
  nav_per_share?: number; // 每份额净资产（元）
  // 比率指标
  roa?: number; // 总资产收益率（%）
  roe?: number; // 净资产收益率（%）
  dscr?: number; // 偿债覆盖倍数
  interest_coverage?: number; // 利息保障倍数
  current_ratio?: number; // 流动比率
  debt_to_asset?: number; // 资产负债率（%）
}

// =====================================================
// 6. 估值与评估信息表类型
// =====================================================
export interface REITValuation {
  reit_code: string; // 基金代码
  valuation_date: Date; // 估值基准日
  report_source?: string; // 报告来源
  appraisal_value?: number; // 评估价值（亿元）
  appraisal_value_per_share?: number; // 每份额评估价值（元）
  valuation_method?: string; // 评估方法
  discount_rate?: number; // 折现率假设（%）
  terminal_growth_rate?: number; // 终值增长率假设（%）
  long_term_rent_growth?: number; // 长期租金增长率假设（%）
  cap_rate?: number; // 资本化率假设（%）
  vacancy_rate_assumption?: number; // 空置率假设（%）
  operating_cost_ratio?: number; // 运营成本占比假设（%）
  implied_cap_rate?: number; // 隐含资本化率
  nav_premium_discount?: number; // 市净率（溢价/折价率）
}

// =====================================================
// 7. 风险合规信息表类型
// =====================================================
export interface REITRiskCompliance {
  reit_code: string; // 基金代码
  info_date: Date; // 信息日期
  regulatory_status?: string; // 监管状态
  regulatory_action_desc?: string; // 监管措施描述
  legal_proceedings?: string; // 涉及的重大诉讼或仲裁
  legal_proceeding_status?: string; // 诉讼状态
  insider_trading_policy?: boolean; // 内幕信息管理制度
  esg_score?: number; // ESG评分
  esg_rating_agency?: string; // ESG评级机构
  related_party_transactions?: string; // 关联交易情况
  contingent_liabilities?: string; // 或有负债
  risk_factor_update?: string; // 风险因素更新
}

// =====================================================
// 8. 市场表现与投资者结构表类型
// =====================================================
export interface REITMarketStats {
  reit_code: string; // 基金代码
  trade_date: Date; // 交易日期
  open_price?: number; // 开盘价（元）
  close_price?: number; // 收盘价（元）
  high_price?: number; // 最高价（元）
  low_price?: number; // 最低价（元）
  daily_volume?: number; // 日成交量（万份）
  daily_turnover?: number; // 日成交额（万元）
  turnover_rate?: number; // 换手率（%）
  market_cap?: number; // 总市值（万元）
  institutional_holding_pct?: number; // 机构投资者持有比例（%）
  retail_holding_pct?: number; // 个人投资者持有比例（%）
  top10_holder_names?: string; // 前十大持有人名称（JSON格式）
  top10_holder_ratios?: string; // 前十大持有人占比（JSON格式）
  top10_holder_total_pct?: number; // 前十大持有人合计占比（%）
  original_holder_holding_pct?: number; // 原始权益人持有比例（%）
}

// =====================================================
// 组合类型
// =====================================================

// 完整的REITs产品信息（包含所有相关数据）
export interface REITProductFull {
  productInfo: REITProductInfo;
  properties: REITPropertyBase[];
  financialMetrics: REITFinancialMetrics[];
  valuations: REITValuation[];
  riskCompliance: REITRiskCompliance[];
  marketStats: REITMarketStats[];
}

// 查询参数类型
export interface REITProductQuery {
  reit_code?: string;
  reit_short_name?: string;
  asset_type_national?: string;
  asset_type_csrc?: string;
  fund_manager?: string;
  limit?: number;
  offset?: number;
}

// 财务指标查询参数
export interface FinancialMetricsQuery {
  reit_code: string;
  start_date?: Date;
  end_date?: Date;
  report_type?: string;
}

// 市场表现查询参数
export interface MarketStatsQuery {
  reit_code?: string;
  start_date?: Date;
  end_date?: Date;
  sort_by?: 'trade_date' | 'daily_volume' | 'daily_turnover';
  order?: 'asc' | 'desc';
}
