-- =====================================================
-- REITs八张表专业数据库完整建表语句（PostgreSQL版本）
-- 包含：产品信息、资产信息、财务指标、运营数据、市场表现、投资者结构、收益分配、风险指标
-- 适用数据库：PostgreSQL 14+
-- 参考标准：证监会公募REITs信息披露要求
-- =====================================================

-- -----------------------------------------------------
-- 1. 产品信息表 (reit_product_info)
-- 记录REITs产品的基础发行信息
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_product_info (
    fund_code VARCHAR(20) NOT NULL PRIMARY KEY,
    fund_name VARCHAR(100) NOT NULL,
    fund_short_name VARCHAR(50),
    
    -- 基础分类
    fund_type VARCHAR(50),  -- 产权类/经营权类
    asset_type VARCHAR(100),  -- 基础设施/仓储物流/产业园/保障性租赁住房等
    
    -- 管理信息
    manager_name VARCHAR(200),  -- 基金管理人
    custodian_name VARCHAR(200),  -- 基金托管人
    operating_manager VARCHAR(200),  -- 运营管理机构
    
    -- 发行信息
    issue_date DATE,
    listing_date DATE,
    issue_price DECIMAL(10,4),
    issue_amount DECIMAL(18,4),  -- 发行规模（亿）
    fund_shares DECIMAL(18,4),  -- 基金份额（亿份）
    
    -- 费率信息
    management_fee_rate DECIMAL(8,4),  -- 管理费率
    custody_fee_rate DECIMAL(8,4),  -- 托管费率
    
    -- 投资范围
    investment_scope TEXT,
    
    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reit_product_fund_type ON reit_product_info(fund_type);
CREATE INDEX idx_reit_product_asset_type ON reit_product_info(asset_type);

-- -----------------------------------------------------
-- 2. 资产信息表 (reit_property_info)
-- 记录REITs持有的底层资产信息
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_property_info (
    property_id SERIAL NOT NULL PRIMARY KEY,
    fund_code VARCHAR(20) NOT NULL,
    property_name VARCHAR(200) NOT NULL,
    
    -- 位置信息
    city VARCHAR(50),
    district VARCHAR(50),
    address TEXT,
    
    -- 资产类型
    property_type VARCHAR(100),  -- 办公楼/商业综合体/产业园/仓储物流等
    building_area DECIMAL(12,2),  -- 建筑面积（平方米）
    leasable_area DECIMAL(12,2),  -- 可出租面积（平方米）
    
    -- 估值信息
    valuation_date DATE,
    appraised_value DECIMAL(18,4),  -- 评估价值（万元）
    value_per_sqm DECIMAL(10,2),  -- 单价（元/平方米）
    
    -- 运营信息
    tenant_count INTEGER,  -- 租户数量
    occupancy_rate DECIMAL(8,4),  -- 出租率
    average_rent DECIMAL(10,2),  -- 平均租金（元/平方米/月）
    
    -- 租期信息
    weighted_lease_term DECIMAL(8,2),  -- 加权平均租期（年）
    
    -- 时间信息
    expiration_date DATE DEFAULT '9999-12-31',  -- 数据有效期
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
);

CREATE INDEX idx_reit_property_fund_code ON reit_property_info(fund_code);
CREATE INDEX idx_reit_property_city ON reit_property_info(city);
CREATE INDEX idx_reit_property_expiration ON reit_property_info(expiration_date);

-- -----------------------------------------------------
-- 3. 财务指标表 (reit_financial_metrics)
-- 记录REITs的财务指标，按报告期存储
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_financial_metrics (
    id SERIAL NOT NULL PRIMARY KEY,
    fund_code VARCHAR(20) NOT NULL,
    report_period VARCHAR(20) NOT NULL,  -- 报告期，如2024Q3
    
    -- 收入指标
    total_revenue DECIMAL(18,4),  -- 营业总收入（万元）
    operating_revenue DECIMAL(18,4),  -- 运营收入（万元）
    net_profit DECIMAL(18,4),  -- 净利润（万元）
    
    -- 资产指标
    total_assets DECIMAL(18,4),  -- 总资产（万元）
    net_assets DECIMAL(18,4),  -- 净资产（万元）
    
    -- 收益指标
    fund_nav_per_share DECIMAL(10,4),  -- 基金净值（元/份）
    distributeable_amount DECIMAL(18,4),  -- 可供分配金额（万元）
    distribution_per_share DECIMAL(10,4),  -- 每份可供分配金额（元）
    
    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(fund_code, report_period),
    FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
);

CREATE INDEX idx_reit_financial_fund_code ON reit_financial_metrics(fund_code);
CREATE INDEX idx_reit_financial_report_period ON reit_financial_metrics(report_period);

-- -----------------------------------------------------
-- 4. 运营数据表 (reit_operational_data)
-- 记录REITs的运营指标，按报告期存储
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_operational_data (
    id SERIAL NOT NULL PRIMARY KEY,
    fund_code VARCHAR(20) NOT NULL,
    report_period VARCHAR(20) NOT NULL,  -- 报告期
    
    -- 运营指标
    occupancy_rate DECIMAL(8,4),  -- 整体出租率
    cap_rate DECIMAL(8,4),  -- 资本化率
    
    -- 租金指标
    average_rent DECIMAL(10,2),  -- 平均租金（元/平方米/月）
    rent_growth_rate DECIMAL(8,4),  -- 租金增长率
    
    -- 成本指标
    operating_expense DECIMAL(18,4),  -- 运营成本（万元）
    expense_ratio DECIMAL(8,4),  -- 费用率
    
    -- 客户指标
    top_ten_tenant_concentration DECIMAL(8,4),  -- 前十大租户集中度
    tenant_turnover_rate DECIMAL(8,4),  -- 租户更替率
    
    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(fund_code, report_period),
    FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
);

CREATE INDEX idx_reit_operational_fund_code ON reit_operational_data(fund_code);
CREATE INDEX idx_reit_operational_report_period ON reit_operational_data(report_period);

-- -----------------------------------------------------
-- 5. 市场表现表 (reit_market_performance)
-- 记录REITs在二级市场的交易数据
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_market_performance (
    id SERIAL NOT NULL PRIMARY KEY,
    fund_code VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    
    -- 价格指标
    opening_price DECIMAL(10,4),  -- 开盘价（元）
    closing_price DECIMAL(10,4),  -- 收盘价（元）
    highest_price DECIMAL(10,4),  -- 最高价（元）
    lowest_price DECIMAL(10,4),  -- 最低价（元）
    
    -- 成交指标
    turnover DECIMAL(18,2),  -- 成交额（万元）
    volume DECIMAL(18,2),  -- 成交量（万手）
    
    -- 指标
    turnover_rate DECIMAL(8,4),  -- 换手率
    market_cap DECIMAL(18,4),  -- 市值（万元）
    
    -- 收益指标
    daily_return DECIMAL(8,4),  -- 日收益率
    nav_premium_rate DECIMAL(8,4),  -- 溢价率
    
    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(fund_code, trade_date),
    FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
);

CREATE INDEX idx_reit_market_fund_code ON reit_market_performance(fund_code);
CREATE INDEX idx_reit_market_trade_date ON reit_market_performance(trade_date);

-- -----------------------------------------------------
-- 6. 投资者结构表 (reit_investor_structure)
-- 记录REITs的投资者分布，按报告期存储
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_investor_structure (
    id SERIAL NOT NULL PRIMARY KEY,
    fund_code VARCHAR(20) NOT NULL,
    report_period VARCHAR(20) NOT NULL,
    
    -- 投资者类型
    investor_type VARCHAR(50) NOT NULL,  -- 个人投资者/机构投资者
    holder_count INTEGER,  -- 持有人户数
    holding_shares DECIMAL(18,4),  -- 持有份额（万份）
    holding_ratio DECIMAL(8,4),  -- 持有比例
    avg_holding_per_investor DECIMAL(18,4),  -- 户均持有（万份）
    
    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(fund_code, report_period, investor_type),
    FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
);

CREATE INDEX idx_reit_investor_fund_code ON reit_investor_structure(fund_code);
CREATE INDEX idx_reit_investor_report_period ON reit_investor_structure(report_period);

-- -----------------------------------------------------
-- 7. 收益分配表 (reit_dividend_history)
-- 记录REITs的分红历史
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_dividend_history (
    id SERIAL NOT NULL PRIMARY KEY,
    fund_code VARCHAR(20) NOT NULL,
    dividend_year INTEGER NOT NULL,  -- 分红年度
    dividend_round INTEGER NOT NULL,  -- 分红轮次
    
    -- 分红信息
    record_date DATE,  -- 权益登记日
    ex_dividend_date DATE,  -- 除息日
    dividend_payment_date DATE,  -- 红利发放日
    
    -- 分红金额
    dividend_per_share DECIMAL(10,4),  -- 每份分红金额（元）
    total_dividend DECIMAL(18,4),  -- 分红总额（万元）
    dividend_yield DECIMAL(8,4),  -- 分红收益率
    
    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(fund_code, dividend_year, dividend_round),
    FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
);

CREATE INDEX idx_reit_dividend_fund_code ON reit_dividend_history(fund_code);
CREATE INDEX idx_reit_dividend_year ON reit_dividend_history(dividend_year);

-- -----------------------------------------------------
-- 8. 风险指标表 (reit_risk_metrics)
-- 记录REITs的风险指标，按报告期存储
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_risk_metrics (
    id SERIAL NOT NULL PRIMARY KEY,
    fund_code VARCHAR(20) NOT NULL,
    report_period VARCHAR(20) NOT NULL,
    
    -- 杠杆指标
    debt_ratio DECIMAL(8,4),  -- 资产负债率
    debt_asset_ratio DECIMAL(8,4),  -- 债务资产比
    
    -- 波动指标
    volatility_30d DECIMAL(8,4),  -- 30日波动率
    volatility_60d DECIMAL(8,4),  -- 60日波动率
    volatility_90d DECIMAL(8,4),  -- 90日波动率
    
    -- 集中度指标
    property_concentration DECIMAL(8,4),  -- 资产集中度
    tenant_concentration DECIMAL(8,4),  -- 租户集中度
    geographic_concentration DECIMAL(8,4),  -- 区域集中度
    
    -- 流动性指标
    liquidity_ratio DECIMAL(8,4),  -- 流动性比率
    
    -- 信用指标
    credit_rating VARCHAR(20),  -- 信用评级
    
    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(fund_code, report_period),
    FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
);

CREATE INDEX idx_reit_risk_fund_code ON reit_risk_metrics(fund_code);
CREATE INDEX idx_reit_risk_report_period ON reit_risk_metrics(report_period);

-- =====================================================
-- 建表完成
-- =====================================================
