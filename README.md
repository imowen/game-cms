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

### 生产环境部署

1. **设置环境变量**
```bash
# .env 文件
ADMIN_PASSWORD=your_secure_password
NODE_ENV=production
```

2. **构建项目**
```bash
npm run build
```

3. **启动生产服务**
```bash
npm start
```

### 推荐部署平台
- Vercel（推荐）
- Netlify
- Railway
- 自建服务器

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
