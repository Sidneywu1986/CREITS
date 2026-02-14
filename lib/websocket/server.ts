// lib/websocket/server.ts
/**
 * WebSocket实时推送服务
 * 用于向客户端推送实时行情、新闻等数据
 */

import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createClient } from 'redis';

export class WebSocketServer {
  private io: SocketServer;
  private redisPublisher: ReturnType<typeof createClient>;
  private redisSubscriber: ReturnType<typeof createClient>;

  constructor(httpServer: HTTPServer) {
    // 初始化Socket.IO
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    });

    // 初始化Redis客户端（用于Pub/Sub）
    this.redisPublisher = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.redisSubscriber = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.setupConnection();
    this.setupRedisSubscription();
  }

  /**
   * 设置WebSocket连接
   */
  private setupConnection() {
    this.io.on('connection', (socket) => {
      console.log('🔌 客户端连接:', socket.id);

      // 订阅频道
      socket.on('subscribe', async (channels: string | string[]) => {
        const channelList = Array.isArray(channels) ? channels : [channels];
        channelList.forEach(channel => {
          socket.join(channel);
          console.log(`  📢 客户端 ${socket.id} 订阅频道: ${channel}`);
        });
      });

      // 取消订阅
      socket.on('unsubscribe', (channels: string | string[]) => {
        const channelList = Array.isArray(channels) ? channels : [channels];
        channelList.forEach(channel => {
          socket.leave(channel);
          console.log(`  🔇 客户端 ${socket.id} 取消订阅: ${channel}`);
        });
      });

      // 请求特定产品数据
      socket.on('request:quotes', async (codes: string[]) => {
        const { dataSyncService } = await import('@/services/data-sync-service');
        const quotes = await dataSyncService.getRealtimeQuotes(codes);
        socket.emit('quotes', quotes);
      });

      // 心跳检测
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // 断开连接
      socket.on('disconnect', () => {
        console.log('🔌 客户端断开:', socket.id);
      });

      // 错误处理
      socket.on('error', (error) => {
        console.error('❌ WebSocket错误:', error);
      });
    });

    console.log('✅ WebSocket服务已启动');
  }

  /**
   * 设置Redis订阅
   */
  private async setupRedisSubscription() {
    try {
      await this.redisPublisher.connect();
      await this.redisSubscriber.connect();

      // 订阅所有更新频道
      const channels = [
        'updates:quotes',
        'updates:products:added',
        'updates:products:updated',
        'updates:financial',
        'updates:news',
      ];

      await this.redisSubscriber.subscribe(channels, (message, channel) => {
        // 将Redis消息转发到WebSocket
        const channelName = channel.replace('updates:', '');
        this.io.to(channelName).emit('update', {
          channel: channelName,
          data: JSON.parse(message),
          timestamp: new Date(),
        });

        console.log(`📤 推送更新到 ${channelName}:`, message.length);
      });

      console.log('✅ Redis订阅已设置');
    } catch (error) {
      console.error('❌ Redis订阅失败:', error);
    }
  }

  /**
   * 推送实时行情到指定频道
   */
  async pushQuotes(quotes: any[]) {
    quotes.forEach(quote => {
      this.io.to(`quote:${quote.code}`).emit('quote:update', {
        ...quote,
        timestamp: new Date(),
      });
    });

    // 同时推送到全局行情频道
    this.io.to('quotes').emit('quotes:update', quotes);
  }

  /**
   * 推送新闻到新闻频道
   */
  async pushNews(news: any[]) {
    this.io.to('news').emit('news:update', news);
  }

  /**
   * 推送产品状态更新
   */
  async pushProductStatus(productId: string, status: string) {
    this.io.to(`product:${productId}`).emit('product:status', {
      productId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * 广播消息到所有客户端
   */
  async broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  /**
   * 获取连接统计
   */
  getStats() {
    return {
      connected: this.io.engine.clientsCount,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()),
      timestamp: new Date(),
    };
  }

  /**
   * 关闭服务器
   */
  async close() {
    await this.redisPublisher.quit();
    await this.redisSubscriber.quit();
    this.io.close();
    console.log('✅ WebSocket服务已关闭');
  }
}

// 创建全局实例（将在自定义服务器中初始化）
let wsServer: WebSocketServer | null = null;

export function getWebSocketServer(): WebSocketServer | null {
  return wsServer;
}

export function initWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer(httpServer);
  }
  return wsServer;
}
