'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  PieChart,
  Download,
  RefreshCw,
  Info,
  ArrowRight,
  Building2,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import type { ValuationInput, ValuationResult } from '@/types/valuation';
import {
  calculateDividendYield,
  calculateComprehensiveValuation,
  downloadValuationReport,
} from '@/lib/utils/valuation';

export default function CalculatorPage() {
  // 默认参数
  const defaultInputs: ValuationInput = {
    currentPrice: 10.5,
    totalShares: 100000,
    annualDividend: 0.52,
    dividendYield: 4.95,

    growthRate: 3.5,
    discountRate: 8.0,
    terminalGrowthRate: 2.0,
    forecastYears: 5,

    peComparable: 15.0,
    pbComparable: 1.2,
    dividendYieldComparable: 4.5,
    marketPe: 18.0,
    marketPb: 1.4,
    navPerShare: 8.75,
  };

  const [inputs, setInputs] = useState<ValuationInput>(defaultInputs);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 自动计算分红率
  useEffect(() => {
    if (inputs.currentPrice > 0 && inputs.annualDividend > 0) {
      const yieldRate = calculateDividendYield(inputs.annualDividend, inputs.currentPrice);
      setInputs(prev => ({ ...prev, dividendYield: yieldRate }));
    }
  }, [inputs.currentPrice, inputs.annualDividend]);

  // 监听参数变化，自动重新计算（防抖500ms）
  const performCalculation = useCallback(() => {
    setIsCalculating(true);
    const timeoutId = setTimeout(() => {
      try {
        const valuationResult = calculateComprehensiveValuation(inputs);
        setResult(valuationResult);
      } catch (error) {
        console.error('估值计算错误:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 500); // 防抖500ms

    return () => clearTimeout(timeoutId);
  }, [inputs]);

  useEffect(() => {
    if (inputs.currentPrice > 0) {
      performCalculation();
    }
  }, [inputs, performCalculation]);

  // 更新输入参数（带校验）
  const updateInput = (field: keyof ValuationInput, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // 基本校验
    if (field === 'forecastYears' && numValue < 1) {
      return; // 预测年数不能小于1
    }
    if (field === 'forecastYears' && numValue > 30) {
      return; // 预测年数不能超过30
    }

    setInputs(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
  };

  // 重置输入
  const handleReset = () => {
    setInputs(defaultInputs);
    setResult(null);
  };

  // 导出估值报告
  const handleExport = () => {
    if (result) {
      downloadValuationReport(inputs, result, 'REITs估值');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Calculator className="mr-3 h-8 w-8 text-orange-500" />
                REITs 估值计算器
              </h1>
              <p className="text-gray-600 mt-2">
                DCF/相对估值综合分析 - 专业REITs产品估值工具
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              重置
            </Button>
            <Button onClick={handleExport} disabled={!result}>
              <Download className="mr-2 h-4 w-4" />
              导出估值报告
            </Button>
          </div>
        </div>
      </div>

      {/* 上下布局：上方参数输入，下方结果展示 */}
      <div className="space-y-6">
        {/* 上方：参数输入区域 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-700">参数输入</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 基础参数卡片 */}
            <Card className="shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                  基础参数
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPrice">
                    当前价格 <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">(元)</span>
                  </Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    value={inputs.currentPrice}
                    onChange={(e) => updateInput('currentPrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalShares">
                    总股本 <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">(万股)</span>
                  </Label>
                  <Input
                    id="totalShares"
                    type="number"
                    step="1"
                    value={inputs.totalShares}
                    onChange={(e) => updateInput('totalShares', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualDividend">
                    年度分红 <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">(元)</span>
                  </Label>
                  <Input
                    id="annualDividend"
                    type="number"
                    step="0.01"
                    value={inputs.annualDividend}
                    onChange={(e) => updateInput('annualDividend', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dividendYield">
                    分红率
                    <span className="text-xs text-gray-500 ml-1">(%)</span>
                    <Badge variant="secondary" className="ml-2 text-xs">自动计算</Badge>
                  </Label>
                  <Input
                    id="dividendYield"
                    type="number"
                    step="0.01"
                    value={inputs.dividendYield}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    分红率 = 年度分红 / 当前价格 × 100%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* DCF估值参数卡片 */}
            <Card className="shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  DCF估值参数
                </CardTitle>
                <CardDescription>现金流折现法（两阶段模型）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="growthRate">
                    增长率
                    <span className="text-xs text-gray-500 ml-1">(%)</span>
                  </Label>
                  <Input
                    id="growthRate"
                    type="number"
                    step="0.1"
                    value={inputs.growthRate}
                    onChange={(e) => updateInput('growthRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountRate">
                    折现率
                    <span className="text-xs text-gray-500 ml-1">(%)</span>
                  </Label>
                  <Input
                    id="discountRate"
                    type="number"
                    step="0.1"
                    value={inputs.discountRate}
                    onChange={(e) => updateInput('discountRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terminalGrowthRate">
                    终值增长率
                    <span className="text-xs text-gray-500 ml-1">(%)</span>
                  </Label>
                  <Input
                    id="terminalGrowthRate"
                    type="number"
                    step="0.1"
                    value={inputs.terminalGrowthRate}
                    onChange={(e) => updateInput('terminalGrowthRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forecastYears">
                    预测年数
                    <span className="text-xs text-gray-500 ml-1">(年)</span>
                  </Label>
                  <Input
                    id="forecastYears"
                    type="number"
                    min="1"
                    max="30"
                    step="1"
                    value={inputs.forecastYears}
                    onChange={(e) => updateInput('forecastYears', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 相对估值参数卡片 */}
            <Card className="shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                  相对估值参数
                </CardTitle>
                <CardDescription>行业对标参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="peComparable">
                    可比公司平均PE
                  </Label>
                  <Input
                    id="peComparable"
                    type="number"
                    step="0.1"
                    value={inputs.peComparable}
                    onChange={(e) => updateInput('peComparable', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pbComparable">
                    可比公司平均PB
                  </Label>
                  <Input
                    id="pbComparable"
                    type="number"
                    step="0.01"
                    value={inputs.pbComparable}
                    onChange={(e) => updateInput('pbComparable', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dividendYieldComparable">
                    可比分红率
                    <span className="text-xs text-gray-500 ml-1">(%)</span>
                  </Label>
                  <Input
                    id="dividendYieldComparable"
                    type="number"
                    step="0.1"
                    value={inputs.dividendYieldComparable}
                    onChange={(e) => updateInput('dividendYieldComparable', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketPe">
                    市场平均PE
                    <span className="text-xs text-gray-500 ml-1">(可选)</span>
                  </Label>
                  <Input
                    id="marketPe"
                    type="number"
                    step="0.1"
                    value={inputs.marketPe}
                    onChange={(e) => updateInput('marketPe', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 下方：结果展示区域 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-700">估值结果</h2>
            {isCalculating && (
              <Badge variant="outline" className="ml-2">
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                计算中...
              </Badge>
            )}
          </div>

          {result ? (
            <>
              {/* 综合估值卡片 */}
              <Card className="shadow-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-orange-700 flex items-center">
                    <Calculator className="mr-3 h-8 w-8" />
                    综合估值结果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">综合目标价</p>
                      <p className="text-4xl font-bold text-blue-600">
                        ¥{result.comprehensive.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">当前价格</p>
                      <p className="text-4xl font-bold text-gray-700">
                        ¥{inputs.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">涨跌幅</p>
                      <p className={`text-4xl font-bold ${
                        result.comprehensive >= inputs.currentPrice ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.comprehensive >= inputs.currentPrice ? '+' : ''}
                        {((result.comprehensive - inputs.currentPrice) / inputs.currentPrice * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        result.recommendation === 'buy'
                          ? 'border-green-600 text-green-700 bg-green-50'
                          : result.recommendation === 'sell'
                          ? 'border-red-600 text-red-700 bg-red-50'
                          : 'border-yellow-600 text-yellow-700 bg-yellow-50'
                      }
                    >
                      <Info className="mr-1 h-4 w-4" />
                      {result.recommendationText}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* DCF估值卡片 */}
              <Card className="shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                    DCF估值
                    <Badge variant="outline" className="ml-2">权重 50%</Badge>
                  </CardTitle>
                  <CardDescription>现金流折现法（两阶段模型）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">DCF目标价</p>
                      <p className="text-3xl font-bold text-green-600">
                        ¥{result.dcf.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">潜在涨跌幅</p>
                      <p className={`text-3xl font-bold ${
                        result.dcfUpsideDownside >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.dcfUpsideDownside >= 0 ? '+' : ''}{result.dcfUpsideDownside}%
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <strong>关键假设：</strong>
                    增长率 {inputs.growthRate}%，折现率 {inputs.discountRate}%，
                    终值增长率 {inputs.terminalGrowthRate}%，预测年数 {inputs.forecastYears} 年
                  </div>
                </CardContent>
              </Card>

              {/* 相对估值卡片 */}
              <Card className="shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                    相对估值
                    <Badge variant="outline" className="ml-2">权重 50%</Badge>
                  </CardTitle>
                  <CardDescription>PE法、PB法、收益率法</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">相对估值平均价</p>
                      <p className="text-3xl font-bold text-purple-600">
                        ¥{result.relative.average.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">相对估值涨跌幅</p>
                      <p className={`text-3xl font-bold ${
                        result.relative.average >= inputs.currentPrice ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.relative.average >= inputs.currentPrice ? '+' : ''}
                        {((result.relative.average - inputs.currentPrice) / inputs.currentPrice * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        PE法估值 (可比PE: {inputs.peComparable})
                      </span>
                      <span className="text-xl font-bold">¥{result.relative.pe.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        PB法估值 (可比PB: {inputs.pbComparable})
                      </span>
                      <span className="text-xl font-bold">¥{result.relative.pb.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        收益率法估值 (可比分红率: {inputs.dividendYieldComparable}%)
                      </span>
                      <span className="text-xl font-bold">¥{result.relative.yield.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 关键财务指标卡片 */}
              <Card className="shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                    关键财务指标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-gray-600">NAV</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        ¥{result.financials.nav?.toFixed(2) || '—'}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-gray-600">FFO/份</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ¥{result.financials.ffo?.toFixed(2) || '—'}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Percent className="h-4 w-4 text-purple-600" />
                        <p className="text-sm text-gray-600">P/FFO</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {result.financials.pffo?.toFixed(2) || '—'}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <p className="text-sm text-gray-600">股息率</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {result.financials.dividendYield.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">等待输入参数</p>
                  <p className="text-sm mt-2">在上方输入参数后，估值结果将自动显示</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: '估值计算器 - REITs 智能助手',
  description: 'REITs产品估值计算工具，支持DCF估值、相对估值等多种估值方法',
};
