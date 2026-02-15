# REITs八张表数据库初始化指南

由于Supabase JavaScript客户端不支持直接执行DDL语句（CREATE/DROP TABLE），需要通过Supabase Dashboard的SQL编辑器手动创建表。

## 步骤1：打开Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 左侧菜单点击 **SQL Editor**

## 步骤2：删除旧表（如果存在）

在SQL编辑器中执行以下SQL：

```sql
-- 删除所有REITs相关表（按依赖关系倒序）
DROP TABLE IF EXISTS reit_risk_metrics CASCADE;
DROP TABLE IF EXISTS reit_dividend_history CASCADE;
DROP TABLE IF EXISTS reit_investor_structure CASCADE;
DROP TABLE IF EXISTS reit_market_performance CASCADE;
DROP TABLE IF EXISTS reit_operational_data CASCADE;
DROP TABLE IF EXISTS reit_financial_metrics CASCADE;
DROP TABLE IF EXISTS reit_property_info CASCADE;
DROP TABLE IF EXISTS reit_product_info CASCADE;
```

## 步骤3：创建新表

复制 `database/schema-reits-postgres.sql` 文件的全部内容，粘贴到SQL编辑器中，点击 **RUN** 执行。

或者直接执行以下SQL（简化版，仅创建产品信息表）：

```sql
-- 产品信息表
CREATE TABLE IF NOT EXISTS reit_product_info (
    fund_code VARCHAR(20) NOT NULL PRIMARY KEY,
    fund_name VARCHAR(100) NOT NULL,
    fund_short_name VARCHAR(50),
    fund_type VARCHAR(50),
    asset_type VARCHAR(100),
    manager_name VARCHAR(200),
    custodian_name VARCHAR(200),
    operating_manager VARCHAR(200),
    issue_date DATE,
    listing_date DATE,
    issue_price DECIMAL(10,4),
    issue_amount DECIMAL(18,4),
    fund_shares DECIMAL(18,4),
    management_fee_rate DECIMAL(8,4),
    custody_fee_rate DECIMAL(8,4),
    investment_scope TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 步骤4：插入示例数据

在项目根目录执行：

```bash
node scripts/create-reits-sample-data.js
```

## 验证

执行成功后，访问 `http://localhost:5000/reits-data-tables` 应该能看到8个REITs产品的数据。
