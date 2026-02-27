-- =====================================================
-- REITs后台管理系统完整初始化脚本
-- 包含：表结构、默认角色、默认权限、超级管理员账号
-- =====================================================

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
  two_factor_secret_encrypted TEXT,
  two_factor_secret_iv VARCHAR(32),
  two_factor_secret_auth_tag VARCHAR(32),
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
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  conditions TEXT,
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
  sensitive_data JSONB,
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
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(50),
  details JSONB,
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

-- =====================================================
-- 插入默认角色
-- =====================================================
INSERT INTO roles (code, name, description) VALUES
  ('super_admin', '超级管理员', '拥有所有权限'),
  ('admin', '管理员', '管理REITs数据和系统用户'),
  ('editor', '编辑', '可以编辑REITs数据'),
  ('viewer', '查看者', '只能查看数据'),
  ('guest', '访客', '仅限基础数据访问')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 插入默认权限
-- =====================================================

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
-- 创建超级管理员账号
-- 用户名: admin
-- 密码: Admin@123
-- 注意：首次登录后请立即修改密码！
-- 密码哈希使用项目中的 AES256.hashPassword 算法生成

DO $$
DECLARE
  super_admin_role_id UUID;
  admin_user_id UUID;
BEGIN
  SELECT id INTO super_admin_role_id FROM roles WHERE code = 'super_admin' LIMIT 1;

  IF super_admin_role_id IS NOT NULL THEN
    INSERT INTO users (username, email, password_hash, role_id, is_active)
    VALUES (
      'admin',
      'admin@reits.local',
      'c7c243846f3d37200bf062336f657ca1:75625c08b437cb4873fdcdcb551bc2253914129861474a4ed431f5a2217960c6',
      super_admin_role_id,
      true
    )
    ON CONFLICT (username) DO NOTHING
    RETURNING id INTO admin_user_id;

    IF admin_user_id IS NOT NULL THEN
      RAISE NOTICE '超级管理员账号创建成功！';
      RAISE NOTICE '用户名: admin';
      RAISE NOTICE '密码: Admin@123';
      RAISE NOTICE '请立即修改密码！';
    ELSE
      RAISE NOTICE '超级管理员账号已存在，跳过创建';
    END IF;
  END IF;
END $$;

-- =====================================================
-- 初始化完成！
-- =====================================================
SELECT '数据库初始化完成！' as status;
SELECT '默认账号信息：' as info;
SELECT '  用户名: admin' as username;
SELECT '  密码: Admin@123' as password;
SELECT '  角色: 超级管理员' as role;
SELECT '警告：请首次登录后立即修改密码！' as warning;
