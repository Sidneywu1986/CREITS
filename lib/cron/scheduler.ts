// lib/cron/scheduler.ts
/**
 * 数据同步定时任务调度器
 * 使用node-cron实现定时任务
 */

import cron from 'node-cron';
import { dataSyncService } from '@/services/data-sync-service';

export class DataSyncScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.registerTasks();
  }

  /**
   * 注册所有定时任务
   */
  private registerTasks() {
    // 任务1：每5分钟同步实时行情（交易时间）
    this.tasks.set('sync-quotes', cron.schedule('*/5 * * * *', async () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      // 仅在交易时间执行（周一至周五 9:30-15:00）
      if (day !== 0 && day !== 6 && hour >= 9 && hour < 15) {
        await this.syncQuotes();
      }
    }));

    // 任务2：每天早上8点同步产品列表
    this.tasks.set('sync-products', cron.schedule('0 8 * * *', async () => {
      await this.syncProductList();
    }));

    // 任务3：每交易日15:30同步财务数据
    this.tasks.set('sync-financial', cron.schedule('30 15 * * 1-5', async () => {
      await this.syncFinancialData();
    }));

    // 任务4：每小时同步新闻
    this.tasks.set('sync-news', cron.schedule('0 * * * *', async () => {
      await this.syncNews();
    }));

    // 任务5：检查数据更新状态
    this.tasks.set('check-status', cron.schedule('*/10 * * * *', async () => {
      await this.checkSyncStatus();
    }));

    console.log('✅ 定时任务注册完成');
  }

  /**
   * 同步实时行情
   */
  private async syncQuotes() {
    try {
      console.log('📊 开始同步实时行情...');
      const startTime = Date.now();

      // 获取所有产品代码
      const products = await dataSyncService.getREITsProducts();
      const codes = products.map(p => p.code).slice(0, 50); // 限制每次同步50个

      // 获取实时行情
      const quotes = await dataSyncService.getRealtimeQuotes(codes);

      // 记录历史数据
      await this.saveQuoteHistory(quotes);

      const duration = Date.now() - startTime;
      console.log(`✅ 实时行情同步完成，共 ${quotes.length} 条数据，耗时 ${duration}ms`);

      // 发布更新事件
      await this.publishUpdate('quotes', quotes);
    } catch (error) {
      console.error('❌ 实时行情同步失败:', error);
    }
  }

  /**
   * 同步产品列表
   */
  private async syncProductList() {
    try {
      console.log('📋 开始同步产品列表...');
      const startTime = Date.now();

      const products = await dataSyncService.getREITsProducts();

      // 对比数据变化
      const changes = await this.compareProductChanges(products);

      if (changes.added.length > 0) {
        console.log(`✨ 新增产品: ${changes.added.length} 个`);
        await this.publishUpdate('products:added', changes.added);
      }

      if (changes.updated.length > 0) {
        console.log(`🔄 更新产品: ${changes.updated.length} 个`);
        await this.publishUpdate('products:updated', changes.updated);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ 产品列表同步完成，共 ${products.length} 条数据，耗时 ${duration}ms`);

      // 更新最后同步时间
      await this.updateLastSyncTime();
    } catch (error) {
      console.error('❌ 产品列表同步失败:', error);
    }
  }

  /**
   * 同步财务数据
   */
  private async syncFinancialData() {
    try {
      console.log('💰 开始同步财务数据...');
      const startTime = Date.now();

      const products = await dataSyncService.getREITsProducts();
      const currentYear = new Date().getFullYear();

      for (const product of products.slice(0, 10)) {
        const financialData = await dataSyncService.getFinancialData(
          product.code, 
          currentYear.toString()
        );

        if (financialData) {
          await this.saveFinancialData(product.code, financialData);
          console.log(`  ✓ ${product.code} 财务数据同步完成`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ 财务数据同步完成，耗时 ${duration}ms`);

      await this.publishUpdate('financial', { timestamp: new Date() });
    } catch (error) {
      console.error('❌ 财务数据同步失败:', error);
    }
  }

  /**
   * 同步新闻
   */
  private async syncNews() {
    try {
      console.log('📰 开始同步新闻...');
      const startTime = Date.now();

      const news = await dataSyncService.getNewsData(50);

      // 保存新闻到数据库
      await this.saveNewsData(news);

      const duration = Date.now() - startTime;
      console.log(`✅ 新闻同步完成，共 ${news.length} 条，耗时 ${duration}ms`);

      await this.publishUpdate('news', news.slice(0, 10));
    } catch (error) {
      console.error('❌ 新闻同步失败:', error);
    }
  }

  /**
   * 检查同步状态
   */
  private async checkSyncStatus() {
    const status = await dataSyncService.checkUpdateStatus();

    if (status.status === 'delayed') {
      console.warn('⚠️ 数据同步延迟超过10分钟！');
      // 发送告警
      await this.sendAlert('数据同步延迟', status);
    }
  }

  /**
   * 对比产品变化
   */
  private async compareProductChanges(newProducts: any[]) {
    // 从数据库获取旧数据
    const oldProducts = await this.getProductsFromDB();
    const oldCodes = new Set(oldProducts.map((p: any) => p.code));
    const newCodes = new Set(newProducts.map(p => p.code));

    return {
      added: newProducts.filter(p => !oldCodes.has(p.code)),
      updated: newProducts.filter(p => oldCodes.has(p.code)),
      removed: oldProducts.filter((p: any) => !newCodes.has(p.code)),
    };
  }

  /**
   * 保存行情历史数据
   */
  private async saveQuoteHistory(quotes: any[]) {
    // 这里应该保存到数据库
    // 示例：await db.quotes.createMany({ data: quotes });
    console.log(`  保存 ${quotes.length} 条行情历史`);
  }

  /**
   * 保存财务数据
   */
  private async saveFinancialData(code: string, data: any) {
    // 这里应该保存到数据库
    console.log(`  保存 ${code} 财务数据`);
  }

  /**
   * 保存新闻数据
   */
  private async saveNewsData(news: any[]) {
    // 这里应该保存到数据库
    console.log(`  保存 ${news.length} 条新闻`);
  }

  /**
   * 从数据库获取产品
   */
  private async getProductsFromDB() {
    // 这里应该从数据库查询
    return [];
  }

  /**
   * 更新最后同步时间
   */
  private async updateLastSyncTime() {
    const redis = dataSyncService['redis'];
    await redis.set('sync:last_time', new Date().toISOString());
  }

  /**
   * 发布更新事件
   */
  private async publishUpdate(channel: string, data: any) {
    // 通过Redis Pub/Sub发布
    const redis = dataSyncService['redis'];
    await redis.publish(`updates:${channel}`, JSON.stringify(data));
  }

  /**
   * 发送告警
   */
  private async sendAlert(message: string, data: any) {
    // 这里可以集成邮件、短信、钉钉等告警方式
    console.warn('🚨 告警:', message, data);
  }

  /**
   * 手动触发任务
   */
  async triggerTask(taskName: string) {
    const task = this.tasks.get(taskName);
    if (task) {
      console.log(`🔔 手动触发任务: ${taskName}`);
      task.invoke();
    } else {
      console.error(`❌ 任务不存在: ${taskName}`);
    }
  }

  /**
   * 停止所有任务
   */
  stop() {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`⏹️  停止任务: ${name}`);
    });
  }

  /**
   * 启动所有任务
   */
  start() {
    this.tasks.forEach((task, name) => {
      task.start();
      console.log(`▶️  启动任务: ${name}`);
    });
  }

  /**
   * 获取任务状态
   */
  getStatus() {
    return {
      running: Array.from(this.tasks.keys()),
      timestamp: new Date(),
    };
  }
}

// 导出单例
export const dataSyncScheduler = new DataSyncScheduler();
