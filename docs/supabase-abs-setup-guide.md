# Supabase数据库建表指南

## ABS数据库表创建步骤

### 方法一：使用Supabase Dashboard（推荐）

#### 第1步：访问Supabase Dashboard

打开浏览器访问：https://supabase.com/dashboard

#### 第2步：进入项目

1. 登录您的Supabase账号
2. 点击项目列表中的项目（项目ID：raplkhuxnrmshilrkjwi）

#### 第3步：打开SQL Editor

1. 在左侧导航栏点击 "SQL Editor"
2. 点击 "New Query" 创建新查询

#### 第4步：复制并执行建表SQL

1. 打开项目中的 `database/schema-abs-postgres.sql` 文件
2. 复制整个文件内容
3. 粘贴到SQL Editor中
4. 点击 "Run" 按钮执行

#### 第5步：验证表创建成功

执行以下SQL验证表是否创建成功：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'abs_%'
ORDER BY table_name;
```

应该返回9张表：
- abs_product_info
- abs_tranche_info
- abs_collateral_pool
- abs_loan_detail
- abs_cashflow
- abs_triggers_events
- abs_risk_compliance
- abs_market_stats
- abs_waterfall_structure

#### 第6步：创建示例数据

在SQL Editor中执行示例数据创建脚本（或使用命令行）：

```bash
node scripts/create-abs-sample-data.js
```

---

## 方法二：使用Supabase CLI（可选）

如果您安装了Supabase CLI，可以使用命令行方式：

```bash
# 1. 登录Supabase
supabase login

# 2. 链接到项目
supabase link --project-ref raplkhuxnrmshilrkjwi

# 3. 执行建表SQL
supabase db push

# 4. 或者直接执行SQL文件
supabase db reset --db-url "postgresql://postgres:$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)@db.raplkhuxnrmshilrkjwi.supabase.co:5432/postgres"
```

---

## 常见问题

### Q1: 执行SQL时报错 "relation already exists"
**A:** 表已存在，可以跳过。或者先删除表再重新创建：
```sql
DROP TABLE IF EXISTS abs_waterfall_structure CASCADE;
DROP TABLE IF EXISTS abs_market_stats CASCADE;
DROP TABLE IF EXISTS abs_risk_compliance CASCADE;
DROP TABLE IF EXISTS abs_triggers_events CASCADE;
DROP TABLE IF EXISTS abs_cashflow CASCADE;
DROP TABLE IF EXISTS abs_loan_detail CASCADE;
DROP TABLE IF EXISTS abs_collateral_pool CASCADE;
DROP TABLE IF EXISTS abs_tranche_info CASCADE;
DROP TABLE IF EXISTS abs_product_info CASCADE;
```

### Q2: 执行SQL时报权限错误
**A:** 确保您使用的是项目所有者账号登录，并且有数据库管理权限。

### Q3: SQL执行后没有错误但表没有创建
**A:** 检查SQL Editor的输出结果，确认每条SQL语句都成功执行。查看SQL Editor底部的日志输出。

---

## 建表后的验证

### 1. 检查表是否存在
```sql
SELECT COUNT(*) as abs_table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'abs_%';
```

应该返回：9

### 2. 检查表结构
```sql
\d+ abs_product_info
```

### 3. 插入测试数据
```sql
INSERT INTO abs_product_info (
  product_code,
  product_full_name,
  product_short_name,
  market_type,
  product_type,
  asset_type_main,
  asset_type_sub,
  issuer_name,
  trustee_name,
  total_scale,
  issue_date
) VALUES (
  'TEST001',
  '测试ABS产品',
  '测试ABS',
  '交易所',
  '企业ABS',
  '债权类',
  'CMBS',
  '测试发起机构',
  '测试计划管理人',
  10.00,
  '2024-01-01'
);
```

### 4. 查询测试数据
```sql
SELECT * FROM abs_product_info WHERE product_code = 'TEST001';
```

---

## 创建完成后

执行以下命令创建示例数据：

```bash
node scripts/create-abs-sample-data.js
```

然后访问前端页面查看数据：
- ABS产品列表：http://localhost:5000/abs-products

---

## 需要帮助？

如果在建表过程中遇到问题，请：
1. 检查SQL Editor的错误消息
2. 确认Supabase项目状态正常
3. 查看本文档的"常见问题"部分
