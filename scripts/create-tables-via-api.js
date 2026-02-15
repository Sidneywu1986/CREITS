/**
 * 通过Supabase REST API创建数据库表
 *
 * 使用方法：
 * node scripts/create-tables-via-api.js
 */

const fs = require('fs');
const path = require('path');
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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  log('❌ Supabase配置缺失', 'red');
  process.exit(1);
}

log('✅ Supabase配置已加载', 'green');
log(`   URL: ${supabaseUrl}`, 'cyan');

// 读取SQL文件
const sqlFile = path.join(__dirname, '../database/schema-postgres.sql');

if (!fs.existsSync(sqlFile)) {
  log(`❌ SQL文件不存在: ${sqlFile}`, 'red');
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
log('✅ 已读取 schema-postgres.sql', 'green');

log('\n========================================', 'blue');
log('  创建数据库表', 'blue');
log('========================================\n', 'blue');

log('⚠️  Supabase REST API不支持直接执行DDL语句', 'yellow');
log('⚠️  请按照以下步骤手动创建表：\n', 'yellow');

log('步骤1：访问 Supabase Dashboard', 'cyan');
log('  https://supabase.com/dashboard/project/raplkhuxnrmshilrkjwi\n', 'cyan');

log('步骤2：打开 SQL Editor', 'cyan');
log('  左侧导航栏 → SQL Editor → New query\n', 'cyan');

log('步骤3：执行建表脚本', 'cyan');
log('  复制 database/schema-postgres.sql 的内容', 'cyan');
log('  粘贴到 SQL Editor 中', 'cyan');
log('  点击 Run 执行\n', 'cyan');

log('步骤4：验证表创建', 'cyan');
log('  左侧导航栏 → Table Editor', 'cyan');
log('  检查8张表是否都已创建\n', 'cyan');

log('步骤5：测试连接', 'cyan');
log('  node scripts/test-supabase-connection.js\n', 'cyan');

log('\n========================================\n', 'blue');
