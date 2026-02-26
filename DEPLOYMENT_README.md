# 部署文件说明

本目录包含了 REITs 智能助手的所有部署相关文件。

## 📁 文件列表

### 配置文件

| 文件名 | 说明 | 用途 |
|--------|------|------|
| `.env.example` | 环境变量模板 | 配置所有必需和可选的环境变量 |
| `Dockerfile` | Docker 镜像构建文件 | 构建应用 Docker 镜像 |
| `.dockerignore` | Docker 构建忽略文件 | 排除不需要打包到镜像中的文件 |
| `docker-compose.yml` | Docker Compose 配置 | 定义多容器应用服务 |

### 脚本文件

| 文件名 | 说明 | 用途 |
|--------|------|------|
| `scripts/deploy.sh` | 一键部署脚本 | 自动化部署流程 |
| `scripts/health-check.sh` | 健康检查脚本 | 验证服务健康状态 |

### 文档文件

| 文件名 | 说明 |
|--------|------|
| `docs/DEPLOYMENT.md` | 完整的部署指南 |
| `docs/DEPLOYMENT_CHECKLIST.md` | 部署检查清单 |
| `docs/DOCKER_DEPLOYMENT.md` | Docker 部署指南 |
| `docs/SUPABASE_SETUP.md` | Supabase 配置指南 |

## 🚀 快速开始

### 方式 1: 使用部署脚本（推荐）

```bash
# 1. 配置环境变量
cp .env.example .env
nano .env  # 填入真实值

# 2. 运行部署脚本
bash scripts/deploy.sh

# 3. 访问应用
curl http://localhost:5000
```

### 方式 2: 使用 Docker

```bash
# 1. 配置环境变量
cp .env.example .env
nano .env  # 填入真实值

# 2. 使用 Docker Compose 部署
docker compose up -d

# 3. 查看日志
docker compose logs -f app

# 4. 访问应用
curl http://localhost:5000
```

### 方式 3: 使用 Coze CLI

```bash
# 1. 配置环境变量（在平台配置）
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. 构建项目
coze build

# 3. 启动服务
coze start

# 4. 访问应用
# 通过平台分配的域名访问
```

## 📋 部署前准备

### 必需环境

- ✅ Node.js 24.x 或更高版本
- ✅ pnpm 包管理器
- ✅ 至少 2GB RAM
- ✅ 至少 5GB 磁盘空间
- ✅ 5000 端口可用

### 必需配置

- ✅ Supabase 项目已创建
- ✅ Supabase URL 和 API 密钥已获取
- ✅ 环境变量已配置

### 数据库准备

```bash
# 同步数据库 Schema
coze-coding-ai db upgrade

# 验证表创建
node scripts/verify-supabase-tables.ts
```

## 🔍 验证部署

### 1. 健康检查

```bash
# 运行健康检查脚本
bash scripts/health-check.sh

# 或手动检查
curl -I http://localhost:5000
```

### 2. 日志检查

```bash
# 查看应用日志
tail -f /app/work/logs/bypass/app.log

# 查看错误日志
grep -i error /app/work/logs/bypass/app.log
```

### 3. 功能测试

```bash
# 测试数据库连接
node scripts/test-supabase-simple.ts

# 测试数据服务
node scripts/test-complete-service.ts
```

## 📚 文档索引

- **[部署指南](./docs/DEPLOYMENT.md)** - 完整的部署步骤和配置说明
- **[部署检查清单](./docs/DEPLOYMENT_CHECKLIST.md)** - 部署前、中、后的检查项
- **[Docker 部署指南](./docs/DOCKER_DEPLOYMENT.md)** - Docker 和 Docker Compose 部署
- **[Supabase 配置指南](./docs/SUPABASE_SETUP.md)** - Supabase 数据库配置

## 🆘 常见问题

### 1. 环境变量未生效

**问题**: 服务启动但无法读取环境变量

**解决方案**:
```bash
# 确认 .env 文件存在
ls -la .env

# 检查变量格式
cat .env | grep NEXT_PUBLIC_SUPABASE

# 重启服务
bash scripts/deploy.sh
```

### 2. 端口被占用

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

### 3. 数据库连接失败

**问题**: `Database connection failed`

**解决方案**:
```bash
# 验证环境变量
echo $NEXT_PUBLIC_SUPABASE_URL

# 测试数据库连接
node scripts/test-supabase-simple.ts

# 检查 Supabase 项目状态
# 访问 https://supabase.com/dashboard
```

## 📞 获取帮助

如遇到问题，请：

1. 查看相关文档
2. 检查日志文件: `/app/work/logs/bypass/app.log`
3. 运行健康检查: `bash scripts/health-check.sh`
4. 查看部署检查清单: `docs/DEPLOYMENT_CHECKLIST.md`

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建
pnpm install
pnpm run build

# 3. 重启服务
bash scripts/deploy.sh

# 4. 验证部署
bash scripts/health-check.sh
```

## 📊 监控和维护

### 查看服务状态

```bash
# 检查进程
ps aux | grep "next start"

# 检查端口
ss -tuln | grep :5000

# 查看资源使用
top -p $(cat /app/work/logs/bypass/service.pid)
```

### 日志管理

```bash
# 查看实时日志
tail -f /app/work/logs/bypass/app.log

# 查看错误日志
tail -f /app/work/logs/bypass/app.log | grep -i error

# 日志归档
tar -czf logs-$(date +%Y%m%d).tar.gz /app/work/logs/bypass/
```

### 性能优化

- 定期清理日志文件
- 监控内存和 CPU 使用
- 优化数据库查询
- 使用 CDN 加速静态资源

## 🔐 安全建议

- ✅ 不要将 `.env` 文件提交到版本控制
- ✅ 定期更新依赖包
- ✅ 使用 HTTPS（生产环境）
- ✅ 配置防火墙规则
- ✅ 定期备份数据库
- ✅ 监控异常访问

## 📝 更新日志

- **v1.0.0** (2025-02-27)
  - 初始部署配置
  - 添加部署脚本和健康检查
  - 完整的文档和检查清单
  - Docker 支持
