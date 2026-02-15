/**
 * 数据迁移工具 - 从MySQL导出数据
 *
 * 使用方法：
 * node scripts/export-mysql-data.js --table=reit_product_info --output=export/
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

// 支持的表列表
const TABLES = [
  'reit_product_info',
  'reit_property_base',
  'reit_property_equity_ops',
  'reit_property_concession_ops',
  'reit_financial_metrics',
  'reit_valuation',
  'reit_risk_compliance',
  'reit_market_stats',
];

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    table: null,
    output: 'export',
    format: 'json',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value;
    }
  }

  return options;
}

// 导出单个表数据
async function exportTable(connection, tableName, outputDir, format) {
  log(`\n导出表: ${tableName}`, 'blue');

  try {
    // 查询数据
    const query = `SELECT * FROM ${tableName}`;
    const [rows] = await connection.query(query);

    log(`✅ 查询到 ${rows.length} 条记录`, 'green');

    if (rows.length === 0) {
      return { tableName, count: 0, success: true };
    }

    // 保存文件
    const fileName = `${tableName}.${format}`;
    const filePath = path.join(outputDir, fileName);

    if (format === 'json') {
      fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf-8');
    } else if (format === 'csv') {
      const csv = convertToCSV(rows);
      fs.writeFileSync(filePath, csv, 'utf-8');
    }

    log(`✅ 已保存到: ${filePath}`, 'cyan');
    return { tableName, count: rows.length, success: true };
  } catch (error) {
    log(`❌ 导出失败: ${error.message}`, 'red');
    return { tableName, count: 0, success: false, error: error.message };
  }
}

// 转换为CSV格式
function convertToCSV(rows) {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const headerRow = headers.join(',');

  const dataRows = rows.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      // 处理null值、日期、数字等
      let strValue = String(value ?? '');

      // 转义引号和逗号
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        strValue = `"${strValue.replace(/"/g, '""')}"`;
      }

      return strValue;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  MySQL数据导出工具', 'blue');
  log('========================================\n', 'blue');

  const options = parseArgs();

  // 检查MySQL连接配置
  const mysqlHost = process.env.MYSQL_HOST;
  const mysqlUser = process.env.MYSQL_USER;
  const mysqlPassword = process.env.MYSQL_PASSWORD;
  const mysqlDatabase = process.env.MYSQL_DATABASE;

  if (!mysqlHost || !mysqlUser || !mysqlPassword || !mysqlDatabase) {
    log('❌ MySQL配置缺失', 'red');
    log('请在 .env.local 中配置:', 'yellow');
    log('  MYSQL_HOST=localhost', 'yellow');
    log('  MYSQL_USER=root', 'yellow');
    log('  MYSQL_PASSWORD=your_password', 'yellow');
    log('  MYSQL_DATABASE=reits_db', 'yellow');
    process.exit(1);
  }

  // 创建输出目录
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  try {
    // 导入mysql2（需要先安装：npm install mysql2）
    const mysql = require('mysql2/promise');

    // 创建连接
    const connection = await mysql.createConnection({
      host: mysqlHost,
      user: mysqlUser,
      password: mysqlPassword,
      database: mysqlDatabase,
      multipleStatements: true,
    });

    log('✅ MySQL连接成功', 'green');

    // 确定要导出的表
    const tablesToExport = options.table ? [options.table] : TABLES;

    // 导出数据
    const results = [];
    for (const tableName of tablesToExport) {
      const result = await exportTable(connection, tableName, options.output, options.format);
      results.push(result);
    }

    // 关闭连接
    await connection.end();

    // 生成报告
    log('\n========== 导出报告 ==========\n', 'blue');
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;
    const totalRecords = results.reduce((sum, r) => sum + r.count, 0);

    log(`成功: ${successCount} 张表`, 'green');
    log(`失败: ${failedCount} 张表`, failedCount > 0 ? 'red' : 'reset');
    log(`总记录数: ${totalRecords}`, 'cyan');

    if (failedCount > 0) {
      log('\n失败的表:', 'red');
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          log(`  - ${r.tableName}: ${r.error}`, 'red');
        });
    }

    log('\n下一步:', 'yellow');
    log('  1. 检查导出的数据文件', 'yellow');
    log('  2. 运行导入工具:', 'yellow');
    log(`     node scripts/import-to-supabase.js --input=${options.output}`, 'yellow');

    log('\n========================================\n', 'blue');
  } catch (error) {
    log('❌ 导出失败:', 'red');
    log(`   ${error.message}`, 'red');
    log('\n请确保已安装mysql2:', 'yellow');
    log('  npm install mysql2', 'yellow');
    process.exit(1);
  }
}

// 执行
main();
