// app/api/sync/status/route.ts
/**
 * 获取同步状态和任务列表
 */

import { NextResponse } from 'next/server';
import { dataSyncScheduler } from '@/lib/cron/scheduler';
import { dataSyncService } from '@/lib/services/data-sync-service';

export async function GET() {
  try {
    // 获取任务状态
    const taskStatus = dataSyncScheduler.getStatus();
    
    // 获取更新状态
    const updateStatus = await dataSyncService.checkUpdateStatus();
    
    // 获取WebSocket统计
    const wsServer = (await import('@/lib/websocket/server')).getWebSocketServer();
    const wsStats = wsServer ? wsServer.getStats() : null;

    return NextResponse.json({
      success: true,
      data: {
        tasks: taskStatus,
        update: updateStatus,
        websocket: wsStats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '获取状态失败', error: String(error) },
      { status: 500 }
    );
  }
}
