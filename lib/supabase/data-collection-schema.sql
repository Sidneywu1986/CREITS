-- ============================================
-- 数据采集管道 - 四类数据资产采集表
-- 第一阶段：基建准备
-- ============================================

-- ============================================
-- 1. 已上市REITs基础信息表
-- ============================================
CREATE TABLE IF NOT EXISTS collected_reits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 基础信息
  reit_code VARCHAR(20) UNIQUE NOT NULL,  -- REITs代码，如"180101"
  reit_name VARCHAR(100) NOT NULL,        -- REITs名称
  exchange VARCHAR(20) NOT NULL,          -- 交易所：'SZSE'(深交所) | 'SSE'(上交所)
  listing_date DATE NOT NULL,             -- 上市日期
  -- 基金信息
  fund_manager VARCHAR(100),              -- 基金管理人
  fund_custodian VARCHAR(100),            -- 基金托管人
  total_shares DECIMAL(20,2),             -- 总份额（亿份）
  -- 资产信息
  asset_type VARCHAR(50),                 -- 资产类型：'infrastructure'(基础设施) | 'REITs'(不动产) | 'park'(产业园)
  underlying_asset TEXT,                  -- 底层资产描述
  property_count INTEGER,                 -- 物业数量
  -- 采集信息
  source_url TEXT,                        -- 数据来源URL
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 数据质量标识
  is_valid BOOLEAN NOT NULL DEFAULT true,
  validation_errors JSONB                 -- 验证错误信息
);

-- REITs采集历史表
CREATE TABLE IF NOT EXISTS collected_reits_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reit_id UUID NOT NULL REFERENCES collected_reits(id) ON DELETE CASCADE,
  data_snapshot JSONB NOT NULL,           -- 数据快照
  change_type VARCHAR(20) NOT NULL,       -- 变化类型：'created' | 'updated' | 'deleted'
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 政策文件表
-- ============================================
CREATE TABLE IF NOT EXISTS collected_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 基础信息
  policy_number VARCHAR(50) UNIQUE,       -- 政策文号，如"发改投资〔2021〕958号"
  policy_title VARCHAR(200) NOT NULL,     -- 政策标题
  publishing_body VARCHAR(100) NOT NULL,  -- 发布机构：'NDRC'(发改委) | 'CSRC'(证监会) | 'MOF'(财政部)
  policy_type VARCHAR(50) NOT NULL,       -- 政策类型：'law'(法律) | 'regulation'(法规) | 'notice'(通知) | 'guideline'(指引)
  publish_date DATE NOT NULL,             -- 发布日期
  effective_date DATE,                    -- 生效日期
  expiry_date DATE,                       -- 失效日期
  -- 政策内容
  content TEXT,                           -- 政策全文
  summary TEXT,                           -- 政策摘要
  keywords TEXT[],                        -- 关键词数组
  -- 影响分析
  related_reits TEXT[],                   -- 受影响的REITs代码
  impact_level VARCHAR(20),               -- 影响级别：'high' | 'medium' | 'low'
  impact_description TEXT,                -- 影响描述
  -- 采集信息
  source_url TEXT NOT NULL,               -- 数据来源URL
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 数据质量标识
  is_valid BOOLEAN NOT NULL DEFAULT true,
  validation_errors JSONB
);

-- ============================================
-- 3. 新闻数据表
-- ============================================
CREATE TABLE IF NOT EXISTS collected_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 基础信息
  title VARCHAR(300) NOT NULL,            -- 新闻标题
  author VARCHAR(100),                    -- 作者
  source VARCHAR(100) NOT NULL,           -- 新闻来源：'caixin'(财新) | 'yicai'(第一财经) | 'cnstock'(中国证券报)
  publish_time TIMESTAMP WITH TIME ZONE NOT NULL,  -- 发布时间
  url TEXT UNIQUE,                        -- 新闻URL（唯一标识）
  -- 新闻内容
  content TEXT,                           -- 新闻正文
  summary TEXT,                           -- 新闻摘要
  keywords TEXT[],                        -- 关键词数组
  -- 情感分析（预留字段）
  sentiment_score DECIMAL(3,2),           -- 情感分数：-1~1，负数负面，正数正面
  sentiment_label VARCHAR(20),            -- 情感标签：'positive' | 'neutral' | 'negative'
  -- REITs关联
  related_reits TEXT[],                   -- 相关REITs代码
  related_stocks TEXT[],                  -- 相关股票代码
  -- 采集信息
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 数据质量标识
  is_valid BOOLEAN NOT NULL DEFAULT true,
  validation_errors JSONB
);

-- ============================================
-- 4. 交易所公告表
-- ============================================
CREATE TABLE IF NOT EXISTS collected_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 基础信息
  announcement_code VARCHAR(50) UNIQUE,   -- 公告编号
  reit_code VARCHAR(20) NOT NULL,        -- REITs代码
  reit_name VARCHAR(100),                 -- REITs名称
  exchange VARCHAR(20) NOT NULL,          -- 交易所：'SZSE'(深交所) | 'SSE'(上交所)
  announcement_type VARCHAR(50) NOT NULL, -- 公告类型：'listing'(上市) | 'dividend'(分红) | 'mkt_status'(市场状态) | 'other'(其他)
  announcement_title VARCHAR(300) NOT NULL,  -- 公告标题
  publish_time TIMESTAMP WITH TIME ZONE NOT NULL,  -- 发布时间
  -- 公告内容
  content TEXT,                           -- 公告全文
  summary TEXT,                           -- 公告摘要
  attachments TEXT[],                     -- 附件URL数组
  -- 采集信息
  source_url TEXT NOT NULL,               -- 数据来源URL
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 数据质量标识
  is_valid BOOLEAN NOT NULL DEFAULT true,
  validation_errors JSONB
);

-- ============================================
-- 5. 数据采集配置表
-- ============================================
CREATE TABLE IF NOT EXISTS data_collection_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type VARCHAR(50) NOT NULL,         -- 数据类型：'reits' | 'policies' | 'news' | 'announcements'
  config_key VARCHAR(100) NOT NULL,       -- 配置键
  config_value JSONB NOT NULL,            -- 配置值（JSON格式）
  description TEXT,                       -- 配置说明
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(data_type, config_key)
);

-- ============================================
-- 6. 数据采集日志表
-- ============================================
CREATE TABLE IF NOT EXISTS data_collection_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type VARCHAR(50) NOT NULL,         -- 数据类型
  collection_type VARCHAR(50) NOT NULL,   -- 采集类型：'full'(全量) | 'incremental'(增量)
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL,            -- 状态：'running' | 'success' | 'failed'
  records_collected INTEGER DEFAULT 0,    -- 采集记录数
  records_updated INTEGER DEFAULT 0,      -- 更新记录数
  records_failed INTEGER DEFAULT 0,       -- 失败记录数
  error_message TEXT,                     -- 错误信息
  details JSONB,                          -- 详细信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. 数据质量监控表
-- ============================================
CREATE TABLE IF NOT EXISTS data_quality_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type VARCHAR(50) NOT NULL,         -- 数据类型
  metric_date DATE NOT NULL,              -- 指标日期
  total_records INTEGER NOT NULL,         -- 总记录数
  valid_records INTEGER NOT NULL,         -- 有效记录数
  invalid_records INTEGER DEFAULT 0,      -- 无效记录数
  duplicate_records INTEGER DEFAULT 0,    -- 重复记录数
  missing_values JSONB,                   -- 缺失值统计（字段名 -> 缺失数量）
  data_completeness DECIMAL(5,2),         -- 数据完整性百分比
  last_check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(data_type, metric_date)
);

-- ============================================
-- 创建索引
-- ============================================

-- collected_reits 索引
CREATE INDEX IF NOT EXISTS idx_collected_reits_code ON collected_reits(reit_code);
CREATE INDEX IF NOT EXISTS idx_collected_reits_exchange ON collected_reits(exchange);
CREATE INDEX IF NOT EXISTS idx_collected_reits_listing_date ON collected_reits(listing_date);
CREATE INDEX IF NOT EXISTS idx_collected_reits_collected_at ON collected_reits(collected_at);

-- collected_reits_history 索引
CREATE INDEX IF NOT EXISTS idx_collected_reits_history_reit ON collected_reits_history(reit_id);
CREATE INDEX IF NOT EXISTS idx_collected_reits_history_collected_at ON collected_reits_history(collected_at);

-- collected_policies 索引
CREATE INDEX IF NOT EXISTS idx_collected_policies_number ON collected_policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_collected_policies_body ON collected_policies(publishing_body);
CREATE INDEX IF NOT EXISTS idx_collected_policies_type ON collected_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_collected_policies_publish_date ON collected_policies(publish_date);
CREATE INDEX IF NOT EXISTS idx_collected_policies_keywords ON collected_policies USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_collected_policies_related_reits ON collected_policies USING GIN(related_reits);
CREATE INDEX IF NOT EXISTS idx_collected_policies_collected_at ON collected_policies(collected_at);

-- collected_news 索引
CREATE INDEX IF NOT EXISTS idx_collected_news_url ON collected_news(url);
CREATE INDEX IF NOT EXISTS idx_collected_news_source ON collected_news(source);
CREATE INDEX IF NOT EXISTS idx_collected_news_publish_time ON collected_news(publish_time);
CREATE INDEX IF NOT EXISTS idx_collected_news_keywords ON collected_news USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_collected_news_related_reits ON collected_news USING GIN(related_reits);
CREATE INDEX IF NOT EXISTS idx_collected_news_sentiment ON collected_news(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_collected_news_collected_at ON collected_news(collected_at);

-- collected_announcements 索引
CREATE INDEX IF NOT EXISTS idx_collected_announcements_code ON collected_announcements(announcement_code);
CREATE INDEX IF NOT EXISTS idx_collected_announcements_reit_code ON collected_announcements(reit_code);
CREATE INDEX IF NOT EXISTS idx_collected_announcements_exchange ON collected_announcements(exchange);
CREATE INDEX IF NOT EXISTS idx_collected_announcements_type ON collected_announcements(announcement_type);
CREATE INDEX IF NOT EXISTS idx_collected_announcements_publish_time ON collected_announcements(publish_time);
CREATE INDEX IF NOT EXISTS idx_collected_announcements_collected_at ON collected_announcements(collected_at);

-- data_collection_config 索引
CREATE INDEX IF NOT EXISTS idx_data_collection_config_type ON data_collection_config(data_type);

-- data_collection_logs 索引
CREATE INDEX IF NOT EXISTS idx_data_collection_logs_type ON data_collection_logs(data_type);
CREATE INDEX IF NOT EXISTS idx_data_collection_logs_status ON data_collection_logs(status);
CREATE INDEX IF NOT EXISTS idx_data_collection_logs_created_at ON data_collection_logs(created_at);

-- data_quality_metrics 索引
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_type ON data_quality_metrics(data_type);
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_date ON data_quality_metrics(metric_date);

-- ============================================
-- 插入默认配置
-- ============================================

-- REITs采集配置
INSERT INTO data_collection_config (data_type, config_key, config_value, description)
VALUES
  ('reits', 'sources', '["SZSE", "SSE"]', 'REITs数据源：深交所、上交所'),
  ('reits', 'collection_interval', '86400', '采集间隔（秒）：86400 = 1天'),
  ('reits', 'target_count', 58, '目标采集数量：58只'),
  ('reits', 'base_urls', '{"SZSE": "https://www.szse.cn/api/reit", "SSE": "https://www.sse.com.cn/api/reit"}', '基础URL配置')
ON CONFLICT (data_type, config_key) DO NOTHING;

-- 政策采集配置
INSERT INTO data_collection_config (data_type, config_key, config_value, description)
VALUES
  ('policies', 'sources', '["NDRC", "CSRC"]', '政策数据源：发改委、证监会'),
  ('policies', 'collection_interval', '86400', '采集间隔（秒）：86400 = 1天'),
  ('policies', 'target_count', 200, '目标采集数量：200+份'),
  ('policies', 'start_year', 2015, '起始年份：2015年'),
  ('policies', 'base_urls', '{"NDRC": "https://www.ndrc.gov.cn", "CSRC": "https://www.csrc.gov.cn"}', '基础URL配置')
ON CONFLICT (data_type, config_key) DO NOTHING;

-- 新闻采集配置
INSERT INTO data_collection_config (data_type, config_key, config_value, description)
VALUES
  ('news', 'sources', '["caixin", "yicai", "cnstock"]', '新闻数据源：财新、第一财经、中国证券报'),
  ('news', 'collection_interval', '3600', '采集间隔（秒）：3600 = 1小时'),
  ('news', 'daily_target', 1400, '每日目标采集数量：1400条'),
  ('news', 'api_rate_limit', 100, 'API限流：100次/分钟'),
  ('news', 'historical_days', 365, '历史回填天数：365天')
ON CONFLICT (data_type, config_key) DO NOTHING;

-- 公告采集配置
INSERT INTO data_collection_config (data_type, config_key, config_value, description)
VALUES
  ('announcements', 'sources', '["SZSE", "SSE"]', '公告数据源：深交所、上交所'),
  ('announcements', 'collection_interval', '3600', '采集间隔（秒）：3600 = 1小时'),
  ('announcements', 'base_urls', '{"SZSE": "https://www.szse.cn/api/disclosure", "SSE": "https://www.sse.com.cn/api/disclosure"}', '基础URL配置')
ON CONFLICT (data_type, config_key) DO NOTHING;
