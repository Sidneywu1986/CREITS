# Coze 平台部署指南

本指南专门针对 Coze 平台的部署流程，帮助您在 Coze 平台上快速部署 REITs 智能助手。

## 📋 目录

- [部署前准备](#部署前准备)
- [配置环境变量](#配置环境变量)
- [部署流程](#部署流程)
- [验证部署](#验证部署)
- [访问应用](#访问应用)
- [常见问题](#常见问题)

## 部署前准备

### 1. 准备 Supabase 凭证

在部署前，您需要准备好 Supabase 的凭证：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 进入项目设置 → API
4. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: 匿名密钥
   - **service_role**: 服务角色密钥（可选，用于服务端操作）

### 2. 同步数据库 Schema

在部署前，需要将数据库 Schema 同步到 Supabase：

```bash
# 在本地运行此命令
coze-coding-ai db upgrade

# 验证表已创建
node scripts/verify-supabase-tables.ts
```

### 3. 检查项目配置

确认项目配置文件 `.coze` 存在且配置正确：

```toml
[project]
requires = ["nodejs-24"]

[dev]
build = ["bash", "./scripts/prepare.sh"]
run = ["bash", "./scripts/dev.sh"]
deps = ["git"]

[deploy]
build = ["bash","./scripts/build.sh"]
run = ["bash","./scripts/start.sh"]
deps = ["git"]
```

## 配置环境变量

### 在 Coze 平台配置环境变量

部署到 Coze 平台时，需要在平台的环境变量配置中添加以下必需变量：

#### 必需环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxxxxxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

#### 可选环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | 服务角色密钥 | - |
| `PORT` | 服务端口 | `5000` |
| `LOG_LEVEL` | 日志级别 | `info` |

### 配置步骤

1. 登录 Coze 平台
2. 进入项目设置 → 环境变量
3. 添加必需的环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. 保存配置

## 部署流程

### 方式 1: 使用 Coze CLI（推荐）

如果您有 Coze CLI 访问权限：

```bash
# 1. 初始化项目（如果还没初始化）
coze init . --template nextjs

# 2. 构建项目
coze build

# 3. 部署项目
coze deploy

# 4. 查看部署状态
coze status
```

### 方式 2: 通过 Coze 平台界面部署

1. **上传代码**
   - 登录 Coze 平台
   - 进入项目页面
   - 上传项目代码或连接 Git 仓库

2. **配置环境变量**
   - 进入项目设置 → 环境变量
   - 添加 Supabase 相关的环境变量
   - 保存配置

3. **触发构建**
   - 点击"构建"按钮
   - 等待构建完成（通常需要 2-5 分钟）

4. **部署服务**
   - 构建成功后，点击"部署"按钮
   - 等待服务启动

### 构建过程

构建过程会自动执行 `scripts/build.sh` 脚本：

1. ✅ 安装依赖
   ```bash
   pnpm install --prefer-frozen-lockfile --prefer-offline
   ```

2. ✅ 构建项目
   ```bash
   npx next build
   ```

3. ✅ 验证构建产物
   - 检查 `.next/` 目录
   - 验证构建无错误

### 启动过程

服务启动时会执行 `scripts/start.sh` 脚本：

1. ✅ 检查环境变量
   - 验证 `NEXT_PUBLIC_SUPABASE_URL` 已配置
   - 验证 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配置

2. ✅ 创建日志目录
   ```bash
   mkdir -p /app/work/logs/bypass
   ```

3. ✅ 启动 Next.js 服务
   ```bash
   npx next start --port 5000 --hostname 0.0.0.0
   ```

4. ✅ 服务监听 5000 端口
   - 服务将在 5000 端口监听请求
   - Coze 平台会自动转发外部流量

## 验证部署

### 1. 检查部署状态

在 Coze 平台的项目页面，查看：

- ✅ 构建状态：显示"构建成功"
- ✅ 部署状态：显示"运行中"
- ✅ 健康检查：显示"健康"

### 2. 检查服务日志

在 Coze 平台的日志页面：

1. 查看启动日志
2. 确认没有错误信息
3. 查找以下关键信息：
   ```
   [INFO] Environment variables check passed
   [INFO] Starting HTTP service on port 5000
   ready - started server on 0.0.0.0:5000, url: http://localhost:5000
   ```

### 3. 测试服务连接

在 Coze 平台的终端中：

```bash
# 测试服务是否响应
curl -I http://localhost:5000

# 测试健康检查端点
curl http://localhost:5000/api/health

# 测试数据库连接
# 在平台上运行测试脚本可能不可用，可通过页面访问验证
```

### 4. 功能验证清单

- [ ] 服务状态显示"运行中"
- [ ] 无严重错误日志
- [ ] 端口 5000 正常监听
- [ ] 页面可正常访问
- [ ] Supabase 连接正常

## 访问应用

### 获取访问地址

部署成功后，Coze 平台会分配一个访问地址：

1. **查看分配的域名**
   - 在项目页面找到"访问地址"
   - 通常格式：`https://your-app-id.coze.app` 或类似

2. **通过浏览器访问**
   - 复制访问地址
   - 在浏览器中打开
   - 验证页面正常显示

### 配置自定义域名（可选）

如果需要配置自定义域名：

1. 在 Coze 平台进入项目设置 → 域名管理
2. 添加自定义域名
3. 配置 DNS 解析
4. 等待 SSL 证书生成
5. 通过自定义域名访问应用

## 常见问题

### 1. 构建失败

**问题**: 构建过程中出现错误

**解决方案**:
- 检查日志中的错误信息
- 确认依赖安装成功
- 验证 TypeScript 无错误
- 检查 `package.json` 配置正确

**常见错误**:
```
Error: Cannot find module 'xxx'
```
- 解决方案：确认 `package.json` 中包含该依赖

```
TypeScript error: xxx
```
- 解决方案：修复 TypeScript 错误或添加类型声明

### 2. 环境变量未生效

**问题**: 服务启动失败，提示缺少环境变量

**解决方案**:
1. 确认在 Coze 平台配置了环境变量
2. 检查变量名拼写是否正确
3. 重新触发部署使环境变量生效
4. 在日志中查找环境变量检查信息

**日志示例**:
```
❌ NEXT_PUBLIC_SUPABASE_URL is not set
```
- 解决方案：添加该环境变量

### 3. 数据库连接失败

**问题**: 应用无法连接到 Supabase

**解决方案**:
1. 验证 `NEXT_PUBLIC_SUPABASE_URL` 正确
2. 验证 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 正确
3. 确认 Supabase 项目处于活动状态
4. 检查 Supabase 项目设置中是否启用了数据库连接
5. 查看日志中的详细错误信息

**日志示例**:
```
Error: Database connection failed: Invalid API key
```
- 解决方案：检查 API 密钥是否正确

### 4. 服务启动失败

**问题**: 服务启动后立即停止

**解决方案**:
1. 查看启动日志
2. 检查端口是否被占用
3. 验证环境变量配置正确
4. 确认构建产物完整
5. 检查是否有运行时错误

**日志示例**:
```
Error: listen EADDRINUSE: address already in use :::5000
```
- 解决方案：确认平台没有其他实例使用 5000 端口

### 5. 页面无法访问

**问题**: 部署成功但页面无法访问

**解决方案**:
1. 确认服务状态为"运行中"
2. 检查访问地址是否正确
3. 查看服务日志是否有错误
4. 确认防火墙/安全组规则允许访问
5. 尝试通过平台内网地址访问

### 6. 数据库表不存在

**问题**: 应用启动后提示数据库表不存在

**解决方案**:
1. 确认已运行 `coze-coding-ai db upgrade`
2. 验证 Supabase 项目中有对应的表
3. 检查数据库连接权限
4. 手动运行验证脚本：
   ```bash
   node scripts/verify-supabase-tables.ts
   ```

## 部署后的操作

### 1. 监控服务

在 Coze 平台：

- 实时查看服务日志
- 监控 CPU 和内存使用
- 查看请求量和响应时间
- 设置告警规则

### 2. 更新应用

当需要更新应用时：

1. **提交代码更改**
   - 推送代码到 Git 仓库
   - 或上传新版本代码

2. **触发新构建**
   - 在平台点击"构建"
   - 等待构建完成

3. **部署新版本**
   - 点击"部署"
   - 验证新版本正常运行

### 3. 回滚版本

如果新版本有问题：

1. 在平台选择之前的版本
2. 点击"回滚"
3. 等待回滚完成
4. 验证功能正常

### 4. 查看日志

在 Coze 平台的日志页面：

- 实时日志流
- 历史日志查询
- 错误日志筛选
- 日志下载

## 性能优化

### 1. 构建优化

- 使用 `prefer-offline` 加速依赖安装
- 启用构建缓存
- 优化依赖大小

### 2. 运行时优化

- 配置适当的内存限制
- 启用 CDN 加速静态资源
- 优化数据库查询
- 使用缓存策略

### 3. 监控优化

- 设置合理的告警阈值
- 定期检查日志
- 监控关键指标
- 优化热点路径

## 安全建议

### 1. 环境变量安全

- ✅ 不要将敏感信息提交到代码库
- ✅ 使用平台的环境变量管理
- ✅ 定期轮换 API 密钥
- ✅ 限制环境变量访问权限

### 2. 网络安全

- ✅ 使用 HTTPS（Coze 平台自动提供）
- ✅ 配置 CORS 策略
- ✅ 启用安全头
- ✅ 限制 API 访问频率

### 3. 数据安全

- ✅ 使用 Supabase RLS 策略
- ✅ 加密敏感数据
- ✅ 定期备份数据库
- ✅ 监控异常访问

## 获取帮助

### 遇到问题时：

1. **查看日志**
   - 在 Coze 平台查看实时日志
   - 筛选错误信息
   - 分析错误原因

2. **参考文档**
   - 查看 [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
   - 查看 [Supabase 配置指南](./SUPABASE_SETUP.md)
   - 查看 [常见问题](#常见问题)

3. **联系支持**
   - 通过 Coze 平台提交工单
   - 提供详细的错误日志
   - 描述复现步骤

### 有用的命令

```bash
# 本地测试构建
pnpm run build

# 本地测试启动
pnpm run start

# 测试数据库连接
node scripts/test-supabase-simple.ts

# 验证表结构
node scripts/verify-supabase-tables.ts
```

## 部署检查清单

### 部署前

- [ ] Supabase 项目已创建
- [ ] 数据库 Schema 已同步
- [ ] 环境变量已配置
- [ ] 代码已提交
- [ ] 本地构建测试通过

### 部署中

- [ ] 构建成功
- [ ] 无构建错误
- [ ] 部署成功
- [ ] 服务启动正常

### 部署后

- [ ] 服务状态为"运行中"
- [ ] 无严重错误日志
- [ ] 页面可正常访问
- [ ] 功能测试通过
- [ ] 监控已配置

## 下一步

部署成功后，您可以：

1. **配置域名**: 添加自定义域名
2. **配置监控**: 设置告警规则
3. **优化性能**: 根据使用情况优化配置
4. **开发新功能**: 基于现有功能继续开发

祝您部署顺利！🚀
