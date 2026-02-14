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
  RefreshCw,
  Info,
} from 'lucide-react';

interface ValuationInput {
  currentPrice: number;
  annualDistribution: number;
  distributionYield: number;
  growthRate: number;
  discountRate: number;
  peerAveragePE: number;
  peerAveragePB: number;
  peerAverageYield: number;
}

interface ValuationResult {
  dcfPrice: number;
  dcfUpsideDownside: number;
  peBasedPrice: number;
  pbBasedPrice: number;
  yieldBasedPrice: number;
  averagePrice: number;
  impliedCapRate: number;
  nav: number;
  ffoPerShare: number;
}

interface FloatingValuationCalculatorProps {
  reitsName: string;
  reitsCode: string;
  currentPrice: number;
  annualDistribution?: number;
}

export default function FloatingValuationCalculator({
  reitsName,
  reitsCode,
  currentPrice,
  annualDistribution = 0,
}: FloatingValuationCalculatorProps) {
  const [inputs, setInputs] = useState<ValuationInput>({
    currentPrice: currentPrice,
    annualDistribution: annualDistribution,
    distributionYield: annualDistribution > 0 && currentPrice > 0 ? (annualDistribution / currentPrice) * 100 : 5,

    growthRate: 3,
    discountRate: 8,
    peerAveragePE: 15,
    peerAveragePB: 1.2,
    peerAverageYield: 4.5,
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('inputs');

  // 自动计算分红率
  useEffect(() => {
    if (inputs.currentPrice > 0 && inputs.annualDistribution > 0) {
      const yieldRate = (inputs.annualDistribution / inputs.currentPrice) * 100;
      setInputs(prev => ({ ...prev, distributionYield: Number(yieldRate.toFixed(2)) }));
    }
  }, [inputs.currentPrice, inputs.annualDistribution]);

  // DCF估值计算
  const calculateDCF = () => {
    const { currentPrice, annualDistribution, growthRate, discountRate } = inputs;
    const growthRateDecimal = growthRate / 100;
    const discountRateDecimal = discountRate / 100;
    const projectionYears = 10;
    const terminalGrowthRate = 0.02;

    let presentValue = 0;

    for (let year = 1; year <= projectionYears; year++) {
      const projectedCashFlow = annualDistribution * Math.pow(1 + growthRateDecimal, year);
      const discountedCashFlow = projectedCashFlow / Math.pow(1 + discountRateDecimal, year);
      presentValue += discountedCashFlow;
    }

    const terminalCashFlow = annualDistribution * Math.pow(1 + growthRateDecimal, projectionYears);
    const terminalValue = (terminalCashFlow * (1 + terminalGrowthRate)) / (discountRateDecimal - terminalGrowthRate);
    const discountedTerminalValue = terminalValue / Math.pow(1 + discountRateDecimal, projectionYears);

    const dcfPrice = presentValue + discountedTerminalValue;
    const upsideDownside = ((dcfPrice - currentPrice) / currentPrice) * 100;

    return {
      price: dcfPrice,
      upsideDownside: Number(upsideDownside.toFixed(2)),
    };
  };

  // 相对估值计算
  const calculateRelativeValuation = () => {
    const { currentPrice, annualDistribution, peerAveragePE, peerAveragePB, peerAverageYield } = inputs;

    const eps = annualDistribution * 0.8;
    const nav = currentPrice / 1.2;

    const peBasedPrice = eps * peerAveragePE;
    const pbBasedPrice = nav * peerAveragePB;
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

      const averagePrice = dcfResult.price * 0.4 + relativeResult.peBasedPrice * 0.3 + relativeResult.pbBasedPrice * 0.3;
      const impliedCapRate = (inputs.annualDistribution / averagePrice) * 100;

      setResult({
        dcfPrice: Number(dcfResult.price.toFixed(2)),
        dcfUpsideDownside: dcfResult.upsideDownside,

        peBasedPrice: relativeResult.peBasedPrice,
        pbBasedPrice: relativeResult.pbBasedPrice,
        yieldBasedPrice: relativeResult.yieldBasedPrice,

        averagePrice: Number(averagePrice.toFixed(2)),
        impliedCapRate: Number(impliedCapRate.toFixed(2)),

        nav: relativeResult.nav,
        ffoPerShare: Number((relativeResult.eps * 1.1).toFixed(2)),
      });

      setIsCalculating(false);
      setActiveTab('results'); // 自动跳转到估值结果
    }, 300);
  };

  const handleReset = () => {
    setInputs({
      currentPrice: currentPrice,
      annualDistribution: annualDistribution,
      distributionYield: annualDistribution > 0 && currentPrice > 0 ? (annualDistribution / currentPrice) * 100 : 5,

      growthRate: 3,
      discountRate: 8,
      peerAveragePE: 15,
      peerAveragePB: 1.2,
      peerAverageYield: 4.5,
    });
    setResult(null);
  };

  return (
    <div className="h-full flex flex-col p-3">
      {/* 标题 */}
      <div className="mb-3 pb-2 border-b">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
          {reitsName} ({reitsCode})
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          当前价格: ¥{currentPrice.toFixed(2)}
        </p>
      </div>

      <Tabs defaultValue="inputs" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-2 h-8">
          <TabsTrigger value="inputs" className="text-xs">
            输入参数
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!result} className="text-xs">
            估值结果
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inputs" className="flex-1 overflow-y-auto space-y-2">
          {/* 基础参数 */}
          <Card>
            <CardHeader className="pb-1 pt-2 px-3">
              <CardTitle className="text-xs flex items-center">
                <DollarSign className="mr-1 h-3 w-3 text-[#667eea]" />
                基础参数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="currentPrice" className="text-xs">当前价格(元)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    value={inputs.currentPrice}
                    onChange={(e) => setInputs({ ...inputs, currentPrice: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="annualDistribution" className="text-xs">年度分红(元/份)</Label>
                  <Input
                    id="annualDistribution"
                    type="number"
                    step="0.01"
                    value={inputs.annualDistribution}
                    onChange={(e) => setInputs({ ...inputs, annualDistribution: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="distributionYield" className="text-xs">分红率 (%)</Label>
                  <Input
                    id="distributionYield"
                    type="number"
                    step="0.01"
                    value={inputs.distributionYield}
                    readOnly
                    className="h-8 text-sm bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DCF参数 */}
          <Card>
            <CardHeader className="pb-1 pt-2 px-3">
              <CardTitle className="text-xs flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-[#667eea]" />
                DCF参数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="growthRate" className="text-xs">
                    增长率(%)
                    <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                      <Info className="h-2 w-2 mr-0.5" />
                      2-5%
                    </Badge>
                  </Label>
                  <Input
                    id="growthRate"
                    type="number"
                    step="0.1"
                    value={inputs.growthRate}
                    onChange={(e) => setInputs({ ...inputs, growthRate: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="discountRate" className="text-xs">
                    折现率(%)
                    <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                      <Info className="h-2 w-2 mr-0.5" />
                      7-10%
                    </Badge>
                  </Label>
                  <Input
                    id="discountRate"
                    type="number"
                    step="0.1"
                    value={inputs.discountRate}
                    onChange={(e) => setInputs({ ...inputs, discountRate: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 相对估值参数 */}
          <Card>
            <CardHeader className="pb-1 pt-2 px-3">
              <CardTitle className="text-xs flex items-center">
                <PieChart className="mr-1 h-3 w-3 text-[#667eea]" />
                相对估值参数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="peerAveragePE" className="text-xs">同业PE</Label>
                  <Input
                    id="peerAveragePE"
                    type="number"
                    step="0.1"
                    value={inputs.peerAveragePE}
                    onChange={(e) => setInputs({ ...inputs, peerAveragePE: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="peerAveragePB" className="text-xs">同业PB</Label>
                  <Input
                    id="peerAveragePB"
                    type="number"
                    step="0.1"
                    value={inputs.peerAveragePB}
                    onChange={(e) => setInputs({ ...inputs, peerAveragePB: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="peerAverageYield" className="text-xs">同业分红率(%)</Label>
                  <Input
                    id="peerAverageYield"
                    type="number"
                    step="0.1"
                    value={inputs.peerAverageYield}
                    onChange={(e) => setInputs({ ...inputs, peerAverageYield: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="flex-1 h-8 text-sm bg-gradient-to-r from-[#667eea] to-[#764ba2]"
            >
              <Calculator className="mr-1 h-3 w-3" />
              {isCalculating ? '计算中...' : '开始计算'}
            </Button>
            <Button onClick={handleReset} variant="outline" className="h-8 text-sm">
              <RefreshCw className="mr-1 h-3 w-3" />
              重置
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="flex-1 overflow-y-auto space-y-2">
          {result && (
            <>
              {/* 综合估值 */}
              <Card>
                <CardHeader className="pb-1 pt-2 px-3">
                  <CardTitle className="text-xs flex items-center">
                    <BarChart className="mr-1 h-3 w-3 text-[#667eea]" />
                    综合估值
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded">
                      <div className="text-[10px] text-muted-foreground">估值价格</div>
                      <div className="text-lg font-bold text-[#667eea]">
                        ¥{result.averagePrice.toFixed(2)}
                      </div>
                      <Badge
                        variant={result.averagePrice >= inputs.currentPrice ? 'default' : 'destructive'}
                        className="mt-1 text-[10px]"
                      >
                        {result.averagePrice >= inputs.currentPrice ? '+' : ''}
                        {((result.averagePrice - inputs.currentPrice) / inputs.currentPrice * 100).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded">
                      <div className="text-[10px] text-muted-foreground">隐含资本化率</div>
                      <div className="text-lg font-bold text-orange-600">
                        {result.impliedCapRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DCF估值 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">DCF估值</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground">DCF价格</div>
                      <div className="font-bold">¥{result.dcfPrice}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">上行/下行</div>
                      <Badge
                        variant={result.dcfUpsideDownside >= 0 ? 'default' : 'destructive'}
                        className="text-[10px]"
                      >
                        {result.dcfUpsideDownside >= 0 ? '+' : ''}{result.dcfUpsideDownside}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 相对估值 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">相对估值</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground">PE法</div>
                      <div className="font-bold">¥{result.peBasedPrice}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">PB法</div>
                      <div className="font-bold">¥{result.pbBasedPrice}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">收益率法</div>
                      <div className="font-bold">¥{result.yieldBasedPrice}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 财务指标 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">关键指标</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground">NAV</div>
                      <div className="font-bold">¥{result.nav}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">FFO/份</div>
                      <div className="font-bold">¥{result.ffoPerShare}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 投资建议 */}
              <Card>
                <CardHeader className="pb-1 pt-2 px-3">
                  <CardTitle className="text-xs flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-[#667eea]" />
                    投资建议
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs px-3 pb-2">
                  <div>
                    <h4 className="font-semibold mb-1">估值结论</h4>
                    {result.averagePrice > inputs.currentPrice * 1.1 ? (
                      <p className="text-green-600">
                        当前价格被低估，估值价格比当前价格高出{' '}
                        {((result.averagePrice - inputs.currentPrice) / inputs.currentPrice * 100).toFixed(2)}%
                        ，建议增持。
                      </p>
                    ) : result.averagePrice < inputs.currentPrice * 0.9 ? (
                      <p className="text-red-600">
                        当前价格被高估，估值价格比当前价格低{' '}
                        {((inputs.currentPrice - result.averagePrice) / inputs.currentPrice * 100).toFixed(2)}%
                        ，建议减持。
                      </p>
                    ) : (
                      <p className="text-blue-600">
                        当前价格处于合理区间，估值价格与当前价格接近，建议持有。
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-1">风险提示</h4>
                    <ul className="text-[10px] text-muted-foreground list-disc list-inside space-y-1">
                      <li>估值结果基于假设参数，实际结果可能因市场环境变化而不同</li>
                      <li>DCF模型对增长率、折现率等参数较为敏感</li>
                      <li>建议结合市场环境、公司基本面等因素综合判断</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
