/**
 * Test Complete Data Service - With snake_case support
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client.js';
import * as ReitsDataService from '../lib/supabase/reits-data-service.js';

async function testAllServices() {
  try {
    console.log('[Complete Test] Testing all data services...');

    // Test REITs Product Service
    console.log('[Complete Test] Testing REITs Product Service...');

    const productService = ReitsDataService.reitsProductService;

    // Cleanup existing test data
    console.log('[Complete Test] 0. Cleaning up existing test data...');
    try {
      const existing = await productService.getByCode('508002');
      if (existing) {
        await productService.delete(existing.id);
        console.log('[Complete Test] ✅ Deleted existing test product');
      }
    } catch (e) {
      // Ignore if not exists
    }

    // 1. Create product
    console.log('[Complete Test] 1. Creating product...');
    const newProduct = await productService.create({
      code: '508002',
      name: '越秀高速REIT',
      issuingMarket: 'SZ',
      status: 'active',
      underlyingAsset: '高速公路',
      fundSize: 30.5,
      nav: 1.1456,
      navDate: new Date().toISOString(),
      listingDate: '2022-08-01T00:00:00Z',
      manager: '越秀交通基建有限公司',
      custodian: '中国工商银行股份有限公司',
      description: '高速公路基础设施REITs'
    });
    console.log('[Complete Test] ✅ Product created:', newProduct.id);

    // 2. Get all products
    console.log('[Complete Test] 2. Getting all products...');
    const allProducts = await productService.getAll();
    console.log('[Complete Test] ✅ Products count:', allProducts.length);

    // 3. Get by code
    console.log('[Complete Test] 3. Getting product by code...');
    const byCode = await productService.getByCode('508002');
    console.log('[Complete Test] ✅ Product by code:', byCode?.name);

    // 4. Update product
    console.log('[Complete Test] 4. Updating product...');
    const updatedProduct = await productService.update(newProduct.id, {
      nav: 1.15,
      description: 'Updated description'
    });
    console.log('[Complete Test] ✅ Product updated:', updatedProduct.nav);

    // 5. Get by ID
    console.log('[Complete Test] 5. Getting product by ID...');
    const byId = await productService.getById(newProduct.id);
    console.log('[Complete Test] ✅ Product by ID:', byId?.name);

    // 6. Delete test products one by one
    console.log('[Complete Test] 6. Deleting test products...');
    await productService.delete(newProduct.id);
    console.log('[Complete Test] ✅ Deleted 1 product');

    console.log('[Complete Test] ✅ All REITs Product Service tests passed!');

    return {
      success: true,
      message: 'All services tested successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Complete Test] ❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

testAllServices()
  .then(result => {
    console.log('[Complete Test] Result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('[Complete Test] Unexpected error:', error);
    process.exit(1);
  });
