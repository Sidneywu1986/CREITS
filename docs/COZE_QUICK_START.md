# Coze 部署快速参考

## 🚀 快速开始（5分钟部署）

### 步骤 1: 配置 Supabase

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建项目或选择现有项目
3. 进入 Settings → API
4. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: 复制密钥

### 步骤 2: 同步数据库

在本地运行：
```bash
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

1. **构建**: 点击"构建"按钮
2. **部署**: 构建成功后点击"部署"
3. **访问**: 通过分配的地址访问应用

## 📋 必需配置

### 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ 必需 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ 必需 |

### 数据库 Schema

确保已同步 7 张表：
- ✅ `reits_products` - REITs 产品
- ✅ `reits_policies` - 政策法规
- ✅ `reits_news` - 新闻资讯
- ✅ `reits_announcements` - 公告信息
- ✅ `reits_valuation_history` - 估值历史
- ✅ `reits_model_training` - 模型训练
- ✅ `reits_evolution_tasks` - 进化任务

## 🔍 验证清单

### 部署后验证

- [ ] 构建状态：✅ 成功
- [ ] 部署状态：✅ 运行中
- [ ] 健康检查：✅ 健康
- [ ] 无错误日志
- [ ] 页面可访问
- [ ] 数据库连接正常

### 快速测试

在 Coze 平台终端运行：
```bash
# 测试服务响应
curl -I http://localhost:5000

# 查看日志
tail -f /app/work/logs/bypass/app.log
```

## 🆘 常见问题快速解决

### 1. 构建失败

**检查**：
- 查看构建日志
- 确认依赖安装成功
- 验证 TypeScript 无错误

### 2. 环境变量未生效

**解决**：
- 在 Coze 平台重新配置
- 重新触发部署
- 检查变量名拼写

### 3. 数据库连接失败

**检查**：
- Supabase URL 是否正确
- API 密钥是否正确
- 项目是否处于活动状态

### 4. 页面无法访问

**检查**：
- 服务状态是否为"运行中"
- 访问地址是否正确
- 查看服务日志

## 📞 获取帮助

- **详细指南**: [Coze 部署完整指南](./COZE_DEPLOYMENT.md)
- **检查清单**: [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- **Supabase 配置**: [Supabase 配置指南](./SUPABASE_SETUP.md)

## 📊 监控要点

### 关键指标

- ✅ 服务状态：运行中
- ✅ CPU 使用：< 80%
- ✅ 内存使用：< 2GB
- ✅ 响应时间：< 2s
- ✅ 错误率：0%

### 日志监控

关注以下日志：
- ✅ `[INFO] Environment variables check passed`
- ✅ `[INFO] Starting HTTP service on port 5000`
- ✅ `ready - started server on 0.0.0.0:5000`

警惕以下错误：
- ❌ `NEXT_PUBLIC_SUPABASE_URL is not set`
- ❌ `Database connection failed`
- ❌ `Error: listen EADDRINUSE`

## 🔄 更新流程

1. **修改代码**
   - 本地开发并测试
   - 提交代码到仓库

2. **触发构建**
   - 在 Coze 平台点击"构建"
   - 等待构建完成

3. **部署新版本**
   - 点击"部署"
   - 验证新版本

4. **验证功能**
   - 访问应用
   - 测试关键功能

## 🎯 成功标志

部署成功的标志：

```
✅ 构建成功（Build Success）
✅ 服务运行中（Running）
✅ 健康检查通过（Health Check: Healthy）
✅ 无严重错误（No Critical Errors）
✅ 页面可访问（Page Accessible）
```

---

**提示**: 如遇到问题，请查看 [Coze 部署完整指南](./COZE_DEPLOYMENT.md) 获取详细解决方案。
