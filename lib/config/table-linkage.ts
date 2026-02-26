/**
 * 八张表智能联动配置
 * 定义REITs各表之间的关联关系和一致性检查规则
 */

export interface LinkageConfig {
  table: string           // 关联表名
  foreignKey?: string     // 外键字段
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  checkField?: string     // 需要检查的字段
  updateAction?: 'sync' | 'validate' | 'alert' // 联动动作
}

export interface TableLinkages {
  [mainTable: string]: LinkageConfig[]
}

/**
 * 联动关系配置
 */
export const tableLinkages: TableLinkages = {
  // 产品信息表作为主表，关联其他七张表
  reit_product_info: [
    { table: 'reit_property_info', foreignKey: 'fund_code', type: 'one-to-many', updateAction: 'sync' },
    { table: 'reit_financial_metrics', foreignKey: 'fund_code', type: 'one-to-many', updateAction: 'validate' },
    { table: 'reit_operational_data', foreignKey: 'fund_code', type: 'one-to-many', updateAction: 'validate' },
    { table: 'reit_market_performance', foreignKey: 'fund_code', type: 'one-to-many', updateAction: 'sync' },
    { table: 'reit_investor_structure', foreignKey: 'fund_code', type: 'one-to-many', updateAction: 'sync' },
    { table: 'reit_dividend_history', foreignKey: 'fund_code', type: 'one-to-many', updateAction: 'sync' },
    { table: 'reit_risk_metrics', foreignKey: 'fund_code', type: 'one-to-many', updateAction: 'validate' }
  ],

  // 资产信息变更时，检查运营数据
  reit_property_info: [
    {
      table: 'reit_operational_data',
      foreignKey: 'fund_code',
      type: 'one-to-many',
      checkField: 'occupancy_rate',
      updateAction: 'validate'
    }
  ],

  // 财务数据变更时，检查风险指标
  reit_financial_metrics: [
    {
      table: 'reit_risk_metrics',
      foreignKey: 'fund_code',
      type: 'one-to-many',
      checkField: 'debt_ratio',
      updateAction: 'validate'
    }
  ],

  // 运营数据变更时，检查市场表现
  reit_operational_data: [
    {
      table: 'reit_market_performance',
      foreignKey: 'fund_code',
      type: 'one-to-many',
      checkField: 'nav_per_share',
      updateAction: 'validate'
    }
  ]
}

/**
 * 获取指定表的联动配置
 */
export function getLinkages(table: string): LinkageConfig[] {
  return tableLinkages[table] || []
}

/**
 * 获取需要联动的所有表
 */
export function getAllLinkedTables(mainTable: string): string[] {
  const linkages = getLinkages(mainTable)
  return linkages.map(l => l.table)
}

/**
 * 检查是否需要联动
 */
export function needsLinkage(sourceTable: string, targetTable: string): boolean {
  const linkages = getLinkages(sourceTable)
  return linkages.some(l => l.table === targetTable)
}

/**
 * 获取联动动作类型
 */
export function getLinkageAction(sourceTable: string, targetTable: string): 'sync' | 'validate' | 'alert' {
  const linkages = getLinkages(sourceTable)
  const linkage = linkages.find(l => l.table === targetTable)
  return linkage?.updateAction || 'validate'
}
