/**
 * 创建REITs示例数据
 * 包含八张表的示例数据
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// REITs产品示例数据
const reitProducts = [
  {
    fund_code: '508000',
    fund_name: '华安张江光大园封闭式基础设施证券投资基金',
    fund_short_name: '张江REIT',
    fund_type: '产权类',
    asset_type: '产业园',
    manager_name: '华安基金管理有限公司',
    custodian_name: '招商银行股份有限公司',
    operating_manager: '上海张江高科技园区开发股份有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 3.000,
    issue_amount: 15.0000,
    fund_shares: 5.0000,
    management_fee_rate: 0.0045,
    custody_fee_rate: 0.0001,
    investment_scope: '基础设施项目支持证券投资',
  },
  {
    fund_code: '508001',
    fund_name: '浙江杭徽高速公路封闭式基础设施证券投资基金',
    fund_short_name: '杭徽高速REIT',
    fund_type: '经营权类',
    asset_type: '高速公路',
    manager_name: '鹏华基金管理有限公司',
    custodian_name: '中国工商银行股份有限公司',
    operating_manager: '浙江杭徽高速公路有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 5.000,
    issue_amount: 30.0000,
    fund_shares: 6.0000,
    management_fee_rate: 0.0040,
    custody_fee_rate: 0.0001,
    investment_scope: '高速公路基础设施项目投资',
  },
  {
    fund_code: '508002',
    fund_name: '东吴苏州工业园区产业园封闭式基础设施证券投资基金',
    fund_short_name: '苏州工业园REIT',
    fund_type: '产权类',
    asset_type: '产业园',
    manager_name: '东吴基金管理有限公司',
    custodian_name: '中国建设银行股份有限公司',
    operating_manager: '苏州工业园区国有资产控股发展有限公司',
    issue_date: '2021-12-30',
    listing_date: '2021-12-30',
    issue_price: 3.000,
    issue_amount: 34.9200,
    fund_shares: 9.0000,
    management_fee_rate: 0.0050,
    custody_fee_rate: 0.0001,
    investment_scope: '产业园基础设施项目投资',
  },
  {
    fund_code: '508003',
    fund_name: '富国首创水务封闭式基础设施证券投资基金',
    fund_short_name: '首创水务REIT',
    fund_type: '经营权类',
    asset_type: '污水处理',
    manager_name: '富国基金管理有限公司',
    custodian_name: '中国农业银行股份有限公司',
    operating_manager: '北京首创生态环保集团股份有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 3.700,
    issue_amount: 18.5000,
    fund_shares: 5.0000,
    management_fee_rate: 0.0038,
    custody_fee_rate: 0.0001,
    investment_scope: '水务基础设施项目投资',
  },
  {
    fund_code: '508004',
    fund_name: '红土创新盐田港仓储物流封闭式基础设施证券投资基金',
    fund_short_name: '盐田港REIT',
    fund_type: '产权类',
    asset_type: '仓储物流',
    manager_name: '红土创新基金管理有限公司',
    custodian_name: '上海浦东发展银行股份有限公司',
    operating_manager: '深圳市盐田港集团有限公司',
    issue_date: '2021-06-07',
    listing_date: '2021-06-07',
    issue_price: 2.300,
    issue_amount: 18.4000,
    fund_shares: 8.0000,
    management_fee_rate: 0.0042,
    custody_fee_rate: 0.0001,
    investment_scope: '仓储物流基础设施项目投资',
  },
  {
    fund_code: '508005',
    fund_name: '博时招商蛇口产业园封闭式基础设施证券投资基金',
    fund_short_name: '蛇口产园REIT',
    fund_type: '产权类',
    asset_type: '产业园',
    manager_name: '博时基金管理有限公司',
    custodian_name: '中国银行股份有限公司',
    operating_manager: '招商局蛇口工业区控股股份有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 2.310,
    issue_amount: 20.0000,
    fund_shares: 9.0000,
    management_fee_rate: 0.0048,
    custody_fee_rate: 0.0001,
    investment_scope: '产业园基础设施项目投资',
  },
  {
    fund_code: '508006',
    fund_name: '平安广州交投广河高速公路封闭式基础设施证券投资基金',
    fund_short_name: '广河高速REIT',
    fund_type: '经营权类',
    asset_type: '高速公路',
    manager_name: '平安基金管理有限公司',
    custodian_name: '中国建设银行股份有限公司',
    operating_manager: '广州交通投资集团有限公司',
    issue_date: '2021-12-14',
    listing_date: '2021-12-14',
    issue_price: 13.020,
    issue_amount: 91.1400,
    fund_shares: 7.0000,
    management_fee_rate: 0.0043,
    custody_fee_rate: 0.0001,
    investment_scope: '高速公路基础设施项目投资',
  },
  {
    fund_code: '508007',
    fund_name: '中金普洛斯仓储物流封闭式基础设施证券投资基金',
    fund_short_name: '普洛斯REIT',
    fund_type: '产权类',
    asset_type: '仓储物流',
    manager_name: '中金基金管理有限公司',
    custodian_name: '中国工商银行股份有限公司',
    operating_manager: '普洛斯（中国）投资有限公司',
    issue_date: '2021-06-21',
    listing_date: '2021-06-21',
    issue_price: 3.890,
    issue_amount: 58.3500,
    fund_shares: 15.0000,
    management_fee_rate: 0.0055,
    custody_fee_rate: 0.0001,
    investment_scope: '仓储物流基础设施项目投资',
  },
];

// 生成资产信息
const properties = [];
reitProducts.forEach(product => {
  const propertyNames = {
    '508000': ['张江光大园一期', '张江光大园二期'],
    '508001': ['杭徽高速临安段', '杭徽高速余杭段'],
    '508002': ['苏州工业园一期', '苏州工业园二期', '苏州工业园三期'],
    '508003': ['北京首创污水处理厂', '合肥首创污水处理厂'],
    '508004': ['盐田港一期仓库', '盐田港二期仓库', '盐田港三期仓库'],
    '508005': ['蛇口网谷A区', '蛇口网谷B区', '蛇口网谷C区'],
    '508006': ['广河高速天河段', '广河高速白云段', '广河高速增城段'],
    '508007': ['普洛斯苏州仓', '普洛斯昆山仓', '普洛斯广州仓', '普洛斯深圳仓'],
  };

  const cities = {
    '508000': '上海',
    '508001': '杭州',
    '508002': '苏州',
    '508003': '北京',
    '508004': '深圳',
    '508005': '深圳',
    '508006': '广州',
    '508007': '苏州',
  };

  (propertyNames[product.fund_code] || ['资产A']).forEach((name, index) => {
    properties.push({
      fund_code: product.fund_code,
      property_name: name,
      city: cities[product.fund_code],
      property_type: product.asset_type,
      building_area: Math.floor(Math.random() * 50000) + 30000,
      leasable_area: Math.floor(Math.random() * 45000) + 25000,
      appraisal_date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      appraised_value: Math.floor(Math.random() * 100000) + 50000,
      occupancy_rate: (Math.random() * 0.15 + 0.85).toFixed(4),
      average_rent: Math.floor(Math.random() * 30) + 40,
    });
  });
});

// 生成财务指标（4个报告期）
const financialMetrics = [];
const reportPeriods = ['2024Q3', '2024Q2', '2024Q1', '2023Q4'];
reitProducts.forEach(product => {
  reportPeriods.forEach(period => {
    financialMetrics.push({
      fund_code: product.fund_code,
      report_period: period,
      total_revenue: Math.floor(Math.random() * 5000) + 3000,
      operating_revenue: Math.floor(Math.random() * 4500) + 2500,
      net_profit: Math.floor(Math.random() * 2000) + 1000,
      total_assets: Math.floor(Math.random() * 300000) + 200000,
      net_assets: Math.floor(Math.random() * 150000) + 100000,
      fund_nav_per_share: (Math.random() * 2 + 2).toFixed(4),
      distributeable_amount: Math.floor(Math.random() * 1500) + 800,
      distribution_per_share: (Math.random() * 0.1 + 0.05).toFixed(4),
    });
  });
});

// 生成运营数据（4个报告期）
const operationalData = [];
reitProducts.forEach(product => {
  reportPeriods.forEach(period => {
    operationalData.push({
      fund_code: product.fund_code,
      report_period: period,
      occupancy_rate: (Math.random() * 0.12 + 0.88).toFixed(4),
      cap_rate: (Math.random() * 0.02 + 0.04).toFixed(4),
      average_rent: Math.floor(Math.random() * 30) + 40,
      rent_growth_rate: (Math.random() * 0.04 - 0.01).toFixed(4),
      operating_expense: Math.floor(Math.random() * 1000) + 500,
      expense_ratio: (Math.random() * 0.15 + 0.15).toFixed(4),
      top_ten_tenant_concentration: (Math.random() * 0.2 + 0.3).toFixed(4),
    });
  });
});

// 生成市场表现数据（最近30个交易日）
const marketPerformance = [];
const today = new Date();
reitProducts.forEach(product => {
  for (let i = 0; i < 30; i++) {
    const tradeDate = new Date(today);
    tradeDate.setDate(tradeDate.getDate() - i);
    
    const basePrice = parseFloat(product.issue_price) * (1 + (Math.random() * 0.2 - 0.05));
    
    marketPerformance.push({
      fund_code: product.fund_code,
      trade_date: tradeDate.toISOString().split('T')[0],
      opening_price: (basePrice + Math.random() * 0.2 - 0.1).toFixed(4),
      closing_price: (basePrice + Math.random() * 0.2 - 0.1).toFixed(4),
      highest_price: (basePrice + Math.random() * 0.15).toFixed(4),
      lowest_price: (basePrice - Math.random() * 0.15).toFixed(4),
      turnover: Math.floor(Math.random() * 5000) + 1000,
      volume: Math.floor(Math.random() * 200) + 50,
      turnover_rate: (Math.random() * 0.05 + 0.01).toFixed(4),
      market_cap: Math.floor(basePrice * product.fund_shares * 10000),
      daily_return: (Math.random() * 0.04 - 0.02).toFixed(4),
    });
  }
});

// 生成投资者结构数据（最新报告期）
const investorStructure = [];
reitProducts.forEach(product => {
  ['个人投资者', '机构投资者'].forEach(type => {
    investorStructure.push({
      fund_code: product.fund_code,
      report_period: '2024Q3',
      investor_type: type,
      holder_count: type === '个人投资者' ? Math.floor(Math.random() * 50000) + 10000 : Math.floor(Math.random() * 200) + 50,
      holding_shares: type === '机构投资者' ? product.fund_shares * 0.8 : product.fund_shares * 0.2,
      holding_ratio: type === '机构投资者' ? 0.8 : 0.2,
      avg_holding_per_investor: type === '个人投资者' ? 0.001 : 0.1,
    });
  });
});

// 生成分红历史数据（2年）
const dividendHistory = [];
reitProducts.forEach(product => {
  [2023, 2024].forEach(year => {
    [1, 2].forEach(round => {
      dividendHistory.push({
        fund_code: product.fund_code,
        dividend_year: year,
        dividend_round: round,
        record_date: new Date(year, round * 3, 15).toISOString().split('T')[0],
        ex_dividend_date: new Date(year, round * 3, 16).toISOString().split('T')[0],
        dividend_payment_date: new Date(year, round * 3 + 1, 1).toISOString().split('T')[0],
        dividend_per_share: (Math.random() * 0.05 + 0.02).toFixed(4),
        total_dividend: Math.floor(Math.random() * 500) + 200,
        dividend_yield: (Math.random() * 0.02 + 0.04).toFixed(4),
      });
    });
  });
});

// 生成风险指标数据（最新报告期）
const riskMetrics = [];
reitProducts.forEach(product => {
  riskMetrics.push({
    fund_code: product.fund_code,
    report_period: '2024Q3',
    debt_ratio: (Math.random() * 0.3 + 0.2).toFixed(4),
    debt_asset_ratio: (Math.random() * 0.25 + 0.15).toFixed(4),
    volatility_30d: (Math.random() * 0.01 + 0.01).toFixed(4),
    volatility_60d: (Math.random() * 0.015 + 0.01).toFixed(4),
    volatility_90d: (Math.random() * 0.02 + 0.012).toFixed(4),
    property_concentration: (Math.random() * 0.2 + 0.3).toFixed(4),
    tenant_concentration: (Math.random() * 0.15 + 0.25).toFixed(4),
    geographic_concentration: (Math.random() * 0.1 + 0.05).toFixed(4),
    liquidity_ratio: (Math.random() * 0.5 + 0.3).toFixed(4),
    credit_rating: ['AAA', 'AA+', 'AA', 'AA-'][Math.floor(Math.random() * 4)],
  });
});

// 插入数据函数
async function insertData() {
  console.log('\n📊 开始插入REITs示例数据...\n');

  try {
    // 1. 插入产品信息
    console.log('📝 正在插入产品信息...');
    const { error: productError } = await supabase
      .from('reit_product_info')
      .insert(reitProducts);
    if (productError) throw productError;
    console.log(`✅ 成功插入 ${reitProducts.length} 个产品\n`);

    // 2. 插入资产信息
    console.log('🏢 正在插入资产信息...');
    const { error: propertyError } = await supabase
      .from('reit_property_info')
      .insert(properties);
    if (propertyError) throw propertyError;
    console.log(`✅ 成功插入 ${properties.length} 条资产信息\n`);

    // 3. 插入财务指标
    console.log('💰 正在插入财务指标...');
    const { error: financialError } = await supabase
      .from('reit_financial_metrics')
      .insert(financialMetrics);
    if (financialError) throw financialError;
    console.log(`✅ 成功插入 ${financialMetrics.length} 条财务指标\n`);

    // 4. 插入运营数据
    console.log('📈 正在插入运营数据...');
    const { error: operationalError } = await supabase
      .from('reit_operational_data')
      .insert(operationalData);
    if (operationalError) throw operationalError;
    console.log(`✅ 成功插入 ${operationalData.length} 条运营数据\n`);

    // 5. 插入市场表现数据
    console.log('📊 正在插入市场表现数据...');
    const { error: marketError } = await supabase
      .from('reit_market_performance')
      .insert(marketPerformance);
    if (marketError) throw marketError;
    console.log(`✅ 成功插入 ${marketPerformance.length} 条市场表现数据\n`);

    // 6. 插入投资者结构数据
    console.log('👥 正在插入投资者结构数据...');
    const { error: investorError } = await supabase
      .from('reit_investor_structure')
      .insert(investorStructure);
    if (investorError) throw investorError;
    console.log(`✅ 成功插入 ${investorStructure.length} 条投资者结构数据\n`);

    // 7. 插入分红历史数据
    console.log('💸 正在插入分红历史数据...');
    const { error: dividendError } = await supabase
      .from('reit_dividend_history')
      .insert(dividendHistory);
    if (dividendError) throw dividendError;
    console.log(`✅ 成功插入 ${dividendHistory.length} 条分红历史数据\n`);

    // 8. 插入风险指标数据
    console.log('⚠️  正在插入风险指标数据...');
    const { error: riskError } = await supabase
      .from('reit_risk_metrics')
      .insert(riskMetrics);
    if (riskError) throw riskError;
    console.log(`✅ 成功插入 ${riskMetrics.length} 条风险指标数据\n`);

    console.log('\n========================================');
    console.log('  ✅ REITs示例数据创建完成！');
    console.log('========================================\n');
    console.log('数据统计:');
    console.log(`  产品信息: ${reitProducts.length} 只`);
    console.log(`  资产信息: ${properties.length} 条`);
    console.log(`  财务指标: ${financialMetrics.length} 条`);
    console.log(`  运营数据: ${operationalData.length} 条`);
    console.log(`  市场表现: ${marketPerformance.length} 条`);
    console.log(`  投资者结构: ${investorStructure.length} 条`);
    console.log(`  分红历史: ${dividendHistory.length} 条`);
    console.log(`  风险指标: ${riskMetrics.length} 条\n`);

  } catch (error) {
    console.error('\n❌ 创建数据失败:');
    console.error(error);
    process.exit(1);
  }
}

// 执行插入
insertData();
