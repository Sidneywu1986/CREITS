/**
 * 估值计算工具函数
 */

// 基础参数接口
export interface ValuationInput {
  // 基础参数
  currentPrice: number;        // 当前价格（元）
  totalShares: number;         // 总股本（万股）
  annualDistribution: number;  // 年度分红（元/份）
  distributionYield: number;   // 分红率（%）

  // DCF估值参数
  growthRate: number;          // 增长率（%）
  discountRate: number;        // 折现率（%）
  terminalGrowthRate: number;  // 终值增长率（%）
  projectionYears: number;     // 预测年数

  // 相对估值参数
  peerAveragePE: number;       // 可比公司PE
  peerAveragePB: number;       // 可比公司PB
  peerAverageYield: number;    // 可比分红率（%）
  marketPE?: number;           // 市场PE（可选）
  marketPB?: number;           // 市场PB（可选）
}

// DCF估值结果
export interface DCFResult {
  presentValue: number;        // 现值总和
  terminalValue: number;       // 终值
  dcfPrice: number;            // DCF目标价
  upsideDownside: number;      // 潜在涨跌幅（%）
  cashFlows: number[];         // 现金流序列
  discountedCashFlows: number[]; // 折现现金流序列
}

// 相对估值结果
export interface RelativeValuationResult {
  peBasedPrice: number;        // PE法估值价
  pbBasedPrice: number;        // PB法估值价
  yieldBasedPrice: number;     // 收益率法估值价
  averagePrice: number;        // 相对估值平均价
  eps: number;                 // 每股收益（元）
  nav: number;                 // 每股净资产（元）
}

// 综合估值结果
export interface ValuationResult {
  // DCF估值
  dcfPrice: number;
  dcfUpsideDownside: number;

  // 相对估值
  peBasedPrice: number;
  pbBasedPrice: number;
  yieldBasedPrice: number;
  relativePrice: number;

  // 综合估值
  targetPrice: number;         // 综合目标价
  upsideDownside: number;      // 涨跌幅（%）

  // 财务指标
  distributionYield: number;   // 股息率（%）
  nav: number;                 // 每股净资产（元）
  ffoPerShare: number;         // FFO/份（元）
  pFFO: number;                // P/FFO

  // 投资建议
  recommendation: 'buy' | 'hold' | 'sell';
  recommendationText: string;
}

/**
 * 计算分红率
 */
export function calculateDistributionYield(
  annualDistribution: number,
  currentPrice: number
): number {
  if (currentPrice === 0) return 0;
  return Number((annualDistribution / currentPrice * 100).toFixed(2));
}

/**
 * DCF估值计算（两阶段模型）
 */
export function calculateDCF(inputs: ValuationInput): DCFResult {
  const {
    currentPrice,
    annualDistribution,
    growthRate,
    discountRate,
    terminalGrowthRate,
    projectionYears
  } = inputs;

  const growthRateDecimal = growthRate / 100;
  const discountRateDecimal = discountRate / 100;
  const terminalGrowthDecimal = terminalGrowthRate / 100;

  let presentValue = 0;
  const cashFlows: number[] = [];
  const discountedCashFlows: number[] = [];

  // 第一阶段：预测未来现金流
  for (let year = 1; year <= projectionYears; year++) {
    const projectedCashFlow = annualDistribution * Math.pow(1 + growthRateDecimal, year);
    const discountedCashFlow = projectedCashFlow / Math.pow(1 + discountRateDecimal, year);
    presentValue += discountedCashFlow;
    cashFlows.push(Number(projectedCashFlow.toFixed(2)));
    discountedCashFlows.push(Number(discountedCashFlow.toFixed(2)));
  }

  // 第二阶段：计算终值
  const terminalCashFlow = annualDistribution * Math.pow(1 + growthRateDecimal, projectionYears);
  const terminalValue = (terminalCashFlow * (1 + terminalGrowthDecimal)) / (discountRateDecimal - terminalGrowthDecimal);
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRateDecimal, projectionYears);

  const totalPresentValue = presentValue + discountedTerminalValue;
  const dcfPrice = totalPresentValue;
  const upsideDownside = ((dcfPrice - currentPrice) / currentPrice) * 100;

  return {
    presentValue: Number(totalPresentValue.toFixed(2)),
    terminalValue: Number(terminalValue.toFixed(2)),
    dcfPrice: Number(dcfPrice.toFixed(2)),
    upsideDownside: Number(upsideDownside.toFixed(2)),
    cashFlows,
    discountedCashFlows
  };
}

/**
 * 相对估值计算
 */
export function calculateRelativeValuation(inputs: ValuationInput): RelativeValuationResult {
  const {
    currentPrice,
    annualDistribution,
    peerAveragePE,
    peerAveragePB,
    peerAverageYield
  } = inputs;

  // 假设每股收益为年度分红的80%（保守估计）
  const eps = annualDistribution * 0.8;
  // 假设每股净资产为当前价格的83%
  const nav = currentPrice / 1.2;

  // PE法估值：每股收益 × 可比PE
  const peBasedPrice = eps * peerAveragePE;

  // PB法估值：每股净资产 × 可比PB
  const pbBasedPrice = nav * peerAveragePB;

  // 收益率法估值：年度分红 / 可比分红率
  const yieldBasedPrice = annualDistribution / (peerAverageYield / 100);

  // 相对估值平均价（三种方法平均）
  const averagePrice = (peBasedPrice + pbBasedPrice + yieldBasedPrice) / 3;

  return {
    peBasedPrice: Number(peBasedPrice.toFixed(2)),
    pbBasedPrice: Number(pbBasedPrice.toFixed(2)),
    yieldBasedPrice: Number(yieldBasedPrice.toFixed(2)),
    averagePrice: Number(averagePrice.toFixed(2)),
    eps: Number(eps.toFixed(2)),
    nav: Number(nav.toFixed(2))
  };
}

/**
 * 综合估值分析
 */
export function calculateComprehensiveValuation(
  inputs: ValuationInput,
  dcfWeight: number = 0.5,
  relativeWeight: number = 0.5
): ValuationResult {
  const dcfResult = calculateDCF(inputs);
  const relativeResult = calculateRelativeValuation(inputs);

  // 综合目标价（DCF + 相对估值）
  const targetPrice = dcfResult.dcfPrice * dcfWeight + relativeResult.averagePrice * relativeWeight;

  // 涨跌幅
  const upsideDownside = ((targetPrice - inputs.currentPrice) / inputs.currentPrice) * 100;

  // FFO（Funds From Operations）：假设为每股收益的1.1倍
  const ffoPerShare = relativeResult.eps * 1.1;
  const pFFO = targetPrice / ffoPerShare;

  // 投资建议
  let recommendation: 'buy' | 'hold' | 'sell';
  let recommendationText: string;

  if (upsideDownside >= 20) {
    recommendation = 'buy';
    recommendationText = '低估 - 强烈推荐买入';
  } else if (upsideDownside >= 10) {
    recommendation = 'buy';
    recommendationText = '偏低 - 推荐买入';
  } else if (upsideDownside >= -10) {
    recommendation = 'hold';
    recommendationText = '合理 - 持有观望';
  } else if (upsideDownside >= -20) {
    recommendation = 'sell';
    recommendationText = '偏高 - 建议卖出';
  } else {
    recommendation = 'sell';
    recommendationText = '高估 - 强烈建议卖出';
  }

  return {
    dcfPrice: dcfResult.dcfPrice,
    dcfUpsideDownside: dcfResult.upsideDownside,

    peBasedPrice: relativeResult.peBasedPrice,
    pbBasedPrice: relativeResult.pbBasedPrice,
    yieldBasedPrice: relativeResult.yieldBasedPrice,
    relativePrice: relativeResult.averagePrice,

    targetPrice: Number(targetPrice.toFixed(2)),
    upsideDownside: Number(upsideDownside.toFixed(2)),

    distributionYield: inputs.distributionYield,
    nav: relativeResult.nav,
    ffoPerShare: Number(ffoPerShare.toFixed(2)),
    pFFO: Number(pFFO.toFixed(2)),

    recommendation,
    recommendationText
  };
}

/**
 * 生成估值报告文本
 */
export function generateValuationReport(
  inputs: ValuationInput,
  result: ValuationResult
): string {
  const now = new Date().toLocaleString('zh-CN');

  return `
===========================================
REITs估值计算报告
===========================================
生成时间：${now}

===========================================
一、输入参数
===========================================

1. 基础参数
   - 当前价格：${inputs.currentPrice.toFixed(2)} 元
   - 总股本：${inputs.totalShares} 万股
   - 年度分红：${inputs.annualDistribution.toFixed(2)} 元/份
   - 分红率：${inputs.distributionYield.toFixed(2)}%

2. DCF估值参数
   - 增长率：${inputs.growthRate}%
   - 折现率：${inputs.discountRate}%
   - 终值增长率：${inputs.terminalGrowthRate}%
   - 预测年数：${inputs.projectionYears} 年

3. 相对估值参数
   - 可比公司PE：${inputs.peerAveragePE}
   - 可比公司PB：${inputs.peerAveragePB}
   - 可比分红率：${inputs.peerAverageYield}%

===========================================
二、估值结果
===========================================

1. DCF估值
   - DCF目标价：${result.dcfPrice.toFixed(2)} 元
   - 潜在涨跌幅：${result.dcfUpsideDownside >= 0 ? '+' : ''}${result.dcfUpsideDownside.toFixed(2)}%

2. 相对估值
   - PE法估值：${result.peBasedPrice.toFixed(2)} 元
   - PB法估值：${result.pbBasedPrice.toFixed(2)} 元
   - 收益率法估值：${result.yieldBasedPrice.toFixed(2)} 元
   - 相对估值平均：${result.relativePrice.toFixed(2)} 元

3. 综合估值
   - 综合目标价：${result.targetPrice.toFixed(2)} 元
   - 当前价格：${inputs.currentPrice.toFixed(2)} 元
   - 涨跌幅：${result.upsideDownside >= 0 ? '+' : ''}${result.upsideDownside.toFixed(2)}%
   - 投资建议：${result.recommendationText}

===========================================
三、关键财务指标
===========================================

- 每股净资产（NAV）：${result.nav.toFixed(2)} 元
- FFO/份：${result.ffoPerShare.toFixed(2)} 元
- P/FFO：${result.pFFO.toFixed(2)}
- 股息率：${result.distributionYield.toFixed(2)}%

===========================================
四、估值说明
===========================================

本报告基于以下方法进行估值：
1. DCF估值：使用两阶段现金流折现模型
2. 相对估值：采用PE、PB、股息率三种方法
3. 综合估值：DCF权重50%，相对估值权重50%

注意：本估值仅供参考，不构成投资建议。
实际投资决策请结合更多因素综合考量。

===========================================
报告结束
===========================================
`;
}

/**
 * 导出估值报告
 */
export function downloadValuationReport(
  inputs: ValuationInput,
  result: ValuationResult,
  reitsName: string = 'REITs产品'
): void {
  const reportText = generateValuationReport(inputs, result);
  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reitsName}_估值报告_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
