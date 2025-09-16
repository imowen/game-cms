# 🎮 小游戏CMS系统

一个专为管理和展示小游戏而设计的内容管理系统，支持批量导入、响应式设计，并针对SEO进行了优化。

## ✨ 主要特性

- 🎯 **游戏管理**：支持单个添加和CSV批量导入
- 🔐 **安全认证**：管理后台密码保护
- 📱 **响应式设计**：完美适配PC和移动设备
- 🚀 **SEO优化**：游戏页面包含丰富的描述和标签
- 🏷️ **分类管理**：支持游戏分类和颜色标签
- 🔍 **搜索筛选**：支持游戏名称和分类筛选
- 📊 **批量操作**：CSV导入、URL有效性检测

## 🆕 最新功能更新

- 🔍 **预览网站按钮** - 管理后台一键预览网站首页
- 👁️ **游戏预览功能** - 直接预览任何游戏页面，无需打开编辑
- 📊 **游戏状态管理** - 支持已发布/草稿/归档三种状态
- 🎯 **全屏游戏体验** - 移除左侧信息框，游戏全屏显示

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装步骤

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **访问应用**
- 前台展示：http://localhost:3001
- 管理后台：http://localhost:3001/admin

## 🔐 管理后台登录

### 登录信息
- **访问地址**：`/admin`
- **默认密码**：`admin123`

### 安全配置
为了安全起见，建议在生产环境中修改密码：

1. **创建环境变量文件**
```bash
cp .env.example .env
```

2. **设置自定义密码**
```bash
# .env 文件中设置
ADMIN_PASSWORD=your_secure_password_here
```

## 📝 使用说明

### 管理后台功能

#### 1. 添加游戏
- 点击 **"添加游戏"** 按钮
- 填写游戏信息：
  - 游戏名称（必填）
  - 游戏描述（推荐填写详细描述，有利SEO）
  - 游戏链接（必填）
  - 缩略图链接（可选）
  - 分类选择
  - 游戏尺寸（默认800x600）
  - 评分（0-5分）

#### 2. 批量导入游戏
- 点击 **"批量导入"** 按钮
- 下载CSV模板
- 按照模板格式填写游戏信息
- 上传CSV文件进行批量导入

#### 3. 编辑游戏
- 在游戏列表中点击 **"编辑"** 按钮
- 修改游戏信息
- 保存修改

#### 4. 删除游戏
- 在游戏列表中点击 **"删除"** 按钮
- 确认删除操作

### CSV批量导入格式

创建CSV文件，包含以下列：

```csv
name,description,game_url,thumbnail_url,category,namespace,size_width,size_height,rating
"示例游戏","游戏描述内容","https://example.com/game","https://example.com/thumb.jpg","益智","example-game",800,600,4.5
```

#### 字段说明
- `name`：游戏名称（必填）
- `description`：游戏描述（推荐详细描述）
- `game_url`：游戏链接（必填）
- `thumbnail_url`：缩略图链接（可选）
- `category`：分类名称（自动创建不存在的分类）
- `namespace`：命名空间（可选，系统自动生成）
- `size_width`：游戏宽度（默认800）
- `size_height`：游戏高度（默认600）
- `rating`：评分0-5（默认0）

### 前台功能

#### 1. 游戏浏览
- 首页展示所有游戏
- 支持分类筛选
- 支持搜索功能

#### 2. 游戏详情页
- 点击游戏卡片进入详情页
- iframe嵌入游戏，支持全屏
- 显示游戏信息和详细说明
- SEO优化的标签和描述

## 🛠️ 技术栈

- **前端**：Next.js 15 + React + TypeScript
- **样式**：Tailwind CSS
- **数据库**：SQLite
- **文件处理**：Multer + PapaParse

## 📁 项目结构

```
game-cms/
├── src/
│   ├── app/
│   │   ├── admin/              # 管理后台页面
│   │   ├── api/                # API路由
│   │   │   ├── auth/           # 认证相关API
│   │   │   ├── games/          # 游戏相关API
│   │   │   └── categories/     # 分类相关API
│   │   ├── game/[id]/          # 游戏详情页
│   │   └── page.tsx            # 首页
│   ├── lib/
│   │   └── database.ts         # 数据库配置
│   └── globals.css             # 全局样式
├── public/                     # 静态资源
├── games.db                    # SQLite数据库文件
├── .env.example               # 环境变量示例
└── README.md                  # 项目文档
```

## 🔧 API接口

### 游戏相关
- `GET /api/games` - 获取游戏列表
- `POST /api/games` - 添加游戏
- `PUT /api/games/[id]` - 更新游戏
- `DELETE /api/games/[id]` - 删除游戏
- `POST /api/games/import` - 批量导入游戏
- `GET /api/games/import` - 下载CSV模板

### 分类相关
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 添加分类

### 认证相关
- `POST /api/auth/login` - 登录
- `GET /api/auth/check` - 检查认证状态

## 🚀 部署说明

### VPS服务器部署（完整指南）

#### 1. 服务器环境准备

**系统要求**
- Ubuntu 20.04+ / CentOS 7+
- Node.js 18+
- PM2 进程管理器
- Nginx 反向代理

**安装Node.js**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

**安装PM2**
```bash
sudo npm install -g pm2
```

**安装Nginx**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx
```

#### 2. 部署应用

**克隆项目**
```bash
cd /var/www/
sudo git clone https://github.com/imowen/game-cms.git
sudo chown -R $USER:$USER game-cms
cd game-cms
```

**安装依赖**
```bash
npm install
```

**配置环境变量**
```bash
cp .env.example .env
nano .env
```

在.env文件中设置：
```bash
# 管理员密码
ADMIN_PASSWORD=your_secure_password_here

# 生产环境
NODE_ENV=production

# 应用端口
PORT=3000
```

**构建项目**
```bash
npm run build
```

#### 3. PM2配置

**创建PM2配置文件**
```bash
nano ecosystem.config.js
```

配置内容：
```javascript
module.exports = {
  apps: [
    {
      name: 'game-cms',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/game-cms',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_file: '/var/log/pm2/game-cms.log',
      out_file: '/var/log/pm2/game-cms-out.log',
      error_file: '/var/log/pm2/game-cms-error.log'
    }
  ]
};
```

**启动应用**
```bash
# 创建日志目录
sudo mkdir -p /var/log/pm2

# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 4. Nginx配置

**创建Nginx配置文件**
```bash
sudo nano /etc/nginx/sites-available/game-cms
```

配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 游戏iframe支持
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-src *;";

    # 主应用代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 数据库文件保护
    location ~ /games\.db$ {
        deny all;
        return 404;
    }
}
```

**启用站点**
```bash
sudo ln -s /etc/nginx/sites-available/game-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL证书配置（可选但推荐）

**安装Certbot**
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

**获取SSL证书**
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 6. 防火墙配置

```bash
# UFW (Ubuntu)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# FirewallD (CentOS)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### 7. 数据库备份脚本

**创建备份脚本**
```bash
nano ~/backup-gamedb.sh
```

脚本内容：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/game-cms"
DB_PATH="/var/www/game-cms/games.db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $DB_PATH $BACKUP_DIR/games_${DATE}.db

# 保留最近30天的备份
find $BACKUP_DIR -name "games_*.db" -mtime +30 -delete

echo "Database backup completed: games_${DATE}.db"
```

**设置执行权限并添加定时任务**
```bash
chmod +x ~/backup-gamedb.sh

# 添加到crontab（每天凌晨3点备份）
crontab -e
# 添加这行：
# 0 3 * * * /home/your-username/backup-gamedb.sh
```

#### 8. 监控和日志

**查看应用状态**
```bash
# PM2状态
pm2 status
pm2 logs game-cms

# 系统资源监控
pm2 monit
```

**Nginx日志**
```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 9. 更新部署

**创建更新脚本**
```bash
nano ~/update-game-cms.sh
```

脚本内容：
```bash
#!/bin/bash
cd /var/www/game-cms

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Restarting PM2 application..."
pm2 restart game-cms

echo "Update completed!"
```

**使用方法**
```bash
chmod +x ~/update-game-cms.sh
./update-game-cms.sh
```

### Docker部署（可选）

**创建Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose**
```yaml
version: '3.8'
services:
  game-cms:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ADMIN_PASSWORD=your_secure_password
    volumes:
      - ./games.db:/app/games.db
    restart: unless-stopped
```

### 云平台部署

#### Vercel部署（推荐）
1. Fork项目到你的GitHub
2. 在Vercel导入项目
3. 设置环境变量：`ADMIN_PASSWORD`
4. 自动部署完成

#### Railway部署
1. 连接GitHub仓库
2. 设置环境变量
3. 自动构建和部署

### 性能优化建议

1. **启用Gzip压缩**
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

2. **设置适当的缓存策略**
3. **使用CDN加速静态资源**
4. **定期监控服务器资源使用情况**
5. **设置日志轮转避免磁盘空间不足**

## 📊 数据库结构

### games 表
- `id` - 主键
- `name` - 游戏名称
- `description` - 游戏描述
- `game_url` - 游戏链接
- `thumbnail_url` - 缩略图链接
- `category_id` - 分类ID
- `namespace` - 命名空间
- `size_width/size_height` - 游戏尺寸
- `rating` - 评分
- `is_active` - 是否激活
- `created_at/updated_at` - 时间戳

### categories 表
- `id` - 主键
- `name` - 分类名称
- `color` - 分类颜色
- `created_at` - 创建时间

## 🐛 常见问题

### Q: 忘记管理密码怎么办？
A: 修改 `.env` 文件中的 `ADMIN_PASSWORD`，或删除该环境变量使用默认密码 `admin123`。

### Q: 游戏无法加载怎么办？
A: 检查游戏URL是否有效，确保目标网站允许iframe嵌入。

### Q: CSV导入失败怎么办？
A: 检查CSV格式是否正确，确保必填字段（name、game_url）不为空。

### Q: 如何修改数据库位置？
A: 修改 `src/lib/database.ts` 中的数据库文件路径。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**享受您的小游戏CMS系统！** 🎮✨
