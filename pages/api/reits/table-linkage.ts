import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sourceTable, sourceId, targetTable } = req.body;

    if (!sourceTable || !sourceId || !targetTable) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 这里应该根据 sourceId 从数据库查询 targetTable 的相关数据
    // 由于是示例，我们返回模拟数据

    let data: any[] = [];

    // 根据目标表返回不同的模拟数据
    switch (targetTable) {
      case 'reit_property_info':
        data = [
          {
            property_name: '张江光大园',
            property_code: 'ZJ001',
            fund_code: sourceId,
            city: '上海',
            district: '浦东新区',
            gross_floor_area: 52000,
            leaseable_area: 48000,
            occupancy_rate: 95.2,
            avg_rent: 5.8,
            asset_value: 150000,
          },
        ];
        break;
      case 'reit_financial_metrics':
        data = [
          {
            fund_code: sourceId,
            report_period: '2024Q4',
            total_assets: 150000,
            total_liabilities: 30000,
            net_assets: 120000,
            operating_revenue: 8500,
            operating_profit: 6200,
            net_profit: 4800,
            debt_ratio: 20.0,
            roe: 4.0,
            roa: 3.2,
          },
        ];
        break;
      case 'reit_operational_data':
        data = [
          {
            fund_code: sourceId,
            report_period: '2024Q4',
            occupancy_rate: 95.2,
            rent_collection_rate: 98.5,
            operating_income: 8500,
            operating_expenses: 2300,
            noi: 6200,
            rent_growth_rate: 3.5,
            tenant_renewal_rate: 85.0,
          },
        ];
        break;
      case 'reit_market_performance':
        data = [
          {
            fund_code: sourceId,
            trade_date: '2024-12-31',
            price: 3.520,
            change_rate: 1.2,
            volume: 1250000,
            turnover_rate: 2.5,
            pe_ratio: 18.5,
            dividend_yield: 4.82,
            market_cap: 17600,
          },
        ];
        break;
      case 'reit_investor_structure':
        data = [
          {
            fund_code: sourceId,
            report_date: '2024-12-31',
            investor_type: '机构投资者',
            holding_ratio: 65.3,
            holding_amount: 3.265,
            investor_count: 45,
          },
          {
            fund_code: sourceId,
            report_date: '2024-12-31',
            investor_type: '个人投资者',
            holding_ratio: 34.7,
            holding_amount: 1.735,
            investor_count: 12890,
          },
        ];
        break;
      case 'reit_dividend_history':
        data = [
          {
            fund_code: sourceId,
            ex_dividend_date: '2024-06-15',
            dividend_per_unit: 0.085,
            dividend_rate: 3.4,
            total_dividend: 425,
            declaration_date: '2024-06-10',
            payment_date: '2024-06-20',
          },
        ];
        break;
      case 'reit_risk_metrics':
        data = [
          {
            fund_code: sourceId,
            report_date: '2024-12-31',
            var_95: 0.085,
            beta: 0.85,
            volatility: 0.15,
            sharpe_ratio: 0.45,
            max_drawdown: 0.12,
          },
        ];
        break;
      default:
        data = [];
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Table linkage error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
