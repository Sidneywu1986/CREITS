/**
 * Test Supabase connection
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client.js';

async function testConnection() {
  try {
    console.log('[Supabase Test] Testing connection...');

    const client = getSupabaseClient();

    // Test 1: Test basic connection
    console.log('[Supabase Test] Step 1: Testing basic connection...');

    // Test 2: Query health_check table
    console.log('[Supabase Test] Step 2: Querying health_check table...');
    const { data: healthData, error: healthError } = await client
      .from('health_check')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (healthError) {
      console.error('[Supabase Test] Health check query failed:', healthError);
      throw healthError;
    }

    console.log('[Supabase Test] Health check data:', healthData);
    console.log('[Supabase Test] ✅ Connection successful!');

    return {
      success: true,
      healthCheck: healthData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Supabase Test] ❌ Connection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

testConnection()
  .then(result => {
    console.log('[Supabase Test] Result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('[Supabase Test] Unexpected error:', error);
    process.exit(1);
  });
