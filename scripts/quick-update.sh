#!/bin/bash

# EAS Updates 快速更新脚本
# 使用方法: ./scripts/quick-update.sh [environment] [message]

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${BLUE}EAS Updates 快速更新脚本${NC}"
    echo ""
    echo "使用方法:"
    echo "  ./scripts/quick-update.sh [environment] [message]"
    echo ""
    echo "环境选项:"
    echo "  dev, development  - 开发环境"
    echo "  preview          - 预览环境"
    echo "  prod, production  - 生产环境"
    echo ""
    echo "示例:"
    echo "  ./scripts/quick-update.sh dev \"修复登录问题\""
    echo "  ./scripts/quick-update.sh preview \"新增用户管理功能\""
    echo "  ./scripts/quick-update.sh prod \"优化性能，修复bug\""
    echo ""
}

# 检查参数
if [ $# -lt 2 ]; then
    echo -e "${RED}错误: 缺少参数${NC}"
    show_help
    exit 1
fi

# 获取参数
ENVIRONMENT=$1
MESSAGE=$2

# 根据环境设置分支
case $ENVIRONMENT in
    "dev"|"development")
        BRANCH="development"
        COLOR=$YELLOW
        ;;
    "preview")
        BRANCH="preview"
        COLOR=$BLUE
        ;;
    "prod"|"production")
        BRANCH="production"
        COLOR=$RED
        ;;
    *)
        echo -e "${RED}错误: 无效的环境参数 '$ENVIRONMENT'${NC}"
        show_help
        exit 1
        ;;
esac

# 显示更新信息
echo -e "${COLOR}🚀 准备发布更新到 $BRANCH 环境${NC}"
echo -e "${COLOR}📝 更新描述: $MESSAGE${NC}"
echo ""

# 确认操作
read -p "确认发布更新? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

# 执行更新
echo -e "${GREEN}正在发布更新...${NC}"
eas update --branch $BRANCH --message "$MESSAGE"

# 检查结果
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 更新发布成功!${NC}"
    echo -e "${BLUE}📱 用户将在下次启动应用时收到更新${NC}"
else
    echo -e "${RED}❌ 更新发布失败${NC}"
    exit 1
fi

