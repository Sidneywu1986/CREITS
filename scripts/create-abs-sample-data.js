/**
 * 创建ABS产品示例数据
 *
 * 使用方法：
 * 1. 先在Supabase Dashboard中执行 database/schema-abs-postgres.sql 创建数据库表
 * 2. 运行 node scripts/create-abs-sample-data.js 创建示例数据
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ABS产品示例数据
const absProducts = [
  // 企业ABS
  {
    code: 'ABS2024001.SH',
    fullName: '中金-平安不动产资产支持专项计划',
    shortName: '平安不动产ABS',
    marketType: '交易所',
    productType: '企业ABS',
    assetMain: '债权类',
    assetSub: 'CMBS',
    issuer: '平安不动产有限公司',
    trustee: '中金公司',
    scale: 50.00,
    issueDate: '2024-01-15',
  },
  {
    code: 'ABS2024002.SH',
    fullName: '中信-华润置地资产支持专项计划',
    shortName: '华润置地ABS',
    marketType: '交易所',
    productType: '企业ABS',
    assetMain: '债权类',
    assetSub: 'CMBS',
    issuer: '华润置地有限公司',
    trustee: '中信证券',
    scale: 80.00,
    issueDate: '2024-02-20',
  },
  {
    code: 'ABS2024003.SH',
    fullName: '国泰君安-万科商业资产支持专项计划',
    shortName: '万科商业ABS',
    marketType: '交易所',
    productType: '企业ABS',
    assetMain: '未来经营收入类',
    assetSub: '商业物业租金',
    issuer: '万科企业股份有限公司',
    trustee: '国泰君安资管',
    scale: 60.00,
    issueDate: '2024-03-10',
  },
  {
    code: 'ABS2024004.SH',
    fullName: '华泰-新城控股资产支持专项计划',
    shortName: '新城控股ABS',
    marketType: '交易所',
    productType: '企业ABS',
    assetMain: '债权类',
    assetSub: '应收账款',
    issuer: '新城控股集团股份有限公司',
    trustee: '华泰证券',
    scale: 30.00,
    issueDate: '2024-04-05',
  },
  {
    code: 'ABS2024005.SH',
    fullName: '招商-保利地产资产支持专项计划',
    shortName: '保利地产ABS',
    marketType: '交易所',
    productType: '企业ABS',
    assetMain: '债权类',
    assetSub: 'CMBS',
    issuer: '保利发展控股集团股份有限公司',
    trustee: '招商证券',
    scale: 70.00,
    issueDate: '2024-05-12',
  },
  // 信贷ABS
  {
    code: 'ABS2024006.IB',
    fullName: '建元2024年第一期个人住房抵押贷款资产支持证券',
    shortName: '建元2024-1',
    marketType: '银行间',
    productType: '信贷ABS',
    assetMain: '不动产抵押贷款类',
    assetSub: '个人住房抵押贷款',
    issuer: '中国建设银行股份有限公司',
    trustee: '中信信托',
    scale: 100.00,
    issueDate: '2024-01-20',
  },
  {
    code: 'ABS2024007.IB',
    fullName: '交银2024年第一期汽车贷款资产支持证券',
    shortName: '交银2024-1',
    marketType: '银行间',
    productType: '信贷ABS',
    assetMain: '债权类',
    assetSub: '汽车贷款',
    issuer: '交通银行股份有限公司',
    trustee: '上海信托',
    scale: 50.00,
    issueDate: '2024-02-25',
  },
  {
    code: 'ABS2024008.IB',
    fullName: '招银2024年第一期信用卡分期资产支持证券',
    shortName: '招银2024-1',
    marketType: '银行间',
    productType: '信贷ABS',
    assetMain: '债权类',
    assetSub: '信用卡分期',
    issuer: '招商银行股份有限公司',
    trustee: '华润信托',
    scale: 80.00,
    issueDate: '2024-03-15',
  },
  // ABN
  {
    code: 'ABN2024001.IB',
    fullName: '中电建2024年度第一期绿色资产支持票据',
    shortName: '中电建绿色ABN',
    marketType: '银行间',
    productType: 'ABN',
    assetMain: '未来经营收入类',
    assetSub: '可再生能源发电收益权',
    issuer: '中国电力建设集团有限公司',
    trustee: '中信银行',
    scale: 40.00,
    issueDate: '2024-02-10',
  },
  {
    code: 'ABN2024002.IB',
    fullName: '国家电网2024年度第一期资产支持票据',
    shortName: '国网2024-1',
    marketType: '银行间',
    productType: 'ABN',
    assetMain: '债权类',
    assetSub: '应收账款',
    issuer: '国家电网有限公司',
    trustee: '工商银行',
    scale: 60.00,
    issueDate: '2024-04-20',
  },
  // 更多企业ABS
  {
    code: 'ABS2024009.SH',
    fullName: '广发-龙湖集团资产支持专项计划',
    shortName: '龙湖集团ABS',
    marketType: '交易所',
    productType: '企业ABS',
    assetMain: '债权类',
    assetSub: 'CMBS',
    issuer: '龙湖集团控股有限公司',
    trustee: '广发证券',
    scale: 55.00,
    issueDate: '2024-06-08',
  },
  {
    code: 'ABS2024010.SH',
    fullName: '申万宏源-远洋集团资产支持专项计划',
    shortName: '远洋集团ABS',
    marketType: '交易所',
    productType: '企业ABS',
    assetMain: '债权类',
    assetSub: 'CMBS',
    issuer: '远洋集团控股有限公司',
    trustee: '申万宏源证券',
    scale: 45.00,
    issueDate: '2024-07-15',
  },
];

// 生成分层信息
function generateTranches(productCode, scale) {
  const seniorARatio = 0.75; // 优先A 75%
  const seniorBRatio = 0.15; // 优先B 15%
  const subordinateRatio = 0.10; // 次级 10%

  return [
    {
      trancheCode: `${productCode}A`,
      trancheName: `${productCode}优先A`,
      trancheLevel: '优先A',
      paymentPriority: 1,
      creditRatingInit: 'AAA',
      creditRatingCurrent: 'AAA',
      issueScale: scale * seniorARatio,
      currentBalance: size * seniorARatio,
      couponType: '固定',
      initialCoupon: 3.5 + Math.random() * 1.5,
      expectedWeightedLife: 3 + Math.random() * 2,
    },
    {
      trancheCode: `${productCode}B`,
      trancheName: `${productCode}优先B`,
      trancheLevel: '优先B',
      paymentPriority: 2,
      creditRatingInit: 'AA+',
      creditRatingCurrent: 'AA+',
      issueScale: scale * seniorBRatio,
      currentBalance: scale * seniorBRatio,
      couponType: '固定',
      initialCoupon: 4.5 + Math.random() * 1.5,
      expectedWeightedLife: 3.5 + Math.random() * 2,
    },
    {
      trancheCode: `${productCode}C`,
      trancheName: `${productCode}次级`,
      trancheLevel: '次级',
      paymentPriority: 3,
      creditRatingInit: '无评级',
      creditRatingCurrent: '无评级',
      issueScale: scale * subordinateRatio,
      currentBalance: scale * subordinateRatio,
      couponType: '浮动',
      initialCoupon: null,
      expectedWeightedLife: 5 + Math.random() * 2,
    },
  ];
}

// 生成资产池数据
function generateCollateralPool(productCode, scale) {
  return {
    poolId: `POOL_${productCode}`,
    reportDate: '2024-12-31',
    totalPrincipalBalance: scale * 0.95,
    totalAssetCount: 100 + Math.floor(Math.random() * 900),
    avgLoanSize: (scale * 0.95) / (100 + Math.floor(Math.random() * 900)),
    weightedAvgMaturity: 24 + Math.floor(Math.random() * 36),
    weightedAvgLoanAge: 6 + Math.floor(Math.random() * 18),
    weightedAvgInterestRate: 4 + Math.random() * 4,
    top1BorrowerRatio: Math.random() * 5,
    top5BorrowerRatio: 5 + Math.random() * 15,
    top1RegionRatio: Math.random() * 10,
    herfindahlIndex: 0.01 + Math.random() * 0.05,
    weightedAvgCreditScore: 650 + Math.floor(Math.random() * 100),
    ltvAvg: 50 + Math.random() * 30,
    delinquency30plus: Math.random() * 2,
    delinquency60plus: Math.random() * 1,
    delinquency90plus: Math.random() * 0.5,
    cumulativeDefaultRate: Math.random() * 1,
    cumulativePrepaymentRate: Math.random() * 5,
    cpr: Math.random() * 10,
    cumulativeRecoveryRate: 60 + Math.random() * 30,
    recoveryLagMonths: 3 + Math.floor(Math.random() * 6),
  };
}

// 生成贷款明细
function generateLoanDetails(productCode, poolId, count = 10) {
  const loans = [];
  const regions = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '四川省', '湖北省'];
  const industries = ['金融', '制造业', '批发零售', '房地产', '信息技术', '教育', '医疗', '交通运输'];
  
  for (let i = 0; i < count; i++) {
    loans.push({
      loanId: `LOAN_${productCode}_${String(i + 1).padStart(4, '0')}`,
      productCode,
      poolId,
      reportDate: '2024-12-31',
      originationDate: '2022-01-01',
      maturityDate: '2026-01-01',
      originalBalance: 50 + Math.random() * 450,
      currentBalance: 30 + Math.random() * 350,
      interestRate: 4 + Math.random() * 5,
      rateType: Math.random() > 0.3 ? '固定' : '浮动',
      borrowerType: Math.random() > 0.3 ? '个人' : '企业',
      borrowerIndustry: industries[Math.floor(Math.random() * industries.length)],
      borrowerRegion: regions[Math.floor(Math.random() * regions.length)],
      creditScore: 600 + Math.floor(Math.random() * 200),
      debtToIncome: Math.random() * 50,
      collateralType: Math.random() > 0.3 ? '房产' : '其他',
      collateralValue: 80 + Math.random() * 820,
      ltvOrigination: 50 + Math.random() * 40,
      ltvCurrent: 45 + Math.random() * 40,
      collateralRegion: regions[Math.floor(Math.random() * regions.length)],
      paymentStatus: Math.random() > 0.95 ? '逾期' : '正常',
      daysPastDue: Math.random() > 0.95 ? Math.floor(Math.random() * 90) : 0,
      delinquencyStatus: Math.random() > 0.95 ? 'D30' : 'D0',
      modificationFlag: Math.random() > 0.98,
      forbearanceFlag: Math.random() > 0.99,
      effectiveDate: '2024-01-01',
    });
  }
  
  return loans;
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  创建ABS产品示例数据', 'blue');
  log('========================================\n', 'blue');

  try {
    // 1. 插入产品基本信息
    log('📊 正在插入产品基本信息...', 'cyan');
    const products = absProducts.map((product) => ({
      product_code: product.code,
      product_full_name: product.fullName,
      product_short_name: product.shortName,
      market_type: product.marketType,
      product_type: product.productType,
      asset_type_main: product.assetMain,
      asset_type_sub: product.assetSub,
      issuer_name: product.issuer,
      issuer_code: `91310000${Math.floor(Math.random() * 100000000)}`,
      trustee_name: product.trustee,
      lead_underwriter: product.trustee,
      rating_agency: '中诚信国际',
      law_firm: '金杜律师事务所',
      accounting_firm: '德勤华永',
      total_scale: product.scale,
      issue_date: product.issueDate,
      establishment_date: product.issueDate,
      listing_date: product.issueDate,
      expected_maturity_date: '2029-01-01',
      legal_maturity_date: '2034-01-01',
      total_tranches: 3,
      senior_tranches: 2,
      mezzanine_tranches: 0,
      subordinate_ratio: 10.00,
      has_recourse: true,
      has_credit_enhancement: true,
      credit_enhancement_type: '优先/次级结构',
      has_external_guarantee: false,
      has_cash_reserve: true,
      has_revolving_period: false,
      registration_number: `备案${product.code.slice(-4)}号`,
      registration_date: product.issueDate,
    }));

    const { data: insertedProducts, error: productError } = await supabase
      .from('abs_product_info')
      .insert(products)
      .select();

    if (productError) {
      log(`❌ 插入产品信息失败: ${productError.message}`, 'red');
      throw productError;
    }

    log(`✅ 成功插入 ${insertedProducts.length} 只ABS产品`, 'green');

    // 2. 插入分层信息
    log('\n📋 正在插入分层信息...', 'cyan');
    const tranches = [];
    insertedProducts.forEach((product) => {
      const trancheList = generateTranches(product.product_code, product.total_scale);
      trancheList.forEach((tranche) => {
        tranches.push({
          tranche_code: tranche.trancheCode,
          product_code: product.product_code,
          tranche_name: tranche.trancheName,
          tranche_level: tranche.trancheLevel,
          payment_priority: tranche.paymentPriority,
          credit_rating_init: tranche.creditRatingInit,
          credit_rating_current: tranche.creditRatingCurrent,
          rating_agency: '中诚信国际',
          issue_scale: tranche.issueScale,
          current_balance: tranche.currentBalance,
          face_value: 100.00,
          issue_price: 100.00,
          coupon_type: tranche.couponType,
          initial_coupon: tranche.initialCoupon,
          coupon_benchmark: '1年期LPR',
          coupon_spread: Math.floor(Math.random() * 100),
          coupon_reset_frequency: '季',
          expected_weighted_life: tranche.expectedWeightedLife,
          legal_maturity: '2034-01-01',
          expected_maturity: '2029-01-01',
          repayment_method: '过手型',
          payment_frequency: '季',
          first_payment_date: '2024-04-15',
        });
      });
    });

    const { data: insertedTranches, error: trancheError } = await supabase
      .from('abs_tranche_info')
      .insert(tranches)
      .select();

    if (trancheError) {
      log(`❌ 插入分层信息失败: ${trancheError.message}`, 'red');
      throw trancheError;
    }

    log(`✅ 成功插入 ${insertedTranches.length} 个分层`, 'green');

    // 3. 插入资产池数据
    log('\n💰 正在插入资产池数据...', 'cyan');
    const collateralPools = insertedProducts.map((product) => {
      const pool = generateCollateralPool(product.product_code, product.total_scale);
      return {
        pool_id: pool.poolId,
        product_code: product.product_code,
        report_date: pool.reportDate,
        total_principal_balance: pool.totalPrincipalBalance,
        total_asset_count: pool.totalAssetCount,
        avg_loan_size: pool.avgLoanSize,
        weighted_avg_maturity: pool.weightedAvgMaturity,
        weighted_avg_loan_age: pool.weightedAvgLoanAge,
        weighted_avg_interest_rate: pool.weightedAvgInterestRate,
        top1_borrower_ratio: pool.top1BorrowerRatio,
        top5_borrower_ratio: pool.top5BorrowerRatio,
        top1_region_ratio: pool.top1RegionRatio,
        herfindahl_index: pool.herfindahlIndex,
        weighted_avg_credit_score: pool.weightedAvgCreditScore,
        ltv_avg: pool.ltvAvg,
        delinquency_30plus: pool.delinquency30plus,
        delinquency_60plus: pool.delinquency60plus,
        delinquency_90plus: pool.delinquency90plus,
        cumulative_default_rate: pool.cumulativeDefaultRate,
        cumulative_prepayment_rate: pool.cumulativePrepaymentRate,
        cpr: pool.cpr,
        cumulative_recovery_rate: pool.cumulativeRecoveryRate,
        recovery_lag_months: pool.recoveryLagMonths,
      };
    });

    const { data: insertedPools, error: poolError } = await supabase
      .from('abs_collateral_pool')
      .insert(collateralPools)
      .select();

    if (poolError) {
      log(`❌ 插入资产池数据失败: ${poolError.message}`, 'red');
      throw poolError;
    }

    log(`✅ 成功插入 ${insertedPools.length} 个资产池`, 'green');

    // 4. 插入贷款明细
    log('\n📝 正在插入贷款明细...', 'cyan');
    const loanDetails = [];
    insertedPools.forEach((pool) => {
      const loans = generateLoanDetails(pool.product_code, pool.pool_id, 10);
      loanDetails.push(...loans);
    });

    const { data: insertedLoans, error: loanError } = await supabase
      .from('abs_loan_detail')
      .insert(loanDetails)
      .select();

    if (loanError) {
      log(`❌ 插入贷款明细失败: ${loanError.message}`, 'red');
      throw loanError;
    }

    log(`✅ 成功插入 ${insertedLoans.length} 笔贷款明细`, 'green');

    // 5. 插入风险合规数据
    log('\n⚠️  正在插入风险合规数据...', 'cyan');
    const riskCompliance = insertedProducts.map((product) => ({
      product_code: product.product_code,
      info_date: '2024-12-31',
      regulatory_status: '正常',
      regulatory_action_desc: null,
      legal_proceedings: null,
      legal_proceeding_status: null,
      disclosure_timeliness: '及时',
      disclosure_quality_rating: 'A',
      esg_score: 70 + Math.random() * 25,
      environmental_score: 65 + Math.random() * 30,
      social_score: 70 + Math.random() * 25,
      governance_score: 75 + Math.random() * 20,
      green_bond_flag: product.asset_sub === '可再生能源发电收益权',
      social_bond_flag: false,
      sustainable_bond_flag: false,
    }));

    const { data: insertedRisk, error: riskError } = await supabase
      .from('abs_risk_compliance')
      .insert(riskCompliance)
      .select();

    if (riskError) {
      log(`❌ 插入风险合规数据失败: ${riskError.message}`, 'red');
      throw riskError;
    }

    log(`✅ 成功插入 ${insertedRisk.length} 条风险合规数据`, 'green');

    // 完成报告
    log('\n========================================', 'blue');
    log('  ✅ ABS示例数据创建完成！', 'green');
    log('========================================\n', 'blue');
    log('数据统计:', 'cyan');
    log(`  产品信息: ${insertedProducts.length} 条`, 'green');
    log(`  分层信息: ${insertedTranches.length} 个`, 'green');
    log(`  资产池: ${insertedPools.length} 个`, 'green');
    log(`  贷款明细: ${insertedLoans.length} 笔`, 'green');
    log(`  风险合规: ${insertedRisk.length} 条`, 'green');

    log('\n下一步操作:', 'yellow');
    log('  1. 访问 http://localhost:5000/abs-products 查看ABS产品列表', 'yellow');
    log('  2. 创建前端页面展示ABS交易结构和水流结构', 'yellow');
    log('  3. 创建ABS数据库服务类（src/lib/database/abs-db.ts）', 'yellow');

    log('\n========================================\n', 'blue');

  } catch (error) {
    log('\n❌ 创建数据失败:', 'red');
    log(error.message, 'red');
    if (error.code) {
      log(`错误代码: ${error.code}`, 'red');
      log('提示：请确保已在Supabase Dashboard中执行建表脚本', 'yellow');
    }
    process.exit(1);
  }
}

// 执行
main();
