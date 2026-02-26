// 数据一致性检查规则配置

export interface ConsistencyRule {
  id: string;
  name: string;
  description: string;
  table: string;
  severity: 'error' | 'warning' | 'info';
  check: (data: any) => boolean;
  message: string;
}

export const consistencyRules: ConsistencyRule[] = [
  // 产品信息表规则
  {
    id: 'product-code-required',
    name: '基金代码必填',
    description: '产品信息表中基金代码不能为空',
    table: 'reit_product_info',
    severity: 'error',
    check: (data) => !!data.fund_code,
    message: '基金代码不能为空',
  },
  {
    id: 'product-name-required',
    name: '基金名称必填',
    description: '产品信息表中基金名称不能为空',
    table: 'reit_product_info',
    severity: 'error',
    check: (data) => !!data.fund_name,
    message: '基金名称不能为空',
  },
  {
    id: 'issue-date-valid',
    name: '发行日期验证',
    description: '发行日期不能晚于当前日期',
    table: 'reit_product_info',
    severity: 'warning',
    check: (data) => {
      if (!data.issue_date) return true;
      const issueDate = new Date(data.issue_date);
      return issueDate <= new Date();
    },
    message: '发行日期不能晚于当前日期',
  },

  // 资产信息表规则
  {
    id: 'property-area-positive',
    name: '资产面积验证',
    description: '资产面积必须大于0',
    table: 'reit_property_info',
    severity: 'error',
    check: (data) => {
      if (!data.gross_floor_area) return false;
      return parseFloat(data.gross_floor_area) > 0;
    },
    message: '资产面积必须大于0',
  },
  {
    id: 'occupancy-rate-valid',
    name: '出租率验证',
    description: '出租率必须在0-100%之间',
    table: 'reit_property_info',
    severity: 'error',
    check: (data) => {
      if (data.occupancy_rate === undefined || data.occupancy_rate === null) {
        return false;
      }
      const rate = parseFloat(data.occupancy_rate);
      return rate >= 0 && rate <= 100;
    },
    message: '出租率必须在0-100%之间',
  },

  // 财务指标表规则
  {
    id: 'total-assets-positive',
    name: '总资产验证',
    description: '总资产必须大于等于0',
    table: 'reit_financial_metrics',
    severity: 'error',
    check: (data) => {
      if (!data.total_assets) return false;
      return parseFloat(data.total_assets) >= 0;
    },
    message: '总资产必须大于等于0',
  },
  {
    id: 'debt-ratio-valid',
    name: '资产负债率验证',
    description: '资产负债率必须在0-100%之间',
    table: 'reit_financial_metrics',
    severity: 'warning',
    check: (data) => {
      if (data.debt_ratio === undefined || data.debt_ratio === null) {
        return false;
      }
      const ratio = parseFloat(data.debt_ratio);
      return ratio >= 0 && ratio <= 100;
    },
    message: '资产负债率必须在0-100%之间',
  },

  // 运营数据表规则
  {
    id: 'rent-growth-valid',
    name: '租金增长率验证',
    description: '租金增长率应在合理范围内',
    table: 'reit_operational_data',
    severity: 'info',
    check: (data) => {
      if (data.rent_growth_rate === undefined || data.rent_growth_rate === null) {
        return true; // 非必填字段为空时不检查
      }
      const growth = parseFloat(data.rent_growth_rate);
      // 允许-50%到+100%的增长范围
      return growth >= -50 && growth <= 100;
    },
    message: '租金增长率应在合理范围内(-50% ~ +100%)',
  },

  // 市场表现表规则
  {
    id: 'market-price-positive',
    name: '市场价格验证',
    description: '市场价格必须大于0',
    table: 'reit_market_performance',
    severity: 'error',
    check: (data) => {
      if (!data.price) return false;
      return parseFloat(data.price) > 0;
    },
    message: '市场价格必须大于0',
  },
  {
    id: 'pe-ratio-valid',
    name: '市盈率验证',
    description: '市盈率必须在合理范围内',
    table: 'reit_market_performance',
    severity: 'warning',
    check: (data) => {
      if (data.pe_ratio === undefined || data.pe_ratio === null) {
        return true; // 非必填字段为空时不检查
      }
      const pe = parseFloat(data.pe_ratio);
      // 允许-10到200的市盈率范围（负值表示亏损）
      return pe >= -10 && pe <= 200;
    },
    message: '市盈率应在合理范围内(-10 ~ 200)',
  },

  // 风险指标表规则
  {
    id: 'var-positive',
    name: 'VaR验证',
    description: '风险价值必须大于0',
    table: 'reit_risk_metrics',
    severity: 'error',
    check: (data) => {
      if (!data.var_95) return false;
      return parseFloat(data.var_95) > 0;
    },
    message: '风险价值必须大于0',
  },
  {
    id: 'beta-valid',
    name: 'Beta系数验证',
    description: 'Beta系数应在合理范围内',
    table: 'reit_risk_metrics',
    severity: 'info',
    check: (data) => {
      if (data.beta === undefined || data.beta === null) {
        return true; // 非必填字段为空时不检查
      }
      const beta = parseFloat(data.beta);
      // 允许-5到5的Beta系数范围
      return beta >= -5 && beta <= 5;
    },
    message: 'Beta系数应在合理范围内(-5 ~ 5)',
  },

  // 跨表一致性规则
  {
    id: 'property-product-linkage',
    name: '资产-产品关联',
    description: '资产表中的fund_code必须在产品表中存在',
    table: 'reit_property_info',
    severity: 'error',
    check: (data) => !!data.fund_code,
    message: '资产必须关联到有效的产品',
  },
];

export interface ConsistencyCheckResult {
  rule: ConsistencyRule;
  passed: boolean;
  data: any;
  message: string;
}

export function getRulesByTable(table: string): ConsistencyRule[] {
  return consistencyRules.filter((rule) => rule.table === table);
}

export function getRulesBySeverity(severity: 'error' | 'warning' | 'info'): ConsistencyRule[] {
  return consistencyRules.filter((rule) => rule.severity === severity);
}
