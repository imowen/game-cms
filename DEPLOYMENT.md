# 🎮 Game CMS 部署指南

## 📋 部署选项

### 方案1: 一键自动部署 (推荐)
使用我们提供的部署脚本，自动化完成所有配置。

### 方案2: Docker部署
适合熟悉Docker的用户，提供容器化部署方案。

### 方案3: 手动部署
完全自定义配置，适合高级用户。

---

## 🚀 方案1: 一键自动部署

### 1. 上传到GitHub

```bash
# 1. 在GitHub创建新仓库 'game-cms'
# 2. 关联本地仓库
git remote add origin https://github.com/你的用户名/game-cms.git
git push -u origin main
```

### 2. VPS环境准备

```bash
# SSH登录VPS
ssh root@your-vps-ip

# 安装Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 安装Git
apt-get update && apt-get install -y git

# 克隆项目
cd /var/www
git clone https://github.com/你的用户名/game-cms.git
cd game-cms
```

### 3. 执行一键部署

```bash
# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 4. 配置Nginx (可选)

```bash
# 安装Nginx
apt-get install -y nginx

# 复制配置文件
cp nginx.conf /etc/nginx/sites-available/game-cms

# 修改域名
nano /etc/nginx/sites-available/game-cms
# 将 your-domain.com 替换为实际域名

# 启用站点
ln -s /etc/nginx/sites-available/game-cms /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 🐳 方案2: Docker部署

### 1. 安装Docker

```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. 克隆并部署

```bash
cd /var/www
git clone https://github.com/你的用户名/game-cms.git
cd game-cms

# 创建数据目录
mkdir -p data

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps
docker-compose logs -f
```

---

## 🛠️ 方案3: 手动部署

### 1. 环境准备

```bash
# 安装Node.js, PM2, Nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs nginx
npm install -g pm2

# 克隆项目
cd /var/www
git clone https://github.com/你的用户名/game-cms.git
cd game-cms
```

### 2. 项目配置

```bash
# 安装依赖
npm ci --only=production

# 构建项目
npm run build

# 配置环境变量
cp .env.example .env
nano .env  # 修改配置
```

### 3. 启动服务

```bash
# 启动PM2
pm2 start npm --name "game-cms" -- start
pm2 startup
pm2 save

# 配置Nginx
cp nginx.conf /etc/nginx/sites-available/game-cms
# 编辑域名配置...
ln -s /etc/nginx/sites-available/game-cms /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## ⚙️ 自动化部署 (GitHub Actions)

### 1. 配置VPS访问

在GitHub仓库的 Settings → Secrets and variables → Actions 中添加：

```
VPS_HOST: your-vps-ip
VPS_USER: root
VPS_SSH_KEY: -----BEGIN OPENSSH PRIVATE KEY-----...
VPS_PORT: 22 (可选)
```

### 2. SSH密钥配置

```bash
# 在VPS上生成密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions"

# 添加公钥到authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# 将私钥内容添加到GitHub Secrets的VPS_SSH_KEY
cat ~/.ssh/id_rsa
```

### 3. 自动部署

现在每次推送代码到main分支，都会自动部署到VPS！

---

## 🔧 常用命令

```bash
# PM2管理
pm2 status               # 查看进程状态
pm2 logs game-cms        # 查看日志
pm2 restart game-cms     # 重启应用
pm2 stop game-cms        # 停止应用
pm2 delete game-cms      # 删除进程

# Nginx管理
nginx -t                 # 测试配置
systemctl reload nginx   # 重载配置
systemctl status nginx   # 查看状态

# 项目更新
git pull origin main     # 拉取代码
npm ci                   # 安装依赖
npm run build            # 构建项目
pm2 restart game-cms     # 重启应用
```

---

## 🔒 SSL证书 (Let's Encrypt)

```bash
# 安装Certbot
apt-get install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期
crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 监控和日志

### 应用监控
- PM2内置监控: `pm2 monit`
- 应用日志: `pm2 logs game-cms`

### 系统监控
- 进程状态: `pm2 status`
- 系统资源: `htop`
- Nginx日志: `tail -f /var/log/nginx/access.log`

---

## ❗ 故障排除

### 应用无法访问
1. 检查PM2状态: `pm2 status`
2. 查看应用日志: `pm2 logs game-cms`
3. 检查端口占用: `netstat -tulpn | grep 3000`

### 数据库问题
1. 检查数据库文件: `ls -la data/`
2. 权限问题: `chown -R node:node data/`

### Nginx问题
1. 测试配置: `nginx -t`
2. 检查日志: `tail -f /var/log/nginx/error.log`

---

## 🎯 性能优化

### PM2集群模式
```bash
pm2 start npm --name "game-cms" -i max -- start
```

### Nginx缓存优化
```nginx
# 在nginx.conf中已包含基础缓存配置
# 可根据需要进一步调整
```

### 数据库优化
```bash
# 定期备份数据库
cp data/games.db data/games.db.backup.$(date +%Y%m%d)
```

---

祝你部署顺利！🎉

如有问题，请查看项目Issues或联系维护者。