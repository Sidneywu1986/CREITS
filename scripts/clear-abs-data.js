/**
 * 清空ABS数据库表中的所有示例数据
 *
 * 使用方法：
 * node scripts/clear-abs-data.js
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

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'abs_loan_detail',
  'abs_cashflow',
  'abs_collateral_pool',
  'abs_tranche_info',
  'abs_risk_compliance',
  'abs_market_stats',
  'abs_triggers_events',
  'abs_waterfall_structure',
  'abs_product_info',
];

async function main() {
  log('\n========================================', 'blue');
  log('  清空ABS数据库表中的示例数据', 'blue');
  log('========================================\n', 'blue');

  try {
    for (const table of tables) {
      log(`🗑️  正在清空表: ${table}...`, 'cyan');
      
      // 使用SQL TRUNCATE命令清空表（比DELETE更快，且重置自增ID）
      const { error } = await supabase.rpc('exec_sql', {
        sql: `TRUNCATE TABLE ${table} CASCADE;`
      });

      // 如果RPC不可用，使用DELETE
      if (error) {
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq('product_code', ''); // 删除所有记录
        
        if (deleteError) {
          log(`⚠️  清空表 ${table} 失败: ${deleteError.message}`, 'yellow');
        } else {
          log(`✅ 表 ${table} 已清空`, 'green');
        }
      } else {
        log(`✅ 表 ${table} 已清空`, 'green');
      }
    }

    log('\n========================================', 'blue');
    log('  ✅ 所有ABS数据表已清空', 'green');
    log('========================================\n', 'blue');

    log('下一步:', 'yellow');
    log('  运行 node scripts/create-abs-sample-data.js 创建示例数据\n', 'cyan');

  } catch (error) {
    log('\n❌ 清空数据失败:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// 执行
main();
