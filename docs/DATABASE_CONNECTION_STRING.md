# 📊 Supabase 数据库连接字符串说明

## 🔗 连接字符串信息

您提供的数据库连接字符串：

```
postgresql://postgres:[YOUR-PASSWORD]@db.dmcdfynotyiismiuyglj.supabase.co:5432/postgres
```

---

## 📋 连接字符串解析

### 各部分说明：

- **协议**: `postgresql://` - PostgreSQL 数据库连接协议
- **用户名**: `postgres` - 数据库超级用户
- **密码**: `[YOUR-PASSWORD]` - 需要替换为实际的数据库密码
- **主机**: `db.dmcdfynotyysimuyglj.supabase.co` - 数据库服务器地址
- **端口**: `5432` - PostgreSQL 默认端口
- **数据库名**: `postgres` - 数据库名称

### ⚠️ 主机名修正

您提供的主机名中有一个小错误，应该是：

```
❌ 错误: db.dmcdfynotyiismiuyglj.supabase.co (一个 y)
✅ 正确: db.dmcdfynotyysimuyglj.supabase.co (两个 y)
```

正确的连接字符串应该是：

```
postgresql://postgres:[YOUR-PASSWORD]@db.dmcdfynotyysimuyglj.supabase.co:5432/postgres
```

---

## 🎯 这个连接字符串的用途

### 1. **应用部署**

❌ **不需要**配置到 Coze 平台环境变量

应用使用 Supabase SDK 连接数据库，只需要：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**不需要这个连接字符串！**

### 2. **数据库管理**

✅ **需要**用于以下操作：

- 运行数据库迁移
- 直接执行 SQL 命令
- 使用数据库管理工具（如 pgAdmin、DBeaver）
- 运行 `coze-coding-ai db upgrade`

---

## 💼 什么时候需要用到？

### ✅ 需要使用连接字符串的场景：

1. **同步数据库 Schema**
   ```bash
   # 这个命令可能需要连接字符串
   coze-coding-ai db upgrade
   ```

2. **使用数据库管理工具**
   - pgAdmin
   - DBeaver
   - TablePlus
   - psql 命令行工具

3. **直接执行 SQL**
   ```bash
   psql "postgresql://postgres:password@db.dmcdfynotyysimuyglj.supabase.co:5432/postgres"
   ```

4. **自定义迁移脚本**
   - 如果您有自定义的数据库迁移脚本

### ❌ 不需要使用连接字符串的场景：

1. **应用运行**
   - 应用使用 Supabase SDK，不需要连接字符串

2. **Coze 平台环境变量**
   - 只需配置 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔑 如何获取数据库密码

### 从 Supabase Dashboard 获取：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard/project/dmcdfynotyysimuyglj)
2. 点击 **Settings** → **Database**
3. 滚动到 **Connection String** 部分
4. 复制完整的连接字符串（包含密码）

或者：

1. 在 **Settings** → **API**
2. 找到 **Connection String** 部分
3. 选择 **URI** 格式
4. 复制连接字符串

---

## 📝 完整配置信息总结

### Coze 平台环境变量（必需）:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dmcdfynotyysimuyglj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 数据库连接字符串（可选，用于管理）:

```bash
postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.dmcdfynotyysimuyglj.supabase.co:5432/postgres
```

---

## 🚀 同步数据库 Schema

### 方法 1: 使用 coze-coding-ai（推荐）

```bash
coze-coding-ai db upgrade
```

### 方法 2: 使用连接字符串手动同步

```bash
# 1. 使用 psql 连接数据库
psql "postgresql://postgres:YOUR_PASSWORD@db.dmcdfynotyysimuyglj.supabase.co:5432/postgres"

# 2. 在 psql 中执行 CREATE TABLE 命令
# （从 schema.sql 文件中复制）
```

---

## 🛠️ 使用数据库管理工具

### 使用 pgAdmin:

1. 打开 pgAdmin
2. 右键点击 "Servers" → "Create" → "Server"
3. 填写连接信息：
   - Name: `REITs Database`
   - Host: `db.dmcdfynotyysimuyglj.supabase.co`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: 您的数据库密码
4. 点击 "Save"

### 使用 psql 命令行:

```bash
# 连接数据库
psql "postgresql://postgres:YOUR_PASSWORD@db.dmcdfynotyysimuyglj.supabase.co:5432/postgres"

# 查看所有表
\dt

# 退出
\q
```

---

## 📊 当前配置总结

### 您的 Supabase 项目信息：

| 项目 | 值 |
|------|-----|
| **项目引用** | `dmcdfynotyysimuyglj` |
| **Supabase URL** | `https://dmcdfynotyysimuyglj.supabase.co` |
| **anon key** | `eyJhbGci...` (您之前提供的) |
| **数据库主机** | `db.dmcdfynotyysimuyglj.supabase.co` |
| **数据库端口** | `5432` |
| **数据库名** | `postgres` |
| **用户名** | `postgres` |

### 需要配置的环境变量（Coze 平台）:

```bash
# 必需配置 ✅
NEXT_PUBLIC_SUPABASE_URL=https://dmcdfynotyysimuyglj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2RmeW5vdHlpaXNtaXV5Z2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjMyNjcsImV4cCI6MjA4NzY5OTI2N30.k8bP1guOpZ88L-93bfn2Fvs9JP0uhPp1POcbFaLJLrs
```

### 数据库连接字符串（仅用于管理，不需要配置）:

```bash
postgresql://postgres:YOUR_PASSWORD@db.dmcdfynotyysimuyglj.supabase.co:5432/postgres
```

---

## ⚠️ 重要提示

### 1. 不要配置数据库连接字符串到 Coze 平台

❌ **错误做法**:
```bash
# 不要在 Coze 平台配置这个！
DATABASE_URL=postgresql://postgres:password@db.dmcdfynotyysimuyglj.supabase.co:5432/postgres
```

✅ **正确做法**:
```bash
# 只配置这两个
NEXT_PUBLIC_SUPABASE_URL=https://dmcdfynotyysimuyglj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 2. 数据库密码安全

- 🔒 不要将数据库密码提交到代码库
- 🔒 不要将数据库密码分享给他人
- 🔒 只在本地环境或可信工具中使用
- 🔒 定期更换数据库密码

### 3. 连接字符串用途

- ✅ 用于数据库管理和迁移
- ✅ 用于开发调试
- ❌ 不用于应用运行（应用使用 Supabase SDK）

---

## 🎯 快速操作指南

### 同步数据库 Schema（如果还没有同步）:

```bash
# 运行数据库迁移
coze-coding-ai db upgrade

# 验证表已创建
node scripts/verify-supabase-tables.ts
```

### 在 Coze 平台配置环境变量:

1. 登录 Coze 平台
2. 进入项目 → Settings → Environment Variables
3. 添加 2 个必需变量（见上文）
4. 保存

### 触发构建和部署:

1. 点击 **构建**
2. 等待构建完成
3. 点击 **部署**
4. 等待服务启动

---

## 📚 相关文档

- [用户凭证配置指南](./USER_CREDENTIALS_GUIDE.md)
- [Supabase 密钥选择指南](./SUPABASE_KEYS_GUIDE.md)
- [Coze 平台部署操作指南](./COZE_PLATFORM_STEPS.md)

---

## 🎉 总结

- ✅ 连接字符串用于数据库管理，不需要配置到 Coze 平台
- ✅ 应用只需要 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ 使用连接字符串可以同步数据库 Schema 和执行 SQL 命令
- ⚠️ 注意主机名中的拼写（两个 y）

**准备好部署了吗？配置环境变量，然后触发构建和部署吧！🚀**
