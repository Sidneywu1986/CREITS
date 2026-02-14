// app/api/sync/quotes/route.ts
/**
 * 手动触发实时行情同步
 */

import { NextResponse } from 'next/server';
import { dataSyncScheduler } from '@/lib/cron/scheduler';

export async function POST() {
  try {
    await dataSyncScheduler.triggerTask('sync-quotes');
    return NextResponse.json({ 
      success: true, 
      message: '实时行情同步已触发' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '同步失败', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { dataSyncService } = await import('@/lib/services/data-sync-service');
    const products = await dataSyncService.getREITsProducts();
    const codes = products.map(p => p.code).slice(0, 10);
    
    const quotes = await dataSyncService.getRealtimeQuotes(codes);
    
    return NextResponse.json({ 
      success: true, 
      data: quotes,
      count: quotes.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '获取行情失败', error: String(error) },
      { status: 500 }
    );
  }
}
