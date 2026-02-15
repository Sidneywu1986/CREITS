/**
 * 数据库初始化脚本
 *
 * 使用方法：
 * node scripts/init-database.js
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

// 读取SQL文件
function readSchemaFile() {
  const schemaPath = path.join(__dirname, '../database/schema.sql');

  if (!fs.existsSync(schemaPath)) {
    log(`❌ SQL文件不存在: ${schemaPath}`, 'red');
    return null;
  }

  const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
  log('✅ 已读取 schema.sql 文件', 'green');
  return sqlContent;
}

// 分割SQL语句
function splitSQLStatements(sqlContent) {
  // 移除注释
  const cleaned = sqlContent
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  // 按分号分割
  const statements = cleaned
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^\/\*/));

  return statements;
}

// 检查Supabase CLI是否安装
function checkSupabaseCLI() {
  const { execSync } = require('child_process');

  try {
    const version = execSync('supabase --version', { encoding: 'utf-8' }).trim();
    log('✅ Supabase CLI 已安装', 'green');
    log(`   版本: ${version}`, 'cyan');
    return true;
  } catch (err) {
    log('❌ Supabase CLI 未安装', 'red');
    log('请安装 Supabase CLI:', 'yellow');
    log('  npm install -g supabase', 'yellow');
    log('  或访问: https://supabase.com/docs/guides/cli', 'yellow');
    return false;
  }
}

// 使用Supabase CLI执行SQL
async function executeWithCLI(sqlStatements) {
  const { execSync } = require('child_process');

  log('\n开始执行SQL语句...', 'blue');
  log('----------------------------------------', 'cyan');

  const results = [];

  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];

    // 跳过空语句和注释
    if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
      continue;
    }

    // 提取表名（用于显示）
    const tableNameMatch = statement.match(/CREATE TABLE\s+`?(\w+)`?/i);
    const tableName = tableNameMatch ? tableNameMatch[1] : `语句 ${i + 1}`;

    try {
      // 创建临时SQL文件
      const tempFile = path.join(__dirname, `temp_${Date.now()}.sql`);
      fs.writeFileSync(tempFile, statement);

      // 执行SQL
      execSync(`supabase db execute --file ${tempFile}`, { stdio: 'pipe' });

      // 删除临时文件
      fs.unlinkSync(tempFile);

      log(`✅ ${tableName}`, 'green');
      results.push({ table: tableName, status: 'success' });
    } catch (err) {
      log(`❌ ${tableName}`, 'red');

      // 检查是否是"表已存在"错误（可以忽略）
      if (err.message.includes('already exists')) {
        log(`   (表已存在，跳过)`, 'yellow');
        results.push({ table: tableName, status: 'exists' });
      } else {
        log(`   错误: ${err.message}`, 'red');
        results.push({ table: tableName, status: 'failed', error: err.message });
      }
    }
  }

  log('----------------------------------------\n', 'cyan');
  return results;
}

// 使用psql执行SQL（需要PostgreSQL客户端）
async function executeWithPSQL(sqlStatements) {
  const { execSync } = require('child_process');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    log('❌ 缺少Supabase凭证', 'red');
    log('请在 .env.local 中配置:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
    return [];
  }

  log('\n开始执行SQL语句...', 'blue');
  log('----------------------------------------', 'cyan');

  const results = [];

  // 解析URL获取连接信息
  const urlMatch = url.match(/https:\/\/(\w+)\.supabase\.co/);
  if (!urlMatch) {
    log('❌ 无法解析Supabase URL', 'red');
    return [];
  }

  const projectRef = urlMatch[1];
  const connectionString = `postgresql://postgres.${projectRef}:${key}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;

  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];

    // 跳过空语句
    if (!statement || statement.trim().length === 0) {
      continue;
    }

    // 提取表名
    const tableNameMatch = statement.match(/CREATE TABLE\s+`?(\w+)`?/i);
    const tableName = tableNameMatch ? tableNameMatch[1] : `语句 ${i + 1}`;

    try {
      // 执行SQL
      execSync(`psql "${connectionString}" -c "${statement.replace(/"/g, '\\"')}"`, {
        stdio: 'pipe',
      });

      log(`✅ ${tableName}`, 'green');
      results.push({ table: tableName, status: 'success' });
    } catch (err) {
      log(`❌ ${tableName}`, 'red');

      if (err.message.includes('already exists')) {
        log(`   (表已存在，跳过)`, 'yellow');
        results.push({ table: tableName, status: 'exists' });
      } else {
        log(`   错误: ${err.message}`, 'red');
        results.push({ table: tableName, status: 'failed', error: err.message });
      }
    }
  }

  log('----------------------------------------\n', 'cyan');
  return results;
}

// 生成报告
function generateReport(results) {
  log('========== 执行结果 ==========\n', 'blue');

  const successCount = results.filter(r => r.status === 'success').length;
  const existsCount = results.filter(r => r.status === 'exists').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  log(`成功: ${successCount}`, 'green');
  log(`已存在: ${existsCount}`, 'yellow');
  log(`失败: ${failedCount}`, failedCount > 0 ? 'red' : 'reset');

  if (failedCount > 0) {
    log('\n失败的表:', 'red');
    results
      .filter(r => r.status === 'failed')
      .forEach(r => {
        log(`  - ${r.table}`, 'red');
        log(`    ${r.error}`, 'red');
      });
  }

  log('\n下一步:', 'yellow');
  if (failedCount === 0) {
    log('  1. 运行测试脚本验证连接:', 'yellow');
    log('     node scripts/test-supabase-connection.js', 'yellow');
    log('  2. 开始使用数据库服务', 'yellow');
  } else {
    log('  1. 检查错误信息', 'red');
    log('  2. 手动在Supabase Dashboard执行失败的SQL语句', 'yellow');
  }
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  数据库初始化脚本', 'blue');
  log('========================================\n', 'blue');

  // 1. 读取SQL文件
  const sqlContent = readSchemaFile();
  if (!sqlContent) {
    process.exit(1);
  }

  // 2. 分割SQL语句
  const statements = splitSQLStatements(sqlContent);
  log(`✅ 解析到 ${statements.length} 条SQL语句`, 'green');

  // 3. 检查可用的执行方式
  const hasCLI = checkSupabaseCLI();
  const hasPSQL = checkPSQL();

  let results = [];

  if (hasCLI) {
    log('\n使用 Supabase CLI 执行SQL...', 'yellow');
    results = await executeWithCLI(statements);
  } else if (hasPSQL) {
    log('\n使用 psql 执行SQL...', 'yellow');
    results = await executeWithPSQL(statements);
  } else {
    log('\n❌ 未找到可用的执行工具', 'red');
    log('\n请选择以下方式之一:', 'yellow');
    log('\n方式1: 使用Supabase CLI（推荐）', 'yellow');
    log('  1. 安装: npm install -g supabase', 'yellow');
    log('  2. 登录: supabase login', 'yellow');
    log('  3. 链接: supabase link --project-ref <your-project-ref>', 'yellow');
    log('  4. 运行: node scripts/init-database.js', 'yellow');
    log('\n方式2: 使用psql', 'yellow');
    log('  1. 安装PostgreSQL客户端', 'yellow');
    log('  2. 运行: node scripts/init-database.js', 'yellow');
    log('\n方式3: 手动在Supabase Dashboard执行', 'yellow');
    log('  1. 打开 https://supabase.com/dashboard', 'yellow');
    log('  2. 进入项目 → SQL Editor', 'yellow');
    log('  3. 复制 database/schema.sql 内容', 'yellow');
    log('  4. 点击 Run 执行', 'yellow');

    process.exit(1);
  }

  // 4. 生成报告
  generateReport(results);

  log('\n========================================\n', 'blue');
}

// 检查psql是否可用
function checkPSQL() {
  const { execSync } = require('child_process');

  try {
    execSync('psql --version', { stdio: 'pipe' });
    log('✅ PostgreSQL客户端 (psql) 已安装', 'green');
    return true;
  } catch (err) {
    return false;
  }
}

// 执行
main().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});
