/**
 * 创建78只已发行REITs产品的示例数据
 *
 * 使用方法：
 * node scripts/create-sample-data.js
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

// 78只REITs产品数据
const reitsProducts = [
  // 交通基础设施
  { code: '508000.SH', name: '沪杭甬高速REIT', manager: '浙江沪杭甬高速公路股份有限公司', assetType: '交通基础设施', type: '收费公路', size: 50.00, listingDate: '2021-06-07' },
  { code: '508001.SH', name: '越秀高速公路REIT', manager: '广州越秀交通基建投资有限公司', assetType: '交通基础设施', type: '收费公路', size: 30.00, listingDate: '2021-06-21' },
  { code: '508002.SH', name: '广河高速REIT', manager: '广州交通投资集团有限公司', assetType: '交通基础设施', type: '收费公路', size: 28.00, listingDate: '2021-12-14' },
  { code: '508003.SH', name: '山东高速REIT', manager: '山东高速集团有限公司', assetType: '交通基础设施', type: '收费公路', size: 25.00, listingDate: '2022-01-17' },
  { code: '508004.SH', name: '中关村REIT', manager: '北京中关村发展集团股份有限公司', assetType: '交通基础设施', type: '产业园', size: 20.00, listingDate: '2022-03-29' },
  { code: '508005.SH', name: '张江REIT', manager: '上海张江高科技园区开发股份有限公司', assetType: '交通基础设施', type: '产业园', size: 15.00, listingDate: '2022-04-12' },
  { code: '508006.SH', name: '普洛斯REIT', manager: '普洛斯中国控股有限公司', assetType: '交通基础设施', type: '仓储物流', size: 70.00, listingDate: '2022-05-27' },
  { code: '508007.SH', name: '盐田港REIT', manager: '深圳市盐田港集团有限公司', assetType: '交通基础设施', type: '仓储物流', size: 30.00, listingDate: '2022-06-21' },
  { code: '508008.SH', name: '苏州产业园REIT', manager: '苏州工业园区股份有限公司', assetType: '交通基础设施', type: '产业园', size: 25.00, listingDate: '2022-07-08' },
  { code: '508009.SH', name: '湖北交投REIT', manager: '湖北省交通投资集团有限公司', assetType: '交通基础设施', type: '收费公路', size: 35.00, listingDate: '2022-08-09' },
  { code: '508010.SH', name: '合肥高新REIT', manager: '合肥高新股份有限公司', assetType: '交通基础设施', type: '产业园', size: 20.00, listingDate: '2022-09-20' },
  { code: '508011.SH', name: '重庆水务REIT', manager: '重庆水务集团股份有限公司', assetType: '交通基础设施', type: '水务', size: 15.00, listingDate: '2022-10-14' },

  // 生态环保
  { code: '508012.SH', name: '首创水务REIT', manager: '北京首创生态环保集团股份有限公司', assetType: '生态环保', type: '污水处理', size: 18.00, listingDate: '2022-11-18' },
  { code: '508013.SH', name: '首创环保REIT', manager: '北京首创生态环保集团股份有限公司', assetType: '生态环保', type: '垃圾处理', size: 20.00, listingDate: '2022-12-26' },
  { code: '508014.SH', name: '招商蛇口REIT', manager: '招商局蛇口工业区控股股份有限公司', assetType: '生态环保', type: '产业园', size: 25.00, listingDate: '2023-01-17' },
  { code: '508015.SH', name: '中关村软件园REIT', manager: '北京中关村软件园发展有限责任公司', assetType: '生态环保', type: '产业园', size: 22.00, listingDate: '2023-02-20' },
  { code: '508016.SH', name: '安徽交控REIT', manager: '安徽省交通控股集团有限公司', assetType: '生态环保', type: '收费公路', size: 30.00, listingDate: '2023-03-24' },
  { code: '508017.SH', name: '厦门安居REIT', manager: '厦门安居集团有限公司', assetType: '生态环保', type: '保障房', size: 13.00, listingDate: '2023-04-28' },
  { code: '508018.SH', name: '华润有巢REIT', manager: '华润置地控股有限公司', assetType: '生态环保', type: '保障房', size: 12.00, listingDate: '2023-06-05' },
  { code: '508019.SH', name: '中航京能REIT', manager: '中航信托股份有限公司', assetType: '生态环保', type: '光伏', size: 10.00, listingDate: '2023-07-10' },
  { code: '508020.SH', name: '广西能源REIT', manager: '广西投资集团有限公司', assetType: '生态环保', type: '水电', size: 15.00, listingDate: '2023-08-15' },
  { code: '508021.SH', name: '天津港REIT', manager: '天津港（集团）有限公司', assetType: '生态环保', type: '仓储物流', size: 25.00, listingDate: '2023-09-18' },

  // 消费基础设施
  { code: '508022.SH', name: '中国铁建REIT', manager: '中国铁建股份有限公司', assetType: '消费基础设施', type: '产业园', size: 20.00, listingDate: '2023-10-23' },
  { code: '508023.SH', name: '中金印力REIT', manager: '中金基金管理有限公司', assetType: '消费基础设施', type: '购物中心', size: 30.00, listingDate: '2023-11-28' },
  { code: '508024.SH', name: '嘉实物美消费REIT', manager: '嘉实基金管理有限公司', assetType: '消费基础设施', type: '购物中心', size: 25.00, listingDate: '2023-12-26' },
  { code: '508025.SH', name: '华夏金茂REIT', manager: '华夏基金管理有限公司', assetType: '消费基础设施', type: '购物中心', size: 28.00, listingDate: '2024-01-22' },
  { code: '508026.SH', name: '华安张江REIT', manager: '华安基金管理有限公司', assetType: '消费基础设施', type: '产业园', size: 22.00, listingDate: '2024-02-27' },
  { code: '508027.SH', name: '国泰君安REIT', manager: '国泰君安证券资产管理有限公司', assetType: '消费基础设施', type: '产业园', size: 20.00, listingDate: '2024-03-25' },

  // 更多交通基础设施
  { code: '508028.SH', name: '河北高速REIT', manager: '河北高速公路集团有限公司', assetType: '交通基础设施', type: '收费公路', size: 35.00, listingDate: '2024-04-23' },
  { code: '508029.SH', name: '深高速REIT', manager: '深圳高速公路股份有限公司', assetType: '交通基础设施', type: '收费公路', size: 32.00, listingDate: '2024-05-22' },
  { code: '508030.SH', name: '江苏交控REIT', manager: '江苏交通控股有限公司', assetType: '交通基础设施', type: '收费公路', size: 38.00, listingDate: '2024-06-18' },
  { code: '508031.SH', name: '广州空港REIT', manager: '广州白云国际机场股份有限公司', assetType: '交通基础设施', type: '机场', size: 25.00, listingDate: '2024-07-15' },
  { code: '508032.SH', name: '上海机场REIT', manager: '上海国际机场股份有限公司', assetType: '交通基础设施', type: '机场', size: 30.00, listingDate: '2024-08-20' },
  { code: '508033.SH', name: '京沪高铁REIT', manager: '京沪高速铁路股份有限公司', assetType: '交通基础设施', type: '铁路', size: 50.00, listingDate: '2024-09-17' },
  { code: '508034.SH', name: '四川高速REIT', manager: '四川省交通投资集团有限责任公司', assetType: '交通基础设施', type: '收费公路', size: 28.00, listingDate: '2024-10-22' },
  { code: '508035.SH', name: '浙江交投REIT', manager: '浙江省交通投资集团有限公司', assetType: '交通基础设施', type: '收费公路', size: 30.00, listingDate: '2024-11-19' },

  // 更多生态环保
  { code: '508036.SH', name: '首创光伏REIT', manager: '北京首创生态环保集团股份有限公司', assetType: '生态环保', type: '光伏', size: 15.00, listingDate: '2024-12-16' },
  { code: '508037.SH', name: '三峡能源REIT', manager: '中国三峡新能源(集团)股份有限公司', assetType: '生态环保', type: '风电', size: 40.00, listingDate: '2025-01-20' },
  { code: '508038.SH', name: '国家电投REIT', manager: '国家电力投资集团有限公司', assetType: '生态环保', type: '光伏', size: 35.00, listingDate: '2025-02-17' },
  { code: '508039.SH', name: '龙源电力REIT', manager: '龙源电力集团股份有限公司', assetType: '生态环保', type: '风电', size: 45.00, listingDate: '2025-03-24' },
  { code: '508040.SH', name: '华能水电REIT', manager: '华能澜沧江水电股份有限公司', assetType: '生态环保', type: '水电', size: 38.00, listingDate: '2025-04-21' },

  // 更多消费基础设施
  { code: '508041.SH', name: '华润万象REIT', manager: '华润置地控股有限公司', assetType: '消费基础设施', type: '购物中心', size: 45.00, listingDate: '2025-05-20' },
  { code: '508042.SH', name: '新城控股REIT', manager: '新城控股集团股份有限公司', assetType: '消费基础设施', type: '购物中心', size: 35.00, listingDate: '2025-06-17' },
  { code: '508043.SH', name: '龙湖天街REIT', manager: '龙湖集团控股有限公司', assetType: '消费基础设施', type: '购物中心', size: 40.00, listingDate: '2025-07-15' },
  { code: '508044.SH', name: '万达商业REIT', manager: '万达商业管理集团股份有限公司', assetType: '消费基础设施', type: '购物中心', size: 50.00, listingDate: '2025-08-19' },

  // 产业园
  { code: '508045.SH', name: '东湖高新REIT', manager: '武汉东湖高新集团股份有限公司', assetType: '产业园', type: '产业园', size: 18.00, listingDate: '2025-09-16' },
  { code: '508046.SH', name: '上海临港REIT', manager: '上海临港控股股份有限公司', assetType: '产业园', type: '产业园', size: 22.00, listingDate: '2025-10-21' },
  { code: '508047.SH', name: '南京江北REIT', manager: '南京江北新区产业投资集团有限公司', assetType: '产业园', type: '产业园', size: 16.00, listingDate: '2025-11-18' },
  { code: '508048.SH', name: '成都高新REIT', manager: '成都高新投资集团有限公司', assetType: '产业园', type: '产业园', size: 20.00, listingDate: '2025-12-15' },
  { code: '508049.SH', name: '西安高新REIT', manager: '西安高新技术产业开发区管理委员会', assetType: '产业园', type: '产业园', size: 17.00, listingDate: '2026-01-19' },
  { code: '508050.SH', name: '杭州滨江REIT', manager: '杭州滨江投资控股有限公司', assetType: '产业园', type: '产业园', size: 15.00, listingDate: '2026-02-16' },

  // 仓储物流
  { code: '508051.SH', name: '万科物流REIT', manager: '万科企业股份有限公司', assetType: '仓储物流', type: '仓储物流', size: 60.00, listingDate: '2026-03-23' },
  { code: '508052.SH', name: '京东物流REIT', manager: '京东物流股份有限公司', assetType: '仓储物流', type: '仓储物流', size: 55.00, listingDate: '2026-04-20' },
  { code: '508053.SH', name: '顺丰REIT', manager: '顺丰控股股份有限公司', assetType: '仓储物流', type: '仓储物流', size: 45.00, listingDate: '2026-05-19' },
  { code: '508054.SH', name: '中通REIT', manager: '中通快递股份有限公司', assetType: '仓储物流', type: '仓储物流', size: 40.00, listingDate: '2026-06-16' },
  { code: '508055.SH', name: '韵达REIT', manager: '韵达控股股份有限公司', assetType: '仓储物流', type: '仓储物流', size: 35.00, listingDate: '2026-07-14' },
  { code: '508056.SH', name: '申通REIT', manager: '申通快递股份有限公司', assetType: '仓储物流', type: '仓储物流', size: 32.00, listingDate: '2026-08-18' },
  { code: '508057.SH', name: '德邦REIT', manager: '德邦物流股份有限公司', assetType: '仓储物流', type: '仓储物流', size: 28.00, listingDate: '2026-09-15' },

  // 保障房
  { code: '508058.SH', name: '深圳安居REIT', manager: '深圳市人才安居集团有限公司', assetType: '保障房', type: '保障房', size: 10.00, listingDate: '2026-10-20' },
  { code: '508059.SH', name: '北京保障房REIT', manager: '北京市保障性住房建设投资中心', assetType: '保障房', type: '保障房', size: 12.00, listingDate: '2026-11-17' },
  { code: '508060.SH', name: '上海保障房REIT', manager: '上海地产（集团）有限公司', assetType: '保障房', type: '保障房', size: 14.00, listingDate: '2026-12-14' },
  { code: '508061.SH', name: '广州安居REIT', manager: '广州市住房保障办公室', assetType: '保障房', type: '保障房', size: 11.00, listingDate: '2027-01-18' },
  { code: '508062.SH', name: '杭州保障房REIT', manager: '杭州市住房保障和房产管理局', assetType: '保障房', type: '保障房', size: 13.00, listingDate: '2027-02-15' },
  { code: '508063.SH', name: '成都保障房REIT', manager: '成都市住房保障中心', assetType: '保障房', type: '保障房', size: 10.00, listingDate: '2027-03-22' },

  // 其他
  { code: '508064.SH', name: '中石化REIT', manager: '中国石油化工股份有限公司', assetType: '其他', type: '加油站', size: 80.00, listingDate: '2027-04-19' },
  { code: '508065.SH', name: '中国电信REIT', manager: '中国电信集团有限公司', assetType: '其他', type: '数据中心', size: 45.00, listingDate: '2027-05-18' },
  { code: '508066.SH', name: '中国移动REIT', manager: '中国移动通信集团有限公司', assetType: '其他', type: '数据中心', size: 50.00, listingDate: '2027-06-15' },
  { code: '508067.SH', name: '中国联通REIT', manager: '中国联合网络通信股份有限公司', assetType: '其他', type: '数据中心', size: 42.00, listingDate: '2027-07-13' },
  { code: '508068.SH', name: '宝武REIT', manager: '中国宝武钢铁集团有限公司', assetType: '其他', type: '产业园', size: 30.00, listingDate: '2027-08-17' },
  { code: '508069.SH', name: '国家电网REIT', manager: '国家电网有限公司', assetType: '其他', type: '储能', size: 55.00, listingDate: '2027-09-14' },
  { code: '508070.SH', name: '南方电网REIT', manager: '中国南方电网有限责任公司', assetType: '其他', type: '储能', size: 48.00, listingDate: '2027-10-19' },
  { code: '508071.SH', name: '中粮REIT', manager: '中粮集团有限公司', assetType: '其他', type: '产业园', size: 25.00, listingDate: '2027-11-16' },
  { code: '508072.SH', name: '华润医药REIT', manager: '华润医药集团有限公司', assetType: '其他', type: '产业园', size: 22.00, listingDate: '2027-12-13' },
  { code: '508073.SH', name: '中航工业REIT', manager: '中国航空工业集团有限公司', assetType: '其他', type: '产业园', size: 28.00, listingDate: '2028-01-17' },
  { code: '508074.SH', name: '中核REIT', manager: '中国核工业集团有限公司', assetType: '其他', type: '产业园', size: 26.00, listingDate: '2028-02-14' },
  { code: '508075.SH', name: '中国中铁REIT', manager: '中国中铁股份有限公司', assetType: '其他', type: '产业园', size: 32.00, listingDate: '2028-03-21' },
  { code: '508076.SH', name: '中国中车REIT', manager: '中国中车股份有限公司', assetType: '其他', type: '产业园', size: 35.00, listingDate: '2028-04-18' },
  { code: '508077.SH', name: '中国建筑REIT', manager: '中国建筑股份有限公司', assetType: '其他', type: '产业园', size: 40.00, listingDate: '2028-05-17' },
];

// 生成随机市场数据
function generateMarketData(reitCode, index) {
  const basePrice = 3.5 + Math.random() * 4; // 3.5-7.5元
  const changePercent = (Math.random() - 0.5) * 10; // -5%到+5%
  const change = basePrice * (changePercent / 100);
  
  return {
    reit_code: reitCode,
    trade_date: new Date().toISOString().split('T')[0],
    open_price: parseFloat((basePrice + (Math.random() - 0.5) * 0.2).toFixed(2)),
    close_price: parseFloat(basePrice.toFixed(2)),
    high_price: parseFloat((basePrice + Math.random() * 0.3).toFixed(2)),
    low_price: parseFloat((basePrice - Math.random() * 0.3).toFixed(2)),
    daily_volume: Math.floor(1000000 + Math.random() * 9000000), // 100-1000万手
    daily_turnover: parseFloat((basePrice * (1000000 + Math.random() * 9000000) / 10000).toFixed(2)),
    turnover_rate: parseFloat((Math.random() * 5).toFixed(2)), // 0-5%
    market_cap: parseFloat((basePrice * (10 + Math.random() * 90)).toFixed(2)), // 10-100亿元
    institutional_holding_pct: parseFloat((60 + Math.random() * 30).toFixed(2)), // 60-90%
    retail_holding_pct: null,
    top10_holder_names: JSON.stringify([
      '机构A', '机构B', '机构C', '机构D', '机构E',
      '机构F', '机构G', '机构H', '机构I', '机构J'
    ]),
    top10_holder_ratios: JSON.stringify([
      10, 8, 6, 5, 4, 4, 3, 3, 2, 2
    ]),
    top10_holder_total_pct: 47.00,
    original_holder_holding_pct: parseFloat((20 + Math.random() * 30).toFixed(2)), // 20-50%
  };
}

// 生成财务指标
function generateFinancialMetrics(reitCode) {
  return {
    reit_code: reitCode,
    report_date: '2024-12-31',
    report_type: '年报',
    total_revenue: parseFloat((10000 + Math.random() * 90000).toFixed(2)), // 1-10亿元
    operating_cost: parseFloat((5000 + Math.random() * 40000).toFixed(2)),
    gross_profit: parseFloat((3000 + Math.random() * 40000).toFixed(2)),
    admin_expense: parseFloat((500 + Math.random() * 3000).toFixed(2)),
    financial_expense: parseFloat((300 + Math.random() * 2000).toFixed(2)),
    net_profit: parseFloat((2000 + Math.random() * 20000).toFixed(2)),
    ebitda: parseFloat((4000 + Math.random() * 50000).toFixed(2)),
    ffo: parseFloat((5000 + Math.random() * 60000).toFixed(2)),
    affo: parseFloat((4500 + Math.random() * 55000).toFixed(2)),
    available_for_distribution: parseFloat((4000 + Math.random() * 50000).toFixed(2)),
    actual_distribution: parseFloat((3500 + Math.random() * 40000).toFixed(2)),
    distribution_per_share: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)), // 0.3-0.8元
    distribution_yield: parseFloat((3 + Math.random() * 6).toFixed(2)), // 3-9%
    total_assets_balance: parseFloat((200000 + Math.random() * 800000).toFixed(2)),
    total_liabilities: parseFloat((50000 + Math.random() * 150000).toFixed(2)),
    net_assets: parseFloat((150000 + Math.random() * 650000).toFixed(2)),
    nav_per_share: parseFloat((2.5 + Math.random() * 3.5).toFixed(2)), // 2.5-6元
    roa: parseFloat((1 + Math.random() * 4).toFixed(2)), // 1-5%
    roe: parseFloat((3 + Math.random() * 10).toFixed(2)), // 3-13%
    dscr: parseFloat((1.5 + Math.random() * 3).toFixed(2)), // 1.5-4.5
    interest_coverage: parseFloat((3 + Math.random() * 10).toFixed(2)), // 3-13
    current_ratio: parseFloat((1.2 + Math.random() * 2).toFixed(2)), // 1.2-3.2
    debt_to_asset: parseFloat((20 + Math.random() * 40).toFixed(2)), // 20-60%
  };
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  创建78只REITs产品示例数据', 'blue');
  log('========================================\n', 'blue');

  try {
    // 1. 插入产品基本信息
    log('📊 正在插入产品基本信息...', 'cyan');
    const products = reitsProducts.map((reit, index) => ({
      reit_code: reit.code,
      reit_short_name: reit.name,
      fund_manager: reit.manager,
      asset_manager: null,
      operator: null,
      listing_date: reit.listingDate,
      fund_size: reit.size,
      total_assets: reit.size * 2,
      asset_type_national: reit.assetType,
      asset_type_csrc: reit.type,
      product_structure: null,
      duration_years: 20 + Math.floor(Math.random() * 30),
      leverage_ratio: parseFloat((20 + Math.random() * 30).toFixed(2)),
      info_disclosure_officer: null,
      disclosure_contact: null,
    }));

    const { data: insertedProducts, error: productError } = await supabase
      .from('reit_product_info')
      .insert(products)
      .select();

    if (productError) {
      log(`❌ 插入产品信息失败: ${productError.message}`, 'red');
      throw productError;
    }

    log(`✅ 成功插入 ${insertedProducts.length} 只产品`, 'green');

    // 2. 插入市场数据
    log('\n📈 正在插入市场数据...', 'cyan');
    const marketStats = reitsProducts.map((reit, index) => generateMarketData(reit.code, index));

    const { data: insertedMarketStats, error: marketError } = await supabase
      .from('reit_market_stats')
      .insert(marketStats)
      .select();

    if (marketError) {
      log(`❌ 插入市场数据失败: ${marketError.message}`, 'red');
      throw marketError;
    }

    log(`✅ 成功插入 ${insertedMarketStats.length} 条市场数据`, 'green');

    // 3. 插入财务指标
    log('\n💰 正在插入财务指标...', 'cyan');
    const financialMetrics = reitsProducts.map((reit) => generateFinancialMetrics(reit.code));

    const { data: insertedMetrics, error: metricsError } = await supabase
      .from('reit_financial_metrics')
      .insert(financialMetrics)
      .select();

    if (metricsError) {
      log(`❌ 插入财务指标失败: ${metricsError.message}`, 'red');
      throw metricsError;
    }

    log(`✅ 成功插入 ${insertedMetrics.length} 条财务指标`, 'green');

    // 4. 插入底层资产（每只产品2-5个资产）
    log('\n🏢 正在插入底层资产...', 'cyan');
    const properties = [];
    const equityOps = [];
    const concessionOps = [];

    reitsProducts.forEach((reit) => {
      const numProperties = 2 + Math.floor(Math.random() * 4); // 2-5个资产

      for (let i = 0; i < numProperties; i++) {
        const propertyId = `${reit.code}_PROP_${String(i + 1).padStart(3, '0')}`;
        
        properties.push({
          property_id: propertyId,
          reit_code: reit.code,
          property_name: `${reit.name}资产${i + 1}`,
          location_province: ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '四川省', '湖北省'][Math.floor(Math.random() * 8)],
          location_city: ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都'][Math.floor(Math.random() * 8)],
          location_district: ['朝阳区', '浦东新区', '天河区', '南山区', '西湖区', '玄武区', '江岸区', '武侯区'][Math.floor(Math.random() * 8)],
          asset_address: `${Math.floor(Math.random() * 999) + 1}号`,
          gross_floor_area: parseFloat((50000 + Math.random() * 200000).toFixed(2)),
          land_area: parseFloat((30000 + Math.random() * 150000).toFixed(2)),
          land_right_type: '出让',
          land_expiry_date: '2050-12-31',
          year_built: 2000 + Math.floor(Math.random() * 20),
          year_acquired: 2010 + Math.floor(Math.random() * 10),
          certificate_number: `CERT_${propertyId}`,
          asset_encumbrance: null,
          effective_date: '2020-01-01',
          expiration_date: '9999-12-31',
        });

        // 根据资产类型插入运营数据
        if (['产业园', '仓储物流', '购物中心', '保障房'].includes(reit.type)) {
          // 产权类
          equityOps.push({
            property_id: propertyId,
            report_date: '2024-12-31',
            rentable_area: parseFloat((40000 + Math.random() * 150000).toFixed(2)),
            occupancy_rate: parseFloat((85 + Math.random() * 14).toFixed(2)), // 85-99%
            average_rent: parseFloat((2 + Math.random() * 5).toFixed(2)), // 2-7元/平米/月
            rental_income: parseFloat((800 + Math.random() * 3000).toFixed(2)), // 万元
            other_income: parseFloat((50 + Math.random() * 200).toFixed(2)),
            total_operating_income: parseFloat((850 + Math.random() * 3200).toFixed(2)),
            top_tenant_name: JSON.stringify(['租户A', '租户B', '租户C', '租户D', '租户E']),
            top_tenant_ratio: parseFloat((5 + Math.random() * 10).toFixed(2)), // 5-15%
            top5_tenant_ratio: parseFloat((20 + Math.random() * 25).toFixed(2)), // 20-45%
            wale: parseFloat((3 + Math.random() * 5).toFixed(2)), // 3-8年
            lease_expiry_1yr: parseFloat((10 + Math.random() * 20).toFixed(2)), // 10-30%
            lease_expiry_2yr: parseFloat((10 + Math.random() * 15).toFixed(2)),
            lease_expiry_3yr: parseFloat((10 + Math.random() * 15).toFixed(2)),
            lease_expiry_3plus: parseFloat((40 + Math.random() * 30).toFixed(2)), // 40-70%
            renewal_rate: parseFloat((70 + Math.random() * 25).toFixed(2)), // 70-95%
            num_units: reit.type === '保障房' ? Math.floor(500 + Math.random() * 1500) : null,
            storage_capacity: reit.type === '仓储物流' ? parseFloat((50000 + Math.random() * 200000).toFixed(2)) : null,
          });
        } else {
          // 经营权类
          concessionOps.push({
            property_id: propertyId,
            report_date: '2024-12-31',
            traffic_volume_avg_daily: Math.floor(50000 + Math.random() * 200000), // 日均车流量
            traffic_volume_total: Math.floor(1825 + Math.random() * 7300), // 年总车流量(万)
            toll_rate_avg: parseFloat((0.3 + Math.random() * 0.7).toFixed(2)), // 收费标准
            toll_income: parseFloat((3000 + Math.random() * 15000).toFixed(2)), // 通行费收入(万元)
            processing_capacity: reit.type === '光伏' ? parseFloat((100 + Math.random() * 400).toFixed(2)) : null, // MW
            actual_processing: reit.type === '光伏' ? parseFloat((80 + Math.random() * 350).toFixed(2)) : null,
            tariff: reit.type === '光伏' ? parseFloat((0.4 + Math.random() * 0.3).toFixed(2)) : null, // 元/度
            operating_revenue: parseFloat((3000 + Math.random() * 15000).toFixed(2)), // 运营收入(万元)
            remaining_concession_years: 15 + Math.floor(Math.random() * 20),
            concession_expiry_date: '2050-12-31',
            major_maintenance_date: '2022-06-01',
            next_major_maintenance_date: '2027-06-01',
            maintenance_reserve: parseFloat((500 + Math.random() * 3000).toFixed(2)),
          });
        }
      }
    });

    // 插入资产信息
    const { error: propertyError } = await supabase
      .from('reit_property_base')
      .insert(properties);

    if (propertyError) {
      log(`❌ 插入资产信息失败: ${propertyError.message}`, 'red');
      throw propertyError;
    }

    log(`✅ 成功插入 ${properties.length} 个底层资产`, 'green');

    // 插入产权类运营数据
    if (equityOps.length > 0) {
      const { error: equityError } = await supabase
        .from('reit_property_equity_ops')
        .insert(equityOps);

      if (equityError) {
        log(`❌ 插入产权类运营数据失败: ${equityError.message}`, 'red');
        throw equityError;
      }
      log(`✅ 成功插入 ${equityOps.length} 条产权类运营数据`, 'green');
    }

    // 插入经营权类运营数据
    if (concessionOps.length > 0) {
      const { error: concessionError } = await supabase
        .from('reit_property_concession_ops')
        .insert(concessionOps);

      if (concessionError) {
        log(`❌ 插入经营权类运营数据失败: ${concessionError.message}`, 'red');
        throw concessionError;
      }
      log(`✅ 成功插入 ${concessionOps.length} 条经营权类运营数据`, 'green');
    }

    // 5. 插入风险合规数据
    log('\n⚠️  正在插入风险合规数据...', 'cyan');
    const riskCompliance = reitsProducts.map((reit) => ({
      reit_code: reit.code,
      info_date: '2024-12-31',
      regulatory_status: '正常',
      regulatory_action_desc: null,
      legal_proceedings: null,
      legal_proceeding_status: null,
      insider_trading_policy: true,
      esg_score: parseFloat((70 + Math.random() * 25).toFixed(2)), // 70-95分
      esg_rating_agency: ['MSCI', 'Sustainalytics', '商道融绿', 'Wind'][Math.floor(Math.random() * 4)],
      related_party_transactions: null,
      contingent_liabilities: null,
      risk_factor_update: '无重大风险因素更新',
    }));

    const { data: insertedRisk, error: riskError } = await supabase
      .from('reit_risk_compliance')
      .insert(riskCompliance)
      .select();

    if (riskError) {
      log(`❌ 插入风险合规数据失败: ${riskError.message}`, 'red');
      throw riskError;
    }

    log(`✅ 成功插入 ${insertedRisk.length} 条风险合规数据`, 'green');

    // 6. 插入估值数据
    log('\n📊 正在插入估值数据...', 'cyan');
    const valuations = reitsProducts.map((reit) => ({
      reit_code: reit.code,
      valuation_date: '2024-12-31',
      report_source: '定期报告',
      appraisal_value: parseFloat((reit.size * 2 * 0.9 + Math.random() * reit.size * 0.2).toFixed(2)), // 评估价值
      appraisal_value_per_share: parseFloat((3 + Math.random() * 4).toFixed(2)), // 每份额评估价值
      valuation_method: '现金流折现法',
      discount_rate: parseFloat((7 + Math.random() * 3).toFixed(2)), // 7-10%
      terminal_growth_rate: 2.5,
      long_term_rent_growth: 2.0,
      cap_rate: parseFloat((5 + Math.random() * 3).toFixed(2)), // 5-8%
      vacancy_rate_assumption: parseFloat((5 + Math.random() * 10).toFixed(2)), // 5-15%
      operating_cost_ratio: parseFloat((25 + Math.random() * 15).toFixed(2)), // 25-40%
      implied_cap_rate: parseFloat((5 + Math.random() * 3).toFixed(2)),
      nav_premium_discount: parseFloat((Math.random() * 20 - 5).toFixed(2)), // -5%到+15%
    }));

    const { data: insertedValuations, error: valuationError } = await supabase
      .from('reit_valuation')
      .insert(valuations)
      .select();

    if (valuationError) {
      log(`❌ 插入估值数据失败: ${valuationError.message}`, 'red');
      throw valuationError;
    }

    log(`✅ 成功插入 ${insertedValuations.length} 条估值数据`, 'green');

    // 完成报告
    log('\n========================================', 'blue');
    log('  ✅ 数据创建完成！', 'green');
    log('========================================\n', 'blue');
    log('数据统计:', 'cyan');
    log(`  产品信息: ${insertedProducts.length} 条`, 'green');
    log(`  市场数据: ${insertedMarketStats.length} 条`, 'green');
    log(`  财务指标: ${insertedMetrics.length} 条`, 'green');
    log(`  底层资产: ${properties.length} 个`, 'green');
    log(`  产权类运营数据: ${equityOps.length} 条`, 'green');
    log(`  经营权类运营数据: ${concessionOps.length} 条`, 'green');
    log(`  风险合规: ${insertedRisk.length} 条`, 'green');
    log(`  估值数据: ${insertedValuations.length} 条`, 'green');

    log('\n下一步操作:', 'yellow');
    log('  1. 访问 http://localhost:5000/issued-reits 查看产品列表', 'yellow');
    log('  2. 访问 http://localhost:5000/reits-eight-tables 查看八张表', 'yellow');
    log('  3. 运行 node scripts/test-supabase-connection.js 验证数据', 'yellow');

    log('\n========================================\n', 'blue');

  } catch (error) {
    log('\n❌ 创建数据失败:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// 执行
main();
