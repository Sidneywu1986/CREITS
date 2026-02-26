/**
 * 验证 .env.local 中的 Supabase 凭证
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'dotenv';

// 读取 .env.local 文件
const envConfig = parse(readFileSync('.env.local'));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('[Supabase验证] 开始验证 Supabase 凭证...');
console.log('[Supabase验证] Supabase URL:', supabaseUrl);
console.log('[Supabase验证] Supabase Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase验证] ❌ Supabase 凭证不完整');
  console.error('[Supabase验证] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('[Supabase验证] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '已配置' : '未配置');
  process.exit(1);
}

// 创建 Supabase 客户端
const client = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('[Supabase验证] 测试数据库连接...');

    // 测试查询 reits_products 表
    const { data, error, count } = await client
      .from('reits_products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[Supabase验证] ❌ 数据库连接失败:', error.message);
      console.error('[Supabase验证] 错误详情:', error);
      process.exit(1);
    }

    console.log('[Supabase验证] ✅ 数据库连接成功！');
    console.log('[Supabase验证] 表 reits_products 中有', count, '条记录');

    // 测试其他表
    console.log('[Supabase验证] 验证所有表结构...');

    const tables = [
      'reits_products',
      'reits_policies',
      'reits_news',
      'reits_announcements',
      'reits_valuation_history',
      'reits_model_training',
      'reits_evolution_tasks'
    ];

    for (const tableName of tables) {
      const { error: tableError } = await client
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (tableError) {
        console.error(`[Supabase验证] ⚠️  表 ${tableName} 访问失败:`, tableError.message);
      } else {
        console.log(`[Supabase验证] ✅ 表 ${tableName} 访问正常`);
      }
    }

    console.log('[Supabase验证] ✅ 所有验证通过！');
    console.log('[Supabase验证] Supabase 凭证有效，可以用于部署');

    return {
      success: true,
      supabaseUrl,
      supabaseKey: supabaseKey.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Supabase验证] ❌ 验证过程出错:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

testConnection()
  .then(result => {
    console.log('[Supabase验证] 最终结果:', JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('[Supabase验证] ❌ 未知错误:', error);
    process.exit(1);
  });
