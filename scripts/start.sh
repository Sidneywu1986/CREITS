#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"
LOG_DIR="/app/work/logs/bypass"

# 创建日志目录
mkdir -p "${LOG_DIR}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# 检查必需的环境变量
check_environment() {
    log "Checking environment variables..."
    
    if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
        log "❌ NEXT_PUBLIC_SUPABASE_URL is not set"
        return 1
    fi
    
    if [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
        log "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
        return 1
    fi
    
    log "✅ Environment variables check passed"
    return 0
}

start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    log "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."

    # 检查环境变量（仅警告，不阻止启动）
    if ! check_environment; then
        log "⚠️  Environment check failed, but continuing anyway (Supabase features will be disabled)"
    fi

    # 启动服务（前台运行，以便 Coze 平台监控）
    exec npx next start --port ${DEPLOY_RUN_PORT} --hostname 0.0.0.0
}

log "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
