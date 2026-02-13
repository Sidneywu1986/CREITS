'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  PieChart,
  Target,
  AlertCircle,
  Loader2,
  Building2,
  Landmark,
} from 'lucide-react';

export default function ValuationCalculatorPage() {
  // 基本信息
  const [basicInfo, setBasicInfo] = useState({
    currentPrice: 5.5,
    totalShares: 10000,
  });

  // 财务参数
  const [financialParams, setFinancialParams] = useState({
    ebitdaToCashRatio: 0.85,
    discountRate: 0.07,
    taxRate: 0.25,
    operatingExpense: 500,
    forecastYears: 10,
  });

  // 资产列表
  const [assets, setAssets] = useState([
    {
      id: 1,
      assetName: '某产业园区A栋',
      assetType: 'industrialPark',
      baseEBITDA: 2000,
      growthRate: 0.03,
      residualValue: 30000,
      maturityDate: '2030-12-31',
    },
  ]);

  // 债务列表
  const [debts, setDebts] = useState([
    {
      id: 1,
      debtType: '银行贷款',
      principal: 10000,
      interestRate: 0.045,
      maturityDate: '2028-12-31',
    },
  ]);

  // 计算结果
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 添加资产
  const addAsset = () => {
    const newAsset = {
      id: Date.now(),
      assetName: '',
      assetType: 'industrialPark',
      baseEBITDA: 0,
      growthRate: 0.03,
      residualValue: 0,
      maturityDate: '2030-12-31',
    };
    setAssets([...assets, newAsset]);
  };

  // 删除资产
  const removeAsset = (id: number) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  // 更新资产
  const updateAsset = (id: number, field: string, value: any) => {
    setAssets(assets.map(a => (a.id === id ? { ...a, [field]: value } : a)));
  };

  // 添加债务
  const addDebt = () => {
    const newDebt = {
      id: Date.now(),
      debtType: '银行贷款',
      principal: 0,
      interestRate: 0.045,
      maturityDate: '2028-12-31',
    };
    setDebts([...debts, newDebt]);
  };

  // 删除债务
  const removeDebt = (id: number) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  // 更新债务
  const updateDebt = (id: number, field: string, value: any) => {
    setDebts(debts.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  };

  // 计算估值
  const calculateValuation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/valuation/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...basicInfo,
          ...financialParams,
          assets: assets.map(a => ({
            ...a,
            maturityDate: new Date(a.maturityDate),
          })),
          debts: debts.map(d => ({
            ...d,
            maturityDate: new Date(d.maturityDate),
          })),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setValuationResult(data.data);
      }
    } catch (error) {
      console.error('估值计算失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化金额
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // 格式化百分比
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            REITs估值计算器
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            基于DCF模型的REITs估值分析工具
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：参数输入 */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="assets">资产信息</TabsTrigger>
                <TabsTrigger value="debts">债务信息</TabsTrigger>
                <TabsTrigger value="financial">财务参数</TabsTrigger>
              </TabsList>

              {/* 基本信息标签页 */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      基本信息
                    </CardTitle>
                    <CardDescription>
                      输入REITs的基本市场信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPrice">当前价格（元）</Label>
                        <Input
                          id="currentPrice"
                          type="number"
                          step="0.01"
                          value={basicInfo.currentPrice}
                          onChange={(e) =>
                            setBasicInfo({ ...basicInfo, currentPrice: parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalShares">总份额（万份）</Label>
                        <Input
                          id="totalShares"
                          type="number"
                          value={basicInfo.totalShares}
                          onChange={(e) =>
                            setBasicInfo({ ...basicInfo, totalShares: parseFloat(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 资产信息标签页 */}
              <TabsContent value="assets" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-green-600" />
                          底层资产信息
                        </CardTitle>
                        <CardDescription>
                          输入底层资产的详细信息
                        </CardDescription>
                      </div>
                      <Button onClick={addAsset} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        添加资产
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assets.map((asset, index) => (
                      <div key={asset.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">资产 {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAsset(asset.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-sm">资产名称</Label>
                            <Input
                              value={asset.assetName}
                              onChange={(e) => updateAsset(asset.id, 'assetName', e.target.value)}
                              placeholder="例如：某产业园区A栋"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">资产类型</Label>
                            <Select
                              value={asset.assetType}
                              onValueChange={(value) => updateAsset(asset.id, 'assetType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="industrialPark">产业园区</SelectItem>
                                <SelectItem value="warehouse">仓储物流</SelectItem>
                                <SelectItem value="transport">交通基础设施</SelectItem>
                                <SelectItem value="affordableHousing">保障性租赁住房</SelectItem>
                                <SelectItem value="energy">能源基础设施</SelectItem>
                                <SelectItem value="consumer">消费基础设施</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">基础EBITDA（万元）</Label>
                            <Input
                              type="number"
                              value={asset.baseEBITDA}
                              onChange={(e) =>
                                updateAsset(asset.id, 'baseEBITDA', parseFloat(e.target.value))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">增长率</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={asset.growthRate}
                              onChange={(e) =>
                                updateAsset(asset.id, 'growthRate', parseFloat(e.target.value))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">剩余价值（万元）</Label>
                            <Input
                              type="number"
                              value={asset.residualValue}
                              onChange={(e) =>
                                updateAsset(asset.id, 'residualValue', parseFloat(e.target.value))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">到期日期</Label>
                            <Input
                              type="date"
                              value={asset.maturityDate}
                              onChange={(e) => updateAsset(asset.id, 'maturityDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 债务信息标签页 */}
              <TabsContent value="debts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Landmark className="w-5 h-5 text-red-600" />
                          债务信息
                        </CardTitle>
                        <CardDescription>
                          输入REITs的债务结构
                        </CardDescription>
                      </div>
                      <Button onClick={addDebt} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        添加债务
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {debts.map((debt, index) => (
                      <div key={debt.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">债务 {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDebt(debt.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-sm">债务类型</Label>
                            <Input
                              value={debt.debtType}
                              onChange={(e) => updateDebt(debt.id, 'debtType', e.target.value)}
                              placeholder="例如：银行贷款"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">本金（万元）</Label>
                            <Input
                              type="number"
                              value={debt.principal}
                              onChange={(e) =>
                                updateDebt(debt.id, 'principal', parseFloat(e.target.value))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">利率</Label>
                            <Input
                              type="number"
                              step="0.001"
                              value={debt.interestRate}
                              onChange={(e) =>
                                updateDebt(debt.id, 'interestRate', parseFloat(e.target.value))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">到期日期</Label>
                            <Input
                              type="date"
                              value={debt.maturityDate}
                              onChange={(e) => updateDebt(debt.id, 'maturityDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 财务参数标签页 */}
              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      财务参数
                    </CardTitle>
                    <CardDescription>
                      配置估值计算的关键参数
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ebitdaToCashRatio">
                          EBITDA转现金流比例
                          <span className="text-xs text-muted-foreground ml-2">
                            ({formatPercent(financialParams.ebitdaToCashRatio)})
                          </span>
                        </Label>
                        <Input
                          id="ebitdaToCashRatio"
                          type="number"
                          step="0.01"
                          max="1"
                          min="0"
                          value={financialParams.ebitdaToCashRatio}
                          onChange={(e) =>
                            setFinancialParams({
                              ...financialParams,
                              ebitdaToCashRatio: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountRate">
                          折现率
                          <span className="text-xs text-muted-foreground ml-2">
                            ({formatPercent(financialParams.discountRate)})
                          </span>
                        </Label>
                        <Input
                          id="discountRate"
                          type="number"
                          step="0.01"
                          value={financialParams.discountRate}
                          onChange={(e) =>
                            setFinancialParams({
                              ...financialParams,
                              discountRate: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">
                          税率
                          <span className="text-xs text-muted-foreground ml-2">
                            ({formatPercent(financialParams.taxRate)})
                          </span>
                        </Label>
                        <Input
                          id="taxRate"
                          type="number"
                          step="0.01"
                          value={financialParams.taxRate}
                          onChange={(e) =>
                            setFinancialParams({
                              ...financialParams,
                              taxRate: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operatingExpense">
                          年运营费用（万元）
                        </Label>
                        <Input
                          id="operatingExpense"
                          type="number"
                          value={financialParams.operatingExpense}
                          onChange={(e) =>
                            setFinancialParams({
                              ...financialParams,
                              operatingExpense: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="forecastYears">预测年数</Label>
                        <Input
                          id="forecastYears"
                          type="number"
                          min="1"
                          max="30"
                          value={financialParams.forecastYears}
                          onChange={(e) =>
                            setFinancialParams({
                              ...financialParams,
                              forecastYears: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 计算按钮 */}
            <Button
              onClick={calculateValuation}
              disabled={loading || assets.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  计算中...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  开始估值计算
                </>
              )}
            </Button>
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  估值结果
                </CardTitle>
                <CardDescription>
                  DCF模型计算结果
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!valuationResult ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                    <Calculator className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium mb-2">等待计算</p>
                    <p className="text-sm">
                      输入参数后点击"开始估值计算"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* IRR */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-sm text-green-700 dark:text-green-400 mb-1">
                        内部收益率 (IRR)
                      </div>
                      <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                        {formatPercent(valuationResult.irr)}
                      </div>
                    </div>

                    {/* 公允价值 */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">
                        每份额公允价值
                      </div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {formatMoney(valuationResult.fairValue)}
                      </div>
                    </div>

                    {/* 分派率 */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">
                        预期分派率
                      </div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {formatPercent(valuationResult.dividendYield)}
                      </div>
                    </div>

                    {/* 市净率 */}
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="text-sm text-amber-700 dark:text-amber-400 mb-1">
                        市净率 (P/NAV)
                      </div>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        {valuationResult.priceToNAV.toFixed(2)}
                      </div>
                    </div>

                    <Separator />

                    {/* 总现金流 */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">总现金流现值</span>
                      <span className="font-semibold">
                        {formatMoney(valuationResult.totalCashFlow)}
                      </span>
                    </div>

                    {/* 投资建议 */}
                    <div className={`p-4 rounded-lg ${
                      valuationResult.irr > financialParams.discountRate
                        ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">
                          {valuationResult.irr > financialParams.discountRate
                            ? '投资建议：买入'
                            : '投资建议：观望'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {valuationResult.irr > financialParams.discountRate
                          ? 'IRR高于折现率，当前估值具有投资价值'
                          : 'IRR低于折现率，建议等待更好的买入时机'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 现金流预测 */}
            {valuationResult && valuationResult.cashFlows && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    现金流预测
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {valuationResult.cashFlows.map((cf: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded"
                      >
                        <span className="text-sm font-medium">第 {cf.year} 年</span>
                        <span className="text-sm font-semibold">
                          {formatMoney(cf.distributableCash)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">DCF估值模型说明</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 基于未来现金流折现计算公允价值</li>
                  <li>• IRR反映投资的内部收益率</li>
                  <li>• 考虑资产增长率和债务结构</li>
                  <li>• 预测年数影响估值结果</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">参数设置建议</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 折现率通常在5%-10%之间</li>
                  <li>• EBITDA转现金流比例通常在80%-90%</li>
                  <li>• 增长率根据行业特点设置</li>
                  <li>• 剩余价值通常为EBITDA的10-15倍</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
