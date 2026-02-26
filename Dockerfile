# ===========================================
# REITs 智能助手 - Docker 镜像
# ===========================================
# 使用官方 Node.js 24 镜像作为基础镜像
# ===========================================

# 构建阶段
FROM node:24-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile --prefer-offline

# 复制项目文件
COPY . .

# 构建应用
RUN pnpm run build

# ===========================================
# 生产阶段
# ===========================================
FROM node:24-alpine AS runner

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 仅安装生产依赖
RUN pnpm install --prod --frozen-lockfile --prefer-offline

# 从构建阶段复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# 创建日志目录
RUN mkdir -p /app/work/logs/bypass && chown -R nextjs:nodejs /app/work

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 5000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# 启动应用
CMD ["npx", "next", "start", "--port", "5000", "--hostname", "0.0.0.0"]
