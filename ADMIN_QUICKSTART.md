# REITs 管理后台快速配置

## 🚀 部署成功！下一步配置管理后台

### 1️⃣ 配置 Supabase（可选但推荐）

如果你想使用完整的管理后台功能，需要配置 Supabase：

1. 去 [supabase.com](https://supabase.com) 创建项目
2. 在 Coze 平台配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2️⃣ 初始化数据库

在 Supabase 控制台的 SQL Editor 中执行：

```sql
-- 复制文件内容：database/init-full.sql
-- 粘贴到 SQL Editor 并执行
```

或者看完整指南：`docs/ADMIN_SETUP_GUIDE.md`

### 3️⃣ 登录管理后台

**默认账号**：
- 用户名：`admin`
- 密码：`Admin@123`

**登录页面**：`/login`

⚠️ **重要**：首次登录后立即修改密码！

### 4️⃣ 管理后台页面

| 页面 | 路径 |
|------|------|
| 登录 | `/login` |
| 审计日志 | `/admin/audit-logs` |
| 备份管理 | `/admin/backup` |
| IP白名单 | `/admin/ip-whitelist` |
| 权限管理 | `/admin/permissions` |
| 安全分析 | `/admin/security` |
| 双因素认证 | `/settings/two-factor` |

---

## 📁 相关文件

- `database/init-full.sql` - 完整数据库初始化脚本
- `docs/ADMIN_SETUP_GUIDE.md` - 详细配置指南
- `scripts/generate-admin-password.js` - 密码哈希生成工具

---

## 🔐 安全提醒

1. ✅ 立即修改默认密码
2. ✅ 启用双因素认证
3. ✅ 定期查看审计日志
4. ✅ 配置 IP 白名单
5. ✅ 定期备份数据

---

**详细配置请查看：docs/ADMIN_SETUP_GUIDE.md**
