#!/bin/bash
# Game CMS 部署脚本

set -e

echo "🎮 开始部署 Game CMS..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js版本
check_node() {
    echo -e "${BLUE}📦 检查Node.js环境...${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js未安装，请先安装Node.js 18+${NC}"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js版本过低，需要18+，当前版本: $(node -v)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js版本: $(node -v)${NC}"
}

# 检查PM2
check_pm2() {
    echo -e "${BLUE}🔄 检查PM2...${NC}"
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}⚠️  PM2未安装，正在安装...${NC}"
        npm install -g pm2
    fi
    echo -e "${GREEN}✅ PM2已安装${NC}"
}

# 安装依赖
install_deps() {
    echo -e "${BLUE}📦 安装依赖...${NC}"
    npm ci --only=production
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 构建项目
build_project() {
    echo -e "${BLUE}🏗️  构建项目...${NC}"
    npm run build
    echo -e "${GREEN}✅ 项目构建完成${NC}"
}

# 数据库初始化
init_database() {
    echo -e "${BLUE}🗄️  初始化数据库...${NC}"
    mkdir -p data
    if [ ! -f "data/games.db" ]; then
        echo -e "${YELLOW}⚠️  首次部署，创建数据库...${NC}"
        # 这里可以添加数据库初始化脚本
    fi
    echo -e "${GREEN}✅ 数据库检查完成${NC}"
}

# PM2部署
pm2_deploy() {
    echo -e "${BLUE}🚀 使用PM2部署...${NC}"

    # 停止旧进程
    pm2 stop game-cms 2>/dev/null || true
    pm2 delete game-cms 2>/dev/null || true

    # 启动新进程
    pm2 start npm --name "game-cms" -- start
    pm2 save

    echo -e "${GREEN}✅ PM2部署完成${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}🎮 Game CMS 自动部署脚本${NC}"
    echo -e "${BLUE}================================${NC}"

    check_node
    check_pm2
    install_deps
    build_project
    init_database
    pm2_deploy

    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo -e "${YELLOW}📍 应用地址: http://localhost:3000${NC}"
    echo -e "${BLUE}💡 查看日志: pm2 logs game-cms${NC}"
    echo -e "${BLUE}💡 重启应用: pm2 restart game-cms${NC}"
    echo -e "${BLUE}💡 停止应用: pm2 stop game-cms${NC}"
}

# 执行主函数
main