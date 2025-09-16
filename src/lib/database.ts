import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

// 生成URL友好的slug
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // 移除中文字符，转换为拼音或英文
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 空格和下划线转为连字符
    .replace(/^-+|-+$/g, ''); // 移除首尾连字符
}

// 生成唯一slug
export async function generateUniqueSlug(name: string, excludeId?: number): Promise<string> {
  const db = await getDatabase();
  let baseSlug = generateSlugFromName(name);

  // 如果是中文名，生成英文slug
  if (!baseSlug || baseSlug.length < 2) {
    // 简单的中文游戏名映射
    const chineseMap: { [key: string]: string } = {
      '超级马里奥': 'super-mario',
      '俄罗斯方块': 'tetris',
      '贪吃蛇': 'snake',
      '打砖块': 'breakout',
      '太空射击': 'space-shooter',
      '连连看': 'mahjong-connect',
      '推箱子': 'sokoban',
      '扫雷': 'minesweeper',
    };

    baseSlug = chineseMap[name] || `game-${Date.now()}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = excludeId
      ? 'SELECT id FROM games WHERE url_slug = ? AND id != ?'
      : 'SELECT id FROM games WHERE url_slug = ?';
    const params = excludeId ? [slug, excludeId] : [slug];

    const existing = await db.get(query, params);
    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  // 使用环境变量或默认路径
  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'games.db');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // 创建表结构
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      game_url TEXT NOT NULL,
      thumbnail_url TEXT,
      category_id INTEGER,
      namespace TEXT UNIQUE,
      url_slug TEXT UNIQUE,
      size_width INTEGER DEFAULT 800,
      size_height INTEGER DEFAULT 600,
      rating REAL DEFAULT 0,
      platform TEXT DEFAULT '未知',
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE INDEX IF NOT EXISTS idx_games_category ON games(category_id);
    CREATE INDEX IF NOT EXISTS idx_games_active ON games(is_active);
    CREATE INDEX IF NOT EXISTS idx_games_namespace ON games(namespace);
    CREATE INDEX IF NOT EXISTS idx_games_slug ON games(url_slug);
  `);

  // 添加platform列到现有表中（如果不存在）
  try {
    await db.run('ALTER TABLE games ADD COLUMN platform TEXT DEFAULT "未知"');
  } catch (error) {
    // 列已存在，忽略错误
  }

  // 添加url_slug列到现有表中（如果不存在）
  try {
    await db.run('ALTER TABLE games ADD COLUMN url_slug TEXT UNIQUE');
  } catch (error) {
    // 列已存在，忽略错误
  }

  // 为现有游戏生成url_slug（如果没有的话）
  try {
    const gamesWithoutSlug = await db.all('SELECT id, name FROM games WHERE url_slug IS NULL OR url_slug = ""');
    for (const game of gamesWithoutSlug) {
      const slug = generateSlugFromName(game.name);
      await db.run('UPDATE games SET url_slug = ? WHERE id = ?', [slug, game.id]);
    }
  } catch (error) {
    console.log('Slug migration skipped:', error);
  }

  // 添加status列到现有表中（如果不存在）
  try {
    await db.run('ALTER TABLE games ADD COLUMN status TEXT DEFAULT "published"');
  } catch (error) {
    // 列已存在，忽略错误
  }

  // 插入默认分类
  await db.run(`
    INSERT OR IGNORE INTO categories (name, color) VALUES 
    ('益智', '#10B981'),
    ('动作', '#EF4444'),
    ('街机游戏', '#F59E0B'),
    ('体育游戏', '#8B5CF6'),
    ('棋牌游戏', '#06B6D4')
  `);

  return db;
}

export interface Game {
  id?: number;
  name: string;
  description?: string;
  game_url: string;
  thumbnail_url?: string;
  category_id?: number;
  namespace?: string;
  url_slug?: string;
  size_width?: number;
  size_height?: number;
  rating?: number;
  platform?: string;
  status?: 'published' | 'draft' | 'archived';
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id?: number;
  name: string;
  color?: string;
  created_at?: string;
}