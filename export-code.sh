#!/bin/bash

# REITs 智能助手 - 代码导出脚本
# 用于将项目代码导出到本地 Git 仓库

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在项目根目录
if [ ! -f ".coze" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

print_info "开始导出 REITs 智能助手代码..."

# 导出选项
echo ""
echo "请选择导出方式："
echo "1) 导出为 Git 压缩包（.tar.gz）"
echo "2) 导出为 ZIP 压缩包（.zip）"
echo "3) 推送到远程 Git 仓库"
echo ""
read -p "请输入选项 (1/2/3): " choice

case $choice in
    1)
        # 导出为 tar.gz
        print_info "正在导出为 Git 压缩包..."
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        OUTPUT_FILE="reits-assistant-${TIMESTAMP}.tar.gz"

        # 获取最新的 commit hash
        COMMIT_HASH=$(git rev-parse --short HEAD)
        BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

        # 导出代码，排除不必要的文件
        git archive --format=tar.gz \
            --prefix="reits-assistant/" \
            --output="${OUTPUT_FILE}" \
            HEAD

        # 排除的文件和目录
        # - node_modules (通过 .gitignore)
        # - .next (通过 .gitignore)
        # - .git (git archive 自动排除)

        print_success "导出成功: ${OUTPUT_FILE}"
        print_info "Commit: ${COMMIT_HASH} (${BRANCH_NAME})"
        print_info "文件大小: $(du -h ${OUTPUT_FILE} | cut -f1)"
        print_info ""
        print_info "解压命令:"
        echo "  tar -xzf ${OUTPUT_FILE}"
        echo "  cd reits-assistant"
        echo ""
        print_info "初始化本地 Git:"
        echo "  git init"
        echo "  git add ."
        echo "  git commit -m \"Initial commit: REITs 智能助手代码\""
        ;;

    2)
        # 导出为 ZIP
        print_info "正在导出为 ZIP 压缩包..."
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        OUTPUT_FILE="reits-assistant-${TIMESTAMP}.zip"

        # 获取最新的 commit hash
        COMMIT_HASH=$(git rev-parse --short HEAD)
        BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

        # 导出代码
        git archive --format=zip \
            --prefix="reits-assistant/" \
            --output="${OUTPUT_FILE}" \
            HEAD

        print_success "导出成功: ${OUTPUT_FILE}"
        print_info "Commit: ${COMMIT_HASH} (${BRANCH_NAME})"
        print_info "文件大小: $(du -h ${OUTPUT_FILE} | cut -f1)"
        print_info ""
        print_info "解压命令:"
        echo "  unzip ${OUTPUT_FILE}"
        echo "  cd reits-assistant"
        echo ""
        print_info "初始化本地 Git:"
        echo "  git init"
        echo "  git add ."
        echo "  git commit -m \"Initial commit: REITs 智能助手代码\""
        ;;

    3)
        # 推送到远程仓库
        print_info "准备推送到远程 Git 仓库..."

        # 检查是否有远程仓库
        if git remote get-url origin > /dev/null 2>&1; then
            REMOTE_URL=$(git remote get-url origin)
            print_info "当前远程仓库: ${REMOTE_URL}"
            read -p "是否使用当前远程仓库? (y/n): " use_current
            if [ "$use_current" != "y" ]; then
                read -p "请输入远程仓库 URL: " REMOTE_URL
                git remote set-url origin "${REMOTE_URL}"
            fi
        else
            read -p "请输入远程仓库 URL: " REMOTE_URL
            git remote add origin "${REMOTE_URL}"
        fi

        # 获取当前分支
        BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

        # 推送到远程
        print_info "正在推送代码到远程仓库..."
        git push -u origin "${BRANCH_NAME}"

        print_success "推送成功!"
        print_info "仓库 URL: ${REMOTE_URL}"
        print_info "分支: ${BRANCH_NAME}"
        ;;

    *)
        print_error "无效的选项"
        exit 1
        ;;
esac

# 显示后续步骤
echo ""
print_info "======================================"
print_info "下一步操作"
print_info "======================================"
echo ""
echo "1. 在本地解压或克隆项目"
echo ""
echo "2. 安装依赖:"
echo "   cd reits-assistant"
echo "   pnpm install"
echo ""
echo "3. 配置环境变量:"
echo "   cp .env.example .env.local"
echo "   # 编辑 .env.local 填入你的配置"
echo ""
echo "4. 启动开发服务器:"
echo "   coze dev"
echo "   # 或"
echo "   pnpm dev"
echo ""
echo "5. 访问应用:"
echo "   http://localhost:5000"
echo ""
echo "6. 测试页面:"
echo "   - 加密测试: http://localhost:5000/test/encryption"
echo "   - 性能测试: http://localhost:5000/test/performance"
echo ""
print_success "导出完成!"
print_info "详细文档请查看: PROJECT_GUIDE.md"
