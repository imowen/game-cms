import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/games/by-slug/[slug] - 通过slug获取游戏详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDatabase();

    // 通过url_slug查询游戏，同时获取分类信息
    const game = await db.get(`
      SELECT
        g.*,
        c.name as category_name,
        c.color as category_color
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.url_slug = ? AND g.is_active = 1
    `, [slug]);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}