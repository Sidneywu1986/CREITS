-- =====================================================
-- 国内REITs专业数据库完整建表语句 (PostgreSQL版本)
-- 包含五大类因子：产品信息、底层资产、财务估值、风险合规、市场表现
-- 适用数据库：PostgreSQL 14+ (Supabase)
-- =====================================================

-- -----------------------------------------------------
-- 1. 产品基本信息表 (reit_product_info)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_product_info (
    reit_code VARCHAR(20) PRIMARY KEY, -- 基金代码 (主键，如：508000.SH)
    reit_short_name VARCHAR(100) NOT NULL, -- 基金简称
    fund_manager VARCHAR(100) NOT NULL, -- 基金管理人
    asset_manager VARCHAR(100), -- 资产支持证券管理人
    operator VARCHAR(200), -- 运营管理机构
    listing_date DATE, -- 上市日期
    fund_size NUMERIC(18,4), -- 基金总份额（亿份）
    total_assets NUMERIC(18,4), -- 募集规模/基金总资产（亿元）
    asset_type_national VARCHAR(50), -- 发改委大类（交通基础设施/消费基础设施等）
    asset_type_csrc VARCHAR(50), -- 证监会/资产类型（收费公路/购物中心等）
    product_structure TEXT, -- 产品结构说明
    duration_years INTEGER, -- 存续期限（年）
    leverage_ratio NUMERIC(10,4), -- 基金杠杆率（%）
    info_disclosure_officer VARCHAR(100), -- 信息披露事务负责人
    disclosure_contact VARCHAR(50), -- 信息披露联系方式
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加表注释
COMMENT ON TABLE reit_product_info IS 'REITs产品基本信息表';
COMMENT ON COLUMN reit_product_info.reit_code IS '基金代码 (主键，如：508000.SH)';
COMMENT ON COLUMN reit_product_info.reit_short_name IS '基金简称';
COMMENT ON COLUMN reit_product_info.fund_manager IS '基金管理人';
COMMENT ON COLUMN reit_product_info.asset_manager IS '资产支持证券管理人';
COMMENT ON COLUMN reit_product_info.operator IS '运营管理机构';
COMMENT ON COLUMN reit_product_info.listing_date IS '上市日期';
COMMENT ON COLUMN reit_product_info.fund_size IS '基金总份额（亿份）';
COMMENT ON COLUMN reit_product_info.total_assets IS '募集规模/基金总资产（亿元）';
COMMENT ON COLUMN reit_product_info.asset_type_national IS '发改委大类（交通基础设施/消费基础设施等）';
COMMENT ON COLUMN reit_product_info.asset_type_csrc IS '证监会/资产类型（收费公路/购物中心等）';
COMMENT ON COLUMN reit_product_info.product_structure IS '产品结构说明';
COMMENT ON COLUMN reit_product_info.duration_years IS '存续期限（年）';
COMMENT ON COLUMN reit_product_info.leverage_ratio IS '基金杠杆率（%）';
COMMENT ON COLUMN reit_product_info.info_disclosure_officer IS '信息披露事务负责人';
COMMENT ON COLUMN reit_product_info.disclosure_contact IS '信息披露联系方式';

-- 创建更新时间自动更新的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reit_product_info_updated_at
    BEFORE UPDATE ON reit_product_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- 2. 底层资产通用信息表 (reit_property_base)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_property_base (
    property_id VARCHAR(50) NOT NULL, -- 资产唯一标识
    reit_code VARCHAR(20) NOT NULL, -- 所属REITs代码
    property_name VARCHAR(200) NOT NULL, -- 资产名称
    location_province VARCHAR(50), -- 所在省份
    location_city VARCHAR(50), -- 所在城市
    location_district VARCHAR(100), -- 所在区域/商圈
    asset_address VARCHAR(255), -- 具体地址
    gross_floor_area NUMERIC(18,4), -- 总建筑面积（平方米）
    land_area NUMERIC(18,4), -- 占地面积（平方米）
    land_right_type VARCHAR(50), -- 土地权属类型（出让/划拨）
    land_expiry_date DATE, -- 土地使用权到期日
    year_built INTEGER, -- 建成年份
    year_acquired INTEGER, -- 购入年份
    certificate_number VARCHAR(100), -- 权证编号
    asset_encumbrance TEXT, -- 资产权利限制（抵押/质押等）
    effective_date DATE NOT NULL, -- 生效日期（数据开始有效时间）
    expiration_date DATE DEFAULT '9999-12-31', -- 失效日期
    PRIMARY KEY (property_id, effective_date)
);

-- 创建索引
CREATE INDEX idx_reit_property_base_reit_code ON reit_property_base(reit_code);

-- 添加表注释
COMMENT ON TABLE reit_property_base IS '底层资产基本信息表（支持历史追溯）';

-- -----------------------------------------------------
-- 3. 产权类资产运营数据表（产业园/仓储/商业/保障房）
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_property_equity_ops (
    property_id VARCHAR(50) NOT NULL, -- 资产唯一标识
    report_date DATE NOT NULL, -- 报告期
    rentable_area NUMERIC(18,4), -- 可出租面积（平方米）
    occupancy_rate NUMERIC(10,4), -- 出租率（%）
    average_rent NUMERIC(18,4), -- 平均租金（元/平方米/月）
    rental_income NUMERIC(18,4), -- 租金收入（万元）
    other_income NUMERIC(18,4), -- 其他经营收入（万元）
    total_operating_income NUMERIC(18,4), -- 总经营收入（万元）
    top_tenant_name VARCHAR(500), -- 前十大租户名称（JSON格式存储）
    top_tenant_ratio NUMERIC(10,4), -- 最大租户占比（%）
    top5_tenant_ratio NUMERIC(10,4), -- 前五大租户合计占比（%）
    wale NUMERIC(10,4), -- 加权平均租期（年）
    lease_expiry_1yr NUMERIC(10,4), -- 1年内到期租约占比（%）
    lease_expiry_2yr NUMERIC(10,4), -- 1-2年到期租约占比（%）
    lease_expiry_3yr NUMERIC(10,4), -- 2-3年到期租约占比（%）
    lease_expiry_3plus NUMERIC(10,4), -- 3年以上到期租约占比（%）
    renewal_rate NUMERIC(10,4), -- 租约续签率（%）
    num_units INTEGER, -- 保障房套（间）数
    storage_capacity NUMERIC(18,4), -- 仓储容量（立方米/吨）
    PRIMARY KEY (property_id, report_date)
);

COMMENT ON TABLE reit_property_equity_ops IS '产权类REITs资产运营数据表';

-- -----------------------------------------------------
-- 4. 经营权类资产运营数据表（高速公路/能源/环保）
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_property_concession_ops (
    property_id VARCHAR(50) NOT NULL, -- 资产唯一标识
    report_date DATE NOT NULL, -- 报告期
    traffic_volume_avg_daily INTEGER, -- 日均车流量（辆次）
    traffic_volume_total BIGINT, -- 总车流量（万辆次）
    toll_rate_avg NUMERIC(10,4), -- 平均收费标准（元/车公里）
    toll_income NUMERIC(18,4), -- 通行费收入（万元）
    processing_capacity NUMERIC(18,4), -- 处理能力（如：吨/日、兆瓦）
    actual_processing NUMERIC(18,4), -- 实际处理量
    tariff NUMERIC(10,4), -- 结算单价（元/单位）
    operating_revenue NUMERIC(18,4), -- 运营收入（万元）
    remaining_concession_years INTEGER, -- 特许经营权剩余年限
    concession_expiry_date DATE, -- 特许经营权到期日
    major_maintenance_date DATE, -- 最近大修日期
    next_major_maintenance_date DATE, -- 下次计划大修日期
    maintenance_reserve NUMERIC(18,4), -- 大修准备金余额（万元）
    PRIMARY KEY (property_id, report_date)
);

COMMENT ON TABLE reit_property_concession_ops IS '经营权类REITs资产运营数据表';

-- -----------------------------------------------------
-- 5. 财务与估值指标表 (reit_financial_metrics)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_financial_metrics (
    reit_code VARCHAR(20) NOT NULL, -- 基金代码
    report_date DATE NOT NULL, -- 报告期
    report_type VARCHAR(20), -- 报告类型（年报/中报/季报）
    -- 利润表
    total_revenue NUMERIC(18,4), -- 营业总收入（万元）
    operating_cost NUMERIC(18,4), -- 营业成本（万元）
    gross_profit NUMERIC(18,4), -- 毛利润（万元）
    admin_expense NUMERIC(18,4), -- 管理费用（万元）
    financial_expense NUMERIC(18,4), -- 财务费用（万元）
    net_profit NUMERIC(18,4), -- 净利润（万元）
    ebitda NUMERIC(18,4), -- 息税折旧摊销前利润（万元）
    -- REITs专用指标
    ffo NUMERIC(18,4), -- 营运现金流FFO（万元）
    affo NUMERIC(18,4), -- 调整后营运现金流AFFO（万元）
    available_for_distribution NUMERIC(18,4), -- 可供分配金额（万元）
    actual_distribution NUMERIC(18,4), -- 实际分红总额（万元）
    distribution_per_share NUMERIC(10,4), -- 每份分红（元）
    distribution_yield NUMERIC(10,4), -- 现金分派率（%）（基于市值）
    -- 资产负债表
    total_assets_balance NUMERIC(18,4), -- 总资产（万元）
    total_liabilities NUMERIC(18,4), -- 总负债（万元）
    net_assets NUMERIC(18,4), -- 净资产（万元）
    nav_per_share NUMERIC(10,4), -- 每份额净资产（元）
    -- 比率指标
    roa NUMERIC(10,4), -- 总资产收益率（%）
    roe NUMERIC(10,4), -- 净资产收益率（%）
    dscr NUMERIC(10,4), -- 偿债覆盖倍数
    interest_coverage NUMERIC(10,4), -- 利息保障倍数
    current_ratio NUMERIC(10,4), -- 流动比率
    debt_to_asset NUMERIC(10,4), -- 资产负债率（%）
    PRIMARY KEY (reit_code, report_date)
);

COMMENT ON TABLE reit_financial_metrics IS 'REITs财务指标表';

-- -----------------------------------------------------
-- 6. 估值与评估信息表 (reit_valuation)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_valuation (
    reit_code VARCHAR(20) NOT NULL, -- 基金代码
    valuation_date DATE NOT NULL, -- 估值基准日
    report_source VARCHAR(50), -- 报告来源（招募说明书/评估报告/定期报告）
    appraisal_value NUMERIC(18,4), -- 评估价值（亿元）
    appraisal_value_per_share NUMERIC(10,4), -- 每份额评估价值（元）
    valuation_method VARCHAR(100), -- 评估方法
    discount_rate NUMERIC(10,4), -- 折现率假设（%）
    terminal_growth_rate NUMERIC(10,4), -- 终值增长率假设（%）
    long_term_rent_growth NUMERIC(10,4), -- 长期租金增长率假设（%）
    cap_rate NUMERIC(10,4), -- 资本化率假设（%）
    vacancy_rate_assumption NUMERIC(10,4), -- 空置率假设（%）
    operating_cost_ratio NUMERIC(10,4), -- 运营成本占比假设（%）
    implied_cap_rate NUMERIC(10,4), -- 隐含资本化率（基于市值反算）
    nav_premium_discount NUMERIC(10,4), -- 市净率（P/NAV，溢价/折价率）
    PRIMARY KEY (reit_code, valuation_date)
);

COMMENT ON TABLE reit_valuation IS 'REITs估值与评估信息表';

-- -----------------------------------------------------
-- 7. 风险合规信息表 (reit_risk_compliance)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_risk_compliance (
    reit_code VARCHAR(20) NOT NULL, -- 基金代码
    info_date DATE NOT NULL, -- 信息日期
    regulatory_status VARCHAR(50), -- 监管状态（正常/问询/处罚）
    regulatory_action_desc TEXT, -- 监管措施描述
    legal_proceedings TEXT, -- 涉及的重大诉讼或仲裁
    legal_proceeding_status VARCHAR(50), -- 诉讼状态
    insider_trading_policy BOOLEAN DEFAULT TRUE, -- 原始权益人是否建立内幕信息管理制度
    esg_score NUMERIC(10,4), -- ESG评分
    esg_rating_agency VARCHAR(50), -- ESG评级机构
    related_party_transactions TEXT, -- 关联交易情况
    contingent_liabilities TEXT, -- 或有负债
    risk_factor_update TEXT, -- 风险因素更新
    PRIMARY KEY (reit_code, info_date)
);

COMMENT ON TABLE reit_risk_compliance IS 'REITs风险合规信息表';

-- -----------------------------------------------------
-- 8. 市场表现与投资者结构表 (reit_market_stats)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reit_market_stats (
    reit_code VARCHAR(20) NOT NULL, -- 基金代码
    trade_date DATE NOT NULL, -- 交易日期
    open_price NUMERIC(10,4), -- 开盘价（元）
    close_price NUMERIC(10,4), -- 收盘价（元）
    high_price NUMERIC(10,4), -- 最高价（元）
    low_price NUMERIC(10,4), -- 最低价（元）
    daily_volume BIGINT, -- 日成交量（万份）
    daily_turnover NUMERIC(18,4), -- 日成交额（万元）
    turnover_rate NUMERIC(10,4), -- 换手率（%）
    market_cap NUMERIC(18,4), -- 总市值（万元）
    institutional_holding_pct NUMERIC(10,4), -- 机构投资者持有比例（%）
    retail_holding_pct NUMERIC(10,4), -- 个人投资者持有比例（%）
    top10_holder_names TEXT, -- 前十大持有人名称（JSON格式）
    top10_holder_ratios TEXT, -- 前十大持有人占比（JSON格式）
    top10_holder_total_pct NUMERIC(10,4), -- 前十大持有人合计占比（%）
    original_holder_holding_pct NUMERIC(10,4), -- 原始权益人持有比例（%）
    PRIMARY KEY (reit_code, trade_date)
);

-- 创建索引
CREATE INDEX idx_reit_market_stats_trade_date ON reit_market_stats(trade_date);

COMMENT ON TABLE reit_market_stats IS 'REITs市场表现与投资者结构表';

-- 完成
SELECT '✅ 所有表创建成功！' AS message;
