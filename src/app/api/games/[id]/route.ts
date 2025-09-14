import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Game, generateUniqueSlug } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    const game = await db.get(`
      SELECT g.*, c.name as category_name, c.color as category_color 
      FROM games g 
      LEFT JOIN categories c ON g.category_id = c.id 
      WHERE g.id = ?
    `, [id]);
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const game: Game = await request.json();

    // 处理url_slug更新
    let url_slug = game.url_slug;
    if (!url_slug) {
      // 如果没有提供slug，从名称生成
      url_slug = await generateUniqueSlug(game.name, parseInt(id));
    } else {
      // 如果提供了slug，确保它是唯一的
      url_slug = await generateUniqueSlug(url_slug, parseInt(id));
    }

    await db.run(`
      UPDATE games
      SET name = ?, description = ?, game_url = ?, thumbnail_url = ?,
          category_id = ?, url_slug = ?, size_width = ?, size_height = ?, rating = ?, platform = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      game.name,
      game.description || null,
      game.game_url,
      game.thumbnail_url || null,
      game.category_id || null,
      url_slug,
      game.size_width || 800,
      game.size_height || 600,
      game.rating || 0,
      game.platform || '未知',
      id
    ]);

    return NextResponse.json({
      success: true,
      url_slug: url_slug,
      message: 'Game updated successfully'
    });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    await db.run('UPDATE games SET is_active = 0 WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}