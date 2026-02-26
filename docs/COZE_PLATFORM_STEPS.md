# 🚀 Coze 平台部署操作指南

## ⚠️ 重要说明

**我无法直接访问和操作 Coze 平台**，但我可以为您提供详细的操作步骤和验证脚本。

请按照以下步骤操作，我会为您提供每一步的详细指导。

---

## 📋 部署前检查

### 当前状态

✅ **已完成**:
- Supabase Schema 已设计（7张表）
- 部署脚本已优化
- 部署文档已准备

⚠️ **需要您完成**:
- 配置 Supabase 凭证
- 在 Coze 平台配置环境变量
- 触发构建和部署

---

## 🔑 步骤 1: 获取 Supabase 凭证

### 1.1 创建 Supabase 项目（如果还没有）

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: `REITs-Intelligent-Assistant`
   - **Database Password**: 设置强密码（请记住）
   - **Region**: 选择离您最近的区域
4. 点击 "Create new project"
5. 等待项目创建完成（约 2 分钟）

### 1.2 获取凭证

1. 进入项目 Dashboard
2. 点击左侧菜单 **Settings** → **API**
3. 复制以下信息：

```
Project URL:
https://your-project-id.supabase.co

anon public:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
（这是一个很长的 JWT token）

service_role（可选，仅用于服务端操作）:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 同步数据库 Schema

在本地运行以下命令，将表结构同步到 Supabase：

```bash
cd /workspace/projects
coze-coding-ai db upgrade
```

**验证表已创建**:
```bash
node scripts/verify-supabase-tables.ts
```

---

## ⚙️ 步骤 2: 在 Coze 平台配置环境变量

### 2.1 登录 Coze 平台

1. 访问 Coze 平台
2. 登录您的账号
3. 进入您的项目：**REITs智能助手平台**

### 2.2 配置环境变量

1. 在项目页面，点击 **设置** 或 **Settings**
2. 找到 **环境变量** 或 **Environment Variables**
3. 点击 **添加变量** 或 **Add Variable**

### 2.3 添加必需的环境变量

**添加以下 2 个必需变量**：

#### 变量 1: NEXT_PUBLIC_SUPABASE_URL
- **变量名**: `NEXT_PUBLIC_SUPABASE_URL`
- **变量值**: 您的 Supabase Project URL
- **示例**: `https://your-project-id.supabase.co`

#### 变量 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **变量名**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **变量值**: 您的 Supabase anon public key
- **示例**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2.4 保存配置

- 点击 **保存** 或 **Save**
- 确认变量已正确配置

---

## 🚀 步骤 3: 触发构建

### 3.1 触发构建

在 Coze 平台：

1. 进入项目页面
2. 找到 **构建** 或 **Build** 按钮
3. 点击 **构建**

### 3.2 监控构建过程

构建过程会自动执行 `scripts/build.sh`：

```
1. 安装依赖
   pnpm install --prefer-frozen-lockfile --prefer-offline

2. 构建项目
   npx next build
```

**构建时间**: 约 2-5 分钟

### 3.3 查看构建日志

- 在构建页面查看实时日志
- 确认没有错误信息
- 等待构建完成

**成功的日志标志**:
```
✓ Compiled successfully
Build completed successfully!
```

---

## 📦 步骤 4: 触发部署

### 4.1 触发部署

构建成功后：

1. 在构建页面找到 **部署** 或 **Deploy** 按钮
2. 点击 **部署**

### 4.2 监控部署过程

部署过程会自动执行 `scripts/start.sh`：

```
1. 检查环境变量
   ✅ NEXT_PUBLIC_SUPABASE_URL
   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

2. 创建日志目录
   mkdir -p /app/work/logs/bypass

3. 启动服务
   npx next start --port 5000 --hostname 0.0.0.0
```

### 4.3 查看部署日志

- 在部署页面查看实时日志
- 确认服务正常启动
- 等待服务就绪

**成功的日志标志**:
```
[INFO] Environment variables check passed
[INFO] Starting HTTP service on port 5000
ready - started server on 0.0.0.0:5000, url: http://localhost:5000
```

---

## ✅ 步骤 5: 验证部署

### 5.1 检查服务状态

在 Coze 平台项目页面查看：

- ✅ **构建状态**: 构建成功
- ✅ **部署状态**: 运行中
- ✅ **健康检查**: 健康

### 5.2 获取访问地址

在项目页面找到 **访问地址**：

- 复制分配的域名
- 格式通常是：`https://your-app-id.coze.site` 或类似

### 5.3 测试访问

1. 在浏览器中打开访问地址
2. 验证页面正常显示
3. 测试页面功能

### 5.4 查看日志

在 Coze 平台的日志页面：

- 查看实时日志
- 确认没有严重错误
- 检查 Supabase 连接是否成功

---

## 🆘 常见问题

### 问题 1: 构建失败

**原因**: 依赖安装失败或 TypeScript 错误

**解决**:
1. 查看构建日志
2. 确认项目配置正确
3. 重新触发构建

### 问题 2: 环境变量未生效

**原因**: 环境变量未正确配置

**解决**:
1. 检查变量名拼写是否正确
2. 确认变量值完整
3. 重新保存环境变量
4. 重新触发部署

### 问题 3: 服务启动失败

**原因**: 环境变量缺失或 Supabase 连接失败

**解决**:
1. 查看启动日志
2. 确认环境变量已配置
3. 验证 Supabase 凭证正确
4. 确认数据库 Schema 已同步

### 问题 4: 页面无法访问

**原因**: 服务未启动或访问地址错误

**解决**:
1. 检查服务状态是否为"运行中"
2. 确认访问地址正确
3. 查看服务日志
4. 尝试刷新页面

---

## 📊 部署检查清单

### 部署前
- [ ] Supabase 项目已创建
- [ ] 已获取 Supabase URL 和 anon key
- [ ] 数据库 Schema 已同步
- [ ] 环境变量已配置

### 部署中
- [ ] 构建成功
- [ ] 无构建错误
- [ ] 部署成功
- [ ] 服务启动正常

### 部署后
- [ ] 服务状态为"运行中"
- [ ] 健康检查通过
- [ ] 无严重错误日志
- [ ] 页面可正常访问

---

## 💡 我的角色

### ✅ 我能做的：

1. **验证配置**
   - 检查项目配置文件
   - 验证脚本是否正确
   - 测试 Supabase 连接（如果提供凭证）

2. **提供指导**
   - 详细的操作步骤
   - 常见问题解决方案
   - 最佳实践建议

3. **创建工具**
   - 验证脚本
   - 检查清单
   - 部署指南

### ❌ 我不能做的：

1. **直接访问 Coze 平台**
   - 无法登录您的 Coze 账号
   - 无法配置环境变量
   - 无法触发构建和部署

2. **获取 Supabase 凭证**
   - 无法替您创建 Supabase 项目
   - 无法访问您的 Supabase Dashboard

3. **外部操作**
   - 无法访问外部服务
   - 无法执行需要人工验证的操作

---

## 🎯 下一步操作

请按照以下顺序操作：

1. ✅ **完成步骤 1**: 获取 Supabase 凭证
2. ✅ **完成步骤 2**: 在 Coze 平台配置环境变量
3. ✅ **完成步骤 3**: 触发构建
4. ✅ **完成步骤 4**: 触发部署
5. ✅ **完成步骤 5**: 验证部署

**如果在任何步骤遇到问题**：
- 告诉我具体在哪一步
- 提供错误信息或截图
- 我会帮您分析和解决

---

## 📞 需要帮助？

如果您在操作过程中遇到问题：

1. **告诉我您在哪一步**
   - 例如："在步骤 2 配置环境变量时遇到问题"

2. **提供错误信息**
   - 复制错误日志或描述错误现象

3. **告诉我您做了什么**
   - 例如："我添加了环境变量，但保存后显示..."

我会根据您提供的信息，帮您分析和解决问题！

---

## 🎉 开始部署

准备好了吗？

**立即开始**:
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建项目或选择现有项目
3. 复制 Project URL 和 anon public key
4. 在 Coze 平台配置环境变量
5. 触发构建和部署

**祝您部署顺利！🚀**
