# 环境变量配置文档

## 概述

本文档定义了系统的所有环境变量配置，确保敏感信息不硬编码在代码中，符合保密合规要求。

---

## 必需配置

### 数据库配置
```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 数据加密密钥（32字节以上）
DATA_ENCRYPTION_KEY=your-secure-encryption-key-min-32-bytes-long

# 备份加密密钥（32字节以上）
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key-min-32-bytes-long
```

### 认证配置
```env
# JWT密钥
JWT_SECRET=your-jwt-secret-key

# 会话密钥
SESSION_SECRET=your-session-secret-key

# 密码哈希盐值（可选，crypto-js会自动生成）
PASSWORD_SALT=your-password-salt
```

### 应用配置
```env
# 应用URL（用于生成链接）
NEXT_PUBLIC_APP_URL=https://your-domain.com

# API基础URL（如果有独立API服务）
API_BASE_URL=https://api.your-domain.com

# 内部API密钥（服务间认证）
INTERNAL_API_KEY=your-internal-api-key
```

---

## 可选配置

### 飞书集成
```env
# 飞书应用凭证
NEXT_PUBLIC_FEISHU_APP_ID=your-feishu-app-id
NEXT_PUBLIC_FEISHU_APP_SECRET=your-feishu-app-secret

# 飞书机器人Webhook（安全告警）
NEXT_PUBLIC_FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook

# 飞书审批机器人
NEXT_PUBLIC_FEISHU_APPROVAL_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/approval-webhook
```

### 邮件服务
```env
# SMTP配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@your-domain.com

# 或使用第三方邮件服务
RESEND_API_KEY=re_xxxxxxxxxxxxxx
```

### 监控与日志
```env
# 日志级别（DEBUG, INFO, WARN, ERROR）
LOG_LEVEL=INFO

# 日志路径
LOG_PATH=/var/log/app

# Sentry错误追踪（生产环境推荐）
SENTRY_DSN=https://your-sentry-dsn
```

### 安全配置
```env
# Cron任务密钥（防止未授权访问）
CRON_SECRET_KEY=your-cron-secret-key

# IP白名单配置（可选，逗号分隔）
ALLOWED_IPS=192.168.1.1,10.0.0.1

# 速率限制配置
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# 2FA配置
TWO_FACTOR_ISSUER=REITs智能助手
TWO_FACTOR_DIGITS=6
TWO_FACTOR_PERIOD=30
```

---

## 定时任务配置

### Vercel Cron Jobs (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/admin/backup/cron",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Linux Cron
```bash
# 每天凌晨2点执行备份
0 2 * * * curl -X POST https://your-domain.com/api/admin/backup/cron \
  -H "x-cron-key: ${CRON_SECRET_KEY}" \
  >> /var/log/backup-cron.log 2>&1
```

---

## 安全检查清单

### 1. 环境变量检查
- [ ] 所有敏感信息都已配置为环境变量
- [ ] 没有在代码中硬编码密钥、密码等敏感信息
- [ ] 生产环境和开发环境使用不同的密钥
- [ ] 密钥长度足够（至少32字节）
- [ ] 定期轮换密钥

### 2. 加密检查
- [ ] 2FA密钥使用AES-256-GCM加密存储
- [ ] 备份数据使用AES-256-GCM加密
- [ ] 密码使用PBKDF2哈希（10000次迭代）
- [ ] 敏感日志字段已脱敏

### 3. 访问控制检查
- [ ] 数据库使用Service Role Key访问
- [ ] 内部API需要额外认证（INTERNAL_API_KEY）
- [ ] Cron任务使用CRON_SECRET_KEY验证
- [ ] 管理员接口需要相应权限

### 4. 日志审计检查
- [ ] 敏感数据已脱敏（密码、密钥、token等）
- [ ] 日志级别配置正确（生产环境使用INFO或WARN）
- [ ] 日志存储路径安全
- [ ] 日志保留期限合规（90天）

---

## 密钥生成工具

### 生成加密密钥（Node.js）
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 生成JWT密钥（Node.js）
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 生成UUID（Node.js）
```bash
node -e "console.log(require('crypto').randomUUID())"
```

---

## 生产环境部署检查

### 部署前检查
- [ ] .env文件已添加到.gitignore
- [ ] 生产环境密钥已配置
- [ ] 没有使用默认密钥
- [ ] 所有API密钥已更新
- [ ] CORS配置正确
- [ ] HTTPS已启用

### 部署后检查
- [ ] 环境变量加载正确
- [ ] 数据库连接正常
- [ ] 加密/解密功能正常
- [ ] 2FA功能正常
- [ ] 备份功能正常
- [ ] 日志输出正常

---

## 环境变量模板

创建 `.env.example` 文件（提交到代码仓库）：

```env
# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 加密密钥
DATA_ENCRYPTION_KEY=
BACKUP_ENCRYPTION_KEY=

# 认证配置
JWT_SECRET=
SESSION_SECRET=

# 应用配置
NEXT_PUBLIC_APP_URL=
API_BASE_URL=
INTERNAL_API_KEY=

# 飞书集成
NEXT_PUBLIC_FEISHU_WEBHOOK=

# 邮件服务
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# 安全配置
CRON_SECRET_KEY=
LOG_LEVEL=INFO
```

---

## 密钥管理最佳实践

### 1. 密钥存储
- 使用云服务商的密钥管理服务（AWS KMS、Azure Key Vault等）
- 或使用环境变量注入
- 不要将密钥提交到代码仓库

### 2. 密钥轮换
- 定期轮换所有密钥（建议每3-6个月）
- 使用密钥版本管理
- 确保轮换时不影响现有服务

### 3. 密钥访问控制
- 限制密钥访问权限
- 使用最小权限原则
- 记录密钥访问日志

### 4. 密钥备份
- 安全备份加密密钥
- 使用物理隔离的备份存储
- 测试恢复流程

---

## 故障排查

### 问题：加密/解密失败
**原因**：加密密钥不匹配
**解决**：
1. 检查DATA_ENCRYPTION_KEY和BACKUP_ENCRYPTION_KEY配置
2. 确保所有环境使用相同的密钥
3. 密钥长度至少32字节

### 问题：2FA验证失败
**原因**：密钥解密失败
**解决**：
1. 检查密钥字段是否正确迁移
2. 验证加密数据格式（encrypted_data, iv, auth_tag）
3. 重新启用2FA

### 问题：备份恢复失败
**原因**：备份数据无法解密
**解决**：
1. 检查BACKUP_ENCRYPTION_KEY
2. 确认IV和AuthTag完整
3. 验证加密数据未被篡改

---

## 总结

本配置文档确保了：
- ✅ 所有敏感信息不硬编码
- ✅ 使用环境变量管理配置
- ✅ 密钥使用强加密算法
- ✅ 定期密钥轮换机制
- ✅ 完整的审计日志
- ✅ 符合保密合规要求

请根据实际部署环境配置相应的环境变量，并定期审查密钥管理策略。
