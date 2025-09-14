import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

async function checkUrlValidity(url: string): Promise<{ valid: boolean; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'GameCMS-Bot/1.0'
      }
    });

    clearTimeout(timeoutId);

    return {
      valid: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameIds } = await request.json();
    
    if (!gameIds || !Array.isArray(gameIds)) {
      return NextResponse.json({ error: 'Invalid game IDs' }, { status: 400 });
    }

    const db = await getDatabase();
    const results = [];

    for (const gameId of gameIds) {
      const game = await db.get('SELECT id, name, game_url FROM games WHERE id = ?', [gameId]);
      
      if (!game) {
        results.push({
          gameId,
          valid: false,
          error: 'Game not found'
        });
        continue;
      }

      const checkResult = await checkUrlValidity(game.game_url);
      
      results.push({
        gameId: game.id,
        gameName: game.name,
        gameUrl: game.game_url,
        ...checkResult
      });

      // 如果需要，可以更新数据库中的状态
      if (!checkResult.valid) {
        // 可以添加一个字段来标记URL无效的游戏
        // await db.run('UPDATE games SET url_valid = 0, last_checked = CURRENT_TIMESTAMP WHERE id = ?', [game.id]);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        valid: results.filter(r => r.valid).length,
        invalid: results.filter(r => !r.valid).length
      }
    });
  } catch (error) {
    console.error('Error checking URLs:', error);
    return NextResponse.json({ error: 'Failed to check URLs' }, { status: 500 });
  }
}

// 检查单个URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    const result = await checkUrlValidity(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking URL:', error);
    return NextResponse.json({ error: 'Failed to check URL' }, { status: 500 });
  }
}