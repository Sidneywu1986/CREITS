-- ============================================
-- 智能进化闭环 - 数据库表结构
-- 第三阶段：智能进化
-- ============================================

-- ============================================
-- 1. Agent预测记录表
-- ============================================
CREATE TABLE IF NOT EXISTS agent_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Agent信息
  agent_type VARCHAR(50) NOT NULL,         -- Agent类型：'valuation' | 'policy' | 'news' | 'risk'
  agent_id VARCHAR(50),                   -- Agent ID
  -- 预测信息
  prediction_type VARCHAR(50) NOT NULL,    -- 预测类型：'price' | 'yield' | 'risk_level' | 'impact'
  target_reit_code VARCHAR(20),           -- 目标REITs代码
  target_date DATE,                       -- 目标日期
  -- 预测结果
  predicted_value DECIMAL(20,2),          -- 预测值
  predicted_range JSONB,                  -- 预测范围（最小值、最大值）
  confidence DECIMAL(5,2),                -- 置信度（0-1）
  model_version VARCHAR(50) NOT NULL,     -- 模型版本
  -- 实际结果
  actual_value DECIMAL(20,2),             -- 实际值（预测后更新）
  actual_range JSONB,                     -- 实际范围
  -- 评估指标
  accuracy_score DECIMAL(5,2),            -- 准确度（0-1）
  error_magnitude DECIMAL(20,2),          -- 误差幅度
  is_accurate BOOLEAN,                    -- 是否准确（误差在可接受范围内）
  -- 预测输入
  input_features JSONB,                   -- 输入特征（政策影响、新闻情感等）
  -- 元数据
  user_hash VARCHAR(64),                  -- 用户Hash（脱敏）
  session_id VARCHAR(100),                -- 会话ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualized_at TIMESTAMP WITH TIME ZONE  -- 实际值更新时间
);

-- ============================================
-- 2. 模型版本管理表
-- ============================================
CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 模型信息
  model_name VARCHAR(100) NOT NULL,       -- 模型名称
  model_type VARCHAR(50) NOT NULL,        -- 模型类型：'valuation' | 'policy' | 'news' | 'risk'
  version VARCHAR(50) UNIQUE NOT NULL,    -- 版本号（如'v1.0.0'）
  -- 模型配置
  model_config JSONB NOT NULL,            -- 模型配置（超参数等）
  agent_weights JSONB NOT NULL,           -- Agent权重配置
  feature_importance JSONB,               -- 特征重要性
  -- 训练信息
  training_data_from TIMESTAMP WITH TIME ZONE,  -- 训练数据起始时间
  training_data_to TIMESTAMP WITH TIME ZONE,    -- 训练数据结束时间
  training_samples INTEGER,              -- 训练样本数
  -- 性能指标
  accuracy DECIMAL(5,2),                  -- 准确率
  precision DECIMAL(5,2),                 -- 精确率
  recall DECIMAL(5,2),                    -- 召回率
  f1_score DECIMAL(5,2),                 -- F1分数
  mse DECIMAL(20,2),                     -- 均方误差
  rmse DECIMAL(20,2),                    -- 均方根误差
  -- 版本状态
  status VARCHAR(20) NOT NULL DEFAULT 'training',  -- 状态：'training' | 'active' | 'deprecated'
  is_active BOOLEAN NOT NULL DEFAULT false,       -- 是否为活跃版本
  is_deprecated BOOLEAN NOT NULL DEFAULT false,  -- 是否已废弃
  -- 元数据
  training_log_id UUID,                  -- 训练日志ID
  created_by VARCHAR(100),               -- 创建者
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,  -- 激活时间
  deactivated_at TIMESTAMP WITH TIME ZONE  -- 停用时间
);

-- ============================================
-- 3. 训练日志表
-- ============================================
CREATE TABLE IF NOT EXISTS training_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 训练信息
  model_name VARCHAR(100) NOT NULL,
  model_type VARCHAR(50) NOT NULL,
  target_version VARCHAR(50) NOT NULL,    -- 目标版本号
  -- 训练配置
  training_type VARCHAR(50) NOT NULL,    -- 训练类型：'full' | 'incremental' | 'fine_tune'
  training_config JSONB NOT NULL,         -- 训练配置
  -- 训练数据
  data_from TIMESTAMP WITH TIME ZONE,
  data_to TIMESTAMP WITH TIME ZONE,
  samples_count INTEGER NOT NULL,
  features_count INTEGER NOT NULL,
  -- 训练过程
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  status VARCHAR(20) NOT NULL,           -- 状态：'running' | 'success' | 'failed'
  -- 训练结果
  final_accuracy DECIMAL(5,2),
  final_loss DECIMAL(20,2),
  best_epoch INTEGER,
  total_epochs INTEGER,
  early_stopped BOOLEAN,
  -- 错误信息
  error_message TEXT,
  error_stack TEXT,
  -- 额外信息
  metrics JSONB,                         -- 其他训练指标
  hyperparameters JSONB,                 -- 超参数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Agent权重配置表
-- ============================================
CREATE TABLE IF NOT EXISTS agent_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Agent信息
  agent_type VARCHAR(50) NOT NULL,
  agent_id VARCHAR(50),
  -- 权重配置
  weight_name VARCHAR(100) NOT NULL,     -- 权重名称：'policy_impact' | 'news_sentiment' | 'market_trend'
  weight_value DECIMAL(10,4) NOT NULL,   -- 权重值
  weight_description TEXT,               -- 权重描述
  -- 权重来源
  source_type VARCHAR(50),               -- 来源类型：'manual' | 'auto' | 'learned'
  source_data_id UUID,                   -- 来源数据ID
  -- 元数据
  model_version VARCHAR(50),             -- 关联的模型版本
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. 特征重要性表
-- ============================================
CREATE TABLE IF NOT EXISTS feature_importance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 模型信息
  model_version VARCHAR(50) NOT NULL,
  model_type VARCHAR(50) NOT NULL,
  -- 特征信息
  feature_name VARCHAR(100) NOT NULL,
  feature_category VARCHAR(50),          -- 特征类别：'policy' | 'news' | 'market' | 'fundamental'
  importance_score DECIMAL(10,4) NOT NULL,  -- 重要性分数（0-1）
  importance_rank INTEGER,               -- 重要性排名
  -- 统计信息
  mean_impact DECIMAL(20,2),             -- 平均影响
  std_impact DECIMAL(20,2),              -- 标准差
  -- 元数据
  calculation_method VARCHAR(50),        -- 计算方法：'permutation' | 'shap' | 'gain'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. 性能监控表
-- ============================================
CREATE TABLE IF NOT EXISTS model_performance_monitor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 监控信息
  model_version VARCHAR(50) NOT NULL,
  model_type VARCHAR(50) NOT NULL,
  monitor_date DATE NOT NULL,
  -- 性能指标
  total_predictions INTEGER NOT NULL,
  accurate_predictions INTEGER NOT NULL,
  accuracy_rate DECIMAL(5,2) NOT NULL,   -- 准确率
  avg_error DECIMAL(20,2),              -- 平均误差
  max_error DECIMAL(20,2),              -- 最大误差
  min_error DECIMAL(20,2),              -- 最小误差
  -- 置信度分析
  high_confidence_predictions INTEGER,  -- 高置信度预测数
  high_confidence_accuracy DECIMAL(5,2),-- 高置信度准确率
  -- 性能趋势
  performance_trend VARCHAR(20),        -- 性能趋势：'improving' | 'stable' | 'degrading'
  drift_detected BOOLEAN NOT NULL DEFAULT false,  -- 是否检测到性能漂移
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(model_version, monitor_date)
);

-- ============================================
-- 创建索引
-- ============================================

-- agent_predictions 索引
CREATE INDEX IF NOT EXISTS idx_agent_predictions_agent ON agent_predictions(agent_type, agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_predictions_target ON agent_predictions(target_reit_code, target_date);
CREATE INDEX IF NOT EXISTS idx_agent_predictions_model ON agent_predictions(model_version);
CREATE INDEX IF NOT EXISTS idx_agent_predictions_created ON agent_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_predictions_actualized ON agent_predictions(actualized_at);

-- model_versions 索引
CREATE INDEX IF NOT EXISTS idx_model_versions_name ON model_versions(model_name);
CREATE INDEX IF NOT EXISTS idx_model_versions_type ON model_versions(model_type);
CREATE INDEX IF NOT EXISTS idx_model_versions_version ON model_versions(version);
CREATE INDEX IF NOT EXISTS idx_model_versions_active ON model_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_model_versions_status ON model_versions(status);

-- training_logs 索引
CREATE INDEX IF NOT EXISTS idx_training_logs_model ON training_logs(model_name, model_type);
CREATE INDEX IF NOT EXISTS idx_training_logs_version ON training_logs(target_version);
CREATE INDEX IF NOT EXISTS idx_training_logs_status ON training_logs(status);
CREATE INDEX IF NOT EXISTS idx_training_logs_created ON training_logs(created_at);

-- agent_weights 索引
CREATE INDEX IF NOT EXISTS idx_agent_weights_agent ON agent_weights(agent_type, agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_weights_name ON agent_weights(weight_name);
CREATE INDEX IF NOT EXISTS idx_agent_weights_model ON agent_weights(model_version);

-- feature_importance 索引
CREATE INDEX IF NOT EXISTS idx_feature_importance_model ON feature_importance(model_version);
CREATE INDEX IF NOT EXISTS idx_feature_importance_type ON feature_importance(model_type);
CREATE INDEX IF NOT EXISTS idx_feature_importance_rank ON feature_importance(importance_rank);

-- model_performance_monitor 索引
CREATE INDEX IF NOT EXISTS idx_model_performance_monitor_version ON model_performance_monitor(model_version);
CREATE INDEX IF NOT EXISTS idx_model_performance_monitor_date ON model_performance_monitor(monitor_date);
CREATE INDEX IF NOT EXISTS idx_model_performance_monitor_drift ON model_performance_monitor(drift_detected);

-- ============================================
-- 插入默认配置
-- ============================================

-- 默认Agent权重配置
INSERT INTO agent_weights (agent_type, agent_id, weight_name, weight_value, weight_description, source_type)
VALUES
  ('valuation', 'valuation_agent', 'policy_impact', 0.3, '政策影响权重', 'manual'),
  ('valuation', 'valuation_agent', 'news_sentiment', 0.25, '新闻情感权重', 'manual'),
  ('valuation', 'valuation_agent', 'market_trend', 0.25, '市场趋势权重', 'manual'),
  ('valuation', 'valuation_agent', 'fundamental', 0.2, '基本面权重', 'manual'),
  ('policy', 'policy_agent', 'policy_impact', 0.5, '政策影响权重', 'manual'),
  ('policy', 'policy_agent', 'news_sentiment', 0.3, '新闻情感权重', 'manual'),
  ('policy', 'policy_agent', 'market_trend', 0.2, '市场趋势权重', 'manual'),
  ('news', 'news_agent', 'sentiment', 0.4, '情感权重', 'manual'),
  ('news', 'news_agent', 'relevance', 0.3, '相关性权重', 'manual'),
  ('news', 'news_agent', 'timeliness', 0.3, '时效性权重', 'manual'),
  ('risk', 'risk_agent', 'policy_risk', 0.3, '政策风险权重', 'manual'),
  ('risk', 'risk_agent', 'market_risk', 0.3, '市场风险权重', 'manual'),
  ('risk', 'risk_agent', 'credit_risk', 0.2, '信用风险权重', 'manual'),
  ('risk', 'risk_agent', 'operational_risk', 0.2, '运营风险权重', 'manual')
ON CONFLICT DO NOTHING;

-- ============================================
-- 创建触发器：自动更新活跃版本
-- ============================================

CREATE OR REPLACE FUNCTION activate_model_version()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果新版本被激活，停用其他活跃版本
  IF NEW.is_active = true AND (OLD.is_active IS NULL OR OLD.is_active = false) THEN
    UPDATE model_versions
    SET is_active = false,
        deactivated_at = NOW()
    WHERE model_name = NEW.model_name
      AND model_type = NEW.model_type
      AND id != NEW.id
      AND is_active = true;
    
    NEW.activated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_activate_model_version
BEFORE UPDATE OF is_active ON model_versions
FOR EACH ROW
EXECUTE FUNCTION activate_model_version();
