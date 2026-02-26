#!/bin/bash
set -Eeuo pipefail

# ===========================================
# REITs 智能助手 - 部署脚本
# ===========================================

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"
LOG_DIR="${LOG_DIR:-/app/work/logs/bypass}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log_step() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
}

# 创建日志目录
ensure_log_dir() {
    mkdir -p "$LOG_DIR"
    log "✅ Log directory created: $LOG_DIR"
}

# 检查环境变量
check_environment() {
    log_step "Checking Environment Variables"
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log "⚠️  .env file not found, found .env.example"
            log "Please copy .env.example to .env and configure required variables"
        else
            log "❌ .env file not found"
        fi
        
        if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]] || [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
            log "❌ Required environment variables are missing:"
            log "   - NEXT_PUBLIC_SUPABASE_URL"
            log "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
            return 1
        fi
    fi
    
    log "✅ Environment variables check passed"
    return 0
}

# 安装依赖
install_dependencies() {
    log_step "Installing Dependencies"
    
    cd "${COZE_WORKSPACE_PATH}"
    
    log "Installing pnpm packages..."
    pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only
    
    log "✅ Dependencies installed"
}

# 构建项目
build_project() {
    log_step "Building Project"
    
    cd "${COZE_WORKSPACE_PATH}"
    
    log "Building Next.js application..."
    npx next build
    
    if [ $? -ne 0 ]; then
        log "❌ Build failed"
        return 1
    fi
    
    log "✅ Build completed successfully"
}

# 清理旧进程
cleanup_old_process() {
    log_step "Cleaning Up Old Process"
    
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    
    if [[ -n "${pids}" ]]; then
        log "Killing old processes on port ${DEPLOY_RUN_PORT}: ${pids}"
        echo "${pids}" | xargs -I {} kill -9 {} 2>/dev/null || true
        sleep 2
        log "✅ Old processes cleaned up"
    else
        log "✅ Port ${DEPLOY_RUN_PORT} is free"
    fi
}

# 启动服务
start_service() {
    log_step "Starting Service"
    
    cd "${COZE_WORKSPACE_PATH}"
    
    log "Starting HTTP service on port ${DEPLOY_RUN_PORT}..."
    
    # 使用后台方式启动服务，并重定向日志
    nohup npx next start --port ${DEPLOY_RUN_PORT} --hostname 0.0.0.0 > "${LOG_DIR}/app.log" 2>&1 &
    
    local service_pid=$!
    echo "${service_pid}" > "${LOG_DIR}/service.pid"
    
    log "✅ Service started with PID: ${service_pid}"
    log "✅ Log file: ${LOG_DIR}/app.log"
}

# 执行健康检查
run_health_check() {
    log_step "Running Health Check"
    
    if [ -x "scripts/health-check.sh" ]; then
        bash scripts/health-check.sh
        return $?
    else
        log "⚠️  Health check script not found, skipping"
        return 0
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "=========================================="
    echo "Deployment Information"
    echo "=========================================="
    echo "Status: ✅ Deployed"
    echo "Port: ${DEPLOY_RUN_PORT}"
    echo "URL: http://localhost:${DEPLOY_RUN_PORT}"
    echo "Log: ${LOG_DIR}/app.log"
    echo "PID: ${LOG_DIR}/service.pid"
    echo "=========================================="
    echo ""
    echo "Useful commands:"
    echo "  - View logs: tail -f ${LOG_DIR}/app.log"
    echo "  - Stop service: kill \$(cat ${LOG_DIR}/service.pid)"
    echo "  - Health check: bash scripts/health-check.sh"
    echo "=========================================="
}

# 主部署流程
main() {
    log "=========================================="
    log "Starting Deployment Process"
    log "=========================================="
    
    # 1. 准备环境
    ensure_log_dir
    
    # 2. 检查环境变量
    if ! check_environment; then
        log "❌ Environment check failed, aborting deployment"
        exit 1
    fi
    
    # 3. 安装依赖
    install_dependencies
    
    # 4. 构建项目
    if ! build_project; then
        log "❌ Build failed, aborting deployment"
        exit 1
    fi
    
    # 5. 清理旧进程
    cleanup_old_process
    
    # 6. 启动服务
    start_service
    
    # 7. 健康检查
    if ! run_health_check; then
        log "❌ Health check failed, but service may still be starting"
        log "   Please check logs: ${LOG_DIR}/app.log"
        exit 1
    fi
    
    # 8. 显示部署信息
    show_deployment_info
    
    log "✅ Deployment completed successfully!"
    exit 0
}

# 错误处理
trap 'log "❌ Deployment failed at line $LINENO"; exit 1' ERR

# 执行主流程
main "$@"
