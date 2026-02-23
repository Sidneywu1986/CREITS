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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart,
  Download,
  RefreshCw,
  Info,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface ValuationInput {
  // 基础参数
  currentPrice: number;
  totalShares: number;
  annualDistribution: number;
  distributionYield: number;

  // DCF参数
  growthRate: number;
  discountRate: number;
  terminalGrowthRate: number;
  projectionYears: number;

  // 相对估值参数
  peerAveragePE: number;
  peerAveragePB: number;
  peerAverageYield: number;
  marketPE: number;
  marketPB: number;
}

interface ValuationResult {
  // DCF估值
  dcfValue: number;
  dcfPrice: number;
  dcfUpsideDownside: number;

  // 相对估值
  peBasedPrice: number;
  pbBasedPrice: number;
  yieldBasedPrice: number;

  // 综合估值
  averagePrice: number;
  impliedCapRate: number;

  // 财务指标
  nav: number;
  ffoPerShare: number;
  adjustedFfoPerShare: number;
}

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<ValuationInput>({
    currentPrice: 10,
    totalShares: 100000,
    annualDistribution: 0.5,
    distributionYield: 5,

    growthRate: 3,
    discountRate: 8,
    terminalGrowthRate: 2,
    projectionYears: 10,

    peerAveragePE: 15,
    peerAveragePB: 1.2,
    peerAverageYield: 4.5,
    marketPE: 20,
    marketPB: 1.5,
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 自动计算分红率
  useEffect(() => {
    if (inputs.currentPrice > 0 && inputs.annualDistribution > 0) {
      const yieldRate = (inputs.annualDistribution / inputs.currentPrice) * 100;
      setInputs(prev => ({ ...prev, distributionYield: Number(yieldRate.toFixed(2)) }));
    }
  }, [inputs.currentPrice, inputs.annualDistribution]);

  // DCF估值计算
  const calculateDCF = () => {
    const { currentPrice, annualDistribution, growthRate, discountRate, terminalGrowthRate, projectionYears } = inputs;
    const growthRateDecimal = growthRate / 100;
    const discountRateDecimal = discountRate / 100;
    const terminalGrowthDecimal = terminalGrowthRate / 100;

    let presentValue = 0;

    // 计算未来现金流的现值
    for (let year = 1; year <= projectionYears; year++) {
      const projectedCashFlow = annualDistribution * Math.pow(1 + growthRateDecimal, year);
      const discountedCashFlow = projectedCashFlow / Math.pow(1 + discountRateDecimal, year);
      presentValue += discountedCashFlow;
    }

    // 计算终值
    const terminalCashFlow = annualDistribution * Math.pow(1 + growthRateDecimal, projectionYears);
    const terminalValue = (terminalCashFlow * (1 + terminalGrowthDecimal)) / (discountRateDecimal - terminalGrowthDecimal);
    const discountedTerminalValue = terminalValue / Math.pow(1 + discountRateDecimal, projectionYears);

    const totalPresentValue = presentValue + discountedTerminalValue;
    const dcfPrice = totalPresentValue;
    const upsideDownside = ((dcfPrice - currentPrice) / currentPrice) * 100;

    return {
      value: totalPresentValue,
      price: dcfPrice,
      upsideDownside: Number(upsideDownside.toFixed(2)),
    };
  };

  // 相对估值计算
  const calculateRelativeValuation = () => {
    const { currentPrice, annualDistribution, peerAveragePE, peerAveragePB, peerAverageYield, marketPE, marketPB } = inputs;

    // 假设每股收益为 annualDistribution * 0.8 (保守估计)
    const eps = annualDistribution * 0.8;
    const nav = currentPrice / 1.2;

    // PE法估值
    const peBasedPrice = eps * peerAveragePE;

    // PB法估值
    const pbBasedPrice = nav * peerAveragePB;

    // 收益率法估值
    const yieldBasedPrice = annualDistribution / (peerAverageYield / 100);

    return {
      peBasedPrice: Number(peBasedPrice.toFixed(2)),
      pbBasedPrice: Number(pbBasedPrice.toFixed(2)),
      yieldBasedPrice: Number(yieldBasedPrice.toFixed(2)),
      eps,
      nav: Number(nav.toFixed(2)),
    };
  };

  // 综合估值计算
  const handleCalculate = () => {
    setIsCalculating(true);

    setTimeout(() => {
      const dcfResult = calculateDCF();
      const relativeResult = calculateRelativeValuation();

      // 综合估值（DCF权重40%，PE权重30%，PB权重30%）
      const averagePrice =
        dcfResult.price * 0.4 +
        relativeResult.peBasedPrice * 0.3 +
        relativeResult.pbBasedPrice * 0.3;

      // 隐含资本化率
      const impliedCapRate = (inputs.annualDistribution / averagePrice) * 100;

      setResult({
        dcfValue: dcfResult.value,
        dcfPrice: Number(dcfResult.price.toFixed(2)),
        dcfUpsideDownside: dcfResult.upsideDownside,

        peBasedPrice: relativeResult.peBasedPrice,
        pbBasedPrice: relativeResult.pbBasedPrice,
        yieldBasedPrice: relativeResult.yieldBasedPrice,

        averagePrice: Number(averagePrice.toFixed(2)),
        impliedCapRate: Number(impliedCapRate.toFixed(2)),

        nav: relativeResult.nav,
        ffoPerShare: Number((relativeResult.eps * 1.1).toFixed(2)),
        adjustedFfoPerShare: Number((relativeResult.eps * 1.15).toFixed(2)),
      });

      setIsCalculating(false);
    }, 500);
  };

  // 重置输入
  const handleReset = () => {
    setInputs({
      currentPrice: 10,
      totalShares: 100000,
      annualDistribution: 0.5,
      distributionYield: 5,

      growthRate: 3,
      discountRate: 8,
      terminalGrowthRate: 2,
      projectionYears: 10,

      peerAveragePE: 15,
      peerAveragePB: 1.2,
      peerAverageYield: 4.5,
      marketPE: 20,
      marketPB: 1.5,
    });
    setResult(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                返回
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <Calculator className="mr-3 text-[#667eea]" />
              REITs 估值计算器
            </h1>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重置
          </Button>
        </div>
        <p className="text-gray-600 mt-2 ml-20">
          综合估值分析工具 - 支持DCF估值、相对估值等多种估值方法
        </p>
      </div>

      {/* 估值计算器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 text-[#667eea]" />
            估值参数设置
          </CardTitle>
          <CardDescription>
            输入REITs产品的基础参数和市场参数，系统将自动计算估值结果
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="inputs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inputs">输入参数</TabsTrigger>
              <TabsTrigger value="results" disabled={!result}>
                估值结果
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inputs" className="space-y-6">
              {/* 基础参数 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                  基础参数
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPrice">当前价格 (元)</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      step="0.01"
                      value={inputs.currentPrice}
                      onChange={(e) => setInputs({ ...inputs, currentPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalShares">总股本 (万股)</Label>
                    <Input
                      id="totalShares"
                      type="number"
                      value={inputs.totalShares}
                      onChange={(e) => setInputs({ ...inputs, totalShares: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualDistribution">年度分红 (元/份)</Label>
                    <Input
                      id="annualDistribution"
                      type="number"
                      step="0.01"
                      value={inputs.annualDistribution}
                      onChange={(e) => setInputs({ ...inputs, annualDistribution: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distributionYield">分红率 (%)</Label>
                    <Input
                      id="distributionYield"
                      type="number"
                      step="0.01"
                      value={inputs.distributionYield}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* DCF参数 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  DCF估值参数
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="growthRate">增长率 (%)</Label>
                    <Input
                      id="growthRate"
                      type="number"
                      step="0.1"
                      value={inputs.growthRate}
                      onChange={(e) => setInputs({ ...inputs, growthRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountRate">折现率 (%)</Label>
                    <Input
                      id="discountRate"
                      type="number"
                      step="0.1"
                      value={inputs.discountRate}
                      onChange={(e) => setInputs({ ...inputs, discountRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="terminalGrowthRate">终值增长率 (%)</Label>
                    <Input
                      id="terminalGrowthRate"
                      type="number"
                      step="0.1"
                      value={inputs.terminalGrowthRate}
                      onChange={(e) => setInputs({ ...inputs, terminalGrowthRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectionYears">预测年数 (年)</Label>
                    <Input
                      id="projectionYears"
                      type="number"
                      min="1"
                      max="30"
                      value={inputs.projectionYears}
                      onChange={(e) => setInputs({ ...inputs, projectionYears: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 相对估值参数 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                  相对估值参数
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peerAveragePE">可比公司平均PE</Label>
                    <Input
                      id="peerAveragePE"
                      type="number"
                      step="0.1"
                      value={inputs.peerAveragePE}
                      onChange={(e) => setInputs({ ...inputs, peerAveragePE: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerAveragePB">可比公司平均PB</Label>
                    <Input
                      id="peerAveragePB"
                      type="number"
                      step="0.01"
                      value={inputs.peerAveragePB}
                      onChange={(e) => setInputs({ ...inputs, peerAveragePB: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerAverageYield">可比公司平均分红率 (%)</Label>
                    <Input
                      id="peerAverageYield"
                      type="number"
                      step="0.1"
                      value={inputs.peerAverageYield}
                      onChange={(e) => setInputs({ ...inputs, peerAverageYield: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketPE">市场平均PE</Label>
                    <Input
                      id="marketPE"
                      type="number"
                      step="0.1"
                      value={inputs.marketPE}
                      onChange={(e) => setInputs({ ...inputs, marketPE: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketPB">市场平均PB</Label>
                    <Input
                      id="marketPB"
                      type="number"
                      step="0.01"
                      value={inputs.marketPB}
                      onChange={(e) => setInputs({ ...inputs, marketPB: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* 计算按钮 */}
              <div className="flex justify-end">
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      计算中...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      开始估值计算
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {result && (
                <>
                  {/* 综合估值结果 */}
                  <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <BarChart className="mr-2 h-6 w-6" />
                      综合估值结果
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm opacity-90">目标价格</p>
                        <p className="text-3xl font-bold">¥{result.averagePrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">当前价格</p>
                        <p className="text-3xl font-bold">¥{inputs.currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">涨跌幅</p>
                        <p className={`text-3xl font-bold ${result.dcfUpsideDownside >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {result.dcfUpsideDownside >= 0 ? '+' : ''}{result.dcfUpsideDownside.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* DCF估值结果 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                      DCF估值
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">DCF估值价格</p>
                          <p className="text-2xl font-bold">¥{result.dcfPrice.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">DCF现值</p>
                          <p className="text-2xl font-bold">¥{result.dcfValue.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">潜在涨跌幅</p>
                          <p className={`text-2xl font-bold ${result.dcfUpsideDownside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.dcfUpsideDownside >= 0 ? '+' : ''}{result.dcfUpsideDownside}%
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* 相对估值结果 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                      相对估值
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">PE法估值</p>
                          <p className="text-2xl font-bold">¥{result.peBasedPrice.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">PB法估值</p>
                          <p className="text-2xl font-bold">¥{result.pbBasedPrice.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">收益率法估值</p>
                          <p className="text-2xl font-bold">¥{result.yieldBasedPrice.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* 财务指标 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Info className="mr-2 h-5 w-5 text-blue-600" />
                      关键财务指标
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">NAV (元)</p>
                          <p className="text-2xl font-bold">¥{result.nav.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">FFO/份 (元)</p>
                          <p className="text-2xl font-bold">¥{result.ffoPerShare.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">调整后FFO/份 (元)</p>
                          <p className="text-2xl font-bold">¥{result.adjustedFfoPerShare.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600">隐含资本化率 (%)</p>
                          <p className="text-2xl font-bold">{result.impliedCapRate.toFixed(2)}%</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* 导出按钮 */}
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      导出估值报告
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: '估值计算器 - REITs 智能助手',
  description: 'REITs产品估值计算工具，支持DCF估值、相对估值等多种估值方法',
};
