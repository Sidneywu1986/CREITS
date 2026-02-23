'use client';

import { useState, useEffect } from 'react';
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
import {
  ValuationInput,
  calculateDistributionYield,
  calculateComprehensiveValuation,
  downloadValuationReport,
} from '@/lib/utils/valuation';

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<ValuationInput>({
    currentPrice: 10.5,
    totalShares: 100000,
    annualDistribution: 0.52,
    distributionYield: 4.95,

    growthRate: 3.5,
    discountRate: 8.0,
    terminalGrowthRate: 2.0,
    projectionYears: 5,

    peerAveragePE: 15.0,
    peerAveragePB: 1.2,
    peerAverageYield: 4.5,
    marketPE: 18.0,
    marketPB: 1.4,
  });

  const [result, setResult] = useState<ReturnType<typeof calculateComprehensiveValuation> | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 自动计算分红率
  useEffect(() => {
    if (inputs.currentPrice > 0 && inputs.annualDistribution > 0) {
      const yieldRate = calculateDistributionYield(inputs.annualDistribution, inputs.currentPrice);
      setInputs(prev => ({ ...prev, distributionYield: yieldRate }));
    }
  }, [inputs.currentPrice, inputs.annualDistribution]);

  // 监听参数变化，自动重新计算
  useEffect(() => {
    if (inputs.currentPrice > 0) {
      setIsCalculating(true);
      const timeoutId = setTimeout(() => {
        const valuationResult = calculateComprehensiveValuation(inputs);
        setResult(valuationResult);
        setIsCalculating(false);
      }, 300); // 防抖300ms

      return () => clearTimeout(timeoutId);
    }
  }, [inputs]);

  // 更新输入参数
  const updateInput = (field: keyof ValuationInput, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // 重置输入
  const handleReset = () => {
    setInputs({
      currentPrice: 10.5,
      totalShares: 100000,
      annualDistribution: 0.52,
      distributionYield: 4.95,

      growthRate: 3.5,
      discountRate: 8.0,
      terminalGrowthRate: 2.0,
      projectionYears: 5,

      peerAveragePE: 15.0,
      peerAveragePB: 1.2,
      peerAverageYield: 4.5,
      marketPE: 18.0,
      marketPB: 1.4,
    });
  };

  // 导出估值报告
  const handleExport = () => {
    if (result) {
      downloadValuationReport(inputs, result, 'REITs估值');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                <Calculator className="mr-3 h-8 w-8 text-[#667eea]" />
                REITs 估值计算器
              </h1>
              <p className="text-gray-600 mt-2">
                综合估值分析工具 - 支持DCF估值、相对估值等多种估值方法
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
              导出报告
            </Button>
          </div>
        </div>
      </div>

      {/* 两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：参数输入表单 */}
        <div className="lg:col-span-5 space-y-6">
          {/* 基础参数 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                基础参数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    onChange={(e) => updateInput('currentPrice', Number(e.target.value))}
                    className="text-base"
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
                    step="0.01"
                    value={inputs.totalShares}
                    onChange={(e) => updateInput('totalShares', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annualDistribution">
                    年度分红 <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">(元/份)</span>
                  </Label>
                  <Input
                    id="annualDistribution"
                    type="number"
                    step="0.01"
                    value={inputs.annualDistribution}
                    onChange={(e) => updateInput('annualDistribution', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distributionYield">
                    分红率
                    <span className="text-xs text-gray-500 ml-1">(%)</span>
                  </Label>
                  <Input
                    id="distributionYield"
                    type="number"
                    step="0.01"
                    value={inputs.distributionYield}
                    disabled
                    className="text-base bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">根据年度分红自动计算</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DCF估值参数 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                DCF估值参数
              </CardTitle>
              <CardDescription>现金流折现法参数设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    onChange={(e) => updateInput('growthRate', Number(e.target.value))}
                    className="text-base"
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
                    onChange={(e) => updateInput('discountRate', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    onChange={(e) => updateInput('terminalGrowthRate', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectionYears">
                    预测年数
                    <span className="text-xs text-gray-500 ml-1">(年)</span>
                  </Label>
                  <Input
                    id="projectionYears"
                    type="number"
                    min="1"
                    max="30"
                    value={inputs.projectionYears}
                    onChange={(e) => updateInput('projectionYears', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 相对估值参数 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                相对估值参数
              </CardTitle>
              <CardDescription>行业对标参数设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peerAveragePE">
                    可比公司PE
                  </Label>
                  <Input
                    id="peerAveragePE"
                    type="number"
                    step="0.1"
                    value={inputs.peerAveragePE}
                    onChange={(e) => updateInput('peerAveragePE', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peerAveragePB">
                    可比公司PB
                  </Label>
                  <Input
                    id="peerAveragePB"
                    type="number"
                    step="0.01"
                    value={inputs.peerAveragePB}
                    onChange={(e) => updateInput('peerAveragePB', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peerAverageYield">
                    可比分红率
                    <span className="text-xs text-gray-500 ml-1">(%)</span>
                  </Label>
                  <Input
                    id="peerAverageYield"
                    type="number"
                    step="0.1"
                    value={inputs.peerAverageYield}
                    onChange={(e) => updateInput('peerAverageYield', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketPE">
                    市场PE
                    <span className="text-xs text-gray-500 ml-1">(可选)</span>
                  </Label>
                  <Input
                    id="marketPE"
                    type="number"
                    step="0.1"
                    value={inputs.marketPE}
                    onChange={(e) => updateInput('marketPE', Number(e.target.value))}
                    className="text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketPB">
                  市场PB
                  <span className="text-xs text-gray-500 ml-1">(可选)</span>
                </Label>
                <Input
                  id="marketPB"
                  type="number"
                  step="0.01"
                  value={inputs.marketPB}
                  onChange={(e) => updateInput('marketPB', Number(e.target.value))}
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：估值结果展示 */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <>
              {/* 综合估值卡片 */}
              <Card className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Calculator className="mr-3 h-8 w-8" />
                    综合估值结果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm opacity-90 mb-2">综合目标价</p>
                      <p className="text-4xl font-bold">¥{result.targetPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-2">当前价格</p>
                      <p className="text-4xl font-bold">¥{inputs.currentPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-2">涨跌幅</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-4xl font-bold ${result.upsideDownside >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {result.upsideDownside >= 0 ? '+' : ''}{result.upsideDownside.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4 bg-white/20" />
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        result.recommendation === 'buy'
                          ? 'border-green-400 text-green-300 bg-green-400/20'
                          : result.recommendation === 'sell'
                          ? 'border-red-400 text-red-300 bg-red-400/20'
                          : 'border-yellow-400 text-yellow-300 bg-yellow-400/20'
                      }
                    >
                      <Info className="mr-1 h-4 w-4" />
                      {result.recommendationText}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* DCF估值卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                    DCF估值
                    <Badge variant="outline" className="ml-2">权重 50%</Badge>
                  </CardTitle>
                  <CardDescription>现金流折现法（两阶段模型）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">DCF目标价</p>
                        <p className="text-2xl font-bold text-green-600">
                          ¥{result.dcfPrice.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">潜在涨跌幅</p>
                        <p className={`text-2xl font-bold ${result.dcfUpsideDownside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.dcfUpsideDownside >= 0 ? '+' : ''}{result.dcfUpsideDownside}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">折现率</p>
                        <p className="text-2xl font-bold">{inputs.discountRate}%</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>关键假设：</strong>
                      增长率 {inputs.growthRate}%，终值增长率 {inputs.terminalGrowthRate}%，
                      预测年数 {inputs.projectionYears} 年
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 相对估值卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                    相对估值
                    <Badge variant="outline" className="ml-2">权重 50%</Badge>
                  </CardTitle>
                  <CardDescription>PE法、PB法、收益率法</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">PE法估值</p>
                        <p className="text-2xl font-bold">¥{result.peBasedPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">可比PE: {inputs.peerAveragePE}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">PB法估值</p>
                        <p className="text-2xl font-bold">¥{result.pbBasedPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">可比PB: {inputs.peerAveragePB}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-1">收益率法估值</p>
                        <p className="text-2xl font-bold">¥{result.yieldBasedPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">可比分红率: {inputs.peerAverageYield}%</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">相对估值平均价</span>
                      <span className="text-2xl font-bold text-purple-600">
                        ¥{result.relativePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 关键财务指标 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                    关键财务指标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <p className="text-sm text-gray-600">NAV</p>
                        </div>
                        <p className="text-2xl font-bold">¥{result.nav.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <p className="text-sm text-gray-600">FFO/份</p>
                        </div>
                        <p className="text-2xl font-bold">¥{result.ffoPerShare.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Percent className="h-4 w-4 text-purple-600" />
                          <p className="text-sm text-gray-600">P/FFO</p>
                        </div>
                        <p className="text-2xl font-bold">{result.pFFO.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <p className="text-sm text-gray-600">股息率</p>
                        </div>
                        <p className="text-2xl font-bold">{result.distributionYield.toFixed(2)}%</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">等待输入参数</p>
                  <p className="text-sm mt-2">在左侧输入参数后，估值结果将自动显示</p>
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
