import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      healthCheck: healthData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Supabase Test] Connection failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
