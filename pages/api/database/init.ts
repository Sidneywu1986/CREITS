import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/services/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 读取 schema.sql 文件
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({ error: 'Schema file not found' });
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // 分割SQL语句（按分号分割）
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results: any[] = [];

    // 逐个执行SQL语句
    for (const statement of statements) {
      if (statement.toLowerCase().includes('create table')) {
        // 提取表名
        const tableNameMatch = statement.match(/create\s+table\s+(\w+)/i);
        const tableName = tableNameMatch ? tableNameMatch[1] : 'unknown';

        // 注意：Supabase 不支持直接执行 DDL 语句
        // 这里只是模拟返回信息，实际需要在 Supabase 控制台手动创建表
        results.push({
          table: tableName,
          status: 'manual_required',
          message: '请在 Supabase 控制台手动创建此表',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Schema 解析成功，请手动在 Supabase 控制台执行 SQL 语句',
      tables: results.map(r => r.table),
      instructions: [
        '1. 登录 Supabase 控制台',
        '2. 进入 SQL Editor',
        '3. 复制 database/schema.sql 文件内容',
        '4. 粘贴到 SQL Editor 并执行',
      ],
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
