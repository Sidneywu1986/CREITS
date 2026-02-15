请按照以下步骤操作：

## 方法1：直接在项目文件夹中找到SQL文件

1. 在你的项目目录中找到文件：`database/schema-postgres.sql`
2. 用文本编辑器打开这个文件
3. 复制全部内容
4. 粘贴到Supabase的SQL Editor中
5. 点击Run按钮执行

## 方法2：使用项目中的测试脚本

我已经创建了一个辅助脚本，可以帮你打开文件并显示内容：

```bash
node scripts/create-tables-via-api.js
```

这个脚本会显示所有需要执行的SQL语句。

## 方法3：逐个创建表（如果SQL太长）

如果一次性复制所有SQL太长，可以分批次执行：

### 批次1：创建前4张表
复制以下SQL到SQL Editor并执行：

```sql
-- 1. 产品基本信息表
CREATE TABLE IF NOT EXISTS reit_product_info (
    reit_code VARCHAR(20) PRIMARY KEY,
    reit_short_name VARCHAR(100) NOT NULL,
    fund_manager VARCHAR(100) NOT NULL,
    asset_manager VARCHAR(100),
    operator VARCHAR(200),
    listing_date DATE,
    fund_size NUMERIC(18,4),
    total_assets NUMERIC(18,4),
    asset_type_national VARCHAR(50),
    asset_type_csrc VARCHAR(50),
    product_structure TEXT,
    duration_years INTEGER,
    leverage_ratio NUMERIC(10,4),
    info_disclosure_officer VARCHAR(100),
    disclosure_contact VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 底层资产信息表
CREATE TABLE IF NOT EXISTS reit_property_base (
    property_id VARCHAR(50) NOT NULL,
    reit_code VARCHAR(20) NOT NULL,
    property_name VARCHAR(200) NOT NULL,
    location_province VARCHAR(50),
    location_city VARCHAR(50),
    location_district VARCHAR(100),
    asset_address VARCHAR(255),
    gross_floor_area NUMERIC(18,4),
    land_area NUMERIC(18,4),
    land_right_type VARCHAR(50),
    land_expiry_date DATE,
    year_built INTEGER,
    year_acquired INTEGER,
    certificate_number VARCHAR(100),
    asset_encumbrance TEXT,
    effective_date DATE NOT NULL,
    expiration_date DATE DEFAULT '9999-12-31',
    PRIMARY KEY (property_id, effective_date)
);

-- 3. 产权类运营数据表
CREATE TABLE IF NOT EXISTS reit_property_equity_ops (
    property_id VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    rentable_area NUMERIC(18,4),
    occupancy_rate NUMERIC(10,4),
    average_rent NUMERIC(18,4),
    rental_income NUMERIC(18,4),
    other_income NUMERIC(18,4),
    total_operating_income NUMERIC(18,4),
    top_tenant_name VARCHAR(500),
    top_tenant_ratio NUMERIC(10,4),
    top5_tenant_ratio NUMERIC(10,4),
    wale NUMERIC(10,4),
    lease_expiry_1yr NUMERIC(10,4),
    lease_expiry_2yr NUMERIC(10,4),
    lease_expiry_3yr NUMERIC(10,4),
    lease_expiry_3plus NUMERIC(10,4),
    renewal_rate NUMERIC(10,4),
    num_units INTEGER,
    storage_capacity NUMERIC(18,4),
    PRIMARY KEY (property_id, report_date)
);

-- 4. 经营权类运营数据表
CREATE TABLE IF NOT EXISTS reit_property_concession_ops (
    property_id VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    traffic_volume_avg_daily INTEGER,
    traffic_volume_total BIGINT,
    toll_rate_avg NUMERIC(10,4),
    toll_income NUMERIC(18,4),
    processing_capacity NUMERIC(18,4),
    actual_processing NUMERIC(18,4),
    tariff NUMERIC(10,4),
    operating_revenue NUMERIC(18,4),
    remaining_concession_years INTEGER,
    concession_expiry_date DATE,
    major_maintenance_date DATE,
    next_major_maintenance_date DATE,
    maintenance_reserve NUMERIC(18,4),
    PRIMARY KEY (property_id, report_date)
);
```

点击Run执行，确认成功后继续批次2。

### 批次2：创建后4张表
复制以下SQL到SQL Editor并执行：

```sql
-- 5. 财务指标表
CREATE TABLE IF NOT EXISTS reit_financial_metrics (
    reit_code VARCHAR(20) NOT NULL,
    report_date DATE NOT NULL,
    report_type VARCHAR(20),
    total_revenue NUMERIC(18,4),
    operating_cost NUMERIC(18,4),
    gross_profit NUMERIC(18,4),
    admin_expense NUMERIC(18,4),
    financial_expense NUMERIC(18,4),
    net_profit NUMERIC(18,4),
    ebitda NUMERIC(18,4),
    ffo NUMERIC(18,4),
    affo NUMERIC(18,4),
    available_for_distribution NUMERIC(18,4),
    actual_distribution NUMERIC(18,4),
    distribution_per_share NUMERIC(10,4),
    distribution_yield NUMERIC(10,4),
    total_assets_balance NUMERIC(18,4),
    total_liabilities NUMERIC(18,4),
    net_assets NUMERIC(18,4),
    nav_per_share NUMERIC(10,4),
    roa NUMERIC(10,4),
    roe NUMERIC(10,4),
    dscr NUMERIC(10,4),
    interest_coverage NUMERIC(10,4),
    current_ratio NUMERIC(10,4),
    debt_to_asset NUMERIC(10,4),
    PRIMARY KEY (reit_code, report_date)
);

-- 6. 估值信息表
CREATE TABLE IF NOT EXISTS reit_valuation (
    reit_code VARCHAR(20) NOT NULL,
    valuation_date DATE NOT NULL,
    report_source VARCHAR(50),
    appraisal_value NUMERIC(18,4),
    appraisal_value_per_share NUMERIC(10,4),
    valuation_method VARCHAR(100),
    discount_rate NUMERIC(10,4),
    terminal_growth_rate NUMERIC(10,4),
    long_term_rent_growth NUMERIC(10,4),
    cap_rate NUMERIC(10,4),
    vacancy_rate_assumption NUMERIC(10,4),
    operating_cost_ratio NUMERIC(10,4),
    implied_cap_rate NUMERIC(10,4),
    nav_premium_discount NUMERIC(10,4),
    PRIMARY KEY (reit_code, valuation_date)
);

-- 7. 风险合规表
CREATE TABLE IF NOT EXISTS reit_risk_compliance (
    reit_code VARCHAR(20) NOT NULL,
    info_date DATE NOT NULL,
    regulatory_status VARCHAR(50),
    regulatory_action_desc TEXT,
    legal_proceedings TEXT,
    legal_proceeding_status VARCHAR(50),
    insider_trading_policy BOOLEAN DEFAULT TRUE,
    esg_score NUMERIC(10,4),
    esg_rating_agency VARCHAR(50),
    related_party_transactions TEXT,
    contingent_liabilities TEXT,
    risk_factor_update TEXT,
    PRIMARY KEY (reit_code, info_date)
);

-- 8. 市场表现表
CREATE TABLE IF NOT EXISTS reit_market_stats (
    reit_code VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    open_price NUMERIC(10,4),
    close_price NUMERIC(10,4),
    high_price NUMERIC(10,4),
    low_price NUMERIC(10,4),
    daily_volume BIGINT,
    daily_turnover NUMERIC(18,4),
    turnover_rate NUMERIC(10,4),
    market_cap NUMERIC(18,4),
    institutional_holding_pct NUMERIC(10,4),
    retail_holding_pct NUMERIC(10,4),
    top10_holder_names TEXT,
    top10_holder_ratios TEXT,
    top10_holder_total_pct NUMERIC(10,4),
    original_holder_holding_pct NUMERIC(10,4),
    PRIMARY KEY (reit_code, trade_date)
);
```

点击Run执行。

## 验证表创建

执行完成后，点击左侧导航栏的 **Table Editor**，你应该能看到8张表：
- reit_product_info
- reit_property_base
- reit_property_equity_ops
- reit_property_concession_ops
- reit_financial_metrics
- reit_valuation
- reit_risk_compliance
- reit_market_stats

## 测试连接

表创建成功后，在终端运行：

```bash
node scripts/test-supabase-connection.js
```

如果看到"🎉 所有测试通过！Supabase配置成功！"，说明配置完成！
