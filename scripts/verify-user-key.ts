/**
 * 验证用户提供的 Supabase Key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2RmeW5vdHlpaXNtaXV5Z2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjMyNjcsImV4cCI6MjA4NzY5OTI2N30.k8bP1guOpZ88L-93bfn2Fvs9JP0uhPp1POcbFaLJLrs';

// 从 key 中提取项目引用
const projectRef = 'dmcdfynotyysimuyglj';
const supabaseUrl = `https://${projectRef}.supabase.co`;

console.log('[Supabase验证] 验证用户提供的 Supabase Key...');
console.log('[Supabase验证] Supabase URL:', supabaseUrl);
console.log('[Supabase验证] Supabase Key:', supabaseKey.substring(0, 30) + '...');

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
      console.error('[Supabase验证] 错误代码:', error.code);
      console.error('[Supabase验证] 错误详情:', error);
      return false;
    }

    console.log('[Supabase验证] ✅ 数据库连接成功！');
    console.log('[Supabase验证] 表 reits_products 中有', count, '条记录');

    // 测试所有表
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

    let allTablesAccessible = true;

    for (const tableName of tables) {
      const { error: tableError } = await client
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (tableError) {
        console.error(`[Supabase验证] ⚠️  表 ${tableName} 访问失败:`, tableError.message);
        allTablesAccessible = false;
      } else {
        console.log(`[Supabase验证] ✅ 表 ${tableName} 访问正常`);
      }
    }

    if (allTablesAccessible) {
      console.log('[Supabase验证] ✅ 所有表都可以正常访问！');
      console.log('[Supabase验证] ✅ Supabase Key 有效，可以用于部署');
    } else {
      console.log('[Supabase验证] ⚠️  部分表访问失败，可能需要同步 Schema');
    }

    return {
      success: true,
      supabaseUrl,
      projectRef,
      tablesAccessible: allTablesAccessible,
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
