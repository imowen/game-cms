import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// 验证管理员身份
async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return false;
    }

    const decoded = Buffer.from(token, 'base64').toString();
    const [user, timestamp] = decoded.split(':');

    if (user === 'woshi404page' && timestamp) {
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      const maxAge = 60 * 60 * 24 * 1000; // 24小时

      if (now - tokenTime < maxAge) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// GET /api/games/by-slug/[slug] - 通过slug获取游戏详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDatabase();

    // 检查是否为管理员
    const isAdmin = await verifyAdminAuth(request);

    // 首先尝试查找激活的游戏
    let game = await db.get(`
      SELECT
        g.*,
        c.name as category_name,
        c.color as category_color
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.url_slug = ? AND g.is_active = 1
    `, [slug]);

    // 如果没找到且用户是管理员，则查找所有游戏（包括不活跃的）
    if (!game && isAdmin) {
      game = await db.get(`
        SELECT
          g.*,
          c.name as category_name,
          c.color as category_color
        FROM games g
        LEFT JOIN categories c ON g.category_id = c.id
        WHERE g.url_slug = ?
      `, [slug]);
    }

    // 最后尝试通过ID查找（向后兼容）
    if (!game) {
      const possibleId = parseInt(slug);
      if (!isNaN(possibleId)) {
        game = await db.get(`
          SELECT
            g.*,
            c.name as category_name,
            c.color as category_color
          FROM games g
          LEFT JOIN categories c ON g.category_id = c.id
          WHERE g.id = ? ${isAdmin ? '' : 'AND g.is_active = 1'}
        `, [possibleId]);
      }
    }

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found', slug: slug },
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