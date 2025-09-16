#!/bin/bash

echo "🔍 检查生产服务器上的数据库状态..."
echo "=========================================="

# 检查当前数据库
if [ -f "/data/www/ggame.ee/games.db" ]; then
    echo "📁 当前数据库文件存在: /data/www/ggame.ee/games.db"
    ls -la /data/www/ggame.ee/games.db
    echo ""

    # 检查数据库内容
    echo "📊 数据库中的游戏数量:"
    sqlite3 /data/www/ggame.ee/games.db "SELECT COUNT(*) as total_games FROM games;" 2>/dev/null || echo "无法读取数据库"
    echo ""

    # 显示游戏列表
    echo "🎮 数据库中的游戏:"
    sqlite3 /data/www/ggame.ee/games.db "SELECT id, name, status FROM games LIMIT 10;" 2>/dev/null || echo "无法读取游戏数据"
    echo ""
else
    echo "❌ 当前数据库文件不存在"
fi

# 检查备份文件
echo "💾 检查备份文件..."
if ls /data/www/ggame.ee/games.db.backup.* 2>/dev/null; then
    echo "✅ 找到备份文件:"
    ls -la /data/www/ggame.ee/games.db.backup.*
    echo ""

    # 检查最新备份的内容
    LATEST_BACKUP=$(ls -t /data/www/ggame.ee/games.db.backup.* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        echo "🔍 最新备份内容 ($LATEST_BACKUP):"
        sqlite3 "$LATEST_BACKUP" "SELECT COUNT(*) as total_games FROM games;" 2>/dev/null || echo "无法读取备份数据库"
        sqlite3 "$LATEST_BACKUP" "SELECT id, name, status FROM games LIMIT 10;" 2>/dev/null || echo "无法读取备份游戏数据"
    fi
else
    echo "❌ 没有找到备份文件"
fi

# 检查其他可能的位置
echo ""
echo "🔍 检查其他可能的数据库位置..."
find /data/www/ggame.ee -name "*.db*" -type f 2>/dev/null || echo "没有找到其他数据库文件"

echo ""
echo "✅ 检查完成"