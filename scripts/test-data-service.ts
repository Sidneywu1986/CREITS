/**
 * Test Supabase Data Service
 */

import {
  reitsProductService,
  reitsPolicyService,
  reitsNewsService,
  reitsModelTrainingService
} from '../lib/supabase/reits-data-service.js';

async function testDataService() {
  try {
    console.log('[DataService Test] Testing data service...');

    // Test 1: Create a REITs product
    console.log('[DataService Test] Step 1: Creating REITs product...');
    const product = await reitsProductService.create({
      code: '508001',
      name: '沪杭甬REIT',
      issuingMarket: 'SH',
      status: 'active',
      underlyingAsset: '高速公路',
      fundSize: 50.5,
      nav: 1.2345,
      navDate: new Date().toISOString(),
      listingDate: '2022-06-01T00:00:00Z',
      manager: '浙江沪杭甬高速公路股份有限公司',
      custodian: '招商银行股份有限公司',
      description: '基础设施公募REITs，投资于沪杭甬高速公路项目'
    });
    console.log('[DataService Test] ✅ Product created:', product);

    // Test 2: Create a policy
    console.log('[DataService Test] Step 2: Creating policy...');
    const policy = await reitsPolicyService.create({
      title: '关于推进基础设施REITs试点的通知',
      content: '为进一步推进基础设施领域不动产投资信托基金试点...',
      source: '国家发改委',
      url: 'https://example.com/policy',
      publishDate: new Date().toISOString(),
      impactScore: 0.8,
      impactDirection: 'positive',
      impactLevel: 'high',
      affectedReits: ['508001', '508005'],
      keyPoints: ['推进基础设施REITs试点', '扩大试点范围'],
      summary: '政策摘要'
    });
    console.log('[DataService Test] ✅ Policy created:', policy);

    // Test 3: Create a news
    console.log('[DataService Test] Step 3: Creating news...');
    const news = await reitsNewsService.create({
      title: 'REITs市场表现强劲',
      content: '近期REITs市场表现强劲，多只产品上涨...',
      snippet: 'REITs市场表现强劲',
      source: '证券时报',
      url: 'https://example.com/news',
      publishTime: new Date().toISOString(),
      sentiment: 'positive',
      sentimentScore: 0.75,
      confidence: 0.85,
      keywords: ['REITs', '上涨', '市场'],
      summary: 'REITs市场表现强劲'
    });
    console.log('[DataService Test] ✅ News created:', news);

    // Test 4: Create a model training record
    console.log('[DataService Test] Step 4: Creating model training record...');
    const training = await reitsModelTrainingService.create({
      modelType: 'valuation',
      modelVersion: 'v1.0.0',
      architecture: 'dense',
      trainingStartTime: new Date(Date.now() - 60000).toISOString(),
      trainingEndTime: new Date().toISOString(),
      epochs: 100,
      batchSize: 32,
      initialLoss: 0.5,
      finalLoss: 0.01,
      finalAccuracy: 0.95,
      validationLoss: 0.015,
      validationAccuracy: 0.92,
      stoppedEarly: false,
      bestEpoch: 95,
      dataCount: 1000,
      trainingTime: 60000,
      modelPath: '/models/valuation',
      hyperparameters: {},
      evaluationMetrics: {},
      trainingHistory: {},
      status: 'completed'
    });
    console.log('[DataService Test] ✅ Training record created:', training);

    // Test 5: Query all products
    console.log('[DataService Test] Step 5: Querying all products...');
    const products = await reitsProductService.getAll();
    console.log('[DataService Test] ✅ Products found:', products.length);

    // Test 6: Query all policies
    console.log('[DataService Test] Step 6: Querying all policies...');
    const policies = await reitsPolicyService.getAll({ limit: 10 });
    console.log('[DataService Test] ✅ Policies found:', policies.length);

    // Test 7: Query all news
    console.log('[DataService Test] Step 7: Querying all news...');
    const newsList = await reitsNewsService.getAll({ limit: 10 });
    console.log('[DataService Test] ✅ News found:', newsList.length);

    console.log('[DataService Test] ✅ All tests passed!');

    return {
      success: true,
      message: 'Data service working correctly',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[DataService Test] ❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

testDataService()
  .then(result => {
    console.log('[DataService Test] Result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('[DataService Test] Unexpected error:', error);
    process.exit(1);
  });
