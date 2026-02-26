/**
 * CronSchedulerService - 定时任务调度器服务
 *
 * 基于 node-cron 实现定时任务调度
 * 负责调度数据采集、模型训练、性能监控等任务
 */

import cron from 'node-cron';
import { cozeWebSearchService } from './web-search-service';
import { cozeLLMService } from './llm-service';

/**
 * 任务类型
 */
export enum TaskType {
  POLICY_COLLECTION = 'policy_collection',       // 政策数据采集
  NEWS_COLLECTION = 'news_collection',           // 新闻数据采集
  REITS_DATA_COLLECTION = 'reits_data_collection', // REITs数据采集
  ANNOUNCEMENT_COLLECTION = 'announcement_collection', // 公告数据采集
  AGENT_EVOLUTION = 'agent_evolution',           // Agent进化
  MODEL_TRAINING = 'model_training',             // 模型训练
  PERFORMANCE_MONITOR = 'performance_monitor',   // 性能监控
  DATA_QUALITY_CHECK = 'data_quality_check'      // 数据质量检查
}

/**
 * 任务状态
 */
export enum TaskStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * 任务配置
 */
export interface TaskConfig {
  id: string;
  type: TaskType;
  name: string;
  description: string;
  cronExpression: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
}

/**
 * 任务执行结果
 */
export interface TaskExecutionResult {
  taskId: string;
  startTime: Date;
  endTime: Date;
  status: TaskStatus;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

/**
 * CronSchedulerService类
 */
export class CronSchedulerService {
  private static instance: CronSchedulerService;
  private tasks: Map<string, TaskConfig>;
  private scheduledTasks: Map<string, cron.ScheduledTask>;

  private constructor() {
    this.tasks = new Map();
    this.scheduledTasks = new Map();
    this.initDefaultTasks();
  }

  static getInstance(): CronSchedulerService {
    if (!CronSchedulerService.instance) {
      CronSchedulerService.instance = new CronSchedulerService();
    }
    return CronSchedulerService.instance;
  }

  /**
   * 初始化默认任务
   */
  private initDefaultTasks(): void {
    // 政策数据采集：每日 09:00 和 14:00
    this.registerTask({
      id: 'policy_collection_1',
      type: TaskType.POLICY_COLLECTION,
      name: '政策数据采集（上午）',
      description: '采集最新的REITs相关政策数据',
      cronExpression: '0 9 * * *',  // 每日 09:00
      enabled: true,
      status: TaskStatus.IDLE,
      retryCount: 0,
      maxRetries: 3
    });

    this.registerTask({
      id: 'policy_collection_2',
      type: TaskType.POLICY_COLLECTION,
      name: '政策数据采集（下午）',
      description: '采集最新的REITs相关政策数据',
      cronExpression: '0 14 * * *',  // 每日 14:00
      enabled: true,
      status: TaskStatus.IDLE,
      retryCount: 0,
      maxRetries: 3
    });

    // 新闻数据采集：每小时
    this.registerTask({
      id: 'news_collection',
      type: TaskType.NEWS_COLLECTION,
      name: '新闻数据采集',
      description: '采集最新的REITs相关新闻',
      cronExpression: '0 * * * *',  // 每小时
      enabled: true,
      status: TaskStatus.IDLE,
      retryCount: 0,
      maxRetries: 3
    });

    // REITs数据采集：每日 20:00
    this.registerTask({
      id: 'reits_data_collection',
      type: TaskType.REITS_DATA_COLLECTION,
      name: 'REITs数据采集',
      description: '采集REITs基础数据和净值数据',
      cronExpression: '0 20 * * *',  // 每日 20:00
      enabled: true,
      status: TaskStatus.IDLE,
      retryCount: 0,
      maxRetries: 3
    });

    // 公告数据采集：每日 19:00
    this.registerTask({
      id: 'announcement_collection',
      type: TaskType.ANNOUNCEMENT_COLLECTION,
      name: '公告数据采集',
      description: '采集REITs相关公告',
      cronExpression: '0 19 * * *',  // 每日 19:00
      enabled: true,
      status: TaskStatus.IDLE,
      retryCount: 0,
      maxRetries: 3
    });

    // Agent进化：每日 22:00
    this.registerTask({
      id: 'agent_evolution',
      type: TaskType.AGENT_EVOLUTION,
      name: 'Agent自我进化',
      description: '执行Agent自我进化，优化权重配置',
      cronExpression: '0 22 * * *',  // 每日 22:00
      enabled: true,
      status: TaskStatus.IDLE,
      retryCount: 0,
      maxRetries: 2
    });

    // 性能监控：每5分钟
    this.registerTask({
      id: 'performance_monitor',
      type: TaskType.PERFORMANCE_MONITOR,
      name: '性能监控',
      description: '监控系统性能和数据采集状态',
      cronExpression: '*/5 * * * *',  // 每5分钟
      enabled: true,
      status: TaskStatus.IDLE,
      retryCount: 0,
      maxRetries: 1
    });

    // 数据质量检查：每日 03:00
    this.registerTask({
      id: 'data_quality_check',
      type: TaskType.DATA_QUALITY_CHECK,
      name: '数据质量检查',
      description: '检查数据质量和完整性',
      cronExpression: '0 3 * * *',  // 每日 03:00
      enabled: true,
      status: TaskStatus.IDLE,
      retryCount: 0,
      maxRetries: 2
    });
  }

  /**
   * 注册任务
   */
  registerTask(config: TaskConfig): void {
    this.tasks.set(config.id, config);

    if (config.enabled) {
      this.startTask(config.id);
    }
  }

  /**
   * 启动任务
   */
  startTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      console.error(`[CronScheduler] 任务不存在: ${taskId}`);
      return false;
    }

    if (this.scheduledTasks.has(taskId)) {
      console.log(`[CronScheduler] 任务已在运行: ${taskId}`);
      return true;
    }

    try {
      const scheduledTask = cron.schedule(task.cronExpression, async () => {
        await this.executeTask(taskId);
      }, {
        scheduled: true,
        timezone: 'Asia/Shanghai'
      });

      this.scheduledTasks.set(taskId, scheduledTask);
      console.log(`[CronScheduler] 任务已启动: ${task.name} (${task.cronExpression})`);

      return true;
    } catch (error) {
      console.error(`[CronScheduler] 启动任务失败: ${taskId}`, error);
      return false;
    }
  }

  /**
   * 停止任务
   */
  stopTask(taskId: string): boolean {
    const scheduledTask = this.scheduledTasks.get(taskId);

    if (!scheduledTask) {
      console.error(`[CronScheduler] 任务未运行: ${taskId}`);
      return false;
    }

    scheduledTask.stop();
    this.scheduledTasks.delete(taskId);

    const task = this.tasks.get(taskId);
    if (task) {
      task.status = TaskStatus.IDLE;
    }

    console.log(`[CronScheduler] 任务已停止: ${taskId}`);

    return true;
  }

  /**
   * 执行任务
   */
  async executeTask(taskId: string): Promise<TaskExecutionResult> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }

    console.log(`[CronScheduler] 开始执行任务: ${task.name}`);
    task.status = TaskStatus.RUNNING;
    task.lastRun = new Date();

    const startTime = new Date();

    try {
      let result: any;

      switch (task.type) {
        case TaskType.POLICY_COLLECTION:
          result = await this.executePolicyCollection();
          break;
        case TaskType.NEWS_COLLECTION:
          result = await this.executeNewsCollection();
          break;
        case TaskType.REITS_DATA_COLLECTION:
          result = await this.executeREITsDataCollection();
          break;
        case TaskType.ANNOUNCEMENT_COLLECTION:
          result = await this.executeAnnouncementCollection();
          break;
        case TaskType.AGENT_EVOLUTION:
          result = await this.executeAgentEvolution();
          break;
        case TaskType.PERFORMANCE_MONITOR:
          result = await this.executePerformanceMonitor();
          break;
        case TaskType.DATA_QUALITY_CHECK:
          result = await this.executeDataQualityCheck();
          break;
        default:
          throw new Error(`未知任务类型: ${task.type}`);
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      task.status = TaskStatus.COMPLETED;
      task.retryCount = 0;

      console.log(`[CronScheduler] 任务执行成功: ${task.name} (耗时: ${duration}ms)`);

      return {
        taskId: taskId,
        startTime,
        endTime,
        status: TaskStatus.COMPLETED,
        success: true,
        result,
        duration
      };
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      const errorMessage = error instanceof Error ? error.message : String(error);

      task.status = TaskStatus.FAILED;
      task.retryCount++;

      console.error(`[CronScheduler] 任务执行失败: ${task.name}`, error);

      // 重试逻辑
      if (task.retryCount < task.maxRetries) {
        console.log(`[CronScheduler] 准备重试 (${task.retryCount}/${task.maxRetries}): ${task.name}`);
        setTimeout(() => this.executeTask(taskId), 5000 * task.retryCount);
      }

      return {
        taskId: taskId,
        startTime,
        endTime,
        status: TaskStatus.FAILED,
        success: false,
        error: errorMessage,
        duration
      };
    }
  }

  /**
   * 执行政策数据采集
   */
  private async executePolicyCollection(): Promise<any> {
    console.log('[CronScheduler] 执行政策数据采集...');

    const policies = await cozeWebSearchService.searchPolicies({
      timeRange: '1d',
      count: 10
    });

    // 对每个政策进行分析
    for (const policy of policies.results) {
      if (policy.content) {
        const impact = await cozeLLMService.analyzePolicyImpact(
          policy.content,
          policy.title
        );

        console.log(`[CronScheduler] 政策分析: ${policy.title} - 影响分数: ${impact.impactScore}`);
      }
    }

    return {
      total: policies.total,
      summary: policies.summary
    };
  }

  /**
   * 执行新闻数据采集
   */
  private async executeNewsCollection(): Promise<any> {
    console.log('[CronScheduler] 执行新闻数据采集...');

    const news = await cozeWebSearchService.searchNews({
      timeRange: '1d',
      count: 10
    });

    // 对每条新闻进行情感分析
    for (const item of news.results) {
      if (item.content) {
        const sentiment = await cozeLLMService.analyzeNewsSentiment(
          item.content,
          item.title
        );

        console.log(`[CronScheduler] 新闻分析: ${item.title} - 情感: ${sentiment.sentiment} (${sentiment.score})`);
      }
    }

    return {
      total: news.total,
      summary: news.summary
    };
  }

  /**
   * 执行REITs数据采集
   */
  private async executeREITsDataCollection(): Promise<any> {
    console.log('[CronScheduler] 执行REITs数据采集...');
    // TODO: 实现REITs数据采集逻辑
    return { status: 'completed', message: 'REITs数据采集待实现' };
  }

  /**
   * 执行公告数据采集
   */
  private async executeAnnouncementCollection(): Promise<any> {
    console.log('[CronScheduler] 执行公告数据采集...');
    // TODO: 实现公告数据采集逻辑
    return { status: 'completed', message: '公告数据采集待实现' };
  }

  /**
   * 执行Agent进化
   */
  private async executeAgentEvolution(): Promise<any> {
    console.log('[CronScheduler] 执行Agent自我进化...');
    // TODO: 集成自我进化服务
    return { status: 'completed', message: 'Agent进化待实现' };
  }

  /**
   * 执行性能监控
   */
  private async executePerformanceMonitor(): Promise<any> {
    console.log('[CronScheduler] 执行性能监控...');
    // TODO: 实现性能监控逻辑
    return { status: 'completed', message: '性能监控待实现' };
  }

  /**
   * 执行数据质量检查
   */
  private async executeDataQualityCheck(): Promise<any> {
    console.log('[CronScheduler] 执行数据质量检查...');
    // TODO: 实现数据质量检查逻辑
    return { status: 'completed', message: '数据质量检查待实现' };
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): TaskConfig[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): TaskConfig | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 更新任务
   */
  updateTask(taskId: string, updates: Partial<TaskConfig>): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    const wasEnabled = task.enabled;
    Object.assign(task, updates);

    // 如果enabled状态改变，需要启动或停止任务
    if (updates.enabled !== undefined && updates.enabled !== wasEnabled) {
      if (updates.enabled) {
        this.startTask(taskId);
      } else {
        this.stopTask(taskId);
      }
    }

    return true;
  }

  /**
   * 启动所有任务
   */
  startAllTasks(): void {
    console.log('[CronScheduler] 启动所有任务...');

    for (const [taskId, task] of this.tasks) {
      if (task.enabled && !this.scheduledTasks.has(taskId)) {
        this.startTask(taskId);
      }
    }
  }

  /**
   * 停止所有任务
   */
  stopAllTasks(): void {
    console.log('[CronScheduler] 停止所有任务...');

    for (const taskId of this.scheduledTasks.keys()) {
      this.stopTask(taskId);
    }
  }

  /**
   * 手动执行任务
   */
  async runTaskManually(taskId: string): Promise<TaskExecutionResult> {
    return await this.executeTask(taskId);
  }
}

// 导出单例
export const cronSchedulerService = CronSchedulerService.getInstance();
