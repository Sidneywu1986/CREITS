-- =====================================================
-- 国内ABS专业数据库完整建表语句（PostgreSQL版本）
-- 包含五大类因子：产品信息、资产池明细、交易结构、风险合规、市场表现
-- 适用数据库：PostgreSQL 14+
-- 参考标准：JR/T 0331.5-2025 证券期货业业务域数据元规范
-- =====================================================

-- -----------------------------------------------------
-- 1. 产品基本信息表 (abs_product_info)
-- 对应标准中"项目发行阶段-资产支持专项计划基本信息"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_product_info (
    product_code VARCHAR(30) NOT NULL,
    product_full_name VARCHAR(200) NOT NULL,
    product_short_name VARCHAR(100),
    
    -- 基础分类
    market_type VARCHAR(20),
    product_type VARCHAR(30),
    asset_type_main VARCHAR(50),
    asset_type_sub VARCHAR(100),
    
    -- 发行信息
    issuer_name VARCHAR(200),
    issuer_code VARCHAR(30),
    trustee_name VARCHAR(200),
    lead_underwriter VARCHAR(200),
    rating_agency VARCHAR(200),
    law_firm VARCHAR(200),
    accounting_firm VARCHAR(200),
    
    -- 规模与日期
    total_scale NUMERIC(18,4),
    issue_date DATE,
    establishment_date DATE,
    listing_date DATE,
    expected_maturity_date DATE,
    legal_maturity_date DATE,
    
    -- 分层结构
    total_tranches INTEGER,
    senior_tranches INTEGER,
    mezzanine_tranches INTEGER,
    subordinate_ratio NUMERIC(10,4),
    
    -- 交易结构特征
    has_recourse BOOLEAN,
    has_credit_enhancement BOOLEAN,
    credit_enhancement_type VARCHAR(100),
    has_external_guarantee BOOLEAN,
    has_cash_reserve BOOLEAN,
    has_revolving_period BOOLEAN,
    revolving_period_months INTEGER,
    
    -- 备案信息
    registration_number VARCHAR(50),
    registration_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (product_code)
);

-- 添加表注释
COMMENT ON TABLE abs_product_info IS 'ABS产品基本信息表';

-- 添加列注释
COMMENT ON COLUMN abs_product_info.product_code IS '产品代码/证券代码 (主键)';
COMMENT ON COLUMN abs_product_info.product_full_name IS '产品全称';
COMMENT ON COLUMN abs_product_info.product_short_name IS '产品简称';
COMMENT ON COLUMN abs_product_info.market_type IS '市场类型（银行间/交易所/机构间）';
COMMENT ON COLUMN abs_product_info.product_type IS '产品类型（信贷ABS/企业ABS/ABN/ABCP等）';
COMMENT ON COLUMN abs_product_info.asset_type_main IS '基础资产大类（债权类/未来经营收入类/不动产抵押贷款类）';
COMMENT ON COLUMN abs_product_info.asset_type_sub IS '基础资产小类（个人住房抵押贷款/汽车贷款/消费贷/租赁债权/收费收益权等）';
COMMENT ON COLUMN abs_product_info.issuer_name IS '发起机构/原始权益人名称';
COMMENT ON COLUMN abs_product_info.issuer_code IS '统一社会信用代码';
COMMENT ON COLUMN abs_product_info.trustee_name IS '受托机构/计划管理人';
COMMENT ON COLUMN abs_product_info.lead_underwriter IS '主承销商';
COMMENT ON COLUMN abs_product_info.rating_agency IS '评级机构';
COMMENT ON COLUMN abs_product_info.law_firm IS '律师事务所';
COMMENT ON COLUMN abs_product_info.accounting_firm IS '会计师事务所';
COMMENT ON COLUMN abs_product_info.total_scale IS '发行总额（万元）';
COMMENT ON COLUMN abs_product_info.issue_date IS '发行起始日';
COMMENT ON COLUMN abs_product_info.establishment_date IS '成立日';
COMMENT ON COLUMN abs_product_info.listing_date IS '上市日';
COMMENT ON COLUMN abs_product_info.expected_maturity_date IS '预期到期日';
COMMENT ON COLUMN abs_product_info.legal_maturity_date IS '法定到期日';
COMMENT ON COLUMN abs_product_info.total_tranches IS '总分层数';
COMMENT ON COLUMN abs_product_info.senior_tranches IS '优先档层数';
COMMENT ON COLUMN abs_product_info.mezzanine_tranches IS '夹层档层数';
COMMENT ON COLUMN abs_product_info.subordinate_ratio IS '次级档占比（%）';
COMMENT ON COLUMN abs_product_info.has_recourse IS '是否具有追索权';
COMMENT ON COLUMN abs_product_info.has_credit_enhancement IS '是否设置内部增信';
COMMENT ON COLUMN abs_product_info.credit_enhancement_type IS '内部增信方式（优先/次级结构/超额抵押/利差账户等）';
COMMENT ON COLUMN abs_product_info.has_external_guarantee IS '是否外部担保';
COMMENT ON COLUMN abs_product_info.has_cash_reserve IS '是否设置现金储备账户';
COMMENT ON COLUMN abs_product_info.has_revolving_period IS '是否设置循环购买期';
COMMENT ON COLUMN abs_product_info.revolving_period_months IS '循环购买期（月）';
COMMENT ON COLUMN abs_product_info.registration_number IS '备案编号/注册号';
COMMENT ON COLUMN abs_product_info.registration_date IS '备案日期';

-- -----------------------------------------------------
-- 2. 资产支持证券分层信息表 (abs_tranche_info)
-- 对应标准中"项目发行阶段-资产支持证券基本信息"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_tranche_info (
    tranche_code VARCHAR(30) NOT NULL,
    product_code VARCHAR(30) NOT NULL,
    tranche_name VARCHAR(100),
    
    -- 分层属性
    tranche_level VARCHAR(20),
    payment_priority INTEGER,
    credit_rating_init VARCHAR(10),
    credit_rating_current VARCHAR(10),
    rating_agency VARCHAR(50),
    
    -- 规模与价格
    issue_scale NUMERIC(18,4),
    current_balance NUMERIC(18,4),
    face_value NUMERIC(10,4),
    issue_price NUMERIC(10,4),
    
    -- 票息特征
    coupon_type VARCHAR(20),
    initial_coupon NUMERIC(10,4),
    coupon_benchmark VARCHAR(50),
    coupon_spread NUMERIC(10,4),
    coupon_reset_frequency VARCHAR(10),
    
    -- 期限特征
    expected_weighted_life NUMERIC(10,4),
    legal_maturity DATE,
    expected_maturity DATE,
    
    -- 偿付结构
    repayment_method VARCHAR(30),
    payment_frequency VARCHAR(10),
    first_payment_date DATE,
    
    PRIMARY KEY (tranche_code)
);

CREATE INDEX idx_tranche_product_code ON abs_tranche_info(product_code);

COMMENT ON TABLE abs_tranche_info IS 'ABS分层信息表';
COMMENT ON COLUMN abs_tranche_info.tranche_code IS '证券代码（如：2089001.IB）';
COMMENT ON COLUMN abs_tranche_info.product_code IS '所属产品代码';
COMMENT ON COLUMN abs_tranche_info.tranche_name IS '证券简称';
COMMENT ON COLUMN abs_tranche_info.tranche_level IS '层级（优先A/优先B/夹层/次级）';
COMMENT ON COLUMN abs_tranche_info.payment_priority IS '偿付顺序（数字越小越优先）';
COMMENT ON COLUMN abs_tranche_info.credit_rating_init IS '发行时信用评级';
COMMENT ON COLUMN abs_tranche_info.credit_rating_current IS '当前信用评级';
COMMENT ON COLUMN abs_tranche_info.rating_agency IS '评级机构';
COMMENT ON COLUMN abs_tranche_info.issue_scale IS '发行规模（万元）';
COMMENT ON COLUMN abs_tranche_info.current_balance IS '当前余额（万元）';
COMMENT ON COLUMN abs_tranche_info.face_value IS '面值（元）';
COMMENT ON COLUMN abs_tranche_info.issue_price IS '发行价格（元/百元面值）';
COMMENT ON COLUMN abs_tranche_info.coupon_type IS '票息类型（固定/浮动/累进/零息）';
COMMENT ON COLUMN abs_tranche_info.initial_coupon IS '初始票面利率（%）';
COMMENT ON COLUMN abs_tranche_info.coupon_benchmark IS '浮动利率基准（如：1年期LPR）';
COMMENT ON COLUMN abs_tranche_info.coupon_spread IS '浮动利差（BP）';
COMMENT ON COLUMN abs_tranche_info.coupon_reset_frequency IS '票息重置频率';
COMMENT ON COLUMN abs_tranche_info.expected_weighted_life IS '预期加权期限（年）';
COMMENT ON COLUMN abs_tranche_info.legal_maturity IS '法定到期日';
COMMENT ON COLUMN abs_tranche_info.expected_maturity IS '预期到期日';
COMMENT ON COLUMN abs_tranche_info.repayment_method IS '还本方式（过手型/计划型）';
COMMENT ON COLUMN abs_tranche_info.payment_frequency IS '兑付频率（月/季/半年/年）';
COMMENT ON COLUMN abs_tranche_info.first_payment_date IS '首次兑付日';

-- -----------------------------------------------------
-- 3. 基础资产池主表 (abs_collateral_pool)
-- 对应标准中"项目存续阶段-基础资产信息"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_collateral_pool (
    pool_id VARCHAR(50) NOT NULL,
    product_code VARCHAR(30) NOT NULL,
    report_date DATE,
    
    -- 资产池概况
    total_principal_balance NUMERIC(18,4),
    total_asset_count INTEGER,
    avg_loan_size NUMERIC(18,4),
    weighted_avg_maturity NUMERIC(10,4),
    weighted_avg_loan_age NUMERIC(10,4),
    weighted_avg_interest_rate NUMERIC(10,4),
    
    -- 分散度指标
    top1_borrower_ratio NUMERIC(10,4),
    top5_borrower_ratio NUMERIC(10,4),
    top1_region_ratio NUMERIC(10,4),
    herfindahl_index NUMERIC(10,4),
    
    -- 信用质量
    weighted_avg_credit_score NUMERIC(10,4),
    ltv_avg NUMERIC(10,4),
    dscr_avg NUMERIC(10,4),
    
    -- 表现指标
    delinquency_30plus NUMERIC(10,4),
    delinquency_60plus NUMERIC(10,4),
    delinquency_90plus NUMERIC(10,4),
    cumulative_default_rate NUMERIC(10,4),
    cumulative_prepayment_rate NUMERIC(10,4),
    cpr NUMERIC(10,4),
    
    -- 回收情况
    cumulative_recovery_rate NUMERIC(10,4),
    recovery_lag_months INTEGER,
    
    PRIMARY KEY (pool_id, report_date)
);

CREATE INDEX idx_pool_product_code ON abs_collateral_pool(product_code);

COMMENT ON TABLE abs_collateral_pool IS '基础资产池概况表';
COMMENT ON COLUMN abs_collateral_pool.pool_id IS '资产池唯一标识';
COMMENT ON COLUMN abs_collateral_pool.product_code IS '所属产品代码';
COMMENT ON COLUMN abs_collateral_pool.report_date IS '报告日期';
COMMENT ON COLUMN abs_collateral_pool.total_principal_balance IS '资产池本金余额（万元）';
COMMENT ON COLUMN abs_collateral_pool.total_asset_count IS '资产笔数';
COMMENT ON COLUMN abs_collateral_pool.avg_loan_size IS '单笔平均金额（万元）';
COMMENT ON COLUMN abs_collateral_pool.weighted_avg_maturity IS '加权平均剩余期限（月）';
COMMENT ON COLUMN abs_collateral_pool.weighted_avg_loan_age IS '加权平均账龄（月）';
COMMENT ON COLUMN abs_collateral_pool.weighted_avg_interest_rate IS '加权平均利率（%）';
COMMENT ON COLUMN abs_collateral_pool.top1_borrower_ratio IS '最大单一借款人占比（%）';
COMMENT ON COLUMN abs_collateral_pool.top5_borrower_ratio IS '前五大借款人合计占比（%）';
COMMENT ON COLUMN abs_collateral_pool.top1_region_ratio IS '最大地区集中度（%）';
COMMENT ON COLUMN abs_collateral_pool.herfindahl_index IS '赫芬达尔指数（集中度指标）';
COMMENT ON COLUMN abs_collateral_pool.weighted_avg_credit_score IS '加权平均信用分（如适用）';
COMMENT ON COLUMN abs_collateral_pool.ltv_avg IS '平均贷款价值比（%，抵押类）';
COMMENT ON COLUMN abs_collateral_pool.dscr_avg IS '平均偿债覆盖倍数（经营类）';
COMMENT ON COLUMN abs_collateral_pool.delinquency_30plus IS '逾期30天以上占比（%）';
COMMENT ON COLUMN abs_collateral_pool.delinquency_60plus IS '逾期60天以上占比（%）';
COMMENT ON COLUMN abs_collateral_pool.delinquency_90plus IS '逾期90天以上占比（%）';
COMMENT ON COLUMN abs_collateral_pool.cumulative_default_rate IS '累计违约率（%）';
COMMENT ON COLUMN abs_collateral_pool.cumulative_prepayment_rate IS '累计提前还款率（%）';
COMMENT ON COLUMN abs_collateral_pool.cpr IS '年化恒定提前还款率（%）';
COMMENT ON COLUMN abs_collateral_pool.cumulative_recovery_rate IS '累计回收率（%）';
COMMENT ON COLUMN abs_collateral_pool.recovery_lag_months IS '回收滞后月数';

-- -----------------------------------------------------
-- 4. 单笔资产明细表（信贷类）- 逐笔贷款级别数据
-- 对应标准中"项目存续阶段-基础资产信息"的逐笔维度
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_loan_detail (
    loan_id VARCHAR(50) NOT NULL,
    product_code VARCHAR(30) NOT NULL,
    pool_id VARCHAR(50),
    report_date DATE,
    
    -- 基础信息
    origination_date DATE,
    maturity_date DATE,
    original_balance NUMERIC(18,4),
    current_balance NUMERIC(18,4),
    interest_rate NUMERIC(10,4),
    rate_type VARCHAR(10),
    
    -- 借款人特征
    borrower_type VARCHAR(20),
    borrower_industry VARCHAR(50),
    borrower_region VARCHAR(30),
    credit_score NUMERIC(10,4),
    debt_to_income NUMERIC(10,4),
    
    -- 抵押物特征（如有）
    collateral_type VARCHAR(50),
    collateral_value NUMERIC(18,4),
    ltv_origination NUMERIC(10,4),
    ltv_current NUMERIC(10,4),
    collateral_region VARCHAR(30),
    
    -- 表现数据
    payment_status VARCHAR(20),
    days_past_due INTEGER,
    delinquency_status VARCHAR(10),
    modification_flag BOOLEAN,
    modification_type VARCHAR(50),
    forbearance_flag BOOLEAN,
    
    -- 历史轨迹（支持时间序列）
    effective_date DATE NOT NULL,
    expiration_date DATE DEFAULT '9999-12-31',
    
    PRIMARY KEY (loan_id, effective_date)
);

CREATE INDEX idx_loan_product_code ON abs_loan_detail(product_code);
CREATE INDEX idx_loan_status ON abs_loan_detail(payment_status);

COMMENT ON TABLE abs_loan_detail IS 'ABS逐笔贷款明细表（支持历史追溯）';
COMMENT ON COLUMN abs_loan_detail.loan_id IS '贷款唯一标识';
COMMENT ON COLUMN abs_loan_detail.product_code IS '所属产品代码';
COMMENT ON COLUMN abs_loan_detail.pool_id IS '所属资产池标识';
COMMENT ON COLUMN abs_loan_detail.report_date IS '报告日期';
COMMENT ON COLUMN abs_loan_detail.origination_date IS '发放日期';
COMMENT ON COLUMN abs_loan_detail.maturity_date IS '到期日期';
COMMENT ON COLUMN abs_loan_detail.original_balance IS '初始本金（万元）';
COMMENT ON COLUMN abs_loan_detail.current_balance IS '当前余额（万元）';
COMMENT ON COLUMN abs_loan_detail.interest_rate IS '贷款利率（%）';
COMMENT ON COLUMN abs_loan_detail.rate_type IS '利率类型（固定/浮动）';
COMMENT ON COLUMN abs_loan_detail.borrower_type IS '借款人类型（个人/企业）';
COMMENT ON COLUMN abs_loan_detail.borrower_industry IS '借款人行业（GB/T 4754）';
COMMENT ON COLUMN abs_loan_detail.borrower_region IS '借款人地区（GB/T 2260）';
COMMENT ON COLUMN abs_loan_detail.credit_score IS '借款人信用分/FICO';
COMMENT ON COLUMN abs_loan_detail.debt_to_income IS '债务收入比（%）';
COMMENT ON COLUMN abs_loan_detail.collateral_type IS '抵押物类型';
COMMENT ON COLUMN abs_loan_detail.collateral_value IS '抵押物价值（万元）';
COMMENT ON COLUMN abs_loan_detail.ltv_origination IS '发放时贷款价值比（%）';
COMMENT ON COLUMN abs_loan_detail.ltv_current IS '当前贷款价值比（%）';
COMMENT ON COLUMN abs_loan_detail.collateral_region IS '抵押物所在地区';
COMMENT ON COLUMN abs_loan_detail.payment_status IS '还款状态（正常/逾期/M/违约/核销）';
COMMENT ON COLUMN abs_loan_detail.days_past_due IS '逾期天数';
COMMENT ON COLUMN abs_loan_detail.delinquency_status IS '逾期阶段（D0/D30/D60/D90+）';
COMMENT ON COLUMN abs_loan_detail.modification_flag IS '是否已修改贷款条款';
COMMENT ON COLUMN abs_loan_detail.modification_type IS '修改类型';
COMMENT ON COLUMN abs_loan_detail.forbearance_flag IS '是否处于宽限期';
COMMENT ON COLUMN abs_loan_detail.effective_date IS '生效日期';
COMMENT ON COLUMN abs_loan_detail.expiration_date IS '失效日期';

-- -----------------------------------------------------
-- 5. 现金流归集与分配表 (abs_cashflow)
-- 对应标准中"项目存续阶段-现金流归集与循环购买信息"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_cashflow (
    flow_id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(30) NOT NULL,
    collection_date DATE,
    payment_date DATE,
    
    -- 现金流归集
    principal_collected NUMERIC(18,4),
    interest_collected NUMERIC(18,4),
    other_collected NUMERIC(18,4),
    total_collected NUMERIC(18,4),
    
    -- 现金流分配（按偿付顺序）
    sequence_step INTEGER,
    recipient_tranche VARCHAR(30),
    allocated_principal NUMERIC(18,4),
    allocated_interest NUMERIC(18,4),
    allocated_total NUMERIC(18,4),
    
    -- 储备账户变动
    reserve_begin_balance NUMERIC(18,4),
    reserve_inflow NUMERIC(18,4),
    reserve_outflow NUMERIC(18,4),
    reserve_end_balance NUMERIC(18,4),
    
    -- 循环购买（如有）
    revolving_flag BOOLEAN,
    new_assets_purchased NUMERIC(18,4),
    new_asset_count INTEGER
);

CREATE INDEX idx_cashflow_product_code ON abs_cashflow(product_code);
CREATE INDEX idx_cashflow_payment_date ON abs_cashflow(payment_date);

COMMENT ON TABLE abs_cashflow IS 'ABS现金流归集与分配表';
COMMENT ON COLUMN abs_cashflow.flow_id IS '现金流ID';
COMMENT ON COLUMN abs_cashflow.product_code IS '产品代码';
COMMENT ON COLUMN abs_cashflow.collection_date IS '归集日期';
COMMENT ON COLUMN abs_cashflow.payment_date IS '兑付日';
COMMENT ON COLUMN abs_cashflow.principal_collected IS '归集本金（万元）';
COMMENT ON COLUMN abs_cashflow.interest_collected IS '归集利息（万元）';
COMMENT ON COLUMN abs_cashflow.other_collected IS '其他收入（万元）';
COMMENT ON COLUMN abs_cashflow.total_collected IS '归集总额（万元）';
COMMENT ON COLUMN abs_cashflow.sequence_step IS '分配步骤序号';
COMMENT ON COLUMN abs_cashflow.recipient_tranche IS '受偿证券代码';
COMMENT ON COLUMN abs_cashflow.allocated_principal IS '分配本金（万元）';
COMMENT ON COLUMN abs_cashflow.allocated_interest IS '分配利息（万元）';
COMMENT ON COLUMN abs_cashflow.allocated_total IS '分配总额（万元）';
COMMENT ON COLUMN abs_cashflow.reserve_begin_balance IS '储备账户期初余额';
COMMENT ON COLUMN abs_cashflow.reserve_inflow IS '储备账户存入';
COMMENT ON COLUMN abs_cashflow.reserve_outflow IS '储备账户动用';
COMMENT ON COLUMN abs_cashflow.reserve_end_balance IS '储备账户期末余额';
COMMENT ON COLUMN abs_cashflow.revolving_flag IS '是否发生循环购买';
COMMENT ON COLUMN abs_cashflow.new_assets_purchased IS '新购入资产金额';
COMMENT ON COLUMN abs_cashflow.new_asset_count IS '新购入资产笔数';

-- -----------------------------------------------------
-- 6. 触发条件与增信事件表 (abs_triggers_events)
-- 对应标准中"项目存续阶段-风险管理信息"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_triggers_events (
    event_id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(30) NOT NULL,
    event_date DATE,
    report_date DATE,
    
    -- 触发条件类型
    trigger_type VARCHAR(30),
    trigger_name VARCHAR(100),
    trigger_threshold NUMERIC(10,4),
    trigger_actual NUMERIC(10,4),
    is_breached BOOLEAN,
    
    -- 触发后的影响
    breach_consequence TEXT,
    cashflow_redirection_flag BOOLEAN,
    early_amortization_flag BOOLEAN,
    
    -- 增信事件
    credit_event_type VARCHAR(30),
    credit_support_provider VARCHAR(100),
    credit_support_amount NUMERIC(18,4)
);

CREATE INDEX idx_triggers_product_code ON abs_triggers_events(product_code);
CREATE INDEX idx_triggers_event_date ON abs_triggers_events(event_date);

COMMENT ON TABLE abs_triggers_events IS 'ABS触发条件与增信事件表';
COMMENT ON COLUMN abs_triggers_events.event_id IS '事件ID';
COMMENT ON COLUMN abs_triggers_events.product_code IS '产品代码';
COMMENT ON COLUMN abs_triggers_events.event_date IS '触发日期';
COMMENT ON COLUMN abs_triggers_events.report_date IS '报告日期（对应哪个报告期）';
COMMENT ON COLUMN abs_triggers_events.trigger_type IS '触发类型（累计违约率/超额利差/信用评级/提前清偿等）';
COMMENT ON COLUMN abs_triggers_events.trigger_name IS '触发条件名称';
COMMENT ON COLUMN abs_triggers_events.trigger_threshold IS '触发阈值';
COMMENT ON COLUMN abs_triggers_events.trigger_actual IS '实际值';
COMMENT ON COLUMN abs_triggers_events.is_breached IS '是否触发';
COMMENT ON COLUMN abs_triggers_events.breach_consequence IS '触发后果（加速清偿/现金流重定向/权利完善等）';
COMMENT ON COLUMN abs_triggers_events.cashflow_redirection_flag IS '是否触发现金流重定向';
COMMENT ON COLUMN abs_triggers_events.early_amortization_flag IS '是否触发提前清偿';
COMMENT ON COLUMN abs_triggers_events.credit_event_type IS '信用事件类型';
COMMENT ON COLUMN abs_triggers_events.credit_support_provider IS '增信提供方';
COMMENT ON COLUMN abs_triggers_events.credit_support_amount IS '增信动用金额';

-- -----------------------------------------------------
-- 7. 风险合规与ESG信息表 (abs_risk_compliance)
-- 对应标准中"项目存续阶段-风险管理信息"
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_risk_compliance (
    product_code VARCHAR(30) NOT NULL,
    info_date DATE NOT NULL,
    
    -- 监管状态
    regulatory_status VARCHAR(50),
    regulatory_action_desc TEXT,
    
    -- 诉讼情况
    legal_proceedings TEXT,
    legal_proceeding_status VARCHAR(50),
    
    -- 信息披露质量
    disclosure_timeliness VARCHAR(20),
    disclosure_quality_rating VARCHAR(10),
    
    -- ESG指标
    esg_score NUMERIC(10,4),
    environmental_score NUMERIC(10,4),
    social_score NUMERIC(10,4),
    governance_score NUMERIC(10,4),
    green_bond_flag BOOLEAN,
    social_bond_flag BOOLEAN,
    sustainable_bond_flag BOOLEAN,
    
    PRIMARY KEY (product_code, info_date)
);

COMMENT ON TABLE abs_risk_compliance IS 'ABS风险合规信息表';
COMMENT ON COLUMN abs_risk_compliance.product_code IS '产品代码';
COMMENT ON COLUMN abs_risk_compliance.info_date IS '信息日期';
COMMENT ON COLUMN abs_risk_compliance.regulatory_status IS '监管状态（正常/问询/处罚）';
COMMENT ON COLUMN abs_risk_compliance.regulatory_action_desc IS '监管措施描述';
COMMENT ON COLUMN abs_risk_compliance.legal_proceedings IS '涉及的重大诉讼或仲裁';
COMMENT ON COLUMN abs_risk_compliance.legal_proceeding_status IS '诉讼状态';
COMMENT ON COLUMN abs_risk_compliance.disclosure_timeliness IS '信息披露及时性（及时/延迟）';
COMMENT ON COLUMN abs_risk_compliance.disclosure_quality_rating IS '信息披露质量评级';
COMMENT ON COLUMN abs_risk_compliance.esg_score IS 'ESG综合评分';
COMMENT ON COLUMN abs_risk_compliance.environmental_score IS '环境评分';
COMMENT ON COLUMN abs_risk_compliance.social_score IS '社会评分';
COMMENT ON COLUMN abs_risk_compliance.governance_score IS '治理评分';
COMMENT ON COLUMN abs_risk_compliance.green_bond_flag IS '是否绿色资产支持证券';
COMMENT ON COLUMN abs_risk_compliance.social_bond_flag IS '是否社会责任资产支持证券';
COMMENT ON COLUMN abs_risk_compliance.sustainable_bond_flag IS '是否可持续发展资产支持证券';

-- -----------------------------------------------------
-- 8. 市场表现与估值表 (abs_market_stats)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_market_stats (
    tranche_code VARCHAR(30) NOT NULL,
    trade_date DATE NOT NULL,
    
    -- 交易价格
    close_price NUMERIC(10,4),
    clean_price NUMERIC(10,4),
    dirty_price NUMERIC(10,4),
    yield_to_maturity NUMERIC(10,4),
    yield_to_worst NUMERIC(10,4),
    modified_duration NUMERIC(10,4),
    convexity NUMERIC(10,4),
    
    -- 交易量
    daily_volume BIGINT,
    daily_turnover NUMERIC(18,4),
    turnover_rate NUMERIC(10,4),
    
    -- 估值
    valuation_price NUMERIC(10,4),
    valuation_source VARCHAR(50),
    
    -- 利差分析
    spread_to_benchmark NUMERIC(10,4),
    benchmark_type VARCHAR(30),
    z_spread NUMERIC(10,4),
    asset_swap_spread NUMERIC(10,4),
    
    -- 投资者结构
    institutional_holding NUMERIC(18,4),
    institutional_holding_pct NUMERIC(10,4),
    top10_holders TEXT,
    
    PRIMARY KEY (tranche_code, trade_date)
);

CREATE INDEX idx_market_trade_date ON abs_market_stats(trade_date);

COMMENT ON TABLE abs_market_stats IS 'ABS市场表现与估值表';
COMMENT ON COLUMN abs_market_stats.tranche_code IS '证券代码';
COMMENT ON COLUMN abs_market_stats.trade_date IS '交易日期';
COMMENT ON COLUMN abs_market_stats.close_price IS '收盘价（元/百元面值）';
COMMENT ON COLUMN abs_market_stats.clean_price IS '净价（元）';
COMMENT ON COLUMN abs_market_stats.dirty_price IS '全价（元）';
COMMENT ON COLUMN abs_market_stats.yield_to_maturity IS '到期收益率（%）';
COMMENT ON COLUMN abs_market_stats.yield_to_worst IS '最差收益率（%）';
COMMENT ON COLUMN abs_market_stats.modified_duration IS '修正久期';
COMMENT ON COLUMN abs_market_stats.convexity IS '凸性';
COMMENT ON COLUMN abs_market_stats.daily_volume IS '日成交量（万份）';
COMMENT ON COLUMN abs_market_stats.daily_turnover IS '日成交额（万元）';
COMMENT ON COLUMN abs_market_stats.turnover_rate IS '换手率（%）';
COMMENT ON COLUMN abs_market_stats.valuation_price IS '估值价格（元）';
COMMENT ON COLUMN abs_market_stats.valuation_source IS '估值来源（中债/中证/其他）';
COMMENT ON COLUMN abs_market_stats.spread_to_benchmark IS '基准利差（BP）';
COMMENT ON COLUMN abs_market_stats.benchmark_type IS '基准类型（国债/国开债/同期限信用债）';
COMMENT ON COLUMN abs_market_stats.z_spread IS 'Z-利差（BP）';
COMMENT ON COLUMN abs_market_stats.asset_swap_spread IS '资产互换利差（BP）';
COMMENT ON COLUMN abs_market_stats.institutional_holding IS '机构持有量（万元）';
COMMENT ON COLUMN abs_market_stats.institutional_holding_pct IS '机构持有比例（%）';
COMMENT ON COLUMN abs_market_stats.top10_holders IS '前十大持有人（JSON格式）';

-- -----------------------------------------------------
-- 9. 交易结构与偿付机制表 (abs_waterfall_structure)
-- 对应复杂ABS的交易模型
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS abs_waterfall_structure (
    structure_id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(30) NOT NULL,
    
    -- 偿付顺序定义
    priority_level INTEGER,
    recipient_tranche_pattern VARCHAR(50),
    payment_type VARCHAR(20),
    
    -- 分配规则
    allocation_basis VARCHAR(30),
    senior_flip_condition TEXT,
    turbo_condition TEXT,
    
    -- 储备账户规则
    reserve_target NUMERIC(18,4),
    reserve_replenish_source VARCHAR(100),
    
    -- 超额利差处理
    excess_spread_usage VARCHAR(100),
    excess_spread_account VARCHAR(50)
);

CREATE INDEX idx_waterfall_product_code ON abs_waterfall_structure(product_code);

COMMENT ON TABLE abs_waterfall_structure IS 'ABS交易结构与偿付机制表';
COMMENT ON COLUMN abs_waterfall_structure.structure_id IS '结构ID';
COMMENT ON COLUMN abs_waterfall_structure.product_code IS '产品代码';
COMMENT ON COLUMN abs_waterfall_structure.priority_level IS '优先级顺序';
COMMENT ON COLUMN abs_waterfall_structure.recipient_tranche_pattern IS '受偿分层模式（如：优先A按比例/优先A1先于优先A2）';
COMMENT ON COLUMN abs_waterfall_structure.payment_type IS '支付类型（本金/利息/两者）';
COMMENT ON COLUMN abs_waterfall_structure.allocation_basis IS '分配基础（按比例/按顺序/定向）';
COMMENT ON COLUMN abs_waterfall_structure.senior_flip_condition IS '优先/次级翻转条件';
COMMENT ON COLUMN abs_waterfall_structure.turbo_condition IS '加速偿还条件';
COMMENT ON COLUMN abs_waterfall_structure.reserve_target IS '储备账户目标金额';
COMMENT ON COLUMN abs_waterfall_structure.reserve_replenish_source IS '储备账户补足来源';
COMMENT ON COLUMN abs_waterfall_structure.excess_spread_usage IS '超额利差用途';
COMMENT ON COLUMN abs_waterfall_structure.excess_spread_account IS '超额利差账户';

-- 完成
SELECT 'ABS数据库表创建完成！' as message;
