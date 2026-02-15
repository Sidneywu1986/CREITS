/**
 * 清空REITs数据库表数据
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const tables = [
  'reit_risk_metrics',
  'reit_dividend_history',
  'reit_investor_structure',
  'reit_market_performance',
  'reit_operational_data',
  'reit_financial_metrics',
  'reit_property_info',
  'reit_product_info'
];

async function clearTables() {
  console.log('\n🗑️  开始清空REITs数据库表...\n');

  for (const tableName of tables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('fund_code', 'INVALID_VALUE'); // 删除所有数据
      
      if (error) {
        console.error(`❌ 清空表 ${tableName} 失败:`, error.message);
      } else {
        console.log(`✅ 已清空表: ${tableName}`);
      }
    } catch (e) {
      console.error(`⚠️  表 ${tableName} 可能不存在，跳过`);
    }
  }

  console.log('\n✅ 所有表清空完成！\n');
}

clearTables();
