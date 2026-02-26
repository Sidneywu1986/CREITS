/**
 * Test Supabase Data Service - Using snake_case
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client.js';

async function testWithSnakeCase() {
  try {
    console.log('[SnakeCase Test] Testing with snake_case field names...');

    const client = getSupabaseClient();

    // Test 1: Create a REITs product with snake_case
    console.log('[SnakeCase Test] Step 1: Creating REITs product...');
    const { data: product, error: productError } = await client
      .from('reits_products')
      .insert({
        code: '508001',
        name: '沪杭甬REIT',
        issuing_market: 'SH',
        status: 'active',
        underlying_asset: '高速公路',
        fund_size: 50.5,
        nav: 1.2345,
        nav_date: new Date().toISOString(),
        listing_date: '2022-06-01T00:00:00Z',
        manager: '浙江沪杭甬高速公路股份有限公司',
        custodian: '招商银行股份有限公司',
        description: '基础设施公募REITs',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (productError) {
      console.error('[SnakeCase Test] Product creation failed:', productError);
      throw productError;
    }
    console.log('[SnakeCase Test] ✅ Product created:', product);

    // Test 2: Query all products
    console.log('[SnakeCase Test] Step 2: Querying all products...');
    const { data: products, error: productsError } = await client
      .from('reits_products')
      .select('*');

    if (productsError) {
      console.error('[SnakeCase Test] Query failed:', productsError);
      throw productsError;
    }
    console.log('[SnakeCase Test] ✅ Products found:', products.length);
    console.log('[SnakeCase Test] Product data:', products);

    console.log('[SnakeCase Test] ✅ All tests passed!');

    return {
      success: true,
      message: 'Snake_case field names working',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[SnakeCase Test] ❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

testWithSnakeCase()
  .then(result => {
    console.log('[SnakeCase Test] Result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('[SnakeCase Test] Unexpected error:', error);
    process.exit(1);
  });
