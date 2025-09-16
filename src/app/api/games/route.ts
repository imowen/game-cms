import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Game, generateUniqueSlug } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT g.*, c.name as category_name, c.color as category_color
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.is_active = 1 AND (g.status = 'published' OR g.status IS NULL)
    `;
    
    const params: (string | number)[] = [];
    
    if (category) {
      query += ' AND g.category_id = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (g.name LIKE ? OR g.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY g.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const games = await db.all(query, params);
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM games WHERE is_active = 1 AND (status = "published" OR status IS NULL)';
    const countParams: (string | number)[] = [];
    
    if (category) {
      countQuery += ' AND category_id = ?';
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const { total } = await db.get(countQuery, countParams);
    
    return NextResponse.json({
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const game: Game = await request.json();

    // 生成namespace如果没有提供
    if (!game.namespace) {
      game.namespace = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 生成url_slug如果没有提供
    if (!game.url_slug) {
      game.url_slug = await generateUniqueSlug(game.name);
    } else {
      // 验证提供的slug是否唯一
      game.url_slug = await generateUniqueSlug(game.url_slug);
    }

    const result = await db.run(`
      INSERT INTO games (name, description, game_url, thumbnail_url, category_id, namespace, url_slug, size_width, size_height, rating, platform, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      game.name,
      game.description || null,
      game.game_url,
      game.thumbnail_url || null,
      game.category_id || null,
      game.namespace,
      game.url_slug,
      game.size_width || 800,
      game.size_height || 600,
      game.rating || 0,
      game.platform || '未知',
      game.status || 'published'
    ]);

    return NextResponse.json({
      success: true,
      id: result.lastID,
      url_slug: game.url_slug,
      message: 'Game created successfully'
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}