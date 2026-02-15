/**
 * Supabase数据库连接测试脚本
 *
 * 使用方法：
 * node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查环境变量
function checkEnvironment() {
  log('\n========== 检查环境变量 ==========', 'blue');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    log('❌ NEXT_PUBLIC_SUPABASE_URL 未配置', 'red');
    log('请在 .env.local 文件中添加:', 'yellow');
    log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co', 'yellow');
    return false;
  }

  if (!key) {
    log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未配置', 'red');
    log('请在 .env.local 文件中添加:', 'yellow');
    log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key', 'yellow');
    return false;
  }

  log('✅ 环境变量配置正确', 'green');
  log(`   URL: ${url}`, 'cyan');
  log(`   Key: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`, 'cyan');

  return true;
}

// 测试数据库连接
async function testConnection() {
  log('\n========== 测试数据库连接 ==========', 'blue');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const supabase = createClient(url, key);

    // 测试简单查询（检查系统表）
    const { data, error } = await supabase
      .from('reit_product_info')
      .select('reit_code')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        log('⚠️  数据库表尚未创建', 'yellow');
        log('请先执行 database/schema.sql 创建表结构', 'yellow');
        return false;
      } else {
        log('❌ 连接失败:', 'red');
        log(`   错误代码: ${error.code}`, 'red');
        log(`   错误信息: ${error.message}`, 'red');
        return false;
      }
    }

    log('✅ 数据库连接成功', 'green');
    return true;
  } catch (err) {
    log('❌ 连接异常:', 'red');
    log(`   ${err.message}`, 'red');
    return false;
  }
}

// 检查表是否存在
async function checkTables() {
  log('\n========== 检查数据库表 ==========', 'blue');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  const expectedTables = [
    'reit_product_info',
    'reit_property_base',
    'reit_property_equity_ops',
    'reit_property_concession_ops',
    'reit_financial_metrics',
    'reit_valuation',
    'reit_risk_compliance',
    'reit_market_stats',
  ];

  const results = [];

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          log(`❌ ${tableName} - 表不存在`, 'red');
          results.push({ table: tableName, status: 'missing' });
        } else {
          log(`⚠️  ${tableName} - 访问错误: ${error.message}`, 'yellow');
          results.push({ table: tableName, status: 'error', error: error.message });
        }
      } else {
        log(`✅ ${tableName} - 表已创建`, 'green');
        results.push({ table: tableName, status: 'exists', count: data?.length || 0 });
      }
    } catch (err) {
      log(`❌ ${tableName} - 异常: ${err.message}`, 'red');
      results.push({ table: tableName, status: 'exception', error: err.message });
    }
  }

  return results;
}

// 测试插入和查询
async function testInsertAndQuery() {
  log('\n========== 测试数据操作 ==========', 'blue');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  const testProduct = {
    reit_code: 'TEST001.SH',
    reit_short_name: '测试REIT',
    fund_manager: '测试基金管理公司',
    listing_date: new Date().toISOString().split('T')[0],
  };

  try {
    // 1. 插入测试数据
    log('1️⃣  插入测试数据...', 'cyan');
    const { data: insertData, error: insertError } = await supabase
      .from('reit_product_info')
      .insert(testProduct)
      .select();

    if (insertError) {
      if (insertError.code === '23505') {
        log('⚠️  测试数据已存在，跳过插入', 'yellow');
      } else {
        log('❌ 插入失败:', 'red');
        log(`   ${insertError.message}`, 'red');
        return false;
      }
    } else {
      log('✅ 插入成功', 'green');
    }

    // 2. 查询测试数据
    log('2️⃣  查询测试数据...', 'cyan');
    const { data: queryData, error: queryError } = await supabase
      .from('reit_product_info')
      .select('*')
      .eq('reit_code', 'TEST001.SH');

    if (queryError) {
      log('❌ 查询失败:', 'red');
      log(`   ${queryError.message}`, 'red');
      return false;
    }

    log('✅ 查询成功', 'green');
    log(`   返回数据:`, 'cyan');
    log(JSON.stringify(queryData, null, 2), 'cyan');

    // 3. 更新测试数据
    log('3️⃣  更新测试数据...', 'cyan');
    const { error: updateError } = await supabase
      .from('reit_product_info')
      .update({ info_disclosure_officer: '测试负责人' })
      .eq('reit_code', 'TEST001.SH');

    if (updateError) {
      log('❌ 更新失败:', 'red');
      log(`   ${updateError.message}`, 'red');
      return false;
    }

    log('✅ 更新成功', 'green');

    // 4. 删除测试数据
    log('4️⃣  删除测试数据...', 'cyan');
    const { error: deleteError } = await supabase
      .from('reit_product_info')
      .delete()
      .eq('reit_code', 'TEST001.SH');

    if (deleteError) {
      log('❌ 删除失败:', 'red');
      log(`   ${deleteError.message}`, 'red');
      return false;
    }

    log('✅ 删除成功', 'green');

    return true;
  } catch (err) {
    log('❌ 操作异常:', 'red');
    log(`   ${err.message}`, 'red');
    return false;
  }
}

// 生成测试报告
function generateReport(envOk, connectionOk, tableResults, dataOpsOk) {
  log('\n========== 测试报告 ==========', 'blue');

  const allPassed = envOk && connectionOk && dataOpsOk;
  const allTablesExist = tableResults.every(r => r.status === 'exists');

  if (allPassed && allTablesExist) {
    log('🎉 所有测试通过！Supabase配置成功！', 'green');
  } else {
    log('⚠️  部分测试未通过，请检查以下问题:', 'yellow');
  }

  log('\n测试结果汇总:', 'cyan');
  log(`  环境变量: ${envOk ? '✅ 通过' : '❌ 失败'}`, envOk ? 'green' : 'red');
  log(`  数据库连接: ${connectionOk ? '✅ 通过' : '❌ 失败'}`, connectionOk ? 'green' : 'red');
  log(`  数据表检查: ${allTablesExist ? '✅ 通过' : '❌ 失败'}`, allTablesExist ? 'green' : 'red');
  log(`  数据操作: ${dataOpsOk ? '✅ 通过' : '❌ 失败'}`, dataOpsOk ? 'green' : 'red');

  if (!allTablesExist) {
    log('\n缺失的表:', 'red');
    tableResults
      .filter(r => r.status === 'missing')
      .forEach(r => log(`  - ${r.table}`, 'red'));
  }

  log('\n下一步操作:', 'yellow');
  if (!envOk) {
    log('  1. 配置 .env.local 文件中的Supabase凭证', 'yellow');
  }
  if (!allTablesExist) {
    log('  2. 在Supabase Dashboard的SQL Editor中执行 database/schema.sql', 'yellow');
  }
  if (allPassed && allTablesExist) {
    log('  1. 开始使用数据库服务: src/lib/database/reits-db.ts', 'green');
    log('  2. 配置飞书集成（参考 docs/feishu-integration-guide.md）', 'green');
    log('  3. 迁移现有数据（参考 docs/migration-guide.md）', 'green');
  }
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  Supabase 数据库连接测试', 'blue');
  log('========================================\n', 'blue');

  // 1. 检查环境变量
  const envOk = checkEnvironment();
  if (!envOk) {
    process.exit(1);
  }

  // 2. 测试数据库连接
  const connectionOk = await testConnection();
  if (!connectionOk) {
    generateReport(envOk, false, [], false);
    process.exit(1);
  }

  // 3. 检查表是否存在
  const tableResults = await checkTables();

  // 4. 测试数据操作
  const dataOpsOk = await testInsertAndQuery();

  // 5. 生成测试报告
  generateReport(envOk, connectionOk, tableResults, dataOpsOk);

  log('\n========================================\n', 'blue');
}

// 执行测试
main().catch(err => {
  console.error('测试执行失败:', err);
  process.exit(1);
});
