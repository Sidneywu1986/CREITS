import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/services/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 测试数据库连接
    const { error } = await supabase.from('reit_product_info').select('count').limit(1);

    if (error) {
      return res.status(200).json({
        connected: false,
        error: error.message,
        tables: [],
      });
    }

    // 获取表统计信息
    const tables = [
      { name: 'reit_product_info', description: '产品基本信息' },
      { name: 'reit_property_base', description: '底层资产通用信息' },
      { name: 'reit_property_equity_ops', description: '产权类运营数据' },
      { name: 'reit_property_concession_ops', description: '经营权类运营数据' },
      { name: 'reit_financial_metrics', description: '财务指标' },
      { name: 'reit_valuation', description: '估值信息' },
      { name: 'reit_risk_compliance', description: '风险合规' },
      { name: 'reit_market_stats', description: '市场表现' },
    ];

    const tableStats = [];

    for (const table of tables) {
      const { count, error: countError } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        tableStats.push({
          name: table.name,
          description: table.description,
          rows: count || 0,
        });
      }
    }

    return res.status(200).json({
      connected: true,
      database: 'Supabase (PostgreSQL)',
      tables: tableStats,
    });
  } catch (error: any) {
    console.error('Database status error:', error);
    return res.status(500).json({
      connected: false,
      error: error.message,
      tables: [],
    });
  }
}
