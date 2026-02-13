import { NextRequest, NextResponse } from 'next/server';
import { DCFValuation, ValuationParams, ValuationTemplates } from '@/services/valuation/dcf';

// 执行估值计算
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 解析参数
    const params: ValuationParams = {
      currentPrice: body.currentPrice,
      totalShares: body.totalShares,
      assets: (body.assets || []).map((asset: any) => ({
        ...asset,
        maturityDate: new Date(asset.maturityDate),
      })),
      ebitdaToCashRatio: body.ebitdaToCashRatio || 0.85,
      operatingExpense: body.operatingExpense || 0,
      debts: (body.debts || []).map((debt: any) => ({
        ...debt,
        maturityDate: new Date(debt.maturityDate),
      })),
      taxRate: body.taxRate || 0.25,
      discountRate: body.discountRate || 0.07,
    };
    
    // 如果提供了资产类型模板，应用模板参数
    if (body.assetType && ValuationTemplates[body.assetType as keyof typeof ValuationTemplates]) {
      const template = ValuationTemplates[body.assetType as keyof typeof ValuationTemplates];
      if (template) {
        params.ebitdaToCashRatio = body.ebitdaToCashRatio || template.ebitdaToCashRatio;
        params.discountRate = body.discountRate || template.discountRate;
        params.taxRate = body.taxRate || template.taxRate;
        params.assets.forEach(asset => {
          if (!asset.growthRate) {
            asset.growthRate = template.growthRate;
          }
        });
      }
    }
    
    // 预测年数
    const forecastYears = body.forecastYears || 10;
    
    // 执行DCF估值
    const result = DCFValuation.calculateDCF(params, forecastYears);
    
    // 如果需要敏感性分析
    let sensitivityData = null;
    if (body.sensitivityAnalysis && body.sensitivityParameter) {
      const range = body.sensitivityRange || [-0.02, -0.01, 0, 0.01, 0.02];
      sensitivityData = DCFValuation.sensitivityAnalysis(
        params,
        body.sensitivityParameter,
        range
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        sensitivityData,
      },
    });
  } catch (error) {
    console.error('估值计算失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '估值计算失败' },
      { status: 500 }
    );
  }
}

// 获取估值模板
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assetType = searchParams.get('assetType');
    
    if (assetType && ValuationTemplates[assetType as keyof typeof ValuationTemplates]) {
      // 返回特定模板
      return NextResponse.json({
        success: true,
        data: ValuationTemplates[assetType as keyof typeof ValuationTemplates],
      });
    }
    
    // 返回所有模板
    return NextResponse.json({
      success: true,
      data: ValuationTemplates,
    });
  } catch (error) {
    console.error('获取估值模板失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取估值模板失败' },
      { status: 500 }
    );
  }
}
