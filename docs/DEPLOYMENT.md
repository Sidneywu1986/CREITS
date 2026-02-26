# 部署指南 - REITs 智能助手

本文档提供了 REITs 智能助手的完整部署指南，包括环境准备、配置、部署步骤和故障排查。

## 📋 目录

- [环境要求](#环境要求)
- [部署前准备](#部署前准备)
- [快速部署](#快速部署)
- [详细部署步骤](#详细部署步骤)
- [环境变量配置](#环境变量配置)
- [验证部署](#验证部署)
- [常见问题](#常见问题)
- [监控和日志](#监控和日志)

## 环境要求

### 必需环境

- **Node.js**: 24.x 或更高版本
- **pnpm**: 最新版本（项目使用 pnpm 作为包管理器）
- **操作系统**: Linux/macOS/Windows (WSL2)
- **内存**: 至少 2GB RAM
- **磁盘空间**: 至少 5GB 可用空间

### 外部服务

- **Supabase**: PostgreSQL 数据库服务（必须）
  - 需要创建 Supabase 项目
  - 获取项目 URL 和 API 密钥

### 可选服务

- **Coze 平台**: 用于托管和部署（如使用 Coze CLI）
- **对象存储**: 用于存储文件（可选）
- **通知服务**: 用于发送告警（可选）

## 部署前准备

### 1. 获取 Supabase 凭证

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 进入项目设置 -> API
4. 记录以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: 公开密钥（客户端使用）
   - **service_role**: 服务角色密钥（仅服务端使用）

### 2. 准备环境变量文件

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入真实值
nano .env  # 或使用其他编辑器
```

### 3. 验证必需环境变量

确保 `.env` 文件中至少包含以下变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 快速部署

### 使用部署脚本（推荐）

```bash
# 一键部署
bash scripts/deploy.sh
```

部署脚本会自动执行以下操作：
1. ✅ 检查环境变量
2. ✅ 安装依赖
3. ✅ 构建项目
4. ✅ 清理旧进程
5. ✅ 启动服务
6. ✅ 运行健康检查

### 使用 Coze CLI

```bash
# 构建生产版本
coze build

# 启动生产服务
coze start
```

## 详细部署步骤

### 步骤 1: 安装依赖

```bash
# 安装项目依赖
pnpm install

# 验证安装
pnpm list
```

### 步骤 2: 同步数据库 Schema

```bash
# 同步 Drizzle Schema 到 Supabase
coze-coding-ai db upgrade

# 验证表创建成功
node scripts/verify-supabase-tables.ts
```

### 步骤 3: 构建项目

```bash
# 构建生产版本
pnpm run build

# 验证构建输出
ls -la .next/
```

### 步骤 4: 启动服务

```bash
# 方式 1: 使用启动脚本
bash scripts/start.sh

# 方式 2: 使用 Next.js 命令
npx next start --port 5000 --hostname 0.0.0.0

# 方式 3: 后台运行（推荐）
nohup npx next start --port 5000 --hostname 0.0.0.0 > /app/work/logs/bypass/app.log 2>&1 &
```

### 步骤 5: 验证部署

```bash
# 运行健康检查
bash scripts/health-check.sh

# 或手动检查
curl -I http://localhost:5000
```

## 环境变量配置

### 必需配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGci...` |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | 服务角色密钥 | - |
| `PORT` | 服务端口 | `5000` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `ENABLE_DATA_COLLECTION` | 启用数据采集 | `true` |
| `ENABLE_EVOLUTION_LOOP` | 启用进化闭环 | `true` |

### 功能开关

```bash
# 启用/禁用特定功能
ENABLE_DATA_COLLECTION=true
ENABLE_EVOLUTION_LOOP=true
ENABLE_API_PLATFORM=true
ENABLE_AI_MARKETPLACE=true
```

### 数据采集配置

```bash
# 数据采集间隔（小时）
SZSE_COLLECT_INTERVAL=6
SSE_COLLECT_INTERVAL=6
ANNOUNCEMENT_COLLECT_INTERVAL=1
```

## 验证部署

### 1. 检查服务状态

```bash
# 检查端口是否监听
ss -tuln | grep :5000

# 检查进程
ps aux | grep "next start"
```

### 2. 测试 HTTP 连接

```bash
# 测试主页
curl http://localhost:5000

# 测试健康检查端点
curl http://localhost:5000/api/health
```

### 3. 查看日志

```bash
# 查看最新日志
tail -f /app/work/logs/bypass/app.log

# 查看错误日志
tail -f /app/work/logs/bypass/app.log | grep -i error

# 查看最近 50 行
tail -n 50 /app/work/logs/bypass/app.log
```

### 4. 验证数据库连接

```bash
# 运行数据库连接测试
node scripts/test-supabase-simple.ts

# 验证表结构
node scripts/verify-supabase-tables.ts

# 测试数据服务
node scripts/test-complete-service.ts
```

### 5. 功能测试清单

- [ ] 主页正常加载
- [ ] Supabase 连接正常
- [ ] 所有数据表可访问
- [ ] API 端点响应正常
- [ ] 日志正常输出
- [ ] 无内存泄漏

## 常见问题

### 1. 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::5000`

**解决方案**:
```bash
# 查找占用端口的进程
ss -lntp | grep :5000

# 杀死进程
kill -9 <PID>

# 或使用部署脚本自动清理
bash scripts/deploy.sh
```

### 2. 数据库连接失败

**问题**: `Database connection failed` 或 `Invalid API key`

**解决方案**:
1. 检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
2. 验证 Supabase 项目是否处于活动状态
3. 检查网络连接和防火墙规则
4. 运行测试脚本: `node scripts/test-supabase-simple.ts`

### 3. 构建失败

**问题**: `Build failed` 或 TypeScript 错误

**解决方案**:
```bash
# 清理构建缓存
rm -rf .next node_modules

# 重新安装依赖
pnpm install

# 重新构建
pnpm run build

# 检查 TypeScript 错误
npx tsc --noEmit
```

### 4. 环境变量未生效

**问题**: 服务运行但无法读取环境变量

**解决方案**:
1. 确认 `.env` 文件存在
2. 检查变量名拼写（区分大小写）
3. 重启服务使环境变量生效
4. 验证变量是否正确加载: `echo $NEXT_PUBLIC_SUPABASE_URL`

### 5. 健康检查失败

**问题**: 健康检查脚本返回失败

**解决方案**:
1. 检查服务是否真正启动: `ps aux | grep next`
2. 查看日志了解错误: `tail -n 50 /app/work/logs/bypass/app.log`
3. 确认端口正确: `curl -I http://localhost:5000`
4. 检查防火墙和网络配置

## 监控和日志

### 日志文件位置

- **应用日志**: `/app/work/logs/bypass/app.log`
- **开发日志**: `/app/work/logs/bypass/dev.log`
- **控制台日志**: `/app/work/logs/bypass/console.log`

### 实时监控

```bash
# 实时查看应用日志
tail -f /app/work/logs/bypass/app.log

# 监控错误日志
tail -f /app/work/logs/bypass/app.log | grep -i error

# 监控服务进程
watch -n 1 'ps aux | grep "next start"'
```

### 性能监控

```bash
# 查看 CPU 和内存使用
top -p $(cat /app/work/logs/bypass/service.pid)

# 查看端口连接
ss -tn | grep :5000

# 查看磁盘使用
df -h
```

## 生产环境建议

### 安全配置

1. **启用 HTTPS**: 在生产环境必须使用 HTTPS
2. **保护敏感密钥**: 不要将 `SUPABASE_SERVICE_ROLE_KEY` 暴露给客户端
3. **启用安全头**: 配置 CSP、XSS 保护等
4. **限制 CORS**: 配置允许的域名列表

### 性能优化

1. **启用 CDN**: 静态资源使用 CDN 加速
2. **配置缓存**: 配置适当的缓存策略
3. **数据库优化**: 为常用查询添加索引
4. **监控资源**: 设置资源使用告警

### 备份策略

1. **数据库备份**: 定期备份 Supabase 数据库
2. **日志备份**: 定期归档日志文件
3. **配置备份**: 备份环境变量和配置文件

### 高可用部署

1. **负载均衡**: 使用 Nginx 或云负载均衡器
2. **多实例**: 部署多个服务实例
3. **健康检查**: 配置自动故障转移
4. **蓝绿部署**: 实现零停机部署

## 部署检查清单

### 部署前

- [ ] 确认 Node.js 版本 (24.x)
- [ ] 确认 pnpm 已安装
- [ ] 获取 Supabase 凭证
- [ ] 配置 `.env` 文件
- [ ] 验证环境变量
- [ ] 备份现有数据（如有）

### 部署中

- [ ] 安装依赖成功
- [ ] 构建无错误
- [ ] 数据库同步成功
- [ ] 服务启动成功
- [ ] 端口正常监听
- [ ] 健康检查通过

### 部署后

- [ ] 主页可访问
- [ ] API 响应正常
- [ ] 数据库连接正常
- [ ] 日志正常输出
- [ ] 无明显性能问题
- [ ] 监控告警配置

## 获取帮助

如果遇到问题：

1. 查看日志文件: `/app/work/logs/bypass/app.log`
2. 运行诊断脚本: `bash scripts/health-check.sh`
3. 查看项目文档: `docs/` 目录
4. 检查已知问题: 查看本文档的"常见问题"部分

## 更新日志

- **v1.0.0** (2025-02-27): 初始部署文档
  - 添加部署脚本和健康检查
  - 完整的环境变量配置说明
  - 故障排查指南
