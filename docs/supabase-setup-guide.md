# Supabase 配置指南

本文档帮助你快速配置Supabase数据库，用于REITs项目数据存储。

## 📋 目录
1. [创建Supabase项目](#1创建supabase项目)
2. [获取凭证信息](#2获取凭证信息)
3. [配置环境变量](#3配置环境变量)
4. [创建数据库表](#4创建数据库表)
5. [测试连接](#5测试连接)
6. [常见问题](#6常见问题)

---

## 1. 创建Supabase项目

### 步骤1：注册账号
1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用GitHub、Google或邮箱注册账号

### 步骤2：创建新项目
1. 登录后，点击 "New Project"
2. 填写项目信息：
   - **Name**: `reits-smart-assistant`
   - **Database Password**: 设置强密码（建议使用密码管理器生成）
   - **Region**: 选择 `Southeast Asia (Singapore)`（国内访问更快）
   - **Pricing Plan**: 选择 `Free`（免费版足够）

3. 点击 "Create new project"
4. 等待项目创建完成（约2分钟）

---

## 2. 获取凭证信息

### 步骤1：获取Project URL和Anon Key
1. 进入项目Dashboard
2. 点击左侧导航栏的 **Settings** → **API**
3. 找到以下信息：
   - **Project URL**: 类似 `https://your-project-ref.supabase.co`
   - **anon/public key**: 类似 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 步骤2：获取Service Role Key（可选，仅服务端使用）
1. 在同一页面，向下滚动到 **Project API keys**
2. 找到 **service_role** key（不要泄露此密钥！）

---

## 3. 配置环境变量

### 步骤1：编辑环境变量文件
在项目根目录下，找到 `.env.local` 文件（如果不存在，从 `.env.local.example` 复制）。

### 步骤2：添加Supabase配置
```bash
# ============================================
# Supabase 数据库配置（用于REITs数据存储）
# ============================================

# Supabase项目URL（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase匿名密钥（必需，客户端和服务端通用）
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase服务角色密钥（可选，仅服务端使用，拥有完全权限）
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 步骤3：替换实际值
将以下占位符替换为你的实际值：
- `your-project-ref` → 你的Project Reference（在URL中）
- `your_anon_key_here` → 从Supabase Dashboard复制的anon/public key
- `your_service_role_key_here` → service_role key（可选）

### 示例：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abc123xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM3h5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjMwMDAwMDAwLCJleHAiOjE5NDU1NTU1NTV9.example
```

---

## 4. 创建数据库表

### 步骤1：打开SQL Editor
1. 在Supabase Dashboard中
2. 点击左侧导航栏的 **SQL Editor**
3. 点击 **New query**

### 步骤2：执行建表脚本
1. 打开项目中的 `database/schema.sql` 文件
2. 复制完整的8个CREATE TABLE语句
3. 粘贴到SQL Editor中
4. 点击 **Run** 执行

### 步骤3：验证表创建
进入 **Table Editor**，检查以下8个表是否都已创建：
- ✅ `reit_product_info`
- ✅ `reit_property_base`
- ✅ `reit_property_equity_ops`
- ✅ `reit_property_concession_ops`
- ✅ `reit_financial_metrics`
- ✅ `reit_valuation`
- ✅ `reit_risk_compliance`
- ✅ `reit_market_stats`

---

## 5. 测试连接

### 方法1：使用项目中的测试脚本
```bash
# 在项目根目录执行
npm run test:supabase
# 或
node scripts/test-supabase-connection.js
```

### 方法2：使用Next.js开发服务器
```bash
# 启动开发服务器
npm run dev

# 访问测试页面
# http://localhost:5000/api/test/supabase-connection
```

### 方法3：手动测试
```javascript
// 在浏览器Console中执行
import { supabase } from '@/lib/services/supabase';

// 测试查询
const { data, error } = await supabase
  .from('reit_product_info')
  .select('*')
  .limit(1);

console.log('连接测试:', { data, error });
```

---

## 6. 常见问题

### Q1: 连接超时怎么办？
**A**: 检查以下几点：
- 确认Project URL是否正确
- 确认Anon Key是否正确
- 检查网络连接（Supabase是否被墙）
- 尝试使用代理或VPN

### Q2: 权限错误 "Permission denied"？
**A**: 确保已配置Row Level Security (RLS)策略：
```sql
-- 在SQL Editor中执行
ALTER TABLE reit_product_info ENABLE ROW LEVEL SECURITY;

-- 允许所有读取（开发环境）
CREATE POLICY "Enable read access for all users"
  ON reit_product_info FOR SELECT
  USING (true);

-- 允许所有写入（开发环境）
CREATE POLICY "Enable insert for all users"
  ON reit_product_info FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON reit_product_info FOR UPDATE
  USING (true);
```

### Q3: 免费版够用吗？
**A**: 免费版限制：
- 数据库存储：500MB
- 文件存储：2GB
- 带宽：2GB/月
- 请求：50K/月

对于REITs项目：
- 假设50只REITs × 10年历史 × 8张表 ≈ 200MB
- 加上索引和元数据 ≈ 300MB
- **免费版完全够用！**

### Q4: 如何备份数据？
**A**: Supabase提供自动备份（Pro版），免费版可以手动导出：
```bash
# 使用Supabase CLI
supabase db dump > backup.sql

# 或在SQL Editor中执行
-- 导出单个表
SELECT * FROM reit_product_info;

-- 导出整个数据库（需要使用命令行工具）
```

### Q5: 如何迁移现有数据？
**A**: 参考 `docs/migration-guide.md` 文档，使用项目中的数据迁移工具：
```bash
# 导出MySQL数据
node scripts/export-mysql-data.js

# 导入到Supabase
node scripts/import-to-supabase.js
```

---

## ✅ 配置检查清单

完成以下检查，确认配置成功：

- [ ] 已创建Supabase项目
- [ ] 已获取Project URL和Anon Key
- [ ] 已在`.env.local`中配置环境变量
- [ ] 已执行`database/schema.sql`创建8个表
- [ ] 已验证所有表创建成功
- [ ] 已测试连接成功
- [ ] 已配置RLS策略（生产环境必须）

---

## 📞 需要帮助？

如果遇到问题：
1. 查看Supabase官方文档：https://supabase.com/docs
2. 查看项目日志：`/app/work/logs/bypass/app.log`
3. 联系项目开发团队

---

## 🔐 安全提示

⚠️ **重要安全事项**：

1. **不要提交.env.local到Git仓库**
   ```bash
   # .gitignore中已包含
   .env.local
   .env.*.local
   ```

2. **区分Anon Key和Service Role Key**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 可以公开，用于客户端
   - `SUPABASE_SERVICE_ROLE_KEY`: 仅服务端使用，不要泄露

3. **生产环境使用RLS**
   - 开发环境可以放宽权限
   - 生产环境必须配置严格的Row Level Security策略

4. **定期轮换密钥**
   - 建议每6个月更换一次Anon Key
   - 更换后更新所有客户端配置

---

## 📚 相关文档

- [Supabase官方文档](https://supabase.com/docs)
- [数据库Schema定义](../database/schema.sql)
- [数据库服务代码](../src/lib/database/reits-db.ts)
- [数据迁移指南](migration-guide.md)
- [飞书集成指南](feishu-integration-guide.md)
