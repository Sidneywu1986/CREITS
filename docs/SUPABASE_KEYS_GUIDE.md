# 🔑 Supabase 密钥选择指南

## 📌 快速回答

**使用 Publishable Key (anon/public key)** ✅

---

## 🎯 详细说明

### Supabase Dashboard 密钥类型

在 Supabase Dashboard → Settings → API 中，您会看到以下密钥：

#### 1. **Project URL**
```
https://your-project-id.supabase.co
```
- **用途**: Supabase 项目的访问地址
- **必需**: ✅ 必需

#### 2. **anon / public / Publishable Key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **用途**: 客户端连接密钥
- **安全级别**: 可以安全暴露给前端
- **必需**: ✅ 必需

#### 3. **service_role / Secret Key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **用途**: 服务端管理密钥
- **安全级别**: 只能在服务端使用，绝对不能暴露给客户端
- **必需**: ⚠️ 可选

---

## ✅ 您应该使用哪个？

### Coze 平台环境变量配置

#### 必需配置（2个）:

**变量 1: NEXT_PUBLIC_SUPABASE_URL**
```
值: https://your-project-id.supabase.co
来源: Settings → API → Project URL
```

**变量 2: NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
来源: Settings → API → anon / public / Publishable Key
```

#### 可选配置（1个）:

**变量 3: SUPABASE_SERVICE_ROLE_KEY**（可选）
```
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
来源: Settings → API → service_role / Secret Key
注意: 仅用于服务端管理操作，不要暴露给客户端
```

---

## 🔍 为什么使用 Publishable Key？

### Publishable Key 的特点：

1. **安全暴露**: 可以安全地在客户端代码中使用
2. **受限权限**: 遵守 Supabase 的 Row Level Security (RLS) 策略
3. **设计目的**: 专门为浏览器、移动应用等客户端设计
4. **必需配置**: Next.js 客户端需要这个密钥连接数据库

### Secret Key 的特点：

1. **完全权限**: 绕过所有 RLS 策略，有完全的数据库访问权限
2. **服务端专用**: 只能在后端代码中使用
3. **危险暴露**: 如果泄露到前端，任何人都可以完全控制您的数据库
4. **可选配置**: 仅在需要服务端管理操作时使用

---

## 🚨 重要安全提示

### ⚠️ 永远不要这样做

❌ **将 Secret Key 暴露给客户端**

```javascript
// 错误示例！
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=service_role_key_here
// ❌ 不要这样做！服务端密钥不能暴露给客户端
```

❌ **将 Secret Key 提交到代码库**

```bash
# 错误示例！
git add .env
# ❌ 不要将包含密钥的文件提交到 Git
```

### ✅ 正确的做法

```bash
# ✅ 只在 Coze 平台配置环境变量
# Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ✅ 如果需要，单独配置服务端密钥（不暴露给客户端）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 配置总结

### 在 Coze 平台配置以下环境变量：

```bash
# 必需配置 ✅
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 可选配置 ⚠️
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 从 Supabase Dashboard 获取：

1. **Project URL** → 复制到 `NEXT_PUBLIC_SUPABASE_URL`
2. **anon / public / Publishable Key** → 复制到 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **service_role / Secret Key**（可选）→ 复制到 `SUPABASE_SERVICE_ROLE_KEY`

---

## 💡 常见问题

### Q: 我可以只用 Publishable Key 吗？

**A: 是的！** ✅

对于大多数应用，只需要 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 就可以正常运行。

Secret Key 仅在需要执行管理操作（如批量导入数据、绕过 RLS 等）时才需要。

### Q: 使用 Publishable Key 安全吗？

**A: 是的，很安全！** ✅

Publishable Key 是设计来暴露给客户端的。配合 Supabase 的 Row Level Security (RLS) 策略，可以有效地控制数据访问权限。

### Q: 什么时候需要使用 Secret Key？

**A: 在以下情况需要：**

- 服务端批量数据导入
- 服务端管理操作
- 需要绕过 RLS 策略的场景
- 后台任务和定时任务

### Q: Secret Key 应该放在哪里？

**A: 只在服务端代码中使用！** 🔒

- ✅ 后端 API 路由
- ✅ 服务端脚本
- ✅ 环境变量（不暴露给客户端）
- ❌ 浏览器代码
- ❌ 客户端 JavaScript

---

## 🎯 快速操作步骤

### 1. 登录 Supabase Dashboard

访问: https://supabase.com/dashboard

### 2. 进入项目设置

选择您的项目 → **Settings** → **API**

### 3. 复制必需的凭证

复制以下两项：

```
1. Project URL:
   https://your-project-id.supabase.co

2. anon / public / Publishable Key:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 配置到 Coze 平台

在 Coze 平台 → **Settings** → **Environment Variables** 中添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. 保存配置

点击 **Save** 保存配置

---

## ✅ 验证配置

配置完成后，可以通过以下方式验证：

### 在本地验证：

```bash
# 使用测试脚本验证
node scripts/test-supabase-simple.ts
```

### 在 Coze 平台验证：

部署后，查看日志，确认没有以下错误：

```
❌ NEXT_PUBLIC_SUPABASE_URL is not set
❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set
❌ Database connection failed
```

成功的日志应该显示：

```
✅ Environment variables check passed
✅ Database connection successful
```

---

## 🎉 总结

**使用哪个密钥？**

- ✅ **Publishable Key (anon/public key)** - 必需！
- ⚠️ **Secret Key (service_role key)** - 可选，仅用于服务端

**配置到哪个变量？**

- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Publishable Key
- `SUPABASE_SERVICE_ROLE_KEY` → Secret Key（可选）

**重要提示：**

- ✅ 只使用 Publishable Key 就可以让应用正常运行
- ✅ Publishable Key 可以安全暴露给客户端
- 🔒 Secret Key 只在服务端使用，不要暴露给客户端

---

**准备好了吗？复制 Project URL 和 Publishable Key，然后在 Coze 平台配置环境变量吧！🚀**
