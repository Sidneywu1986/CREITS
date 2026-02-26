import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'

/**
 * 八张表数据API
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 认证
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: '未授权' })
  }

  if (req.method === 'GET') {
    try {
      const { fundCode } = req.query

      // 并行查询八张表数据
      const [
        productInfo,
        propertyBase,
        propertyEquityOps,
        propertyConcessionOps,
        financialMetrics,
        valuation,
        riskCompliance,
        marketStats
      ] = await Promise.all([
        supabase
          .from('reit_product_info')
          .select('*')
          .eq(fundCode ? 'reit_code' : 'reit_code', fundCode || fundCode)
          .limit(fundCode ? 1 : 100),
        supabase
          .from('reit_property_base')
          .select('*')
          .eq(fundCode ? 'reit_code' : 'reit_code', fundCode || fundCode)
          .limit(100),
        supabase
          .from('reit_property_equity_ops')
          .select('*')
          .eq(fundCode ? 'reit_code' : 'reit_code', fundCode || fundCode)
          .limit(100),
        supabase
          .from('reit_property_concession_ops')
          .select('*')
          .eq(fundCode ? 'reit_code' : 'reit_code', fundCode || fundCode)
          .limit(100),
        supabase
          .from('reit_financial_metrics')
          .select('*')
          .eq(fundCode ? 'fund_code' : 'fund_code', fundCode || fundCode)
          .limit(100),
        supabase
          .from('reit_valuation')
          .select('*')
          .eq(fundCode ? 'reit_code' : 'reit_code', fundCode || fundCode)
          .limit(100),
        supabase
          .from('reit_risk_compliance')
          .select('*')
          .eq(fundCode ? 'fund_code' : 'fund_code', fundCode || fundCode)
          .limit(100),
        supabase
          .from('reit_market_stats')
          .select('*')
          .eq(fundCode ? 'fund_code' : 'fund_code', fundCode || fundCode)
          .limit(100)
      ])

      const data = {
        productInfo: productInfo.data || [],
        propertyBase: propertyBase.data || [],
        propertyEquityOps: propertyEquityOps.data || [],
        propertyConcessionOps: propertyConcessionOps.data || [],
        financialMetrics: financialMetrics.data || [],
        valuation: valuation.data || [],
        riskCompliance: riskCompliance.data || [],
        marketStats: marketStats.data || []
      }

      res.status(200).json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  } else {
    res.status(405).json({ error: '方法不允许' })
  }
}
