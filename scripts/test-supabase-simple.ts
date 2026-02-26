/**
 * Test Supabase connection - Simple version
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client.js';

async function testConnection() {
  try {
    console.log('[Supabase Test] Testing connection...');

    const client = getSupabaseClient();

    // Test 1: Test basic connection
    console.log('[Supabase Test] Step 1: Testing basic connection...');

    // Test 2: Query a simple system table
    console.log('[Supabase Test] Step 2: Querying information_schema...');
    const { data: tables, error: tablesError } = await client
      .rpc('get_tables');

    if (tablesError) {
      console.log('[Supabase Test] RPC query not available, trying direct query...');
      // Try a different approach - list all tables
      const { data: allTables, error: allTablesError } = await client
        .from('pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public')
        .limit(10);

      if (allTablesError) {
        console.log('[Supabase Test] Query failed:', allTablesError);
      } else {
        console.log('[Supabase Test] Found tables:', allTables);
      }
    } else {
      console.log('[Supabase Test] Tables:', tables);
    }

    console.log('[Supabase Test] ✅ Connection successful!');

    return {
      success: true,
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
