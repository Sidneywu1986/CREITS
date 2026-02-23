/**
 * 估值计算器类型定义
 */

// 估值输入参数
export interface ValuationInput {
  // 基础参数
  currentPrice: number;          // 当前价格（元）
  totalShares: number;           // 总股本（万股）
  annualDividend: number;        // 年度分红（元/份）
  dividendYield: number;         // 分红率（%）

  // DCF估值参数
  growthRate: number;            // 增长率（%）
  discountRate: number;          // 折现率（%）
  terminalGrowthRate: number;    // 终值增长率（%）
  forecastYears: number;         // 预测年数

  // 相对估值参数
  peComparable: number;          // 可比公司平均PE
  pbComparable: number;          // 可比公司平均PB
  dividendYieldComparable: number; // 可比分红率（%）
  marketPe?: number;             // 市场平均PE（可选）
  marketPb?: number;             // 市场平均PB（可选）

  // 可选财务指标
  navPerShare?: number;          // 每股净资产（元）
}

// DCF估值输入
export interface DCFInput {
  dividend: number;              // 年度分红
  growthRate: number;            // 增长率（小数形式）
  discountRate: number;          // 折现率（小数）
  terminalGrowthRate: number;    // 终值增长率（小数）
  years: number;                 // 预测年数
}

// 相对估值输入
export interface RelativeInput {
  currentPrice: number;          // 当前价格
  dividend: number;              // 年度分红
  bookValuePerShare?: number;    // 每股净资产
  peComparable: number;          // 可比公司PE
  pbComparable: number;          // 可比公司PB
  dividendYieldComparable: number; // 可比分红率（小数）
}

// 相对估值结果
export interface RelativeResult {
  peValue: number;               // PE法估值
  pbValue: number;               // PB法估值
  yieldValue: number;            // 收益率法估值
  average: number;               // 平均估值
}

// 估值结果
export interface ValuationResult {
  // 综合估值
  comprehensive: number;         // 综合目标价

  // DCF估值
  dcf: number;                   // DCF目标价
  dcfUpsideDownside: number;     // DCF潜在涨跌幅（%）

  // 相对估值
  relative: {
    pe: number;                  // PE法估值
    pb: number;                  // PB法估值
    yield: number;               // 收益率法估值
    average: number;             // 相对估值平均价
  };

  // 财务指标
  financials: {
    nav?: number;                // 每股净资产
    ffo?: number;                // FFO/份
    pffo?: number;               // P/FFO
    dividendYield: number;       // 股息率（%）
  };

  // 投资建议
  recommendation: 'buy' | 'hold' | 'sell';
  recommendationText: string;
}

// 导出报告数据结构
export interface ValuationReportData {
  input: ValuationInput;
  results: {
    comprehensive: number;
    dcf: number;
    relative: RelativeResult;
    financials: ValuationResult['financials'];
  };
  timestamp: string;
}
