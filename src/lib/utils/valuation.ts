/**
 * 估值计算工具函数
 */

import type {
  ValuationInput,
  DCFInput,
  RelativeInput,
  RelativeResult,
  ValuationResult,
  ValuationReportData,
} from '@/types/valuation';

/**
 * 计算分红率
 */
export function calculateDividendYield(
  annualDividend: number,
  currentPrice: number
): number {
  if (currentPrice === 0) return 0;
  return Number((annualDividend / currentPrice * 100).toFixed(2));
}

/**
 * DCF估值计算（两阶段模型）
 */
export function calculateDCF(input: DCFInput): number {
  const { dividend, growthRate, discountRate, terminalGrowthRate, years } = input;

  let presentValue = 0;

  // 第一阶段：逐年折现
  for (let i = 1; i <= years; i++) {
    const fcf = dividend * Math.pow(1 + growthRate, i);
    presentValue += fcf / Math.pow(1 + discountRate, i);
  }

  // 终值
  const terminalFCF = dividend * Math.pow(1 + growthRate, years) * (1 + terminalGrowthRate);
  const terminalValue = terminalFCF / (discountRate - terminalGrowthRate);
  presentValue += terminalValue / Math.pow(1 + discountRate, years);

  return Number(presentValue.toFixed(2));
}

/**
 * 相对估值计算
 */
export function calculateRelative(input: RelativeInput): RelativeResult {
  const {
    dividend,
    peComparable,
    pbComparable,
    dividendYieldComparable,
    bookValuePerShare = 10,
  } = input;

  // PE法估值：使用收益率法（股息率法）
  const peValue = dividend / dividendYieldComparable;

  // PB法估值：每股净资产 × 可比PB
  const pbValue = bookValuePerShare * pbComparable;

  // 收益率法估值（与PE法相同，但可区分）
  const yieldValue = dividend / dividendYieldComparable;

  // 取三种方法的平均值作为相对估值结果
  const average = (peValue + pbValue + yieldValue) / 3;

  return {
    peValue: Number(peValue.toFixed(2)),
    pbValue: Number(pbValue.toFixed(2)),
    yieldValue: Number(yieldValue.toFixed(2)),
    average: Number(average.toFixed(2)),
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
  // DCF估值
  const dcfInput: DCFInput = {
    dividend: inputs.annualDividend,
    growthRate: inputs.growthRate / 100,
    discountRate: inputs.discountRate / 100,
    terminalGrowthRate: inputs.terminalGrowthRate / 100,
    years: inputs.forecastYears,
  };
  const dcfValue = calculateDCF(dcfInput);
  const dcfUpsideDownside = Number(((dcfValue - inputs.currentPrice) / inputs.currentPrice * 100).toFixed(2));

  // 相对估值
  const relativeInput: RelativeInput = {
    currentPrice: inputs.currentPrice,
    dividend: inputs.annualDividend,
    bookValuePerShare: inputs.navPerShare || inputs.currentPrice / 1.2,
    peComparable: inputs.peComparable,
    pbComparable: inputs.pbComparable,
    dividendYieldComparable: inputs.dividendYieldComparable / 100,
  };
  const relativeResult = calculateRelative(relativeInput);

  // 综合估值（DCF权重50%，相对估值权重50%）
  const comprehensive = dcfValue * dcfWeight + relativeResult.average * relativeWeight;

  // 涨跌幅
  const upsideDownside = Number(((comprehensive - inputs.currentPrice) / inputs.currentPrice * 100).toFixed(2));

  // 财务指标
  const nav = inputs.navPerShare || inputs.currentPrice / 1.2;
  const ffo = inputs.annualDividend * 1.1; // 假设FFO为分红的1.1倍
  const pffo = comprehensive / ffo;
  const dividendYield = inputs.dividendYield;

  // 投资建议
  let recommendation: 'buy' | 'hold' | 'sell';
  let recommendationText: string;

  if (upsideDownside >= 10) {
    recommendation = 'buy';
    recommendationText = '低估 - 推荐买入';
  } else if (upsideDownside >= -10) {
    recommendation = 'hold';
    recommendationText = '合理 - 持有观望';
  } else {
    recommendation = 'sell';
    recommendationText = '高估 - 建议卖出';
  }

  return {
    comprehensive: Number(comprehensive.toFixed(2)),
    dcf: dcfValue,
    dcfUpsideDownside,
    relative: {
      pe: relativeResult.peValue,
      pb: relativeResult.pbValue,
      yield: relativeResult.yieldValue,
      average: relativeResult.average,
    },
    financials: {
      nav: Number(nav.toFixed(2)),
      ffo: Number(ffo.toFixed(2)),
      pffo: Number(pffo.toFixed(2)),
      dividendYield,
    },
    recommendation,
    recommendationText,
  };
}

/**
 * 生成估值报告数据
 */
export function generateValuationReportData(
  inputs: ValuationInput,
  result: ValuationResult
): ValuationReportData {
  return {
    input: inputs,
    results: {
      comprehensive: result.comprehensive,
      dcf: result.dcf,
      relative: {
        peValue: result.relative.pe,
        pbValue: result.relative.pb,
        yieldValue: result.relative.yield,
        average: result.relative.average,
      },
      financials: result.financials,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * 导出估值报告（JSON格式）
 */
export function downloadValuationReport(
  inputs: ValuationInput,
  result: ValuationResult,
  reitsName: string = 'REITs产品'
): void {
  const reportData = generateValuationReportData(inputs, result);
  const jsonString = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reitsName}_估值报告_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
