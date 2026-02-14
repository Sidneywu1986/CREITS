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
  X,
} from 'lucide-react';

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

interface REITsValuationCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  reitsName?: string;
  reitsCode?: string;
  currentPrice?: number;
  annualDistribution?: number;
}

export default function REITsValuationCalculator({
  isOpen,
  onClose,
  reitsName = 'REITs产品',
  reitsCode = 'XXXXXX',
  currentPrice = 0,
  annualDistribution = 0,
}: REITsValuationCalculatorProps) {
  const [inputs, setInputs] = useState<ValuationInput>({
    currentPrice: currentPrice || 10,
    totalShares: 100000,
    annualDistribution: annualDistribution || 0.5,
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
    let projectedCashFlows: number[] = [];

    // 计算未来现金流的现值
    for (let year = 1; year <= projectionYears; year++) {
      const projectedCashFlow = annualDistribution * Math.pow(1 + growthRateDecimal, year);
      const discountedCashFlow = projectedCashFlow / Math.pow(1 + discountRateDecimal, year);
      presentValue += discountedCashFlow;
      projectedCashFlows.push(projectedCashFlow);
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
      projectedCashFlows,
      terminalValue,
    };
  };

  // 相对估值计算
  const calculateRelativeValuation = () => {
    const { currentPrice, annualDistribution, peerAveragePE, peerAveragePB, peerAverageYield, marketPE, marketPB } = inputs;

    // 假设每股收益为 annualDistribution * 0.8 (保守估计)
    const eps = annualDistribution * 0.8;
    const nav = currentPrice / 1.2; // 假设NAV为当前价格的83%

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
      currentPrice: currentPrice || 10,
      totalShares: 100000,
      annualDistribution: annualDistribution || 0.5,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 text-[#667eea]" />
                {reitsName} ({reitsCode}) 估值计算器
              </CardTitle>
              <CardDescription>综合估值分析 - DCF + 相对估值</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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
                  <DollarSign className="mr-2 h-5 w-5" />
                  基础参数
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* DCF参数 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  DCF模型参数
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="growthRate">
                      预期增长率 (%)
                      <Badge variant="secondary" className="ml-2">
                        <Info className="h-3 w-3 mr-1" />
                        建议2-5%
                      </Badge>
                    </Label>
                    <Input
                      id="growthRate"
                      type="number"
                      step="0.1"
                      value={inputs.growthRate}
                      onChange={(e) => setInputs({ ...inputs, growthRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountRate">
                      折现率 (%)
                      <Badge variant="secondary" className="ml-2">
                        <Info className="h-3 w-3 mr-1" />
                        建议7-10%
                      </Badge>
                    </Label>
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
                    <Label htmlFor="projectionYears">预测年限 (年)</Label>
                    <Input
                      id="projectionYears"
                      type="number"
                      min="5"
                      max="20"
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
                  <PieChart className="mr-2 h-5 w-5" />
                  相对估值参数
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peerAveragePE">同业平均市盈率 (PE)</Label>
                    <Input
                      id="peerAveragePE"
                      type="number"
                      step="0.1"
                      value={inputs.peerAveragePE}
                      onChange={(e) => setInputs({ ...inputs, peerAveragePE: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerAveragePB">同业平均市净率 (PB)</Label>
                    <Input
                      id="peerAveragePB"
                      type="number"
                      step="0.1"
                      value={inputs.peerAveragePB}
                      onChange={(e) => setInputs({ ...inputs, peerAveragePB: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerAverageYield">同业平均分红率 (%)</Label>
                    <Input
                      id="peerAverageYield"
                      type="number"
                      step="0.1"
                      value={inputs.peerAverageYield}
                      onChange={(e) => setInputs({ ...inputs, peerAverageYield: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketPE">市场平均市盈率</Label>
                    <Input
                      id="marketPE"
                      type="number"
                      step="0.1"
                      value={inputs.marketPE}
                      onChange={(e) => setInputs({ ...inputs, marketPE: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="flex-1 bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {isCalculating ? '计算中...' : '开始计算'}
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重置
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {result && (
                <>
                  {/* 综合估值 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <BarChart className="mr-2 h-5 w-5 text-[#667eea]" />
                        综合估值结果
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">综合估值价格</div>
                          <div className="text-2xl font-bold text-[#667eea]">
                            ¥{result.averagePrice.toFixed(2)}
                          </div>
                          <Badge
                            variant={
                              result.averagePrice >= inputs.currentPrice ? 'default' : 'destructive'
                            }
                            className="mt-2"
                          >
                            {result.averagePrice >= inputs.currentPrice ? '+' : ''}
                            {((result.averagePrice - inputs.currentPrice) / inputs.currentPrice * 100).toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">当前价格</div>
                          <div className="text-2xl font-bold text-green-600">
                            ¥{inputs.currentPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">隐含资本化率</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {result.impliedCapRate.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* DCF估值 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">DCF估值 (现金流折现)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">DCF估值价格</div>
                          <div className="text-xl font-bold">¥{result.dcfPrice}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">DCF总现值</div>
                          <div className="text-xl font-bold">¥{result.dcfValue.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">上行/下行空间</div>
                          <Badge
                            variant={result.dcfUpsideDownside >= 0 ? 'default' : 'destructive'}
                          >
                            {result.dcfUpsideDownside >= 0 ? '+' : ''}{result.dcfUpsideDownside}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 相对估值 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">相对估值</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">PE法估值</div>
                          <div className="text-xl font-bold">¥{result.peBasedPrice}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">PB法估值</div>
                          <div className="text-xl font-bold">¥{result.pbBasedPrice}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">收益率法估值</div>
                          <div className="text-xl font-bold">¥{result.yieldBasedPrice}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 财务指标 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">关键财务指标</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">净资产价值 (NAV)</div>
                          <div className="text-xl font-bold">¥{result.nav}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">每股运营资金 (FFO)</div>
                          <div className="text-xl font-bold">¥{result.ffoPerShare}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">调整后每股运营资金 (AFFO)</div>
                          <div className="text-xl font-bold">¥{result.adjustedFfoPerShare}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 投资建议分析 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-[#667eea]" />
                        投资建议分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">估值结论</h4>
                        {result.averagePrice > inputs.currentPrice * 1.1 ? (
                          <p className="text-green-600">
                            当前价格被低估，综合估值价格比当前价格高出{' '}
                            {((result.averagePrice - inputs.currentPrice) / inputs.currentPrice * 100).toFixed(2)}%
                            ，建议增持。
                          </p>
                        ) : result.averagePrice < inputs.currentPrice * 0.9 ? (
                          <p className="text-red-600">
                            当前价格被高估，综合估值价格比当前价格低{' '}
                            {((inputs.currentPrice - result.averagePrice) / inputs.currentPrice * 100).toFixed(2)}%
                            ，建议减持。
                          </p>
                        ) : (
                          <p className="text-blue-600">
                            当前价格处于合理区间，综合估值价格与当前价格接近，建议持有。
                          </p>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">DCF分析</h4>
                        <p className="text-sm text-muted-foreground">
                          DCF模型显示，基于{inputs.projectionYears}年的现金流预测，假设增长率为{' '}
                          {inputs.growthRate}%，折现率为{inputs.discountRate}%，DCF估值为¥{result.dcfPrice}，
                          {result.dcfUpsideDownside >= 0 ? '存在上行' : '存在下行'}空间{Math.abs(result.dcfUpsideDownside)}%。
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">相对估值分析</h4>
                        <p className="text-sm text-muted-foreground">
                          与同业相比，PE法估值为¥{result.peBasedPrice}，PB法估值为¥{result.pbBasedPrice}，
                          收益率法估值为¥{result.yieldBasedPrice}。当前隐含资本化率为{result.impliedCapRate.toFixed(2)}%，
                          与分红率{inputs.distributionYield}%相比{result.impliedCapRate > inputs.distributionYield ? '偏高' : '偏低'}。
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">风险提示</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li>估值结果基于假设参数，实际结果可能因市场环境变化而不同</li>
                          <li>DCF模型对增长率、折现率等参数较为敏感</li>
                          <li>相对估值依赖于同业数据的准确性和可比性</li>
                          <li>建议结合市场环境、公司基本面等因素综合判断</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
