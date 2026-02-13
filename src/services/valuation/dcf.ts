/**
 * REITs估值计算服务
 * 提供DCF估值、IRR计算等核心算法
 */

// 估值参数接口
export interface ValuationParams {
  // REITs基本信息
  currentPrice: number; // 当前价格
  totalShares: number; // 总份额
  
  // 底层资产信息
  assets: {
    assetName: string;
    assetType: string;
    baseEBITDA: number; // 基础EBITDA（万元）
    growthRate: number; // 增长率
    residualValue: number; // 剩余价值（万元）
    maturityDate: Date; // 到期日期
  }[];
  
  // 财务参数
  ebitdaToCashRatio: number; // EBITDA转现金流比例
  operatingExpense: number; // 运营费用（万元）
  
  // 债务信息
  debts: {
    debtType: string;
    principal: number; // 本金（万元）
    interestRate: number; // 利率
    maturityDate: Date; // 到期日期
  }[];
  
  // 税率
  taxRate: number; // 税率
  
  // 折现率
  discountRate: number; // 折现率
}

// 现金流接口
export interface CashFlow {
  year: number;
  ebitda: number;
  distributableCash: number;
  npv: number;
}

// 估值结果接口
export interface ValuationResult {
  irr: number; // 内部收益率
  fairValue: number; // 公允价值（元）
  priceToNAV: number; // 市净率
  dividendYield: number; // 分派率
  cashFlows: CashFlow[]; // 现金流预测
  totalCashFlow: number; // 总现金流现值
  assetDetails: any[]; // 资产明细
}

// DCF估值计算类
export class DCFValuation {
  
  /**
   * 计算REITs内部收益率（IRR）
   * 使用牛顿迭代法求解
   * @param cashFlows - 未来现金流数组
   * @param currentPrice - 当前价格
   * @returns IRR
   */
  static calculateIRR(cashFlows: number[], currentPrice: number): number {
    let irr = 0.1; // 初始猜测值10%
    const tolerance = 1e-6;
    const maxIterations = 1000;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = -currentPrice;
      let derivative = 0;
      
      cashFlows.forEach((cf, year) => {
        npv += cf / Math.pow(1 + irr, year + 1);
        derivative -= (year + 1) * cf / Math.pow(1 + irr, year + 2);
      });
      
      const newIrr = irr - npv / derivative;
      
      if (Math.abs(newIrr - irr) < tolerance) {
        return irr;
      }
      
      irr = newIrr;
    }
    
    // 如果未收敛，返回最后一次结果
    return irr;
  }
  
  /**
   * 计算资产端EBITDA预测
   * @param baseEBITDA - 基础EBITDA
   * @param growthRate - 增长率
   * @param years - 预测年数
   */
  static calculateEBITDAForecast(
    baseEBITDA: number,
    growthRate: number,
    years: number
  ): number[] {
    const forecast: number[] = [];
    for (let i = 0; i < years; i++) {
      forecast.push(baseEBITDA * Math.pow(1 + growthRate, i));
    }
    return forecast;
  }
  
  /**
   * 计算基金端可供分配现金流
   * @param assetEBITDA - 资产端EBITDA
   * @param params - 其他参数
   */
  static calculateDistributableCash(
    assetEBITDA: number,
    params: {
      ebitdaToCashRatio: number;
      debtPrincipal: number;
      debtInterest: number;
      operatingExpense: number;
      taxRate: number;
    }
  ): number {
    const { ebitdaToCashRatio, debtPrincipal, debtInterest, operatingExpense, taxRate } = params;
    
    // 计算运营现金流
    const operatingCashFlow = assetEBITDA * ebitdaToCashRatio;
    
    // 计算税前现金流
    const preTaxCashFlow = operatingCashFlow - debtInterest - operatingExpense;
    
    // 计算税费
    const tax = Math.max(0, preTaxCashFlow * taxRate);
    
    // 计算可供分配现金流
    const distributableCash = operatingCashFlow - debtPrincipal - debtInterest - operatingExpense - tax;
    
    return distributableCash;
  }
  
  /**
   * 计算债务本息支付
   * @param debts - 债务数组
   * @param year - 第几年
   */
  static calculateDebtPayment(debts: ValuationParams['debts'], year: number): {
    principal: number;
    interest: number;
  } {
    let totalPrincipal = 0;
    let totalInterest = 0;
    
    debts.forEach(debt => {
      // 计算债务剩余期限
      const yearsRemaining = Math.max(0, this.getYearsDiff(new Date(), debt.maturityDate));
      
      // 如果债务在预测期内，计算本息
      if (year < yearsRemaining) {
        // 假设等额本金还款
        const principalPerYear = debt.principal / yearsRemaining;
        totalPrincipal += principalPerYear;
        totalInterest += (debt.principal - principalPerYear * year) * debt.interestRate;
      }
    });
    
    return { principal: totalPrincipal, interest: totalInterest };
  }
  
  /**
   * 获取两个日期之间的年数差
   */
  static getYearsDiff(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
  }
  
  /**
   * 执行完整的DCF估值
   * @param params - 估值参数
   * @param forecastYears - 预测年数
   */
  static calculateDCF(params: ValuationParams, forecastYears: number = 10): ValuationResult {
    const cashFlows: CashFlow[] = [];
    let totalNPV = 0;
    
    // 遍历每一年
    for (let year = 0; year < forecastYears; year++) {
      // 1. 计算总EBITDA
      let totalEBITDA = 0;
      params.assets.forEach(asset => {
        totalEBITDA += asset.baseEBITDA * Math.pow(1 + asset.growthRate, year);
      });
      
      // 2. 计算债务本息
      const { principal, interest } = this.calculateDebtPayment(params.debts, year);
      
      // 3. 计算可供分配现金流
      const distributableCash = this.calculateDistributableCash(totalEBITDA, {
        ebitdaToCashRatio: params.ebitdaToCashRatio,
        debtPrincipal: principal,
        debtInterest: interest,
        operatingExpense: params.operatingExpense,
        taxRate: params.taxRate,
      });
      
      // 4. 计算现金流现值
      const npv = distributableCash / Math.pow(1 + params.discountRate, year + 1);
      
      cashFlows.push({
        year: year + 1,
        ebitda: totalEBITDA,
        distributableCash,
        npv,
      });
      
      totalNPV += npv;
    }
    
    // 5. 计算剩余价值现值
    let totalResidualValue = 0;
    params.assets.forEach(asset => {
      totalResidualValue += asset.residualValue;
    });
    const residualValueNPV = totalResidualValue / Math.pow(1 + params.discountRate, forecastYears);
    totalNPV += residualValueNPV;
    
    // 6. 计算每份额的公允价值
    const fairValuePerShare = totalNPV / params.totalShares;
    
    // 7. 计算IRR
    const allCashFlows = cashFlows.map(cf => cf.distributableCash);
    allCashFlows.push(totalResidualValue); // 最后一年加上剩余价值
    const irr = this.calculateIRR(allCashFlows, params.currentPrice);
    
    // 8. 计算分派率
    const annualDividend = cashFlows[0].distributableCash;
    const dividendYield = annualDividend / (params.currentPrice * params.totalShares);
    
    // 9. 计算市净率
    const nav = totalNPV;
    const priceToNAV = (params.currentPrice * params.totalShares) / nav;
    
    return {
      irr,
      fairValue: fairValuePerShare,
      priceToNAV,
      dividendYield,
      cashFlows,
      totalCashFlow: totalNPV,
      assetDetails: params.assets,
    };
  }
  
  /**
   * 敏感性分析
   * @param params - 基准参数
   * @param parameter - 要调整的参数
   * @param range - 调整范围（如 [-0.02, -0.01, 0, 0.01, 0.02]）
   */
  static sensitivityAnalysis(
    params: ValuationParams,
    parameter: string,
    range: number[]
  ): Array<{ value: number; irr: number; fairValue: number }> {
    return range.map(adjustment => {
      const newParams = JSON.parse(JSON.stringify(params)) as ValuationParams;
      let baseValue = 0;

      // 根据参数类型调整
      if (parameter === 'discountRate') {
        baseValue = params.discountRate;
        newParams.discountRate = baseValue + adjustment;
      } else if (parameter === 'taxRate') {
        baseValue = params.taxRate;
        newParams.taxRate = baseValue + adjustment;
      } else if (parameter === 'ebitdaToCashRatio') {
        baseValue = params.ebitdaToCashRatio;
        newParams.ebitdaToCashRatio = baseValue + adjustment;
      } else if (parameter === 'growthRate') {
        // 调整所有资产的增长率
        baseValue = params.assets[0]?.growthRate || 0.03;
        newParams.assets.forEach(asset => {
          asset.growthRate = baseValue + adjustment;
        });
      }
      
      const result = this.calculateDCF(newParams);
      return {
        value: baseValue + adjustment,
        irr: result.irr,
        fairValue: result.fairValue,
      };
    });
  }
}

// 预设估值模板
export const ValuationTemplates = {
  // 产业园区模板
  industrialPark: {
    ebitdaToCashRatio: 0.85,
    discountRate: 0.07,
    taxRate: 0.25,
    growthRate: 0.03,
  },
  
  // 仓储物流模板
  warehouse: {
    ebitdaToCashRatio: 0.9,
    discountRate: 0.065,
    taxRate: 0.25,
    growthRate: 0.04,
  },
  
  // 交通基础设施模板
  transport: {
    ebitdaToCashRatio: 0.8,
    discountRate: 0.055,
    taxRate: 0.25,
    growthRate: 0.02,
  },
  
  // 保障性租赁住房模板
  affordableHousing: {
    ebitdaToCashRatio: 0.88,
    discountRate: 0.06,
    taxRate: 0.12, // 保障性租赁住房有税收优惠
    growthRate: 0.05,
  },
  
  // 能源基础设施模板
  energy: {
    ebitdaToCashRatio: 0.82,
    discountRate: 0.075,
    taxRate: 0.25,
    growthRate: 0.025,
  },
  
  // 消费基础设施模板
  consumer: {
    ebitdaToCashRatio: 0.87,
    discountRate: 0.08,
    taxRate: 0.25,
    growthRate: 0.045,
  },
};
