/**
 * REITs 数据库测试用例
 *
 * 使用方法：
 * 1. 确保 Supabase 连接已配置
 * 2. 在项目中运行此脚本或导入到页面执行
 * 3. 检查测试结果
 */

import { reitsDB } from '@/lib/database/reits-db';

// 测试结果接口
interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

// 测试结果数组
const testResults: TestResult[] = [];

// 辅助函数：记录测试结果
function logTest(name: string, passed: boolean, message: string, duration?: number) {
  const result: TestResult = { name, passed, message, duration };
  testResults.push(result);

  console.log(
    `[${passed ? '✓' : '✗'}] ${name}${duration ? ` (${duration}ms)` : ''}`
  );
  if (!passed) {
    console.error(`  Error: ${message}`);
  }
}

// 测试 1：获取所有产品
async function testGetAllProducts() {
  const startTime = Date.now();
  try {
    const products = await reitsDB.getAllProducts();

    if (Array.isArray(products)) {
      logTest(
        '获取所有产品',
        true,
        `成功获取 ${products.length} 个产品`,
        Date.now() - startTime
      );

      // 打印前 3 个产品信息
      console.log('  前 3 个产品:');
      products.slice(0, 3).forEach((product: any) => {
        console.log(`    - ${product.reit_code}: ${product.reit_short_name}`);
      });

      return products;
    } else {
      logTest('获取所有产品', false, '返回结果不是数组', Date.now() - startTime);
      return [];
    }
  } catch (error: any) {
    logTest('获取所有产品', false, error.message, Date.now() - startTime);
    return [];
  }
}

// 测试 2：获取产品详细信息
async function testGetProductByCode() {
  const startTime = Date.now();
  try {
    // 先获取一个产品代码
    const products = await reitsDB.getAllProducts({ limit: 1 });

    if (products.length === 0) {
      logTest('获取产品详细信息', false, '没有可用的产品', Date.now() - startTime);
      return null;
    }

    const reitCode = products[0].reit_code;
    const product = await reitsDB.getProductByCode(reitCode);

    if (product) {
      logTest(
        '获取产品详细信息',
        true,
        `成功获取产品 ${reitCode} 的详细信息`,
        Date.now() - startTime
      );
      console.log(`  产品名称: ${product.reit_short_name}`);
      console.log(`  基金管理人: ${product.fund_manager}`);
      console.log(`  募集规模: ${product.total_assets} 亿元`);
      return product;
    } else {
      logTest('获取产品详细信息', false, '未找到产品信息', Date.now() - startTime);
      return null;
    }
  } catch (error: any) {
    logTest('获取产品详细信息', false, error.message, Date.now() - startTime);
    return null;
  }
}

// 测试 3：获取底层资产
async function testGetAllProperties() {
  const startTime = Date.now();
  try {
    const properties = await reitsDB.getAllProperties();

    if (Array.isArray(properties)) {
      logTest(
        '获取所有底层资产',
        true,
        `成功获取 ${properties.length} 个资产`,
        Date.now() - startTime
      );

      // 打印前 3 个资产信息
      console.log('  前 3 个资产:');
      properties.slice(0, 3).forEach((property: any) => {
        console.log(`    - ${property.property_id}: ${property.property_name}`);
      });

      return properties;
    } else {
      logTest('获取所有底层资产', false, '返回结果不是数组', Date.now() - startTime);
      return [];
    }
  } catch (error: any) {
    logTest('获取所有底层资产', false, error.message, Date.now() - startTime);
    return [];
  }
}

// 测试 4：按产品代码获取资产
async function testGetPropertiesByReitCode() {
  const startTime = Date.now();
  try {
    // 先获取一个产品代码
    const products = await reitsDB.getAllProducts({ limit: 1 });

    if (products.length === 0) {
      logTest('按产品代码获取资产', false, '没有可用的产品', Date.now() - startTime);
      return [];
    }

    const reitCode = products[0].reit_code;
    const properties = await reitsDB.getPropertiesByReitCode(reitCode);

    if (Array.isArray(properties)) {
      logTest(
        '按产品代码获取资产',
        true,
        `成功获取产品 ${reitCode} 的 ${properties.length} 个资产`,
        Date.now() - startTime
      );

      properties.forEach((property: any) => {
        console.log(`    - ${property.property_name} (${property.location_city})`);
      });

      return properties;
    } else {
      logTest('按产品代码获取资产', false, '返回结果不是数组', Date.now() - startTime);
      return [];
    }
  } catch (error: any) {
    logTest('按产品代码获取资产', false, error.message, Date.now() - startTime);
    return [];
  }
}

// 测试 5：获取财务指标
async function testGetFinancialMetrics() {
  const startTime = Date.now();
  try {
    // 先获取一个产品代码
    const products = await reitsDB.getAllProducts({ limit: 1 });

    if (products.length === 0) {
      logTest('获取财务指标', false, '没有可用的产品', Date.now() - startTime);
      return null;
    }

    const reitCode = products[0].reit_code;
    const metrics = await reitsDB.getFinancialMetrics({
      reit_code: reitCode,
      limit: 5,
    });

    if (Array.isArray(metrics)) {
      logTest(
        '获取财务指标',
        true,
        `成功获取产品 ${reitCode} 的 ${metrics.length} 条财务指标`,
        Date.now() - startTime
      );

      if (metrics.length > 0) {
        console.log(`  最新报告期: ${metrics[0].report_date}`);
        console.log(`  可供分配金额: ${metrics[0].available_for_distribution} 万元`);
        console.log(`  现金分派率: ${metrics[0].distribution_yield}%`);
      }

      return metrics;
    } else {
      logTest('获取财务指标', false, '返回结果不是数组', Date.now() - startTime);
      return [];
    }
  } catch (error: any) {
    logTest('获取财务指标', false, error.message, Date.now() - startTime);
    return [];
  }
}

// 测试 6：获取市场表现数据
async function testGetMarketStats() {
  const startTime = Date.now();
  try {
    // 先获取一个产品代码
    const products = await reitsDB.getAllProducts({ limit: 1 });

    if (products.length === 0) {
      logTest('获取市场表现数据', false, '没有可用的产品', Date.now() - startTime);
      return [];
    }

    const reitCode = products[0].reit_code;
    const marketStats = await reitsDB.getMarketStats({
      reit_code: reitCode,
      limit: 10,
    });

    if (Array.isArray(marketStats)) {
      logTest(
        '获取市场表现数据',
        true,
        `成功获取产品 ${reitCode} 的 ${marketStats.length} 条市场数据`,
        Date.now() - startTime
      );

      if (marketStats.length > 0) {
        console.log(`  最新交易日: ${marketStats[0].trade_date}`);
        console.log(`  最新收盘价: ${marketStats[0].close_price} 元`);
        console.log(`  总市值: ${marketStats[0].market_cap} 万元`);
      }

      return marketStats;
    } else {
      logTest('获取市场表现数据', false, '返回结果不是数组', Date.now() - startTime);
      return [];
    }
  } catch (error: any) {
    logTest('获取市场表现数据', false, error.message, Date.now() - startTime);
    return [];
  }
}

// 测试 7：复杂查询 - 按资产类型筛选产品
async function testFilterByAssetType() {
  const startTime = Date.now();
  try {
    const products = await reitsDB.getAllProducts({
      asset_type_national: '交通基础设施',
      limit: 10,
    });

    if (Array.isArray(products)) {
      logTest(
        '按资产类型筛选产品',
        true,
        `成功找到 ${products.length} 个交通基础设施类REITs`,
        Date.now() - startTime
      );

      return products;
    } else {
      logTest('按资产类型筛选产品', false, '返回结果不是数组', Date.now() - startTime);
      return [];
    }
  } catch (error: any) {
    logTest('按资产类型筛选产品', false, error.message, Date.now() - startTime);
    return [];
  }
}

// 测试 8：分页查询
async function testPagination() {
  const startTime = Date.now();
  try {
    const page1 = await reitsDB.getAllProducts({ limit: 5, offset: 0 });
    const page2 = await reitsDB.getAllProducts({ limit: 5, offset: 5 });

    if (Array.isArray(page1) && Array.isArray(page2)) {
      logTest(
        '分页查询',
        true,
        `第1页 ${page1.length} 条，第2页 ${page2.length} 条`,
        Date.now() - startTime
      );

      return { page1, page2 };
    } else {
      logTest('分页查询', false, '返回结果格式错误', Date.now() - startTime);
      return null;
    }
  } catch (error: any) {
    logTest('分页查询', false, error.message, Date.now() - startTime);
    return null;
  }
}

// 主测试函数
export async function runAllTests() {
  console.log('========================================');
  console.log('REITs 数据库测试开始');
  console.log('========================================\n');

  try {
    // 依次执行所有测试
    await testGetAllProducts();
    await testGetProductByCode();
    await testGetAllProperties();
    await testGetPropertiesByReitCode();
    await testGetFinancialMetrics();
    await testGetMarketStats();
    await testFilterByAssetType();
    await testPagination();

    // 打印测试总结
    console.log('\n========================================');
    console.log('测试总结');
    console.log('========================================');

    const passed = testResults.filter((r) => r.passed).length;
    const failed = testResults.filter((r) => !r.passed).length;
    const total = testResults.length;

    console.log(`总测试数: ${total}`);
    console.log(`通过: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`失败: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
    console.log(`总耗时: ${testResults.reduce((sum, r) => sum + (r.duration || 0), 0)}ms`);

    if (failed === 0) {
      console.log('\n✓ 所有测试通过！');
    } else {
      console.log('\n✗ 部分测试失败，请查看详细日志');
    }

    return {
      total,
      passed,
      failed,
      results: testResults,
    };
  } catch (error: any) {
    console.error('\n测试执行出错:', error);
    return {
      total: testResults.length,
      passed: testResults.filter((r) => r.passed).length,
      failed: testResults.filter((r) => !r.passed).length + 1,
      error: error.message,
      results: testResults,
    };
  }
}

// 导出单个测试函数，方便单独运行
export {
  testGetAllProducts,
  testGetProductByCode,
  testGetAllProperties,
  testGetPropertiesByReitCode,
  testGetFinancialMetrics,
  testGetMarketStats,
  testFilterByAssetType,
  testPagination,
};
