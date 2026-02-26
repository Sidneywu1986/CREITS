# Docker 部署指南

本文档提供了使用 Docker 和 Docker Compose 部署 REITs 智能助手的详细指南。

## 📋 目录

- [前提条件](#前提条件)
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [管理命令](#管理命令)
- [故障排查](#故障排查)
- [高级配置](#高级配置)

## 前提条件

### 必需软件

- **Docker**: 20.10.x 或更高版本
- **Docker Compose**: 2.0.x 或更高版本

### 验证安装

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker compose version

# 检查 Docker 服务状态
docker ps
```

## 快速开始

### 1. 准备环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env
```

### 2. 构建并启动

```bash
# 构建并启动应用
docker compose up -d

# 查看日志
docker compose logs -f app

# 检查健康状态
docker compose ps
```

### 3. 访问应用

```bash
# 测试访问
curl http://localhost:5000

# 或在浏览器中打开
# http://localhost:5000
```

## 详细部署步骤

### 步骤 1: 准备环境变量

确保 `.env` 文件包含以下必需变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 步骤 2: 构建镜像

```bash
# 构建应用镜像
docker compose build

# 或仅构建应用服务
docker compose build app
```

### 步骤 3: 启动服务

```bash
# 启动所有服务
docker compose up -d

# 启动特定服务
docker compose up -d app

# 查看服务状态
docker compose ps
```

### 步骤 4: 运行数据库迁移

```bash
# 运行数据库迁移（一次性）
docker compose --profile migrations up supabase-migrations

# 验证表已创建
docker compose --profile migrations logs supabase-migrations
```

### 步骤 5: 验证部署

```bash
# 检查应用健康状态
curl http://localhost:5000/api/health

# 查看应用日志
docker compose logs -f app

# 进入容器内部检查
docker compose exec app sh
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 应用端口 | `5000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | - |
| `LOG_LEVEL` | 日志级别 | `info` |

### 端口映射

默认端口映射：

| 容器端口 | 主机端口 | 说明 |
|---------|---------|------|
| 5000 | 5000 | 应用 HTTP 端口 |

### 数据卷

默认数据卷：

| 卷名 | 挂载路径 | 说明 |
|------|---------|------|
| logs | /app/work/logs/bypass | 应用日志 |

## 管理命令

### 服务管理

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose stop

# 重启服务
docker compose restart

# 删除服务
docker compose down

# 删除服务并删除卷
docker compose down -v
```

### 查看状态

```bash
# 查看服务状态
docker compose ps

# 查看资源使用
docker stats

# 查看服务日志
docker compose logs -f app

# 查看最近的日志
docker compose logs --tail=100 app
```

### 进入容器

```bash
# 进入应用容器
docker compose exec app sh

# 在容器中执行命令
docker compose exec app node --version

# 在容器中运行测试
docker compose exec app npm test
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker compose build

# 重启服务
docker compose up -d

# 清理旧镜像
docker image prune -f
```

## 故障排查

### 1. 容器无法启动

**问题**: 容器启动失败或立即退出

**解决方案**:
```bash
# 查看容器日志
docker compose logs app

# 检查环境变量
docker compose config

# 检查端口占用
netstat -tuln | grep :5000
```

### 2. 数据库连接失败

**问题**: 应用无法连接到 Supabase

**解决方案**:
```bash
# 验证环境变量
docker compose exec app env | grep SUPABASE

# 测试网络连接
docker compose exec app ping your-project-id.supabase.co

# 检查健康检查
docker compose exec app sh -c "curl http://localhost:5000/api/health"
```

### 3. 权限问题

**问题**: 日志文件无法写入

**解决方案**:
```bash
# 修复日志目录权限
sudo chown -R 1001:1001 ./logs

# 或在 docker-compose.yml 中使用 root 用户运行
# 不推荐生产环境
```

### 4. 内存不足

**问题**: 容器因内存不足被杀死

**解决方案**:
```bash
# 限制容器内存使用
# 在 docker-compose.yml 中添加:
# deploy:
#   resources:
#     limits:
#       memory: 2G

# 或增加 Docker 内存限制
# Docker Desktop -> Settings -> Resources -> Memory
```

## 高级配置

### 1. 使用 Nginx 反向代理

```bash
# 启动 Nginx 代理
docker compose --profile proxy up -d

# 配置 SSL 证书
# 将证书文件放置在 ./nginx/ssl/ 目录
```

### 2. 启用日志收集

```bash
# 启动日志收集器
docker compose --profile logging up -d

# 配置 Fluent Bit
# 编辑 ./fluent-bit/fluent-bit.conf
```

### 3. 多实例部署

```bash
# 扩展应用实例
docker compose up -d --scale app=3

# 使用 Nginx 负载均衡
# 在 nginx.conf 中配置多个 upstream
```

### 4. 自定义镜像

```bash
# 使用自定义 Dockerfile
docker compose -f docker-compose.custom.yml build

# 使用构建参数
docker build --build-arg NODE_VERSION=24 -t reits-assistant:custom .
```

### 5. 健康检查配置

在 `docker-compose.yml` 中自定义健康检查：

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 性能优化

### 1. 镜像优化

```dockerfile
# 使用多阶段构建
# 已在 Dockerfile 中实现

# 使用 .dockerignore 排除不必要的文件
# 已创建 .dockerignore

# 使用 Alpine Linux 基础镜像
# 已在 Dockerfile 中使用
```

### 2. 运行时优化

```bash
# 使用资源限制
# 在 docker-compose.yml 中添加:
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G

# 启用 Docker BuildKit
export DOCKER_BUILDKIT=1
```

### 3. 网络优化

```bash
# 使用自定义网络
# 已在 docker-compose.yml 中配置

# 配置 DNS
# 在 docker-compose.yml 中添加:
dns:
  - 8.8.8.8
  - 8.8.4.4
```

## 安全最佳实践

### 1. 使用非 root 用户

```dockerfile
# 已在 Dockerfile 中实现
USER nextjs
```

### 2. 最小化镜像

```dockerfile
# 使用 Alpine Linux
FROM node:24-alpine

# 只安装生产依赖
RUN pnpm install --prod
```

### 3. 敏感信息管理

```bash
# 使用 Docker Secrets（Swarm 模式）
# 或使用环境变量文件
docker compose --env-file .env.prod up -d
```

### 4. 网络隔离

```yaml
# 使用隔离的网络
networks:
  reits-network:
    driver: bridge
    internal: true  # 仅内部访问
```

## 监控和日志

### 查看日志

```bash
# 实时查看应用日志
docker compose logs -f app

# 查看所有服务日志
docker compose logs -f

# 查看特定时间的日志
docker compose logs --since 2024-01-01T00:00:00 app
```

### 监控指标

```bash
# 查看容器资源使用
docker stats

# 查看容器详细信息
docker inspect reits-assistant-app

# 查看容器事件
docker events
```

### 日志收集

```bash
# 启用 Fluent Bit 日志收集
docker compose --profile logging up -d

# 配置日志输出到外部系统
# 编辑 ./fluent-bit/fluent-bit.conf
```

## 备份和恢复

### 数据备份

```bash
# 备份日志文件
docker compose exec app tar -czf /tmp/logs-backup.tar.gz /app/work/logs
docker compose cp app:/tmp/logs-backup.tar.gz ./logs-backup.tar.gz

# 备份环境变量
cp .env .env.backup
```

### 数据恢复

```bash
# 恢复日志文件
docker compose cp ./logs-backup.tar.gz app:/tmp/
docker compose exec app tar -xzf /tmp/logs-backup.tar.gz -C /
```

## 故障恢复

### 回滚到上一个版本

```bash
# 停止当前服务
docker compose down

# 使用之前的镜像
docker compose up -d --no-recreate

# 或使用特定镜像
docker compose up -d --image reits-assistant:v1.0.0
```

### 紧急修复

```bash
# 进入容器进行修复
docker compose exec app sh

# 查看日志
cat /app/work/logs/bypass/app.log

# 重启服务
docker compose restart app
```

## 常见问题 (FAQ)

### Q: 如何更新应用？

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建
docker compose build

# 3. 重启服务
docker compose up -d
```

### Q: 如何查看容器内部文件？

```bash
# 列出容器文件
docker compose exec app ls -la /app

# 复制文件到宿主机
docker compose cp app:/app/work/logs/bypass/app.log ./app.log

# 复制文件到容器
docker compose cp ./config.json app:/app/config/
```

### Q: 如何清理 Docker 资源？

```bash
# 清理停止的容器
docker container prune -f

# 清理未使用的镜像
docker image prune -f

# 清理未使用的卷
docker volume prune -f

# 清理所有未使用的资源
docker system prune -a -f
```

### Q: 如何在生产环境部署？

```bash
# 1. 使用生产环境变量
docker compose --env-file .env.prod up -d

# 2. 启用所有服务
docker compose --profile proxy --profile logging up -d

# 3. 配置 SSL 证书
# 将证书文件放置在 ./nginx/ssl/ 目录

# 4. 配置防火墙
# 只允许 80 和 443 端口访问
```

## 获取帮助

如需更多帮助，请参考：

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [项目部署指南](./DEPLOYMENT.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
