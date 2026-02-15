/**
 * 在Supabase中创建ABS数据库表
 * 使用Supabase Dashboard的SQL Editor手动执行，或通过Supabase CLI执行
 *
 * 使用方法：
 * node scripts/init-abs-database.js
 *
 * 注意：此脚本将生成SQL语句，你需要在Supabase Dashboard的SQL Editor中手动执行
 */

const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n========================================', 'blue');
  log('  在Supabase中创建ABS数据库表', 'blue');
  log('========================================\n', 'blue');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ 缺少环境变量：NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY', 'red');
    process.exit(1);
  }

  try {
    // 读取SQL文件
    log('📄 正在读取建表脚本...', 'cyan');
    const sqlContent = fs.readFileSync('database/schema-abs-postgres.sql', 'utf8');
    log('✅ 建表脚本读取成功\n', 'green');

    log('📋 SQL脚本内容预览（前500字符）：', 'yellow');
    log(sqlContent.substring(0, 500) + '...\n', 'cyan');

    log('========================================', 'blue');
    log('  手动执行步骤', 'blue');
    log('========================================\n', 'magenta');

    log('📝 请按照以下步骤在Supabase中创建数据库表：\n', 'yellow');

    log('第1步：访问Supabase Dashboard', 'cyan');
    log(`  URL: ${supabaseUrl}\n`, 'cyan');

    log('第2步：打开SQL Editor', 'cyan');
    log('  路径：SQL Editor > New Query\n', 'cyan');

    log('第3步：复制并执行SQL脚本', 'cyan');
    log('  文件：database/schema-abs-postgres.sql\n', 'cyan');

    log('第4步：验证表创建成功', 'cyan');
    log('  执行以下SQL验证：\n', 'cyan');
    
    const verifySQL = `SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'abs_%'
ORDER BY table_name;`;

    log('```sql', 'cyan');
    log(verifySQL, 'cyan');
    log('```\n', 'cyan');

    log('第5步：创建完成后，运行以下命令创建示例数据', 'cyan');
    log('  node scripts/create-abs-sample-data.js\n', 'cyan');

    log('========================================', 'blue');
    log('  要创建的ABS数据库表（9张）', 'blue');
    log('========================================\n', 'magenta');

    const tables = [
      '1. abs_product_info - ABS产品基本信息表',
      '2. abs_tranche_info - ABS分层信息表',
      '3. abs_collateral_pool - 基础资产池概况表',
      '4. abs_loan_detail - ABS逐笔贷款明细表',
      '5. abs_cashflow - ABS现金流归集与分配表',
      '6. abs_triggers_events - ABS触发条件与增信事件表',
      '7. abs_risk_compliance - ABS风险合规信息表',
      '8. abs_market_stats - ABS市场表现与估值表',
      '9. abs_waterfall_structure - ABS交易结构与偿付机制表',
    ];

    tables.forEach(table => {
      log(`  ${table}`, 'green');
    });

    log('\n💡 提示：', 'yellow');
    log('  - Supabase免费套餐支持50,000条数据库记录', 'cyan');
    log('  - 建表语句已包含完整的表和列注释', 'cyan');
    log('  - 所有表都包含适当的索引以优化查询性能', 'cyan');

    log('\n========================================\n', 'blue');

    // 将SQL内容保存到临时文件，方便复制
    const tempFile = '/tmp/abs-schema.sql';
    fs.writeFileSync(tempFile, sqlContent);
    log('📁 SQL脚本已保存到：', 'yellow');
    log(`  ${tempFile}`, 'cyan');
    log('\n', 'cyan');

  } catch (error) {
    log('\n❌ 读取SQL文件失败:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// 执行
main();
