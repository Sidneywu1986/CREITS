/**
 * 重建REITs数据库表
 * 先删除旧表，再创建新表
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 由于Supabase JS客户端不支持直接执行DROP TABLE
// 我们需要使用rpc或者通过SQL编辑器
// 这里创建一个SQL脚本来删除并重建表

async function rebuildTables() {
  console.log('\n🔧 REITs数据库表重建说明\n');
  console.log('⚠️  Supabase JavaScript客户端不支持直接执行DDL语句（CREATE/DROP TABLE）');
  console.log('   请按照以下步骤操作：\n');
  console.log('1. 打开Supabase Dashboard');
  console.log('2. 进入 SQL Editor');
  console.log('3. 执行以下SQL语句：\n');
  
  const dropTablesSQL = `
-- 删除所有REITs相关表（按依赖关系倒序）
DROP TABLE IF EXISTS reit_risk_metrics CASCADE;
DROP TABLE IF EXISTS reit_dividend_history CASCADE;
DROP TABLE IF EXISTS reit_investor_structure CASCADE;
DROP TABLE IF EXISTS reit_market_performance CASCADE;
DROP TABLE IF EXISTS reit_operational_data CASCADE;
DROP TABLE IF EXISTS reit_financial_metrics CASCADE;
DROP TABLE IF EXISTS reit_property_info CASCADE;
DROP TABLE IF EXISTS reit_product_info CASCADE;
`;

  console.log('--- 步骤1: 删除旧表 ---');
  console.log(dropTablesSQL.trim());
  console.log('\n');

  console.log('--- 步骤2: 创建新表 ---');
  console.log('请复制 database/schema-reits-postgres.sql 文件中的内容并执行\n');
  
  console.log('3. 执行完成后，运行以下命令插入示例数据：');
  console.log('   node scripts/create-reits-sample-data.js\n');
}

rebuildTables();
