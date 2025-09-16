# 🔐 管理员密码配置说明

## 📋 密码设置方法

### 方法1：环境变量设置（推荐）

在 VPS 上的项目目录中的 `.env` 文件中设置：

```bash
# 编辑 .env 文件
nano /data/www/ggame.ee/.env

# 添加或修改以下行：
ADMIN_PASSWORD=your_new_secure_password
```

### 方法2：直接修改代码（不推荐）

修改 `/src/app/api/auth/login/route.ts` 文件：

```typescript
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your_new_password';
```

## 🔄 应用更改

设置新密码后，重启应用：

```bash
# 重启 PM2 应用
pm2 restart game-cms

# 查看应用状态
pm2 status
```

## 🚀 新功能说明

### 退出登录功能

- 在管理后台右上角添加了红色的"退出登录"按钮
- 点击按钮会确认是否退出
- 退出后会清除登录状态，返回登录页面

### 密码安全建议

1. **使用强密码**：至少 12 位，包含大小写字母、数字和特殊字符
2. **定期更换**：建议每 3-6 个月更换一次密码
3. **保密存储**：不要在代码中硬编码密码，使用环境变量

## 🛡️ 安全提示

- 默认密码是 `admin123`，请立即修改
- 生产环境务必使用强密码
- 可以考虑添加双因素认证（2FA）增强安全性

## 🔍 故障排除

如果登录有问题：

1. 检查 `.env` 文件是否正确设置
2. 确认 PM2 应用已重启
3. 查看应用日志：`pm2 logs game-cms`