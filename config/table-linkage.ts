// 八张表联动配置
export interface TableLinkageConfig {
  table: string;
  foreignKey: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  checkField?: string;
}

export const tableLinkages: Record<string, TableLinkageConfig[]> = {
  // 产品信息表：关联所有其他表
  reit_product_info: [
    { table: 'reit_property_info', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_financial_metrics', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_operational_data', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_market_performance', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_investor_structure', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_dividend_history', foreignKey: 'fund_code', type: 'one-to-many' },
    { table: 'reit_risk_metrics', foreignKey: 'fund_code', type: 'one-to-many' },
  ],
  
  // 资产信息表：关联财务和运营数据
  reit_property_info: [
    { table: 'reit_financial_metrics', foreignKey: 'fund_code', type: 'one-to-many', checkField: 'occupancy_rate' },
    { table: 'reit_operational_data', foreignKey: 'fund_code', type: 'one-to-many', checkField: 'rent_growth_rate' },
  ],
  
  // 财务数据表：关联风险指标
  reit_financial_metrics: [
    { table: 'reit_risk_metrics', foreignKey: 'fund_code', type: 'one-to-many', checkField: 'debt_ratio' },
  ],
  
  // 运营数据表：关联资产信息
  reit_operational_data: [
    { table: 'reit_property_info', foreignKey: 'fund_code', type: 'one-to-many', checkField: 'occupancy_rate' },
  ],
  
  // 市场表现表：关联产品信息
  reit_market_performance: [
    { table: 'reit_product_info', foreignKey: 'fund_code', type: 'one-to-one' },
  ],
  
  // 投资者结构表：关联产品信息
  reit_investor_structure: [
    { table: 'reit_product_info', foreignKey: 'fund_code', type: 'one-to-one' },
  ],
  
  // 收益分配表：关联产品信息
  reit_dividend_history: [
    { table: 'reit_product_info', foreignKey: 'fund_code', type: 'one-to-one' },
  ],
  
  // 风险指标表：关联财务数据
  reit_risk_metrics: [
    { table: 'reit_financial_metrics', foreignKey: 'fund_code', type: 'one-to-many', checkField: 'debt_ratio' },
  ],
};

// 表格中文名称映射
export const tableLabels: Record<string, string> = {
  reit_product_info: '产品信息',
  reit_property_info: '资产信息',
  reit_financial_metrics: '财务指标',
  reit_operational_data: '运营数据',
  reit_market_performance: '市场表现',
  reit_investor_structure: '投资者结构',
  reit_dividend_history: '收益分配',
  reit_risk_metrics: '风险指标',
};

export function getTableLabel(table: string): string {
  return tableLabels[table] || table;
}
