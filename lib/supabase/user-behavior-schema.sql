-- ============================================
-- 用户行为追踪 - 数据脱敏存储表
-- 第一阶段：基建准备
-- ============================================

-- ============================================
-- 1. 用户页面访问记录表（脱敏）
-- ============================================
CREATE TABLE IF NOT EXISTS user_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 脱敏用户标识（Hash值，无法反向解密）
  user_hash VARCHAR(64) NOT NULL,           -- 用户ID的SHA-256 Hash
  -- 会话信息
  session_id VARCHAR(100) NOT NULL,         -- 会话ID
  -- 页面信息
  page_path VARCHAR(500) NOT NULL,          -- 页面路径
  page_title VARCHAR(200),                  -- 页面标题
  referrer VARCHAR(500),                    -- 来源页面
  -- 时间信息
  page_view_start TIMESTAMP WITH TIME ZONE NOT NULL,
  page_view_end TIMESTAMP WITH TIME ZONE,    -- 页面离开时间
  duration_seconds INTEGER,                 -- 停留时长（秒）
  -- 设备信息（脱敏）
  device_type VARCHAR(50),                  -- 设备类型：'desktop' | 'mobile' | 'tablet'
  browser_family VARCHAR(50),               -- 浏览器家族
  os_family VARCHAR(50),                    -- 操作系统家族
  -- 位置信息（聚合，仅到城市级别）
  country VARCHAR(50),                      -- 国家
  city VARCHAR(50),                         -- 城市
  -- 附加信息（脱敏后的业务数据）
  page_data JSONB,                          -- 页面相关数据（已脱敏）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 用户搜索行为记录表（脱敏）
-- ============================================
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 脱敏用户标识
  user_hash VARCHAR(64) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  -- 搜索信息
  search_query TEXT,                        -- 搜索词（脱敏，敏感词已过滤）
  search_type VARCHAR(50),                  -- 搜索类型：'reits' | 'policies' | 'news' | 'general'
  search_filters JSONB,                     -- 搜索过滤器（已脱敏）
  -- 结果信息
  result_count INTEGER,                     -- 搜索结果数量
  clicked_result_id UUID,                   -- 点击结果的ID（如果有）
  -- 时间信息
  search_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  -- 搜索上下文
  search_context JSONB,                     -- 搜索上下文（页面路径等）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 用户导出行为记录表（脱敏）
-- ============================================
CREATE TABLE IF NOT EXISTS user_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 脱敏用户标识
  user_hash VARCHAR(64) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  -- 导出信息
  export_type VARCHAR(50) NOT NULL,         -- 导出类型：'pdf' | 'excel' | 'json'
  export_scope VARCHAR(100),                -- 导出范围：'single' | 'batch' | 'all'
  export_source VARCHAR(100),               -- 导出来源：'reits' | 'policies' | 'news' | 'reports'
  export_filters JSONB,                     -- 导出过滤器（已脱敏）
  -- 结果信息
  record_count INTEGER,                     -- 导出记录数
  file_size_bytes BIGINT,                   -- 文件大小（字节）
  export_status VARCHAR(20) NOT NULL,       -- 导出状态：'success' | 'failed' | 'partial'
  error_message TEXT,                       -- 错误信息
  -- 时间信息
  export_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. 用户Agent交互行为记录表（脱敏）
-- ============================================
CREATE TABLE IF NOT EXISTS user_agent_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 脱敏用户标识
  user_hash VARCHAR(64) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  -- Agent信息（脱敏）
  agent_type VARCHAR(50) NOT NULL,          -- Agent类型：'valuation' | 'policy' | 'news' | 'risk'
  agent_id VARCHAR(50),                     -- Agent ID
  -- 交互信息
  interaction_type VARCHAR(50) NOT NULL,    -- 交互类型：'chat' | 'generate_report' | 'analyze' | 'export'
  interaction_input TEXT,                   -- 用户输入（脱敏）
  interaction_output TEXT,                  -- Agent输出（脱敏，仅保留摘要）
  interaction_tokens INTEGER,               -- Token使用量
  interaction_duration_seconds INTEGER,     -- 交互时长（秒）
  -- 结果信息
  interaction_status VARCHAR(20) NOT NULL,  -- 交互状态：'success' | 'failed' | 'timeout'
  user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),  -- 用户反馈（1-5分）
  -- 时间信息
  interaction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. 用户行为聚合统计表（隐私保护）
-- ============================================
CREATE TABLE IF NOT EXISTS user_behavior_aggregated (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 聚合维度
  aggregation_date DATE NOT NULL,           -- 聚合日期
  aggregation_type VARCHAR(50) NOT NULL,    -- 聚合类型：'daily' | 'weekly' | 'monthly'
  -- 统计指标
  total_page_views BIGINT NOT NULL,         -- 总页面浏览量
  total_users INTEGER NOT NULL,             -- 总用户数（脱敏）
  average_session_duration DECIMAL(10,2),   -- 平均会话时长（秒）
  top_pages JSONB,                          -- 热门页面TOP 10
  top_searches JSONB,                       -- 热门搜索TOP 10
  total_exports BIGINT NOT NULL,            -- 总导出次数
  total_agent_interactions BIGINT NOT NULL, -- 总Agent交互次数
  -- 性能指标
  avg_page_load_time DECIMAL(10,2),        -- 平均页面加载时间（毫秒）
  error_rate DECIMAL(5,2),                  -- 错误率（百分比）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aggregation_date, aggregation_type)
);

-- ============================================
-- 6. 用户行为隐私配置表
-- ============================================
CREATE TABLE IF NOT EXISTS user_behavior_privacy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_hash VARCHAR(64) UNIQUE NOT NULL,    -- 脱敏用户标识
  -- 隐私设置
  tracking_enabled BOOLEAN NOT NULL DEFAULT true,  -- 是否允许追踪
  data_retention_days INTEGER NOT NULL DEFAULT 90,  -- 数据保留天数
  -- 细粒度控制
  allow_page_view_tracking BOOLEAN NOT NULL DEFAULT true,
  allow_search_tracking BOOLEAN NOT NULL DEFAULT true,
  allow_export_tracking BOOLEAN NOT NULL DEFAULT true,
  allow_agent_tracking BOOLEAN NOT NULL DEFAULT true,
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 创建索引
-- ============================================

-- user_page_views 索引
CREATE INDEX IF NOT EXISTS idx_user_page_views_user_hash ON user_page_views(user_hash);
CREATE INDEX IF NOT EXISTS idx_user_page_views_session_id ON user_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_user_page_views_start_time ON user_page_views(page_view_start);
CREATE INDEX IF NOT EXISTS idx_user_page_views_page_path ON user_page_views(page_path);

-- user_searches 索引
CREATE INDEX IF NOT EXISTS idx_user_searches_user_hash ON user_searches(user_hash);
CREATE INDEX IF NOT EXISTS idx_user_searches_session_id ON user_searches(session_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_timestamp ON user_searches(search_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_searches_type ON user_searches(search_type);

-- user_exports 索引
CREATE INDEX IF NOT EXISTS idx_user_exports_user_hash ON user_exports(user_hash);
CREATE INDEX IF NOT EXISTS idx_user_exports_session_id ON user_exports(session_id);
CREATE INDEX IF NOT EXISTS idx_user_exports_timestamp ON user_exports(export_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_exports_type ON user_exports(export_type);

-- user_agent_interactions 索引
CREATE INDEX IF NOT EXISTS idx_user_agent_interactions_user_hash ON user_agent_interactions(user_hash);
CREATE INDEX IF NOT EXISTS idx_user_agent_interactions_session_id ON user_agent_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_interactions_timestamp ON user_agent_interactions(interaction_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_agent_interactions_agent_type ON user_agent_interactions(agent_type);

-- user_behavior_aggregated 索引
CREATE INDEX IF NOT EXISTS idx_user_behavior_aggregated_date ON user_behavior_aggregated(aggregation_date);
CREATE INDEX IF NOT EXISTS idx_user_behavior_aggregated_type ON user_behavior_aggregated(aggregation_type);

-- user_behavior_privacy 索引
CREATE INDEX IF NOT EXISTS idx_user_behavior_privacy_user_hash ON user_behavior_privacy(user_hash);

-- ============================================
-- 数据清理函数（自动删除过期数据）
-- ============================================

-- 创建数据清理函数
CREATE OR REPLACE FUNCTION cleanup_old_behavior_data()
RETURNS void AS $$
BEGIN
  -- 删除过期的页面访问记录
  DELETE FROM user_page_views
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- 删除过期的搜索记录
  DELETE FROM user_searches
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- 删除过期的导出记录
  DELETE FROM user_exports
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- 删除过期的Agent交互记录
  DELETE FROM user_agent_interactions
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（每天凌晨2点执行）
-- 注意：需要在PostgreSQL中启用pg_cron扩展
-- SELECT cron.schedule('cleanup-behavior-data', '0 2 * * *', 'SELECT cleanup_old_behavior_data()');
