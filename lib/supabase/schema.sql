-- REITs后台管理系统数据库表定义

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
  department VARCHAR(100),
  region VARCHAR(100),
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret_encrypted TEXT, -- 2FA密钥加密存储
  two_factor_secret_iv VARCHAR(32), -- 初始化向量
  two_factor_secret_auth_tag VARCHAR(32), -- 认证标签
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 权限表
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,  -- 如 'reit_product_info'
  action VARCHAR(50) NOT NULL,      -- 'create' | 'read' | 'update' | 'delete' | 'export'
  conditions TEXT,                   -- JSON格式的数据权限条件
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, resource, action)
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  sensitive_data JSONB,  -- 加密存储的敏感数据
  ip_address VARCHAR(50),
  user_agent TEXT,
  result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 登录尝试记录表
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50) NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 安全告警表
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,  -- 'bruteforce', 'unusual_time', 'multiple_ips', 'permission_escalation'
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(50),
  details JSONB,  -- 存储告警详情，如失败次数、IP数量等
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户IP白名单表
CREATE TABLE IF NOT EXISTS user_ip_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(50) NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id, ip_address)
);

-- 备份元数据表
CREATE TABLE IF NOT EXISTS backup_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  tables TEXT[] NOT NULL,
  size BIGINT NOT NULL,
  encrypted_data TEXT NOT NULL,
  iv VARCHAR(32) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 加密配置表
CREATE TABLE IF NOT EXISTS encrypted_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key VARCHAR(255) UNIQUE NOT NULL,
  encrypted_data TEXT NOT NULL,
  iv VARCHAR(32) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  type VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_user_ip_whitelist_user_id ON user_ip_whitelist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ip_whitelist_ip_address ON user_ip_whitelist(ip_address);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_created_at ON backup_metadata(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_status ON backup_metadata(status);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 users 表添加更新时间触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入默认角色
INSERT INTO roles (code, name, description) VALUES
  ('super_admin', '超级管理员', '拥有所有权限'),
  ('admin', '管理员', '管理REITs数据和系统用户'),
  ('editor', '编辑', '可以编辑REITs数据'),
  ('viewer', '查看者', '只能查看数据'),
  ('guest', '访客', '仅限基础数据访问')
ON CONFLICT (code) DO NOTHING;

-- 插入默认权限
-- 超级管理员权限
DO $$
DECLARE
  super_admin_id UUID;
BEGIN
  SELECT id INTO super_admin_id FROM roles WHERE code = 'super_admin' LIMIT 1;
  
  IF super_admin_id IS NOT NULL THEN
    INSERT INTO permissions (role_id, resource, action) VALUES
      (super_admin_id, 'reits:all', 'create'),
      (super_admin_id, 'reits:all', 'read'),
      (super_admin_id, 'reits:all', 'update'),
      (super_admin_id, 'reits:all', 'delete'),
      (super_admin_id, 'reits:all', 'export'),
      (super_admin_id, 'abs:data', 'create'),
      (super_admin_id, 'abs:data', 'read'),
      (super_admin_id, 'abs:data', 'update'),
      (super_admin_id, 'abs:data', 'delete'),
      (super_admin_id, 'abs:data', 'export'),
      (super_admin_id, 'system:users', 'create'),
      (super_admin_id, 'system:users', 'read'),
      (super_admin_id, 'system:users', 'update'),
      (super_admin_id, 'system:users', 'delete'),
      (super_admin_id, 'system:roles', 'read'),
      (super_admin_id, 'system:roles', 'update'),
      (super_admin_id, 'system:logs', 'read'),
      (super_admin_id, 'system:logs', 'export'),
      (super_admin_id, 'system:settings', 'read'),
      (super_admin_id, 'system:settings', 'update'),
      (super_admin_id, 'system:security', 'read'),
      (super_admin_id, 'system:security', 'update'),
      (super_admin_id, 'system:security', 'analyze')
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;
END $$;

-- 管理员权限
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM roles WHERE code = 'admin' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO permissions (role_id, resource, action) VALUES
      (admin_id, 'reits:all', 'create'),
      (admin_id, 'reits:all', 'read'),
      (admin_id, 'reits:all', 'update'),
      (admin_id, 'reits:all', 'delete'),
      (admin_id, 'reits:all', 'export'),
      (admin_id, 'abs:data', 'read'),
      (admin_id, 'abs:data', 'update'),
      (admin_id, 'abs:data', 'export'),
      (admin_id, 'system:users', 'read'),
      (admin_id, 'system:logs', 'read')
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;
END $$;

-- 编辑权限
DO $$
DECLARE
  editor_id UUID;
BEGIN
  SELECT id INTO editor_id FROM roles WHERE code = 'editor' LIMIT 1;
  
  IF editor_id IS NOT NULL THEN
    INSERT INTO permissions (role_id, resource, action) VALUES
      (editor_id, 'reits:product', 'read'),
      (editor_id, 'reits:product', 'update'),
      (editor_id, 'reits:property', 'read'),
      (editor_id, 'reits:property', 'update'),
      (editor_id, 'reits:financial', 'read'),
      (editor_id, 'reits:financial', 'update'),
      (editor_id, 'reits:operational', 'read'),
      (editor_id, 'reits:operational', 'update'),
      (editor_id, 'reits:market', 'read'),
      (editor_id, 'reits:market', 'update'),
      (editor_id, 'reits:investor', 'read'),
      (editor_id, 'reits:investor', 'update'),
      (editor_id, 'reits:dividend', 'read'),
      (editor_id, 'reits:dividend', 'update'),
      (editor_id, 'reits:risk', 'read'),
      (editor_id, 'reits:risk', 'update'),
      (editor_id, 'abs:data', 'read')
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;
END $$;

-- 查看者权限
DO $$
DECLARE
  viewer_id UUID;
BEGIN
  SELECT id INTO viewer_id FROM roles WHERE code = 'viewer' LIMIT 1;
  
  IF viewer_id IS NOT NULL THEN
    INSERT INTO permissions (role_id, resource, action) VALUES
      (viewer_id, 'reits:product', 'read'),
      (viewer_id, 'reits:property', 'read'),
      (viewer_id, 'reits:financial', 'read'),
      (viewer_id, 'reits:operational', 'read'),
      (viewer_id, 'reits:market', 'read'),
      (viewer_id, 'reits:investor', 'read'),
      (viewer_id, 'reits:dividend', 'read'),
      (viewer_id, 'reits:risk', 'read'),
      (viewer_id, 'abs:data', 'read')
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;
END $$;

-- 访客权限
DO $$
DECLARE
  guest_id UUID;
BEGIN
  SELECT id INTO guest_id FROM roles WHERE code = 'guest' LIMIT 1;
  
  IF guest_id IS NOT NULL THEN
    INSERT INTO permissions (role_id, resource, action) VALUES
      (guest_id, 'reits:product', 'read'),
      (guest_id, 'reits:market', 'read')
    ON CONFLICT (role_id, resource, action) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- 第四阶段：智能进化新增表
-- =====================================================

-- 备份表
CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(20) NOT NULL,  -- 'full' | 'incremental'
  size BIGINT NOT NULL,
  tables JSONB NOT NULL,       -- 表名列表
  checksum TEXT NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'completed' | 'failed' | 'verifying'
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent反馈表
CREATE TABLE IF NOT EXISTS agent_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_id TEXT NOT NULL,
  human_decision VARCHAR(20) NOT NULL,  -- 'approve' | 'reject' | 'review'
  reason TEXT,
  corrected BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent模型表
CREATE TABLE IF NOT EXISTS agent_models (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  accuracy DECIMAL(5,2),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 工作流定义表
CREATE TABLE IF NOT EXISTS workflow_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,  -- 'draft' | 'active' | 'archived'
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 工作流实例表
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflow_definitions(id) ON DELETE CASCADE,
  workflow_version TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,  -- 'running' | 'completed' | 'failed' | 'cancelled'
  current_node_id TEXT,
  variables JSONB NOT NULL,
  history JSONB NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_by TEXT NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_backups_timestamp ON backups(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_feedback_created ON agent_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_status ON workflow_definitions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_workflow ON workflow_instances(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);

-- =====================================================
-- 第五阶段：生态进化新增表
-- =====================================================

-- API密钥表
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  prefix TEXT NOT NULL,
  scopes JSONB NOT NULL,
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  user_id TEXT NOT NULL,
  organization_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API使用记录表
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 机构表
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  logo TEXT,
  theme JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  plan VARCHAR(20) NOT NULL DEFAULT 'free',
  max_users INTEGER NOT NULL DEFAULT 10,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户机构关联表
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 机构角色表
CREATE TABLE IF NOT EXISTS org_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  UNIQUE(organization_id, code)
);

-- 报表表
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  components JSONB NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报表实例表
CREATE TABLE IF NOT EXISTS report_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format VARCHAR(10) NOT NULL,
  data JSONB NOT NULL,
  generated_by TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 报表计划表
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cron TEXT NOT NULL,
  recipients JSONB NOT NULL,
  format VARCHAR(10) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent模板表
CREATE TABLE IF NOT EXISTS agent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  version TEXT NOT NULL,
  icon TEXT,
  author TEXT NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  config JSONB NOT NULL,
  is_official BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent评论表
CREATE TABLE IF NOT EXISTS agent_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES agent_templates(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent安装记录表
CREATE TABLE IF NOT EXISTS agent_installs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES agent_templates(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- 创建第五阶段索引
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_org ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_instances_report ON report_instances(report_id);
CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_agent_reviews_template ON agent_reviews(template_id);
