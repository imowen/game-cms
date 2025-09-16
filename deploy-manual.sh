#!/bin/bash

echo "🚀 Manual Deployment Script for Game CMS"
echo "========================================"

# 导航到项目目录
echo "📁 Navigating to project directory..."
cd /data/www/ggame.ee || {
  echo "❌ Project directory not found"
  exit 1
}

# 显示当前分支和最新提交
echo "📊 Current git status:"
git branch
git log --oneline -3

# 拉取最新代码
echo "📥 Pulling latest code..."
git pull origin main

# 显示更新后的状态
echo "📊 After update git status:"
git log --oneline -3

# 完全清理依赖
echo "🧹 Cleaning dependencies..."
rm -rf node_modules
rm -rf package-lock.json

# 重新安装依赖
echo "📦 Reinstalling dependencies..."
npm install

# 运行数据库迁移
echo "🗄️ Running database migration..."
npm run migrate

# 清理所有缓存
echo "🧽 Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache

# 构建项目
echo "🏗️ Building project..."
NODE_ENV=production npm run build

# 显示构建结果
echo "📋 Build completed, checking files..."
ls -la .next/

# 停止并删除现有PM2进程
echo "🛑 Stopping existing PM2 process..."
pm2 stop game-cms || true
pm2 delete game-cms || true

# 启动新的PM2进程
echo "🚀 Starting new PM2 process..."
pm2 start npm --name "game-cms" -- start

# 保存PM2配置
echo "💾 Saving PM2 configuration..."
pm2 save

# 检查应用状态
echo "🔍 Checking application status..."
sleep 10

if curl -f http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Deployment successful! Game CMS is running."
  echo "🌐 Application should be available at https://ggame.ee"
else
  echo "❌ Deployment failed! Application not responding."
  echo "📋 Checking PM2 logs:"
  pm2 logs game-cms --lines 10
  exit 1
fi

echo "🎉 Manual deployment completed!"