# REITs 管理后台和超级管理员配置指南

## 概述

本指南将帮助你配置完整的 REITs 管理后台系统，包括数据库初始化、超级管理员账号创建和权限配置。

---

## 前提条件

1. ✅ 应用已成功部署到 Coze 平台
2. ✅ Supabase 项目已创建（如果需要）
3. ✅ 以下环境变量已配置（可选）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 第一步：配置 Supabase（可选）

### 1.1 创建 Supabase 项目

如果你还没有 Supabase 项目：

1. 访问 [supabase.com](https://supabase.com)
2. 注册/登录账号
3. 创建新项目
4. 记录下项目的 URL 和 API Keys

### 1.2 配置环境变量

在 Coze 平台或 `.env.local` 文件中配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 第二步：初始化数据库

### 2.1 方式一：在 Supabase 控制台执行 SQL（推荐）

1. 登录 Supabase 控制台
2. 进入你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New Query**
5. 打开项目中的 `database/init-full.sql` 文件
6. 复制全部内容并粘贴到 SQL Editor 中
7. 点击 **Run** 执行

### 2.2 方式二：使用 API 端点（如果已配置）

如果项目中有数据库初始化 API，可以调用：

```bash
curl -X POST http://your-app-url/api/database/init
```

---

## 第三步：验证数据库初始化

执行完 SQL 后，验证以下内容：

### 3.1 检查角色表

```sql
SELECT * FROM roles;
```

应该看到 5 个角色：
- `super_admin` - 超级管理员
- `admin` - 管理员
- `editor` - 编辑
- `viewer` - 查看者
- `guest` - 访客

### 3.2 检查权限表

```sql
SELECT r.code, p.resource, p.action
FROM roles r
JOIN permissions p ON r.id = p.role_id
ORDER BY r.code, p.resource, p.action;
```

### 3.3 检查超级管理员账号

```sql
SELECT id, username, email, role_id, is_active
FROM users
WHERE username = 'admin';
```

---

## 第四步：登录管理后台

### 4.1 默认账号信息

- **用户名**: `admin`
- **密码**: `Admin@123`
- **角色**: 超级管理员

### 4.2 登录步骤

1. 访问应用的登录页面：`/login`
2. 输入用户名和密码
3. 点击"登录"按钮
4. 登录成功后会跳转到首页

### 4.3 ⚠️ 重要：立即修改密码！

首次登录后，请立即修改默认密码：

1. 登录后访问 `/settings` 页面
2. 找到"修改密码"选项
3. 输入当前密码 `Admin@123`
4. 设置新的强密码（建议包含大小写字母、数字、特殊字符）
5. 保存新密码

---

## 第五步：管理后台功能说明

### 5.1 超级管理员权限

超级管理员拥有以下所有权限：

- ✅ REITs 数据：创建、读取、更新、删除、导出
- ✅ ABS 数据：创建、读取、更新、删除、导出
- ✅ 系统用户：创建、读取、更新、删除
- ✅ 系统角色：读取、更新
- ✅ 系统日志：读取、导出
- ✅ 系统设置：读取、更新
- ✅ 系统安全：读取、更新、分析

### 5.2 管理后台页面

| 页面路径 | 功能说明 |
|---------|---------|
| `/admin/audit-logs` | 审计日志查看 |
| `/admin/backup` | 数据备份管理 |
| `/admin/ip-whitelist` | IP 白名单管理 |
| `/admin/permissions` | 权限管理 |
| `/admin/security` | 安全分析 |
| `/settings/two-factor` | 双因素认证设置 |

---

## 第六步：创建其他用户（可选）

### 6.1 使用管理后台创建

1. 以超级管理员身份登录
2. 访问用户管理页面（如果有）
3. 点击"创建用户"
4. 填写用户信息
5. 分配角色
6. 保存

### 6.2 使用 SQL 创建

```sql
-- 插入新用户
INSERT INTO users (username, email, password_hash, role_id, is_active)
VALUES (
  'editor1',
  'editor1@reits.local',
  -- 生成密码哈希，使用 scripts/generate-admin-password.js
  'salt:hash',
  (SELECT id FROM roles WHERE code = 'editor' LIMIT 1),
  true
);
```

---

## 第七步：密码哈希生成工具

项目中提供了密码哈希生成脚本：

```bash
cd /workspace/projects
node scripts/generate-admin-password.js YourNewPassword123!
```

输出示例：
```
密码: YourNewPassword123!
哈希: salt:hash
验证: ✅ 通过
```

---

## 常见问题

### Q1: 登录时提示"数据库连接失败"

**原因**: Supabase 环境变量未配置或配置错误

**解决**:
1. 检查环境变量是否正确配置
2. 确认 Supabase 项目 URL 和 API Key 是否正确
3. 确认 Supabase 项目是否已启动

### Q2: 登录时提示"用户名或密码错误"

**原因**: 数据库未初始化或密码错误

**解决**:
1. 确认已执行 `database/init-full.sql`
2. 确认使用的是默认密码 `Admin@123`
3. 尝试重置密码（见下文）

### Q3: 如何重置超级管理员密码？

**方式一：使用 SQL 更新**

```sql
-- 1. 生成新密码的哈希
-- 在本地运行: node scripts/generate-admin-password.js NewPassword123!

-- 2. 更新数据库
UPDATE users
SET password_hash = 'new-salt:new-hash',
    login_attempts = 0,
    locked_until = null
WHERE username = 'admin';
```

**方式二：重新执行初始化脚本**

如果不担心数据丢失，可以：
1. 删除现有用户：`DELETE FROM users WHERE username = 'admin';`
2. 重新执行 `database/init-full.sql` 中的用户创建部分

### Q4: 没有 Supabase 可以使用吗？

**可以**！项目已支持无 Supabase 运行：

- 登录功能会降级为模拟模式
- 管理后台页面会显示"数据库未配置"提示
- 但基础页面功能仍然可用

---

## 安全建议

1. ✅ **立即修改默认密码**
2. ✅ **启用双因素认证**（在 `/settings/two-factor`）
3. ✅ **定期查看审计日志**（在 `/admin/audit-logs`）
4. ✅ **配置 IP 白名单**（在 `/admin/ip-whitelist`）
5. ✅ **定期备份数据**（在 `/admin/backup`）
6. ✅ **使用强密码**（至少 12 位，包含大小写字母、数字、特殊字符）

---

## 下一步

配置完成后，你可以：

1. 📊 查看 REITs 数据页面
2. 🔐 配置其他系统用户
3. 📝 设置权限和角色
4. 🔍 查看审计日志
5. 🛡️ 配置安全设置

---

## 技术支持

如有问题，请检查：

1. 浏览器控制台是否有错误
2. 应用日志是否有错误信息
3. Supabase 控制台是否有错误
4. 网络请求是否正常

---

**配置完成！现在你拥有一个完整的 REITs 管理后台系统了！** 🎉
