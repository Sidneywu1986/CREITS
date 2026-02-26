import { ConsistencyRule, ConsistencyCheckResult, getRulesByTable } from '@/config/consistency-rules';

/**
 * 数据一致性检查器
 */
export class ConsistencyChecker {
  /**
   * 检查单条数据
   */
  public static checkRecord(data: any, table: string): ConsistencyCheckResult[] {
    const results: ConsistencyCheckResult[] = [];
    const rules = getRulesByTable(table);

    for (const rule of rules) {
      const passed = rule.check(data);
      results.push({
        rule,
        passed,
        data,
        message: passed ? '验证通过' : rule.message,
      });
    }

    return results;
  }

  /**
   * 检查多条数据
   */
  public static checkRecords(data: any[], table: string): Map<string, ConsistencyCheckResult[]> {
    const resultsMap = new Map<string, ConsistencyCheckResult[]>();

    data.forEach((record, index) => {
      const recordId = record.id || `${table}_${index}`;
      resultsMap.set(recordId, this.checkRecord(record, table));
    });

    return resultsMap;
  }

  /**
   * 检查跨表一致性
   */
  public static checkCrossTableConsistency(
    dataMap: Map<string, any[]>
  ): ConsistencyCheckResult[] {
    const results: ConsistencyCheckResult[] = [];

    // 检查资产表与产品表的关联
    const properties = dataMap.get('reit_property_info') || [];
    const products = dataMap.get('reit_product_info') || [];
    const productCodes = new Set(products.map(p => p.fund_code));

    properties.forEach((property, index) => {
      if (!productCodes.has(property.fund_code)) {
        results.push({
          rule: {
            id: 'cross-table-property-product',
            name: '资产-产品关联',
            description: '资产表中的fund_code必须在产品表中存在',
            table: 'reit_property_info',
            severity: 'error',
            check: () => false,
            message: `资产(${property.property_name || `#${index}`})关联的产品代码(${property.fund_code})不存在`,
          },
          passed: false,
          data: property,
          message: `资产(${property.property_name || `#${index}`})关联的产品代码(${property.fund_code})不存在`,
        });
      }
    });

    // 检查财务数据与风险指标的一致性
    const financialMetrics = dataMap.get('reit_financial_metrics') || [];
    const riskMetrics = dataMap.get('reit_risk_metrics') || [];

    // 创建财务数据映射
    const financialMap = new Map(
      financialMetrics.map(f => [f.fund_code, f])
    );

    // 检查风险指标对应的财务数据是否存在
    riskMetrics.forEach((risk, index) => {
      const financial = financialMap.get(risk.fund_code);
      if (!financial) {
        results.push({
          rule: {
            id: 'cross-table-risk-financial',
            name: '风险-财务关联',
            description: '风险指标表中必须有对应的财务数据',
            table: 'reit_risk_metrics',
            severity: 'error',
            check: () => false,
            message: `风险指标(${risk.fund_code})缺少对应的财务数据`,
          },
          passed: false,
          data: risk,
          message: `风险指标(${risk.fund_code})缺少对应的财务数据`,
        });
      }
    });

    return results;
  }

  /**
   * 获取汇总统计
   */
  public static getSummary(
    results: ConsistencyCheckResult[]
  ): {
    total: number;
    passed: number;
    failed: number;
    errors: number;
    warnings: number;
    infos: number;
  } {
    const summary = {
      total: results.length,
      passed: 0,
      failed: 0,
      errors: 0,
      warnings: 0,
      infos: 0,
    };

    results.forEach((result) => {
      if (result.passed) {
        summary.passed++;
      } else {
        summary.failed++;
        if (result.rule.severity === 'error') summary.errors++;
        else if (result.rule.severity === 'warning') summary.warnings++;
        else if (result.rule.severity === 'info') summary.infos++;
      }
    });

    return summary;
  }

  /**
   * 过滤失败的检查结果
   */
  public static getFailedResults(
    results: ConsistencyCheckResult[]
  ): ConsistencyCheckResult[] {
    return results.filter((result) => !result.passed);
  }

  /**
   * 按严重程度过滤
   */
  public static filterBySeverity(
    results: ConsistencyCheckResult[],
    severity: 'error' | 'warning' | 'info'
  ): ConsistencyCheckResult[] {
    return results.filter((result) => !result.passed && result.rule.severity === severity);
  }

  /**
   * 导出检查报告
   */
  public static exportReport(
    results: ConsistencyCheckResult[],
    table: string
  ): string {
    const summary = this.getSummary(results);
    const failedResults = this.getFailedResults(results);

    let report = `# 数据一致性检查报告\n\n`;
    report += `## 检查表: ${table}\n\n`;
    report += `## 检查时间: ${new Date().toLocaleString()}\n\n`;
    report += `## 检查摘要\n\n`;
    report += `- 总检查数: ${summary.total}\n`;
    report += `- 通过: ${summary.passed}\n`;
    report += `- 失败: ${summary.failed}\n`;
    report += `- 错误: ${summary.errors}\n`;
    report += `- 警告: ${summary.warnings}\n`;
    report += `- 信息: ${summary.infos}\n\n`;

    if (failedResults.length > 0) {
      report += `## 失败项详情\n\n`;
      failedResults.forEach((result, index) => {
        report += `### ${index + 1}. ${result.rule.name}\n`;
        report += `- 严重程度: ${result.rule.severity}\n`;
        report += `- 描述: ${result.rule.description}\n`;
        report += `- 消息: ${result.message}\n`;
        report += `- 数据: ${JSON.stringify(result.data, null, 2)}\n\n`;
      });
    } else {
      report += `## ✅ 所有检查通过\n\n`;
    }

    return report;
  }
}
