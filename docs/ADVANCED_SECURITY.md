# 第二阶段高级防护功能文档

## 概述

第二阶段实现了三大高级防护功能：双因素认证（2FA）、IP白名单和自动化数据备份，进一步提升了系统的安全性。

---

## 1. 双因素认证（2FA）

### 功能介绍
双因素认证通过在密码之外增加第二重验证（TOTP动态验证码），大幅提升账户安全性。

### 技术实现
- **库**: speakeasy（TOTP生成/验证）+ qrcode（二维码生成）
- **密钥长度**: Base32编码
- **验证码**: 6位数字，30秒刷新
- **时间窗口**: 允许前后2个时间窗口的验证码

### 核心文件
- 服务: `lib/security/two-factor.ts`
- API: `pages/api/auth/2fa/*.ts`
- 页面: `pages/settings/two-factor.tsx`

### 数据库变更
```sql
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
```

### 使用流程

#### 启用2FA
1. 访问 `/settings/two-factor`
2. 点击「开始设置」生成二维码
3. 使用 Google Authenticator 或其他 TOTP 应用扫描二维码
4. 输入应用生成的6位验证码
5. 确认启用，保存备份码

#### 登录时验证
1. 输入用户名和密码
2. 系统检测用户启用2FA
3. 提示输入TOTP验证码
4. 验证通过后登录成功

#### 禁用2FA
1. 在设置页面输入当前验证码
2. 确认禁用

### API接口

#### POST /api/auth/2fa/setup
生成2FA配置（密钥、二维码、备份码）

#### POST /api/auth/2fa/enable
启用2FA，验证OTP

#### POST /api/auth/2fa/disable
禁用2FA，验证OTP

#### POST /api/auth/2fa/verify
验证OTP（登录时使用）

---

## 2. IP 白名单

### 功能介绍
限制允许访问系统的IP地址范围，防止未授权IP访问。

### 技术实现
- **格式支持**: 单个IPv4地址（如 192.168.1.1）和CIDR范围（如 192.168.1.0/24）
- **验证**: 正则表达式验证IP格式
- **CIDR检查**: 子网掩码验证

### 核心文件
- 服务: `lib/security/ip-whitelist.ts`
- API: `pages/api/admin/ip-whitelist.ts`
- 页面: `pages/admin/ip-whitelist.tsx`

### 数据库表
```sql
CREATE TABLE user_ip_whitelist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ip_address VARCHAR(50) NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  UNIQUE(user_id, ip_address)
);
```

### 使用流程

#### 添加IP到白名单
1. 访问 `/admin/ip-whitelist`
2. 点击「添加IP」
3. 输入IP地址或CIDR范围
4. 添加描述（可选）
5. 确认添加

#### 移除IP
1. 在白名单列表中找到要移除的IP
2. 点击删除按钮
3. 确认移除

### API接口

#### GET /api/admin/ip-whitelist
获取当前用户白名单

#### POST /api/admin/ip-whitelist
添加IP到白名单

#### DELETE /api/admin/ip-whitelist/[id]
从白名单移除IP

### 安全建议
- 添加白名单前先确认自己的IP地址
- 使用 `/32` 或 `/128` 表示单个IP
- 定期检查并清理不再使用的IP

---

## 3. 自动化数据备份

### 功能介绍
自动定期备份数据库，采用AES-256-GCM加密存储，支持手动备份和自动清理。

### 技术实现
- **加密算法**: AES-256-GCM
- **密钥派生**: SHA-256哈希
- **备份频率**: 每天凌晨2点（通过cron触发）
- **保留策略**: 90天
- **备份内容**: users、roles、permissions、audit_logs、login_attempts、security_alerts、user_ip_whitelist

### 核心文件
- 服务: `lib/backup/backup-service.ts`
- API: `pages/api/admin/backup.ts`
- Cron: `pages/api/admin/backup/cron.ts`
- 页面: `pages/admin/backup.tsx`

### 数据库表
```sql
CREATE TABLE backup_metadata (
  id UUID PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  tables TEXT[] NOT NULL,
  size BIGINT NOT NULL,
  encrypted_data TEXT NOT NULL,
  iv VARCHAR(32) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### 备份流程

#### 自动备份
1. 定时任务每天凌晨2点触发 `/api/admin/backup/cron`
2. 验证CRON_SECRET_KEY
3. 逐表导出数据为JSON
4. 使用AES-256-GCM加密
5. 存储加密数据和元信息
6. 清理90天前的备份

#### 手动备份
1. 访问 `/admin/backup`
2. 点击「立即备份」
3. 等待备份完成
4. 查看备份列表

### API接口

#### GET /api/admin/backup
获取备份列表

#### POST /api/admin/backup
手动创建备份

#### GET /api/admin/backup/stats
获取备份统计信息

#### POST /api/admin/backup/cron
定时备份（需CRON_SECRET_KEY）

### 环境变量配置

```env
# 备份加密密钥（建议使用强密码）
BACKUP_ENCRYPTION_KEY=your-encryption-key

# Cron任务密钥
CRON_SECRET_KEY=your-cron-secret-key
```

### 定时任务配置（推荐）

#### Vercel Cron Jobs
在 `vercel.json` 中配置：
```json
{
  "crons": [{
    "path": "/api/admin/backup/cron",
    "schedule": "0 2 * * *"
  }]
}
```

#### Linux Cron
```bash
0 2 * * * curl -X POST https://your-domain.com/api/admin/backup/cron -H "x-cron-key: YOUR_SECRET_KEY"
```

---

## 部署指南

### 1. 安装依赖
```bash
pnpm add speakeasy qrcode @types/qrcode
```

### 2. 更新数据库Schema
```bash
# 在Supabase控制台执行 lib/supabase/schema.sql 中的新增表定义
```

### 3. 配置环境变量
```env
BACKUP_ENCRYPTION_KEY=your-secure-encryption-key
CRON_SECRET_KEY=your-cron-secret-key
```

### 4. 配置定时备份
根据你的部署平台选择合适的定时任务方案：
- Vercel: 使用 Cron Jobs
- 自建服务器: 使用 Linux Cron
- 其他: 使用第三方定时任务服务

---

## 最佳实践

### 2FA
- 强制管理员启用2FA
- 定期更换备份码
- 使用硬件安全密钥（可选）

### IP白名单
- 仅对关键账号启用
- 使用最小权限原则
- 定期审计白名单

### 数据备份
- 定期测试备份恢复
- 监控备份成功/失败率
- 保留多个版本备份
- 异地存储备份文件（可选）

---

## 故障排查

### 2FA问题

#### 问题: 无法扫描二维码
- 检查网络连接
- 尝试手动输入密钥
- 更新 Authenticator 应用

#### 问题: 验证码无效
- 确认设备时间正确
- 检查验证码是否过期（30秒）
- 尝试下一个验证码

#### 问题: 丢失 Authenticator
- 使用备份码登录
- 重新设置2FA

### IP白名单问题

#### 问题: 无法添加IP
- 检查IP格式是否正确
- 确认IP不是CIDR格式错误
- 检查是否已存在

#### 问题: 被白名单锁定
- 联系管理员
- 从数据库移除限制
- 临时禁用IP白名单检查

### 数据备份问题

#### 问题: 定时备份未执行
- 检查cron配置
- 验证CRON_SECRET_KEY
- 查看服务器日志

#### 问题: 备份失败
- 检查数据库连接
- 确认表结构正确
- 查看错误信息

#### 问题: 恢复备份失败
- 验证备份文件完整性
- 检查加密密钥
- 确认表结构兼容

---

## 权限要求

| 功能 | 权限 | 说明 |
|------|------|------|
| 2FA设置 | 无 | 所有用户可配置 |
| IP白名单管理 | system:security | 管理员权限 |
| 数据备份 | system:backup | 管理员权限 |
| 查看备份列表 | system:security | 管理员权限 |

---

## 安全建议

1. **启用2FA**: 建议所有用户启用双因素认证
2. **IP白名单**: 对高权限账号启用IP白名单
3. **定期备份**: 确保备份正常运行
4. **监控告警**: 配置备份失败告警
5. **访问审计**: 结合审计日志监控异常访问
6. **密钥管理**: 定期轮换加密密钥

---

## 总结

第二阶段的高级防护功能通过多层次的安全机制，显著提升了系统的安全性：

- **2FA**: 防止密码泄露导致的账户被盗
- **IP白名单**: 限制访问来源，减少攻击面
- **数据备份**: 确保数据安全，支持灾难恢复

建议根据实际业务需求选择性启用这些功能，并定期进行安全审计。
