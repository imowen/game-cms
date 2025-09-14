import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  db = await open({
    filename: path.join(process.cwd(), 'games.db'),
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
  `);

  // 添加platform列到现有表中（如果不存在）
  try {
    await db.run('ALTER TABLE games ADD COLUMN platform TEXT DEFAULT "未知"');
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
  size_width?: number;
  size_height?: number;
  rating?: number;
  platform?: string;
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