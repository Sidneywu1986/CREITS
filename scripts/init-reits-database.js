/**
 * REITs数据库初始化脚本
 * 执行建表SQL语句
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 读取SQL文件
const fs = require('fs');
const sqlContent = fs.readFileSync('./database/schema-reits-postgres.sql', 'utf8');

// 由于Supabase客户端不支持直接执行CREATE TABLE语句
// 我们需要使用SQL API或者分别执行每个表的创建
// 这里使用一个简化的方法：逐个创建表

async function createTables() {
  console.log('\n🗄️  开始创建REITs数据库表...\n');

  const tableCreateSQL = {
    reit_product_info: `
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
    `,
    reit_property_info: `
      CREATE TABLE IF NOT EXISTS reit_property_info (
        property_id SERIAL NOT NULL PRIMARY KEY,
        fund_code VARCHAR(20) NOT NULL,
        property_name VARCHAR(200) NOT NULL,
        city VARCHAR(50),
        district VARCHAR(50),
        address TEXT,
        property_type VARCHAR(100),
        building_area DECIMAL(12,2),
        leasable_area DECIMAL(12,2),
        valuation_date DATE,
        appraised_value DECIMAL(18,4),
        value_per_sqm DECIMAL(10,2),
        tenant_count INTEGER,
        occupancy_rate DECIMAL(8,4),
        average_rent DECIMAL(10,2),
        weighted_lease_term DECIMAL(8,2),
        expiration_date DATE DEFAULT '9999-12-31',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
      );
    `,
    reit_financial_metrics: `
      CREATE TABLE IF NOT EXISTS reit_financial_metrics (
        id SERIAL NOT NULL PRIMARY KEY,
        fund_code VARCHAR(20) NOT NULL,
        report_period VARCHAR(20) NOT NULL,
        total_revenue DECIMAL(18,4),
        operating_revenue DECIMAL(18,4),
        net_profit DECIMAL(18,4),
        total_assets DECIMAL(18,4),
        net_assets DECIMAL(18,4),
        fund_nav_per_share DECIMAL(10,4),
        distributeable_amount DECIMAL(18,4),
        distribution_per_share DECIMAL(10,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fund_code, report_period),
        FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
      );
    `,
    reit_operational_data: `
      CREATE TABLE IF NOT EXISTS reit_operational_data (
        id SERIAL NOT NULL PRIMARY KEY,
        fund_code VARCHAR(20) NOT NULL,
        report_period VARCHAR(20) NOT NULL,
        occupancy_rate DECIMAL(8,4),
        cap_rate DECIMAL(8,4),
        average_rent DECIMAL(10,2),
        rent_growth_rate DECIMAL(8,4),
        operating_expense DECIMAL(18,4),
        expense_ratio DECIMAL(8,4),
        top_ten_tenant_concentration DECIMAL(8,4),
        tenant_turnover_rate DECIMAL(8,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fund_code, report_period),
        FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
      );
    `,
    reit_market_performance: `
      CREATE TABLE IF NOT EXISTS reit_market_performance (
        id SERIAL NOT NULL PRIMARY KEY,
        fund_code VARCHAR(20) NOT NULL,
        trade_date DATE NOT NULL,
        opening_price DECIMAL(10,4),
        closing_price DECIMAL(10,4),
        highest_price DECIMAL(10,4),
        lowest_price DECIMAL(10,4),
        turnover DECIMAL(18,2),
        volume DECIMAL(18,2),
        turnover_rate DECIMAL(8,4),
        market_cap DECIMAL(18,4),
        daily_return DECIMAL(8,4),
        nav_premium_rate DECIMAL(8,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fund_code, trade_date),
        FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
      );
    `,
    reit_investor_structure: `
      CREATE TABLE IF NOT EXISTS reit_investor_structure (
        id SERIAL NOT NULL PRIMARY KEY,
        fund_code VARCHAR(20) NOT NULL,
        report_period VARCHAR(20) NOT NULL,
        investor_type VARCHAR(50) NOT NULL,
        holder_count INTEGER,
        holding_shares DECIMAL(18,4),
        holding_ratio DECIMAL(8,4),
        avg_holding_per_investor DECIMAL(18,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fund_code, report_period, investor_type),
        FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
      );
    `,
    reit_dividend_history: `
      CREATE TABLE IF NOT EXISTS reit_dividend_history (
        id SERIAL NOT NULL PRIMARY KEY,
        fund_code VARCHAR(20) NOT NULL,
        dividend_year INTEGER NOT NULL,
        dividend_round INTEGER NOT NULL,
        record_date DATE,
        ex_dividend_date DATE,
        dividend_payment_date DATE,
        dividend_per_share DECIMAL(10,4),
        total_dividend DECIMAL(18,4),
        dividend_yield DECIMAL(8,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fund_code, dividend_year, dividend_round),
        FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
      );
    `,
    reit_risk_metrics: `
      CREATE TABLE IF NOT EXISTS reit_risk_metrics (
        id SERIAL NOT NULL PRIMARY KEY,
        fund_code VARCHAR(20) NOT NULL,
        report_period VARCHAR(20) NOT NULL,
        debt_ratio DECIMAL(8,4),
        debt_asset_ratio DECIMAL(8,4),
        volatility_30d DECIMAL(8,4),
        volatility_60d DECIMAL(8,4),
        volatility_90d DECIMAL(8,4),
        property_concentration DECIMAL(8,4),
        tenant_concentration DECIMAL(8,4),
        geographic_concentration DECIMAL(8,4),
        liquidity_ratio DECIMAL(8,4),
        credit_rating VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fund_code, report_period),
        FOREIGN KEY (fund_code) REFERENCES reit_product_info(fund_code) ON DELETE CASCADE
      );
    `
  };

  try {
    for (const [tableName, sql] of Object.entries(tableCreateSQL)) {
      console.log(`📝 创建表: ${tableName}`);
      
      // 使用Supabase的SQL RPC（需要创建RPC函数）
      // 或者使用Supabase的SQL编辑器直接执行
      // 这里我们只能提示用户在Supabase Dashboard中执行SQL
      console.log(`⚠️  请在Supabase Dashboard的SQL编辑器中执行以下SQL:`);
      console.log(sql.trim());
      console.log('');
    }
    
    console.log('\n💡 提示: 请在Supabase Dashboard的SQL编辑器中执行上述SQL语句');
    console.log('   或者将 database/schema-reits-postgres.sql 文件内容复制到SQL编辑器中执行\n');

  } catch (error) {
    console.error('\n❌ 创建表失败:', error);
  }
}

createTables();
