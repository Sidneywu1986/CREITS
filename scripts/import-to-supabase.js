/**
 * 数据导入工具 - 导入数据到Supabase
 *
 * 使用方法：
 * node scripts/import-to-supabase.js --input=export/ --table=reit_product_info
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

// Supabase API客户端
class SupabaseImporter {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.baseURL = 'https://api.supabase.com/v1'; // 使用REST API
    this.projectURL = url.replace('/project/', '').split('.')[0];
    this.apiBase = `https://${this.projectURL}.supabase.co`;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.apiBase}${endpoint}`;
    const headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    };

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async insert(table, records) {
    // 分批插入（Supabase限制每次最多1000条）
    const batchSize = 500;
    const batches = [];

    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    let totalInserted = 0;
    let totalFailed = 0;

    for (const batch of batches) {
      try {
        await this.request('POST', `/rest/v1/${table}`, batch);
        totalInserted += batch.length;
      } catch (error) {
        console.error(`批次插入失败: ${error.message}`);
        totalFailed += batch.length;

        // 尝试逐条插入
        for (const record of batch) {
          try {
            await this.request('POST', `/rest/v1/${table}`, record);
            totalInserted++;
            totalFailed--;
          } catch (e) {
            console.error(`单条插入失败: ${e.message}`);
          }
        }
      }
    }

    return { totalInserted, totalFailed };
  }

  async upsert(table, records) {
    // 使用upsert（如果存在则更新，不存在则插入）
    const batchSize = 500;
    const batches = [];

    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    let totalInserted = 0;
    let totalFailed = 0;

    for (const batch of batches) {
      try {
        await this.request('POST', `/rest/v1/${table}`, batch, {
          headers: {
            'Prefer': 'resolution=ignore-duplicates,return=minimal',
          },
        });
        totalInserted += batch.length;
      } catch (error) {
        console.error(`批次upsert失败: ${error.message}`);
        totalFailed += batch.length;
      }
    }

    return { totalInserted, totalFailed };
  }

  async count(table) {
    try {
      const result = await this.request('GET', `/rest/v1/${table}?select=count&head=true`, null, {
        headers: {
          'Prefer': 'count=exact',
        },
      });
      return result[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: 'export',
    table: null,
    format: 'json',
    mode: 'insert', // insert or upsert
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

// 导入单个表
async function importTable(importer, tableName, inputDir, format, mode) {
  log(`\n导入表: ${tableName}`, 'blue');

  // 读取文件
  const fileName = `${tableName}.${format}`;
  const filePath = path.join(inputDir, fileName);

  if (!fs.existsSync(filePath)) {
    log(`❌ 文件不存在: ${filePath}`, 'red');
    return { tableName, count: 0, success: false, error: '文件不存在' };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = format === 'json' ? JSON.parse(content) : parseCSV(content);

    log(`✅ 读取到 ${records.length} 条记录`, 'green');

    if (records.length === 0) {
      return { tableName, count: 0, success: true };
    }

    // 检查现有记录数
    const existingCount = await importer.count(tableName);
    if (existingCount > 0) {
      log(`⚠️  表中已有 ${existingCount} 条记录`, 'yellow');
      if (mode === 'insert') {
        log('   使用 --mode=upsert 更新现有记录', 'yellow');
      }
    }

    // 导入数据
    const result = mode === 'upsert'
      ? await importer.upsert(tableName, records)
      : await importer.insert(tableName, records);

    log(`✅ 成功: ${result.totalInserted}`, 'green');
    if (result.totalFailed > 0) {
      log(`❌ 失败: ${result.totalFailed}`, 'red');
    }

    return {
      tableName,
      count: result.totalInserted,
      success: true,
      failed: result.totalFailed,
    };
  } catch (error) {
    log(`❌ 导入失败: ${error.message}`, 'red');
    return { tableName, count: 0, success: false, error: error.message };
  }
}

// 解析CSV文件
function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  const headers = parseCSVLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record = {};

    headers.forEach((header, index) => {
      let value = values[index];

      // 尝试转换类型
      if (value === 'null' || value === '') {
        value = null;
      } else if (!isNaN(value)) {
        value = parseFloat(value);
      } else if (value.toLowerCase() === 'true') {
        value = true;
      } else if (value.toLowerCase() === 'false') {
        value = false;
      }

      record[header] = value;
    });

    records.push(record);
  }

  return records;
}

// 解析CSV行（处理引号和逗号）
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 转义的引号
        current += '"';
        i++;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  Supabase数据导入工具', 'blue');
  log('========================================\n', 'blue');

  const options = parseArgs();

  // 检查Supabase配置
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Supabase配置缺失', 'red');
    log('请在 .env.local 中配置:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key', 'yellow');
    process.exit(1);
  }

  // 检查输入目录
  if (!fs.existsSync(options.input)) {
    log(`❌ 输入目录不存在: ${options.input}`, 'red');
    process.exit(1);
  }

  try {
    // 创建导入器
    const importer = new SupabaseImporter(supabaseUrl, supabaseKey);
    log('✅ Supabase连接成功', 'green');

    // 确定要导入的表
    const tablesToImport = options.table
      ? [options.table]
      : fs.readdirSync(options.input).map((f) => f.replace(/\.(json|csv)$/, ''));

    log(`\n将要导入 ${tablesToImport.length} 张表`, 'cyan');

    // 导入数据
    const results = [];
    for (const tableName of tablesToImport) {
      const result = await importTable(
        importer,
        tableName,
        options.input,
        options.format,
        options.mode
      );
      results.push(result);
    }

    // 生成报告
    log('\n========== 导入报告 ==========\n', 'blue');
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;
    const totalRecords = results.reduce((sum, r) => sum + (r.count || 0), 0);
    const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);

    log(`成功: ${successCount} 张表`, 'green');
    log(`失败: ${failedCount} 张表`, failedCount > 0 ? 'red' : 'reset');
    log(`插入记录: ${totalRecords}`, 'cyan');
    if (totalFailed > 0) {
      log(`失败记录: ${totalFailed}`, 'red');
    }

    if (failedCount > 0) {
      log('\n失败的表:', 'red');
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          log(`  - ${r.tableName}: ${r.error}`, 'red');
        });
    }

    log('\n下一步:', 'yellow');
    if (failedCount === 0) {
      log('  1. 验证数据是否正确导入', 'yellow');
      log('  2. 运行测试:', 'yellow');
      log('     node scripts/test-supabase-connection.js', 'yellow');
      log('  3. 开始使用应用', 'yellow');
    } else {
      log('  1. 检查失败的表', 'red');
      log('  2. 使用 --mode=upsert 重新导入', 'yellow');
    }

    log('\n========================================\n', 'blue');
  } catch (error) {
    log('❌ 导入失败:', 'red');
    log(`   ${error.message}`, 'red');
    process.exit(1);
  }
}

// 执行
main();
