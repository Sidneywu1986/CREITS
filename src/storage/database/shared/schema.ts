import { pgTable, serial, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import {
  text,
  varchar,
  boolean,
  integer,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";

// System table - Keep existing
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ============================================
// REITs Product Table
// ============================================
export const reitsProducts = pgTable(
  "reits_products",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    code: varchar("code", { length: 20 }).notNull().unique(), // REITs代码，如"508001"
    name: varchar("name", { length: 200 }).notNull(), // 产品名称
    issuingMarket: varchar("issuing_market", { length: 20 }), // 发行市场: SH/SZ
    status: varchar("status", { length: 20 }).default("active"), // 状态: active/suspended/delisted
    underlyingAsset: varchar("underlying_asset", { length: 200 }), // 底层资产类型
    fundSize: numeric("fund_size"), // 基金规模（亿元）
    nav: numeric("nav"), // 单位净值
    navDate: timestamp("nav_date", { withTimezone: true, mode: 'string' }), // 净值日期
    listingDate: timestamp("listing_date", { withTimezone: true, mode: 'string' }), // 上市日期
    manager: varchar("manager", { length: 200 }), // 基金管理人
    custodian: varchar("custodian", { length: 200 }), // 基金托管人
    description: text("description"), // 产品描述
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reits_products_code_idx").on(table.code),
    index("reits_products_status_idx").on(table.status),
    index("reits_products_market_idx").on(table.issuingMarket),
  ]
);

// ============================================
// REITs Policy Table
// ============================================
export const reitsPolicies = pgTable(
  "reits_policies",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 500 }).notNull(), // 政策标题
    content: text("content"), // 政策内容
    source: varchar("source", { length: 200 }), // 来源网站
    url: varchar("url", { length: 1000 }), // 原始URL
    publishDate: timestamp("publish_date", { withTimezone: true, mode: 'string' }), // 发布日期
    impactScore: numeric("impact_score"), // 影响分数 -1到1
    impactDirection: varchar("impact_direction", { length: 20 }), // 影响方向: positive/negative/neutral
    impactLevel: varchar("impact_level", { length: 20 }), // 影响级别: high/medium/low
    affectedReits: jsonb("affected_reits"), // 受影响的REITs列表
    keyPoints: jsonb("key_points"), // 关键要点
    summary: text("summary"), // 摘要
    authorityLevel: integer("authority_level"), // 权威度评分 0-100
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reits_policies_title_idx").on(table.title),
    index("reits_policies_source_idx").on(table.source),
    index("reits_policies_publish_date_idx").on(table.publishDate),
    index("reits_policies_impact_score_idx").on(table.impactScore),
  ]
);

// ============================================
// REITs News Table
// ============================================
export const reitsNews = pgTable(
  "reits_news",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 500 }).notNull(), // 新闻标题
    content: text("content"), // 新闻内容
    snippet: text("snippet"), // 摘要片段
    source: varchar("source", { length: 200 }), // 来源网站
    url: varchar("url", { length: 1000 }), // 原始URL
    publishTime: timestamp("publish_time", { withTimezone: true, mode: 'string' }), // 发布时间
    sentiment: varchar("sentiment", { length: 20 }), // 情感倾向: positive/negative/neutral
    sentimentScore: numeric("sentiment_score"), // 情感分数 -1到1
    confidence: numeric("confidence"), // 置信度 0-1
    keywords: jsonb("keywords"), // 关键词
    summary: text("summary"), // 摘要
    authorityLevel: integer("authority_level"), // 权威度评分 0-100
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reits_news_title_idx").on(table.title),
    index("reits_news_source_idx").on(table.source),
    index("reits_news_publish_time_idx").on(table.publishTime),
    index("reits_news_sentiment_idx").on(table.sentiment),
    index("reits_news_sentiment_score_idx").on(table.sentimentScore),
  ]
);

// ============================================
// REITs Announcement Table
// ============================================
export const reitsAnnouncements = pgTable(
  "reits_announcements",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    productId: varchar("product_id", { length: 36 }), // 关联的REITs产品ID
    productCode: varchar("product_code", { length: 20 }), // 关联的REITs产品代码
    title: varchar("title", { length: 500 }).notNull(), // 公告标题
    content: text("content"), // 公告内容
    announcementType: varchar("announcement_type", { length: 100 }), // 公告类型
    source: varchar("source", { length: 200 }), // 来源网站
    url: varchar("url", { length: 1000 }), // 原始URL
    publishDate: timestamp("publish_date", { withTimezone: true, mode: 'string' }), // 发布日期
    importance: varchar("importance", { length: 20 }), // 重要性: high/medium/low
    keyPoints: jsonb("key_points"), // 关键要点
    affectedItems: jsonb("affected_items"), // 受影响的项目
    summary: text("summary"), // 摘要
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reits_announcements_product_id_idx").on(table.productId),
    index("reits_announcements_product_code_idx").on(table.productCode),
    index("reits_announcements_type_idx").on(table.announcementType),
    index("reits_announcements_publish_date_idx").on(table.publishDate),
    index("reits_announcements_importance_idx").on(table.importance),
  ]
);

// ============================================
// REITs Valuation History Table
// ============================================
export const reitsValuationHistory = pgTable(
  "reits_valuation_history",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    productId: varchar("product_id", { length: 36 }).notNull(), // 关联的REITs产品ID
    productCode: varchar("product_code", { length: 20 }).notNull(), // 关联的REITs产品代码
    valuationDate: timestamp("valuation_date", { withTimezone: true, mode: 'string' }).notNull(), // 估值日期
    nav: numeric("nav"), // 单位净值
    navChange: numeric("nav_change"), // 净值变动
    navChangePercent: numeric("nav_change_percent"), // 净值变动百分比
    price: numeric("price"), // 价格
    priceChange: numeric("price_change"), // 价格变动
    priceChangePercent: numeric("price_change_percent"), // 价格变动百分比
    volume: numeric("volume"), // 成交量
    turnover: numeric("turnover"), // 成交额
    totalMarketValue: numeric("total_market_value"), // 总市值
    aiPredictedNav: numeric("ai_predicted_nav"), // AI预测净值
    aiPredictedPrice: numeric("ai_predicted_price"), // AI预测价格
    modelVersion: varchar("model_version", { length: 50 }), // 模型版本
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reits_valuation_history_product_id_idx").on(table.productId),
    index("reits_valuation_history_product_code_idx").on(table.productCode),
    index("reits_valuation_history_date_idx").on(table.valuationDate),
  ]
);

// ============================================
// REITs Model Training Table
// ============================================
export const reitsModelTraining = pgTable(
  "reits_model_training",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    modelType: varchar("model_type", { length: 50 }).notNull(), // 模型类型: valuation/policy_impact/news_sentiment/risk_assessment
    modelVersion: varchar("model_version", { length: 50 }), // 模型版本
    architecture: varchar("architecture", { length: 50 }), // 架构: dense/lstm/gru/cnn/transformer
    trainingStartTime: timestamp("training_start_time", { withTimezone: true, mode: 'string' }).notNull(), // 训练开始时间
    trainingEndTime: timestamp("training_end_time", { withTimezone: true, mode: 'string' }), // 训练结束时间
    epochs: integer("epochs").notNull(), // 训练轮数
    batchSize: integer("batch_size").notNull(), // 批次大小
    initialLoss: numeric("initial_loss"), // 初始Loss
    finalLoss: numeric("final_loss"), // 最终Loss
    finalAccuracy: numeric("final_accuracy"), // 最终准确率
    validationLoss: numeric("validation_loss"), // 验证Loss
    validationAccuracy: numeric("validation_accuracy"), // 验证准确率
    stoppedEarly: boolean("stopped_early").default(false), // 是否早停
    bestEpoch: integer("best_epoch"), // 最佳轮次
    dataCount: integer("data_count"), // 数据量
    trainingTime: integer("training_time"), // 训练耗时（毫秒）
    modelPath: varchar("model_path", { length: 500 }), // 模型保存路径
    hyperparameters: jsonb("hyperparameters"), // 超参数
    evaluationMetrics: jsonb("evaluation_metrics"), // 评估指标
    trainingHistory: jsonb("training_history"), // 训练历史
    status: varchar("status", { length: 20 }).default("completed"), // 状态: completed/failed/running
    errorMessage: text("error_message"), // 错误信息
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reits_model_training_type_idx").on(table.modelType),
    index("reits_model_training_version_idx").on(table.modelVersion),
    index("reits_model_training_status_idx").on(table.status),
    index("reits_model_training_start_time_idx").on(table.trainingStartTime),
  ]
);

// ============================================
// REITs Evolution Task Table
// ============================================
export const reitsEvolutionTasks = pgTable(
  "reits_evolution_tasks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    taskType: varchar("task_type", { length: 50 }).notNull(), // 任务类型: valuation/policy_impact/news_sentiment/risk_assessment
    dataCount: integer("data_count"), // 数据采集数量
    analysisCount: integer("analysis_count"), // 分析数量
    trainingResult: jsonb("training_result"), // 训练结果
    evaluationResult: jsonb("evaluation_result"), // 评估结果
    success: boolean("success").default(false), // 是否成功
    errorMessage: text("error_message"), // 错误信息
    scheduledTime: timestamp("scheduled_time", { withTimezone: true, mode: 'string' }), // 计划执行时间
    startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }), // 开始时间
    endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }), // 结束时间
    duration: integer("duration"), // 执行耗时（毫秒）
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reits_evolution_tasks_type_idx").on(table.taskType),
    index("reits_evolution_tasks_scheduled_time_idx").on(table.scheduledTime),
    index("reits_evolution_tasks_success_idx").on(table.success),
  ]
);
