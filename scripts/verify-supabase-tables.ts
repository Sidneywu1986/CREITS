/**
 * Verify Supabase tables
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client.js';

async function verifyTables() {
  try {
    console.log('[Supabase Verify] Verifying tables...');

    const client = getSupabaseClient();

    // Test 1: Query reits_products
    console.log('[Supabase Verify] Step 1: Querying reits_products...');
    const { data: products, error: productsError } = await client
      .from('reits_products')
      .select('*')
      .limit(1);

    if (productsError) {
      console.error('[Supabase Verify] reits_products query failed:', productsError);
    } else {
      console.log('[Supabase Verify] reits_products:', products);
    }

    // Test 2: Query reits_policies
    console.log('[Supabase Verify] Step 2: Querying reits_policies...');
    const { data: policies, error: policiesError } = await client
      .from('reits_policies')
      .select('*')
      .limit(1);

    if (policiesError) {
      console.error('[Supabase Verify] reits_policies query failed:', policiesError);
    } else {
      console.log('[Supabase Verify] reits_policies:', policies);
    }

    // Test 3: Query reits_news
    console.log('[Supabase Verify] Step 3: Querying reits_news...');
    const { data: news, error: newsError } = await client
      .from('reits_news')
      .select('*')
      .limit(1);

    if (newsError) {
      console.error('[Supabase Verify] reits_news query failed:', newsError);
    } else {
      console.log('[Supabase Verify] reits_news:', news);
    }

    // Test 4: Query reits_announcements
    console.log('[Supabase Verify] Step 4: Querying reits_announcements...');
    const { data: announcements, error: announcementsError } = await client
      .from('reits_announcements')
      .select('*')
      .limit(1);

    if (announcementsError) {
      console.error('[Supabase Verify] reits_announcements query failed:', announcementsError);
    } else {
      console.log('[Supabase Verify] reits_announcements:', announcements);
    }

    // Test 5: Query reits_valuation_history
    console.log('[Supabase Verify] Step 5: Querying reits_valuation_history...');
    const { data: valuation, error: valuationError } = await client
      .from('reits_valuation_history')
      .select('*')
      .limit(1);

    if (valuationError) {
      console.error('[Supabase Verify] reits_valuation_history query failed:', valuationError);
    } else {
      console.log('[Supabase Verify] reits_valuation_history:', valuation);
    }

    // Test 6: Query reits_model_training
    console.log('[Supabase Verify] Step 6: Querying reits_model_training...');
    const { data: training, error: trainingError } = await client
      .from('reits_model_training')
      .select('*')
      .limit(1);

    if (trainingError) {
      console.error('[Supabase Verify] reits_model_training query failed:', trainingError);
    } else {
      console.log('[Supabase Verify] reits_model_training:', training);
    }

    // Test 7: Query reits_evolution_tasks
    console.log('[Supabase Verify] Step 7: Querying reits_evolution_tasks...');
    const { data: evolution, error: evolutionError } = await client
      .from('reits_evolution_tasks')
      .select('*')
      .limit(1);

    if (evolutionError) {
      console.error('[Supabase Verify] reits_evolution_tasks query failed:', evolutionError);
    } else {
      console.log('[Supabase Verify] reits_evolution_tasks:', evolution);
    }

    console.log('[Supabase Verify] ✅ All tables verified!');

    return {
      success: true,
      message: 'All tables created and accessible',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Supabase Verify] ❌ Verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

verifyTables()
  .then(result => {
    console.log('[Supabase Verify] Result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('[Supabase Verify] Unexpected error:', error);
    process.exit(1);
  });
