# 数据迁移指南

本文档帮助你将现有数据从MySQL迁移到Supabase。

## 📋 目录
1. [迁移前准备](#1迁移前准备)
2. [从MySQL导出数据](#2从mysql导出数据)
3. [导入到Supabase](#3导入到supabase)
4. [数据验证](#4数据验证)
5. [常见问题](#5常见问题)

---

## 1. 迁移前准备

### 1.1 备份现有数据
在开始迁移前，请务必备份现有MySQL数据库：

```bash
# 备份整个数据库
mysqldump -h localhost -u root -p reits_db > backup_$(date +%Y%m%d).sql

# 或使用Supabase CLI（如果已配置）
supabase db dump > backup_$(date +%Y%m%d).sql
```

### 1.2 检查数据完整性
```sql
-- 检查每张表的记录数
SELECT
  'reit_product_info' as table_name,
  COUNT(*) as record_count
FROM reit_product_info
UNION ALL
SELECT 'reit_property_base', COUNT(*) FROM reit_property_base
UNION ALL
SELECT 'reit_property_equity_ops', COUNT(*) FROM reit_property_equity_ops
UNION ALL
SELECT 'reit_property_concession_ops', COUNT(*) FROM reit_property_concession_ops
UNION ALL
SELECT 'reit_financial_metrics', COUNT(*) FROM reit_financial_metrics
UNION ALL
SELECT 'reit_valuation', COUNT(*) FROM reit_valuation
UNION ALL
SELECT 'reit_risk_compliance', COUNT(*) FROM reit_risk_compliance
UNION ALL
SELECT 'reit_market_stats', COUNT(*) FROM reit_market_stats;
```

### 1.3 配置环境变量
在 `.env.local` 中添加MySQL配置：

```bash
# MySQL配置（用于导出数据）
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=reits_db

# Supabase配置（用于导入数据）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 1.4 安装依赖
```bash
# 安装mysql2（用于连接MySQL）
npm install mysql2

# 安装依赖（如果还没有）
npm install
```

---

## 2. 从MySQL导出数据

### 2.1 导出所有表
```bash
# 导出所有表（JSON格式，默认）
node scripts/export-mysql-data.js --output=export

# 导出所有表（CSV格式）
node scripts/export-mysql-data.js --output=export --format=csv
```

### 2.2 导出单个表
```bash
# 导出特定表
node scripts/export-mysql-data.js --table=reit_product_info --output=export

# 导出多个表（多次执行）
node scripts/export-mysql-data.js --table=reit_product_info --output=export
node scripts/export-mysql-data.js --table=reit_market_stats --output=export
```

### 2.3 导出结果
导出的文件将保存在 `export/` 目录下：
```
export/
├── reit_product_info.json
├── reit_property_base.json
├── reit_property_equity_ops.json
├── reit_property_concession_ops.json
├── reit_financial_metrics.json
├── reit_valuation.json
├── reit_risk_compliance.json
└── reit_market_stats.json
```

---

## 3. 导入到Supabase

### 3.1 确保Supabase表已创建
在导入前，确保已在Supabase中创建了所有表：

1. 登录 https://supabase.com/dashboard
2. 进入项目 → SQL Editor
3. 执行 `database/schema.sql` 创建表
4. 验证所有表都已创建

### 3.2 导入所有表（insert模式）
```bash
# 插入模式（会跳过重复记录）
node scripts/import-to-supabase.js --input=export

# 使用CSV格式导入
node scripts/import-to-supabase.js --input=export --format=csv
```

### 3.3 导入所有表（upsert模式）
```bash
# Upsert模式（更新已存在的记录）
node scripts/import-to-supabase.js --input=export --mode=upsert
```

### 3.4 导入单个表
```bash
# 导入特定表
node scripts/import-to-supabase.js --input=export --table=reit_product_info
```

### 3.5 查看导入进度
导入过程中会实时显示进度：
```
========================================
  Supabase数据导入工具
========================================

✅ Supabase连接成功

将要导入 8 张表

导入表: reit_product_info
✅ 读取到 50 条记录
⚠️  表中已有 10 条记录
✅ 成功: 50

导入表: reit_market_stats
✅ 读取到 12500 条记录
✅ 成功: 12500

...
```

---

## 4. 数据验证

### 4.1 验证记录数
```bash
# 运行连接测试
node scripts/test-supabase-connection.js
```

或手动查询：
```sql
-- 在Supabase SQL Editor中执行
SELECT
  'reit_product_info' as table_name,
  COUNT(*) as record_count
FROM reit_product_info
UNION ALL
SELECT 'reit_property_base', COUNT(*) FROM reit_property_base
UNION ALL
SELECT 'reit_market_stats', COUNT(*) FROM reit_market_stats;
```

### 4.2 验证数据完整性
```javascript
// 在浏览器Console中执行
import { reitsDB } from '@/lib/database/reits-db';

// 检查产品数量
const products = await reitsDB.getAllProducts();
console.log(`产品数量: ${products.length}`);

// 检查特定产品的完整信息
const fullInfo = await reitsDB.getFullProductInfo('508000.SH');
console.log('完整信息:', fullInfo);
```

### 4.3 验证前端展示
1. 启动开发服务器：`npm run dev`
2. 访问 http://localhost:5000/issued-reits
3. 检查数据是否正常显示

---

## 5. 常见问题

### Q1: 导出时提示"mysql2模块未找到"
**A**: 需要安装mysql2依赖
```bash
npm install mysql2
```

### Q2: 导入时提示"Supabase配置缺失"
**A**: 检查 `.env.local` 文件中的Supabase配置
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Q3: 导入时提示"表中已有记录"
**A**: 使用 `--mode=upsert` 更新已存在的记录
```bash
node scripts/import-to-supabase.js --input=export --mode=upsert
```

### Q4: 大表导入失败或超时
**A**: 分批导入
```bash
# 方法1：分表导入
node scripts/import-to-supabase.js --input=export --table=reit_market_stats

# 方法2：减小导出文件
# 先导出部分数据，再导入
```

### Q5: JSON格式解析错误
**A**: 检查导出的JSON文件是否有效
```bash
# 使用jq验证JSON
jq . export/reit_product_info.json
```

### Q6: CSV导入时字段顺序不对
**A**: CSV导入会自动根据第一行的标题匹配字段，确保标题与数据库字段名一致

### Q7: 日期格式问题
**A**: Supabase期望ISO格式日期（YYYY-MM-DD或YYYY-MM-DDTHH:mm:ss.sssZ）
```javascript
// 转换日期格式
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};
```

### Q8: 中文乱码问题
**A**: 确保导出时使用UTF-8编码
```bash
# 检查文件编码
file -i export/reit_product_info.json

# 转换为UTF-8（如果需要）
iconv -f GBK -t UTF-8 export/reit_product_info.json > export/reit_product_info_utf8.json
```

---

## 6. 高级场景

### 6.1 增量迁移
只迁移新增或更新的数据：
```sql
-- 在MySQL中查询需要迁移的数据
SELECT * FROM reit_market_stats
WHERE trade_date >= '2024-01-01';

-- 导出结果，然后导入
```

### 6.2 数据清洗
在导入前清洗数据：
```javascript
// 创建清洗脚本
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('export/reit_product_info.json', 'utf-8'));

// 清洗数据
const cleaned = data.map(item => ({
  ...item,
  reit_code: item.reit_code?.trim(),
  reit_short_name: item.reit_short_name?.trim(),
  fund_size: item.fund_size || null,
}));

// 保存清洗后的数据
fs.writeFileSync('export/reit_product_info_cleaned.json', JSON.stringify(cleaned, null, 2));
```

### 6.3 跨数据库迁移
从PostgreSQL或其他数据库迁移：
```bash
# 使用pg_dump导出PostgreSQL数据
pg_dump -h localhost -U postgres reits_db > export.sql

# 转换为JSON格式（需要编写转换脚本）
node scripts/convert-pg-to-json.js --input=export.sql --output=export
```

---

## 7. 迁移清单

完成以下检查，确认迁移成功：

- [ ] 已备份现有MySQL数据库
- [ ] 已检查MySQL数据完整性
- [ ] 已安装所需依赖（mysql2）
- [ ] 已配置环境变量
- [ ] 已从MySQL导出所有表
- [ ] 已在Supabase中创建所有表
- [ ] 已成功导入所有表
- [ ] 已验证记录数一致
- [ ] 已验证前端数据展示
- [ ] 已测试CRUD操作

---

## 📞 需要帮助？

如果遇到问题：
1. 查看迁移日志：`scripts/export-mysql-data.js` 和 `scripts/import-to-supabase.js` 的输出
2. 检查环境变量配置
3. 查看Supabase Dashboard中的错误日志
4. 联系项目开发团队

---

## 📚 相关文档

- [Supabase配置指南](supabase-setup-guide.md)
- [飞书集成指南](feishu-integration-guide.md)
- [数据库Schema定义](../database/schema.sql)
- [数据库服务代码](../src/lib/database/reits-db.ts)
