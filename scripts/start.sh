#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "================================="
log "Starting Next.js app on VefaaS"
log "================================="
log "Current directory: $(pwd)"
log "Node version: $(node -v)"
log "PORT: ${DEPLOY_RUN_PORT}"
log "WORKSPACE: ${COZE_WORKSPACE_PATH}"

# 切换到工作目录
cd "${COZE_WORKSPACE_PATH}"

# 检查项目文件
if [ ! -f "package.json" ]; then
    log "❌ Error: package.json not found in ${COZE_WORKSPACE_PATH}"
    ls -la
    exit 1
fi

log "✅ Found package.json"

# 启动服务（前台运行，以便 VefaaS 监控）
log "Starting HTTP service on port ${DEPLOY_RUN_PORT}..."
exec npx next start --port ${DEPLOY_RUN_PORT} --hostname 0.0.0.0
