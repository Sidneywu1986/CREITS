-- =====================================================
-- 国内REITs专业数据库完整建表语句
-- 包含五大类因子：产品信息、底层资产、财务估值、风险合规、市场表现
-- 适用数据库：MySQL 8.0+
-- =====================================================

-- -----------------------------------------------------
-- 1. 产品基本信息表 (reit_product_info)
-- -----------------------------------------------------
CREATE TABLE reit_product_info (
    reit_code VARCHAR(20) NOT NULL COMMENT '基金代码 (主键，如：508000.SH)',
    reit_short_name VARCHAR(100) NOT NULL COMMENT '基金简称',
    fund_manager VARCHAR(100) NOT NULL COMMENT '基金管理人',
    asset_manager VARCHAR(100) COMMENT '资产支持证券管理人',
    operator VARCHAR(200) COMMENT '运营管理机构',
    listing_date DATE COMMENT '上市日期',
    fund_size DECIMAL(18,4) COMMENT '基金总份额（亿份）',
    total_assets DECIMAL(18,4) COMMENT '募集规模/基金总资产（亿元）',
    asset_type_national VARCHAR(50) COMMENT '发改委大类（交通基础设施/消费基础设施等）',
    asset_type_csrc VARCHAR(50) COMMENT '证监会/资产类型（收费公路/购物中心等）',
    product_structure TEXT COMMENT '产品结构说明',
    duration_years INT COMMENT '存续期限（年）',
    leverage_ratio DECIMAL(10,4) COMMENT '基金杠杆率（%）',
    info_disclosure_officer VARCHAR(100) COMMENT '信息披露事务负责人',
    disclosure_contact VARCHAR(50) COMMENT '信息披露联系方式',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (reit_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='REITs产品基本信息表';

-- -----------------------------------------------------
-- 2. 底层资产通用信息表 (reit_property_base)
-- -----------------------------------------------------
CREATE TABLE reit_property_base (
    property_id VARCHAR(50) NOT NULL COMMENT '资产唯一标识',
    reit_code VARCHAR(20) NOT NULL COMMENT '所属REITs代码',
    property_name VARCHAR(200) NOT NULL COMMENT '资产名称',
    location_province VARCHAR(50) COMMENT '所在省份',
    location_city VARCHAR(50) COMMENT '所在城市',
    location_district VARCHAR(100) COMMENT '所在区域/商圈',
    asset_address VARCHAR(255) COMMENT '具体地址',
    gross_floor_area DECIMAL(18,4) COMMENT '总建筑面积（平方米）',
    land_area DECIMAL(18,4) COMMENT '占地面积（平方米）',
    land_right_type VARCHAR(50) COMMENT '土地权属类型（出让/划拨）',
    land_expiry_date DATE COMMENT '土地使用权到期日',
    year_built INT COMMENT '建成年份',
    year_acquired INT COMMENT '购入年份',
    certificate_number VARCHAR(100) COMMENT '权证编号',
    asset_encumbrance TEXT COMMENT '资产权利限制（抵押/质押等）',
    effective_date DATE NOT NULL COMMENT '生效日期（数据开始有效时间）',
    expiration_date DATE DEFAULT '9999-12-31' COMMENT '失效日期',
    PRIMARY KEY (property_id, effective_date),
    INDEX idx_reit_code (reit_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='底层资产基本信息表（支持历史追溯）';

-- -----------------------------------------------------
-- 3. 产权类资产运营数据表（产业园/仓储/商业/保障房）
-- -----------------------------------------------------
CREATE TABLE reit_property_equity_ops (
    property_id VARCHAR(50) NOT NULL COMMENT '资产唯一标识',
    report_date DATE NOT NULL COMMENT '报告期',
    rentable_area DECIMAL(18,4) COMMENT '可出租面积（平方米）',
    occupancy_rate DECIMAL(10,4) COMMENT '出租率（%）',
    average_rent DECIMAL(18,4) COMMENT '平均租金（元/平方米/月）',
    rental_income DECIMAL(18,4) COMMENT '租金收入（万元）',
    other_income DECIMAL(18,4) COMMENT '其他经营收入（万元）',
    total_operating_income DECIMAL(18,4) COMMENT '总经营收入（万元）',
    top_tenant_name VARCHAR(500) COMMENT '前十大租户名称（JSON格式存储）',
    top_tenant_ratio DECIMAL(10,4) COMMENT '最大租户占比（%）',
    top5_tenant_ratio DECIMAL(10,4) COMMENT '前五大租户合计占比（%）',
    wale DECIMAL(10,4) COMMENT '加权平均租期（年）',
    lease_expiry_1yr DECIMAL(10,4) COMMENT '1年内到期租约占比（%）',
    lease_expiry_2yr DECIMAL(10,4) COMMENT '1-2年到期租约占比（%）',
    lease_expiry_3yr DECIMAL(10,4) COMMENT '2-3年到期租约占比（%）',
    lease_expiry_3plus DECIMAL(10,4) COMMENT '3年以上到期租约占比（%）',
    renewal_rate DECIMAL(10,4) COMMENT '租约续签率（%）',
    -- 保障房专用字段
    num_units INT COMMENT '保障房套（间）数',
    -- 仓储专用字段
    storage_capacity DECIMAL(18,4) COMMENT '仓储容量（立方米/吨）',
    PRIMARY KEY (property_id, report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产权类REITs资产运营数据表';

-- -----------------------------------------------------
-- 4. 经营权类资产运营数据表（高速公路/能源/环保）
-- -----------------------------------------------------
CREATE TABLE reit_property_concession_ops (
    property_id VARCHAR(50) NOT NULL COMMENT '资产唯一标识',
    report_date DATE NOT NULL COMMENT '报告期',
    -- 高速公路专用
    traffic_volume_avg_daily INT COMMENT '日均车流量（辆次）',
    traffic_volume_total BIGINT COMMENT '总车流量（万辆次）',
    toll_rate_avg DECIMAL(10,4) COMMENT '平均收费标准（元/车公里）',
    toll_income DECIMAL(18,4) COMMENT '通行费收入（万元）',
    -- 能源/环保专用
    processing_capacity DECIMAL(18,4) COMMENT '处理能力（如：吨/日、兆瓦）',
    actual_processing DECIMAL(18,4) COMMENT '实际处理量',
    tariff DECIMAL(10,4) COMMENT '结算单价（元/单位）',
    operating_revenue DECIMAL(18,4) COMMENT '运营收入（万元）',
    -- 通用字段
    remaining_concession_years INT COMMENT '特许经营权剩余年限',
    concession_expiry_date DATE COMMENT '特许经营权到期日',
    major_maintenance_date DATE COMMENT '最近大修日期',
    next_major_maintenance_date DATE COMMENT '下次计划大修日期',
    maintenance_reserve DECIMAL(18,4) COMMENT '大修准备金余额（万元）',
    PRIMARY KEY (property_id, report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='经营权类REITs资产运营数据表';

-- -----------------------------------------------------
-- 5. 财务与估值指标表 (reit_financial_metrics)
-- -----------------------------------------------------
CREATE TABLE reit_financial_metrics (
    reit_code VARCHAR(20) NOT NULL COMMENT '基金代码',
    report_date DATE NOT NULL COMMENT '报告期',
    report_type VARCHAR(20) COMMENT '报告类型（年报/中报/季报）',
    -- 利润表
    total_revenue DECIMAL(18,4) COMMENT '营业总收入（万元）',
    operating_cost DECIMAL(18,4) COMMENT '营业成本（万元）',
    gross_profit DECIMAL(18,4) COMMENT '毛利润（万元）',
    admin_expense DECIMAL(18,4) COMMENT '管理费用（万元）',
    financial_expense DECIMAL(18,4) COMMENT '财务费用（万元）',
    net_profit DECIMAL(18,4) COMMENT '净利润（万元）',
    ebitda DECIMAL(18,4) COMMENT '息税折旧摊销前利润（万元）',
    -- REITs专用指标
    ffo DECIMAL(18,4) COMMENT '营运现金流FFO（万元）',
    affo DECIMAL(18,4) COMMENT '调整后营运现金流AFFO（万元）',
    available_for_distribution DECIMAL(18,4) COMMENT '可供分配金额（万元）',
    actual_distribution DECIMAL(18,4) COMMENT '实际分红总额（万元）',
    distribution_per_share DECIMAL(10,4) COMMENT '每份分红（元）',
    distribution_yield DECIMAL(10,4) COMMENT '现金分派率（%）（基于市值）',
    -- 资产负债表
    total_assets_balance DECIMAL(18,4) COMMENT '总资产（万元）',
    total_liabilities DECIMAL(18,4) COMMENT '总负债（万元）',
    net_assets DECIMAL(18,4) COMMENT '净资产（万元）',
    nav_per_share DECIMAL(10,4) COMMENT '每份额净资产（元）',
    -- 比率指标
    roa DECIMAL(10,4) COMMENT '总资产收益率（%）',
    roe DECIMAL(10,4) COMMENT '净资产收益率（%）',
    dscr DECIMAL(10,4) COMMENT '偿债覆盖倍数',
    interest_coverage DECIMAL(10,4) COMMENT '利息保障倍数',
    current_ratio DECIMAL(10,4) COMMENT '流动比率',
    debt_to_asset DECIMAL(10,4) COMMENT '资产负债率（%）',
    PRIMARY KEY (reit_code, report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='REITs财务指标表';

-- -----------------------------------------------------
-- 6. 估值与评估信息表 (reit_valuation)
-- -----------------------------------------------------
CREATE TABLE reit_valuation (
    reit_code VARCHAR(20) NOT NULL COMMENT '基金代码',
    valuation_date DATE NOT NULL COMMENT '估值基准日',
    report_source VARCHAR(50) COMMENT '报告来源（招募说明书/评估报告/定期报告）',
    appraisal_value DECIMAL(18,4) COMMENT '评估价值（亿元）',
    appraisal_value_per_share DECIMAL(10,4) COMMENT '每份额评估价值（元）',
    valuation_method VARCHAR(100) COMMENT '评估方法',
    discount_rate DECIMAL(10,4) COMMENT '折现率假设（%）',
    terminal_growth_rate DECIMAL(10,4) COMMENT '终值增长率假设（%）',
    long_term_rent_growth DECIMAL(10,4) COMMENT '长期租金增长率假设（%）',
    cap_rate DECIMAL(10,4) COMMENT '资本化率假设（%）',
    vacancy_rate_assumption DECIMAL(10,4) COMMENT '空置率假设（%）',
    operating_cost_ratio DECIMAL(10,4) COMMENT '运营成本占比假设（%）',
    implied_cap_rate DECIMAL(10,4) COMMENT '隐含资本化率（基于市值反算）',
    nav_premium_discount DECIMAL(10,4) COMMENT '市净率（P/NAV，溢价/折价率）',
    PRIMARY KEY (reit_code, valuation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='REITs估值与评估信息表';

-- -----------------------------------------------------
-- 7. 风险合规信息表 (reit_risk_compliance)
-- -----------------------------------------------------
CREATE TABLE reit_risk_compliance (
    reit_code VARCHAR(20) NOT NULL COMMENT '基金代码',
    info_date DATE NOT NULL COMMENT '信息日期',
    regulatory_status VARCHAR(50) COMMENT '监管状态（正常/问询/处罚）',
    regulatory_action_desc TEXT COMMENT '监管措施描述',
    legal_proceedings TEXT COMMENT '涉及的重大诉讼或仲裁',
    legal_proceeding_status VARCHAR(50) COMMENT '诉讼状态',
    insider_trading_policy BOOLEAN DEFAULT TRUE COMMENT '原始权益人是否建立内幕信息管理制度',
    esg_score DECIMAL(10,4) COMMENT 'ESG评分',
    esg_rating_agency VARCHAR(50) COMMENT 'ESG评级机构',
    related_party_transactions TEXT COMMENT '关联交易情况',
    contingent_liabilities TEXT COMMENT '或有负债',
    risk_factor_update TEXT COMMENT '风险因素更新',
    PRIMARY KEY (reit_code, info_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='REITs风险合规信息表';

-- -----------------------------------------------------
-- 8. 市场表现与投资者结构表 (reit_market_stats)
-- -----------------------------------------------------
CREATE TABLE reit_market_stats (
    reit_code VARCHAR(20) NOT NULL COMMENT '基金代码',
    trade_date DATE NOT NULL COMMENT '交易日期',
    open_price DECIMAL(10,4) COMMENT '开盘价（元）',
    close_price DECIMAL(10,4) COMMENT '收盘价（元）',
    high_price DECIMAL(10,4) COMMENT '最高价（元）',
    low_price DECIMAL(10,4) COMMENT '最低价（元）',
    daily_volume BIGINT COMMENT '日成交量（万份）',
    daily_turnover DECIMAL(18,4) COMMENT '日成交额（万元）',
    turnover_rate DECIMAL(10,4) COMMENT '换手率（%）',
    market_cap DECIMAL(18,4) COMMENT '总市值（万元）',
    institutional_holding_pct DECIMAL(10,4) COMMENT '机构投资者持有比例（%）',
    retail_holding_pct DECIMAL(10,4) COMMENT '个人投资者持有比例（%）',
    top10_holder_names TEXT COMMENT '前十大持有人名称（JSON格式）',
    top10_holder_ratios TEXT COMMENT '前十大持有人占比（JSON格式）',
    top10_holder_total_pct DECIMAL(10,4) COMMENT '前十大持有人合计占比（%）',
    original_holder_holding_pct DECIMAL(10,4) COMMENT '原始权益人持有比例（%）',
    PRIMARY KEY (reit_code, trade_date),
    INDEX idx_trade_date (trade_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='REITs市场表现与投资者结构表';
