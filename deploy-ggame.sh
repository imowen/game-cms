#!/bin/bash

echo "🚀 部署 Game CMS 到 ggame.ee (Ubuntu + Caddy + PM2)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 错误处理
set -e
trap 'echo -e "${RED}❌ 部署失败！${NC}"' ERR

# 项目配置
PROJECT_DIR="/data/www/ggame.ee"
REPO_URL="https://github.com/imowen/game-cms.git"
DOMAIN="ggame.ee"
APP_NAME="game-cms"

echo -e "${BLUE}📋 部署配置：${NC}"
echo -e "   项目目录: ${PROJECT_DIR}"
echo -e "   Git 仓库: ${REPO_URL}"
echo -e "   域名: ${DOMAIN}"
echo -e "   应用名称: ${APP_NAME}"
echo ""

# 检查是否为 root 用户
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ 请以 root 用户运行此脚本${NC}"
   exit 1
fi

echo -e "${YELLOW}1️⃣ 更新系统并安装基础依赖...${NC}"
apt update
apt install -y curl git ufw

echo -e "${YELLOW}2️⃣ 安装 Node.js 18+...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✅ Node.js 安装完成: $(node -v)${NC}"
else
    echo -e "${GREEN}✅ Node.js 已安装: $(node -v)${NC}"
fi

echo -e "${YELLOW}3️⃣ 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✅ PM2 已安装${NC}"
fi

echo -e "${YELLOW}4️⃣ 安装 Caddy...${NC}"
if ! command -v caddy &> /dev/null; then
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update && apt install caddy
    echo -e "${GREEN}✅ Caddy 安装完成${NC}"
else
    echo -e "${GREEN}✅ Caddy 已安装${NC}"
fi

echo -e "${YELLOW}5️⃣ 创建项目目录...${NC}"
mkdir -p /data/www
cd /data/www

echo -e "${YELLOW}6️⃣ 克隆项目代码...${NC}"
if [ -d "${PROJECT_DIR}" ]; then
    echo -e "${BLUE}📁 项目目录已存在，更新代码...${NC}"
    cd "${PROJECT_DIR}"
    git pull origin main
else
    echo -e "${BLUE}📥 克隆项目代码...${NC}"
    git clone "${REPO_URL}" ggame.ee
    cd "${PROJECT_DIR}"
fi

echo -e "${YELLOW}7️⃣ 安装项目依赖...${NC}"
npm ci --only=production

echo -e "${YELLOW}8️⃣ 构建项目...${NC}"
npm run build

echo -e "${YELLOW}9️⃣ 设置文件权限...${NC}"
chown -R www-data:www-data "${PROJECT_DIR}"

echo -e "${YELLOW}🔟 配置 PM2...${NC}"
# 停止可能存在的进程
pm2 delete "${APP_NAME}" 2>/dev/null || true

# 启动应用
cd "${PROJECT_DIR}"
pm2 start npm --name "${APP_NAME}" -- start

# 设置开机自启
pm2 startup
pm2 save

echo -e "${YELLOW}1️⃣1️⃣ 配置 Caddy...${NC}"
# 创建 Caddy 配置
cat > /etc/caddy/Caddyfile << EOF
# ggame.ee Caddy 配置

ggame.ee {
    # 反向代理到 Next.js 应用
    reverse_proxy localhost:3000

    # 启用 gzip 压缩
    encode gzip

    # 静态文件缓存
    @static {
        path *.css *.js *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2 *.ttf *.eot
    }
    header @static Cache-Control "public, max-age=31536000"

    # 安全头
    header {
        # 移除 Server 标识
        -Server
        # 防止点击劫持
        X-Frame-Options "SAMEORIGIN"
        # 防止 MIME 类型嗅探
        X-Content-Type-Options "nosniff"
        # XSS 保护
        X-XSS-Protection "1; mode=block"
        # 推荐 HTTPS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }

    # 日志记录
    log {
        output file /var/log/caddy/ggame.log
        format json
    }

    # 错误页面
    handle_errors {
        @5xx expression {http.error.status_code} >= 500
        handle @5xx {
            respond "服务器内部错误，请稍后再试" 500
        }
    }
}

# www 重定向
www.ggame.ee {
    redir https://ggame.ee{uri} permanent
}
EOF

# 创建日志目录
mkdir -p /var/log/caddy
chown caddy:caddy /var/log/caddy

# 验证配置
echo -e "${BLUE}🔍 验证 Caddy 配置...${NC}"
caddy validate --config /etc/caddy/Caddyfile

# 启动 Caddy
systemctl enable caddy
systemctl restart caddy

echo -e "${YELLOW}1️⃣2️⃣ 配置防火墙...${NC}"
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo -e "${BLUE}📊 服务状态检查：${NC}"
echo -e "${YELLOW}PM2 状态：${NC}"
pm2 status
echo ""
echo -e "${YELLOW}Caddy 状态：${NC}"
systemctl status caddy --no-pager -l | head -10
echo ""

echo -e "${GREEN}🌐 网站信息：${NC}"
echo -e "   🔗 网站地址: https://ggame.ee"
echo -e "   📂 项目路径: ${PROJECT_DIR}"
echo -e "   🚀 应用名称: ${APP_NAME}"
echo ""

echo -e "${BLUE}🔧 常用管理命令：${NC}"
echo -e "   查看应用状态: ${YELLOW}pm2 status${NC}"
echo -e "   查看应用日志: ${YELLOW}pm2 logs ${APP_NAME}${NC}"
echo -e "   重启应用: ${YELLOW}pm2 restart ${APP_NAME}${NC}"
echo -e "   查看 Caddy 状态: ${YELLOW}systemctl status caddy${NC}"
echo -e "   重启 Caddy: ${YELLOW}systemctl restart caddy${NC}"
echo ""

echo -e "${GREEN}✅ ggame.ee 部署成功！${NC}"
echo -e "${BLUE}💡 SSL 证书将在首次访问时自动申请${NC}"