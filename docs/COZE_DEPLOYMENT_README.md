# Coze 平台部署 - 完整指南

## 📌 部署概览

本文档提供了在 **Coze 平台** 上部署 REITs 智能助手的完整指南和快速参考。

### 部署架构

```
┌─────────────┐
│   Coze 平台  │
│  ┌────────┐ │
│  │ 构建   │ │ ──→ scripts/build.sh
│  └────────┘ │
│  ┌────────┐ │
│  │ 部署   │ │ ──→ scripts/start.sh
│  └────────┘ │
└─────────────┘
       │
       ↓
┌─────────────┐
│  应用服务   │
│  (5000)     │
└─────────────┘
       │
       ↓
┌─────────────┐
│  Supabase   │
│  数据库     │
└─────────────┘
```

## 🚀 快速开始（5分钟）

### 步骤 1: 准备 Supabase

```bash
# 访问 https://supabase.com/dashboard
# 1. 创建项目
# 2. 复制 Project URL 和 anon public key
```

### 步骤 2: 同步数据库

```bash
# 在本地运行
coze-coding-ai db upgrade
```

### 步骤 3: 配置环境变量

在 Coze 平台的项目设置 → 环境变量中添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 步骤 4: 部署

在 Coze 平台：
1. 点击"构建"
2. 等待构建完成
3. 点击"部署"
4. 通过分配的地址访问

## 📋 必需配置

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGci...` |

### 数据库表

确保已同步以下 7 张表：
- `reits_products`
- `reits_policies`
- `reits_news`
- `reits_announcements`
- `reits_valuation_history`
- `reits_model_training`
- `reits_evolution_tasks`

## 🔍 验证部署

### 1. 检查服务状态

在 Coze 平台查看：
- ✅ 构建状态：成功
- ✅ 部署状态：运行中
- ✅ 健康检查：健康

### 2. 查看日志

在日志页面查找：
```
[INFO] Environment variables check passed
[INFO] Starting HTTP service on port 5000
ready - started server on 0.0.0.0:5000
```

### 3. 测试访问

```bash
# 在 Coze 平台终端
curl -I http://localhost:5000
```

## 🆘 常见问题

### 问题 1: 构建失败

**原因**: TypeScript 错误或依赖问题

**解决**:
1. 查看构建日志
2. 本地运行 `pnpm run build` 测试
3. 修复错误后重新提交

### 问题 2: 环境变量未生效

**原因**: 环境变量配置错误或未保存

**解决**:
1. 检查变量名拼写
2. 重新配置环境变量
3. 重新触发部署

### 问题 3: 数据库连接失败

**原因**: Supabase 凭证错误或项目未激活

**解决**:
1. 验证 Supabase URL 和密钥
2. 确认项目处于活动状态
3. 检查数据库连接权限

### 问题 4: 服务启动失败

**原因**: 端口冲突或配置错误

**解决**:
1. 查看启动日志
2. 确认环境变量正确
3. 检查端口占用

## 📚 详细文档

- **[Coze 部署完整指南](./COZE_DEPLOYMENT.md)** - 详细的部署步骤和配置说明
- **[Coze 快速开始](./COZE_QUICK_START.md)** - 5分钟快速部署指南
- **[部署检查清单](./DEPLOYMENT_CHECKLIST.md)** - 部署前后检查项
- **[Supabase 配置指南](./SUPABASE_SETUP.md)** - Supabase 数据库配置

## 🔄 更新流程

1. **修改代码**
   ```bash
   # 本地开发
   pnpm run dev
   ```

2. **提交代码**
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

3. **触发构建**
   - 在 Coze 平台点击"构建"

4. **部署新版本**
   - 构建成功后点击"部署"

5. **验证更新**
   - 访问应用
   - 测试新功能

## 📊 监控要点

### 关键指标

- 服务状态：运行中
- CPU 使用率：< 80%
- 内存使用：< 2GB
- 响应时间：< 2s
- 错误率：0%

### 日志监控

**正常日志**:
```
[INFO] Environment variables check passed
[INFO] Starting HTTP service on port 5000
ready - started server on 0.0.0.0:5000
```

**错误日志**:
```
❌ NEXT_PUBLIC_SUPABASE_URL is not set
❌ Database connection failed
❌ Error: listen EADDRINUSE
```

## 🔧 部署脚本说明

### scripts/build.sh

构建脚本，在 Coze 平台执行构建时自动运行：

```bash
# 1. 安装依赖
pnpm install --prefer-frozen-lockfile --prefer-offline

# 2. 构建项目
npx next build
```

### scripts/start.sh

启动脚本，在 Coze 平台部署服务时自动运行：

```bash
# 1. 检查环境变量
# 验证 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. 创建日志目录
mkdir -p /app/work/logs/bypass

# 3. 启动服务
npx next start --port 5000 --hostname 0.0.0.0
```

## 🎯 成功标志

部署成功的标志：

```
✅ 构建成功
✅ 服务运行中
✅ 健康检查通过
✅ 无严重错误
✅ 页面可访问
```

## 💡 最佳实践

### 1. 部署前

- 本地测试构建成功
- 同步数据库 Schema
- 配置环境变量
- 备份数据库（如果需要）

### 2. 部署中

- 监控构建日志
- 确认无构建错误
- 验证服务启动
- 检查关键功能

### 3. 部署后

- 配置监控告警
- 定期查看日志
- 优化性能
- 备份数据

## 🔐 安全建议

- ✅ 不要将环境变量提交到代码库
- ✅ 使用 Coze 平台的环境变量管理
- ✅ 定期轮换 API 密钥
- ✅ 启用安全头和 CORS
- ✅ 使用 Supabase RLS 策略

## 📞 获取帮助

如遇到问题：

1. **查看日志** - 在 Coze 平台查看实时日志
2. **参考文档** - 查看详细文档
3. **检查清单** - 使用部署检查清单
4. **联系支持** - 通过 Coze 平台提交工单

## 🎉 开始部署

准备好了吗？按照以下步骤开始部署：

1. 📖 阅读 [Coze 快速开始](./COZE_QUICK_START.md)
2. ⚙️ 配置 Supabase 和环境变量
3. 🚀 在 Coze 平台触发构建和部署
4. ✅ 验证部署成功
5. 🌐 访问您的应用

祝您部署顺利！🚀
