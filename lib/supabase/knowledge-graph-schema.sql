-- ============================================
-- 知识图谱 - 节点与关系表
-- 第二阶段：知识图谱
-- ============================================

-- ============================================
-- 1. 图谱节点表
-- ============================================
CREATE TABLE IF NOT EXISTS graph_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 节点基础信息
  node_type VARCHAR(50) NOT NULL,          -- 节点类型：'reit' | 'policy' | 'event' | 'asset' | 'fund'
  node_name VARCHAR(200) NOT NULL,        -- 节点名称
  node_code VARCHAR(50) UNIQUE,           -- 节点代码（用于唯一标识）
  -- 节点属性（JSON格式，根据节点类型不同而不同）
  properties JSONB NOT NULL,               -- 节点属性
  -- 节点元数据
  source_table VARCHAR(100),               -- 来源表
  source_id UUID,                         -- 来源ID
  -- 关联强度统计
  connection_count INTEGER DEFAULT 0,     -- 连接数
  importance_score DECIMAL(5,2) DEFAULT 0,  -- 重要性评分（0-100）
  -- 时间信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 图谱关系表
-- ============================================
CREATE TABLE IF NOT EXISTS graph_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 关系基础信息
  source_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  edge_type VARCHAR(50) NOT NULL,          -- 关系类型：'affects' | 'related_to' | 'contains' | 'managed_by'
  -- 关系属性
  properties JSONB,                        -- 关系属性
  -- 关系强度
  strength DECIMAL(5,2) DEFAULT 0,        -- 关系强度（0-1）
  confidence DECIMAL(5,2) DEFAULT 0,      -- 置信度（0-1）
  -- 关系来源
  source_type VARCHAR(50),                -- 来源类型：'policy' | 'news' | 'manual'
  source_id UUID,                         -- 来源ID
  -- 时间信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_node_id, target_node_id, edge_type)
);

-- ============================================
-- 3. REITs节点属性表
-- ============================================
CREATE TABLE IF NOT EXISTS node_reits (
  node_id UUID PRIMARY KEY REFERENCES graph_nodes(id) ON DELETE CASCADE,
  -- REITs基础信息
  reit_code VARCHAR(20) UNIQUE NOT NULL,
  reit_name VARCHAR(100) NOT NULL,
  exchange VARCHAR(20) NOT NULL,
  listing_date DATE NOT NULL,
  -- 基金信息
  fund_manager VARCHAR(100),
  fund_custodian VARCHAR(100),
  total_shares DECIMAL(20,2),
  -- 资产信息
  asset_type VARCHAR(50),
  underlying_asset TEXT,
  property_count INTEGER,
  -- 市场表现
  current_price DECIMAL(10,2),
  market_cap DECIMAL(20,2),
  daily_change DECIMAL(5,2),
  -- 八张表关联
  has_financial_data BOOLEAN DEFAULT false,
  has_asset_data BOOLEAN DEFAULT false,
  has_income_data BOOLEAN DEFAULT false,
  -- 更新时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. 政策节点属性表
-- ============================================
CREATE TABLE IF NOT EXISTS node_policies (
  node_id UUID PRIMARY KEY REFERENCES graph_nodes(id) ON DELETE CASCADE,
  -- 政策基础信息
  policy_number VARCHAR(50) UNIQUE,
  policy_title VARCHAR(200) NOT NULL,
  publishing_body VARCHAR(100) NOT NULL,
  policy_type VARCHAR(50) NOT NULL,
  publish_date DATE NOT NULL,
  effective_date DATE,
  expiry_date DATE,
  -- 政策内容
  content TEXT,
  summary TEXT,
  keywords TEXT[],
  -- 影响分析
  impact_level VARCHAR(20),
  impact_description TEXT,
  related_reits TEXT[],
  -- 更新时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. 事件节点属性表
-- ============================================
CREATE TABLE IF NOT EXISTS node_events (
  node_id UUID PRIMARY KEY REFERENCES graph_nodes(id) ON DELETE CASCADE,
  -- 事件基础信息
  event_type VARCHAR(50) NOT NULL,         -- 事件类型：'news' | 'announcement' | 'market_event'
  event_title VARCHAR(300) NOT NULL,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  event_source VARCHAR(100) NOT NULL,     -- 事件来源：'caixin' | 'yicai' | 'szse' | 'sse'
  -- 事件内容
  content TEXT,
  summary TEXT,
  -- 影响分析
  sentiment_score DECIMAL(3,2),
  sentiment_label VARCHAR(20),
  affected_reits TEXT[],
  -- 更新时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. 资产节点属性表
-- ============================================
CREATE TABLE IF NOT EXISTS node_assets (
  node_id UUID PRIMARY KEY REFERENCES graph_nodes(id) ON DELETE CASCADE,
  -- 资产基础信息
  asset_name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,        -- 资产类型：'infrastructure' | 'real_estate' | 'park'
  location VARCHAR(200),                  -- 地理位置
  -- 资产属性
  area DECIMAL(20,2),                     -- 面积（平方米）
  valuation DECIMAL(20,2),                -- 估值（万元）
  -- 关联REITs
  owned_by_reits TEXT[],                  -- 所属REITs列表
  -- 更新时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. 基金公司节点属性表
-- ============================================
CREATE TABLE IF NOT EXISTS node_funds (
  node_id UUID PRIMARY KEY REFERENCES graph_nodes(id) ON DELETE CASCADE,
  -- 基金公司信息
  fund_name VARCHAR(200) NOT NULL,
  fund_code VARCHAR(20) UNIQUE,
  fund_type VARCHAR(50),                  -- 基金类型：'公募基金' | '私募基金'
  -- 管理信息
  managed_reits TEXT[],                   -- 管理的REITs列表
  total_reits_count INTEGER DEFAULT 0,    -- 管理的REITs数量
  -- 更新时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. 图谱路径表（用于关系查询）
-- ============================================
CREATE TABLE IF NOT EXISTS graph_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_type VARCHAR(50) NOT NULL,         -- 路径类型：'shortest' | 'all' | 'weighted'
  start_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  end_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  -- 路径信息
  path_nodes TEXT[] NOT NULL,              -- 路径节点ID数组
  path_edges TEXT[] NOT NULL,              -- 路径关系ID数组
  path_length INTEGER NOT NULL,            -- 路径长度（节点数）
  path_weight DECIMAL(10,2),              -- 路径权重
  -- 路径属性
  is_bidirectional BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. 图谱查询缓存表
-- ============================================
CREATE TABLE IF NOT EXISTS graph_query_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash VARCHAR(64) UNIQUE NOT NULL,  -- 查询哈希
  query_text TEXT NOT NULL,               -- 查询文本
  query_type VARCHAR(50) NOT NULL,        -- 查询类型：'nlp' | 'relation' | 'path'
  -- 查询结果
  result JSONB NOT NULL,                  -- 查询结果（JSON格式）
  result_count INTEGER DEFAULT 0,        -- 结果数量
  -- 缓存信息
  hit_count INTEGER DEFAULT 0,            -- 命中次数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================
-- 创建索引
-- ============================================

-- graph_nodes 索引
CREATE INDEX IF NOT EXISTS idx_graph_nodes_type ON graph_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_code ON graph_nodes(node_code);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_importance ON graph_nodes(importance_score DESC);

-- graph_edges 索引
CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_type ON graph_edges(edge_type);
CREATE INDEX IF NOT EXISTS idx_graph_edges_strength ON graph_edges(strength DESC);
CREATE INDEX IF NOT EXISTS idx_graph_edges_composite ON graph_edges(source_node_id, target_node_id);

-- node_reits 索引
CREATE INDEX IF NOT EXISTS idx_node_reits_code ON node_reits(reit_code);
CREATE INDEX IF NOT EXISTS idx_node_reits_exchange ON node_reits(exchange);
CREATE INDEX IF NOT EXISTS idx_node_reits_asset_type ON node_reits(asset_type);

-- node_policies 索引
CREATE INDEX IF NOT EXISTS idx_node_policies_number ON node_policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_node_policies_body ON node_policies(publishing_body);
CREATE INDEX IF NOT EXISTS idx_node_policies_publish_date ON node_policies(publish_date);
CREATE INDEX IF NOT EXISTS idx_node_policies_keywords ON node_policies USING GIN(keywords);

-- node_events 索引
CREATE INDEX IF NOT EXISTS idx_node_events_type ON node_events(event_type);
CREATE INDEX IF NOT EXISTS idx_node_events_time ON node_events(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_node_events_affected_reits ON node_events USING GIN(affected_reits);

-- node_assets 索引
CREATE INDEX IF NOT EXISTS idx_node_assets_type ON node_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_node_assets_location ON node_assets(location);

-- node_funds 索引
CREATE INDEX IF NOT EXISTS idx_node_funds_name ON node_funds(fund_name);
CREATE INDEX IF NOT EXISTS idx_node_funds_code ON node_funds(fund_code);

-- graph_paths 索引
CREATE INDEX IF NOT EXISTS idx_graph_paths_start ON graph_paths(start_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_paths_end ON graph_paths(end_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_paths_type ON graph_paths(path_type);

-- graph_query_cache 索引
CREATE INDEX IF NOT EXISTS idx_graph_query_cache_hash ON graph_query_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_graph_query_cache_type ON graph_query_cache(query_type);
CREATE INDEX IF NOT EXISTS idx_graph_query_cache_expires ON graph_query_cache(expires_at);
