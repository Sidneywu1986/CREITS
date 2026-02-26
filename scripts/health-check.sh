#!/bin/bash
set -Eeuo pipefail

# ===========================================
# REITs 智能助手 - 健康检查脚本
# ===========================================

PORT=5000
HEALTH_URL="http://localhost:${PORT}/api/health"
MAX_RETRIES=30
RETRY_INTERVAL=2

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "Starting health check for port ${PORT}..."

# 检查端口是否监听
check_port() {
    local port=$1
    if ss -tuln 2>/dev/null | grep -q ":${port}[[:space:]]"; then
        if ss -tuln 2>/dev/null | grep ":${port}[[:space:]]" | grep -q LISTEN; then
            return 0
        fi
    fi
    return 1
}

# 检查 HTTP 响应
check_http() {
    local url=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
    echo "$response"
}

# 检查环境变量
check_env_vars() {
    log "Checking required environment variables..."
    
    local required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log "❌ Missing environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    log "✅ All required environment variables are set"
    return 0
}

# 检查数据库连接
check_database() {
    log "Checking database connection..."
    
    # 尝试连接 Supabase
    if command -v node &> /dev/null; then
        node -e "
        const { createClient } = require('@supabase/supabase-js');
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!url || !key) {
            console.log('Missing Supabase credentials');
            process.exit(1);
        }
        
        const client = createClient(url, key);
        client.from('reits_products').select('count').then(({ error }) => {
            if (error) {
                console.log('Database connection failed:', error.message);
                process.exit(1);
            }
            console.log('Database connection OK');
            process.exit(0);
        });
        " 2>&1 | grep -q "Database connection OK"
        
        if [ $? -eq 0 ]; then
            log "✅ Database connection successful"
            return 0
        fi
    fi
    
    log "⚠️  Could not verify database connection"
    return 0  # 不阻塞部署
}

# 主检查流程
main() {
    local retry_count=0
    local status="unhealthy"
    
    # 检查环境变量
    if ! check_env_vars; then
        log "❌ Environment check failed"
        exit 1
    fi
    
    # 检查数据库
    check_database
    
    # 等待服务启动
    log "Waiting for service to be ready..."
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if check_port $PORT; then
            log "✅ Port ${PORT} is listening"
            
            # 检查 HTTP 响应
            http_status=$(check_http "$HEALTH_URL" || echo "000")
            
            if [ "$http_status" = "200" ]; then
                log "✅ Health check passed (HTTP 200)"
                status="healthy"
                break
            elif [ "$http_status" = "404" ]; then
                # 如果没有 /api/health 端点，检查主页
                home_status=$(check_http "http://localhost:${PORT}/" || echo "000")
                if [ "$home_status" = "200" ]; then
                    log "✅ Service is responding (HTTP 200)"
                    status="healthy"
                    break
                fi
            fi
            
            log "⏳ Service responding with HTTP ${http_status}, retrying..."
        else
            log "⏳ Port ${PORT} not yet listening, retrying..."
        fi
        
        retry_count=$((retry_count + 1))
        sleep $RETRY_INTERVAL
    done
    
    if [ "$status" = "healthy" ]; then
        log "✅ All health checks passed"
        
        # 输出服务信息
        echo ""
        echo "=========================================="
        echo "Service Information:"
        echo "=========================================="
        echo "Status: Healthy"
        echo "Port: ${PORT}"
        echo "URL: http://localhost:${PORT}"
        echo "Environment: ${NODE_ENV:-unknown}"
        echo "=========================================="
        
        exit 0
    else
        log "❌ Health check failed after ${MAX_RETRIES} retries"
        
        # 输出诊断信息
        echo ""
        echo "=========================================="
        echo "Diagnostics:"
        echo "=========================================="
        echo "Port status:"
        ss -tuln 2>/dev/null | grep ":${PORT}" || echo "  Not listening"
        echo ""
        echo "Recent errors:"
        if [ -f "/app/work/logs/bypass/app.log" ]; then
            tail -n 20 /app/work/logs/bypass/app.log | grep -i "error" || echo "  No errors found"
        fi
        echo "=========================================="
        
        exit 1
    fi
}

main "$@"
