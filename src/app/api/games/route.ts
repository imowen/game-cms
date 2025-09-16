import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Game, generateUniqueSlug } from '@/lib/database';

// 防爬虫和频率限制
const requestLog = new Map<string, { count: number; lastRequest: number; blocked: boolean }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟
const MAX_REQUESTS_PER_WINDOW = 20; // 每分钟最多20次请求
const BLOCK_DURATION = 10 * 60 * 1000; // 封禁10分钟

function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const userLog = requestLog.get(ip) || { count: 0, lastRequest: 0, blocked: false };

  // 检查是否在封禁期
  if (userLog.blocked && now - userLog.lastRequest < BLOCK_DURATION) {
    return { allowed: false, reason: 'IP temporarily blocked due to excessive requests' };
  }

  // 重置封禁状态
  if (userLog.blocked && now - userLog.lastRequest >= BLOCK_DURATION) {
    userLog.blocked = false;
    userLog.count = 0;
  }

  // 重置计数窗口
  if (now - userLog.lastRequest > RATE_LIMIT_WINDOW) {
    userLog.count = 0;
  }

  userLog.count++;
  userLog.lastRequest = now;

  // 检查是否超过限制
  if (userLog.count > MAX_REQUESTS_PER_WINDOW) {
    userLog.blocked = true;
    requestLog.set(ip, userLog);
    return { allowed: false, reason: 'Rate limit exceeded. Please try again later.' };
  }

  requestLog.set(ip, userLog);
  return { allowed: true };
}

// 检查是否为内部访问
function checkInternalAccess(request: NextRequest): { allowed: boolean; reason?: string } {
  const referer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent');
  const host = request.headers.get('host');
  const xRequestedWith = request.headers.get('x-requested-with');

  // 必须有Referer头且来自本站
  if (!referer) {
    return { allowed: false, reason: 'Direct API access not allowed. Access must be from website pages.' };
  }

  // 验证referer必须来自本站
  const allowedDomains = ['ggame.ee', 'localhost'];
  let isValidReferer = false;

  try {
    const refererDomain = new URL(referer).hostname;
    isValidReferer = allowedDomains.some(domain =>
      refererDomain === domain || refererDomain.endsWith('.' + domain)
    );
  } catch {
    return { allowed: false, reason: 'Invalid referer format' };
  }

  if (!isValidReferer) {
    return { allowed: false, reason: 'External access not permitted. API only available to internal pages.' };
  }

  // 检查User-Agent，必须像浏览器
  if (!userAgent || userAgent.length < 10) {
    return { allowed: false, reason: 'Invalid user agent' };
  }

  // 阻止常见的爬虫和API工具
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /scrape/i, /wget/i, /curl/i,
    /python/i, /java/i, /go-http/i, /postman/i, /insomnia/i,
    /axios/i
    // 移除 /fetch/i, /http/i, /request/i, /client/i 避免误伤正常浏览器请求
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return { allowed: false, reason: 'Automated access detected' };
  }

  // 要求常见浏览器标识
  const browserPatterns = [
    /mozilla/i, /chrome/i, /safari/i, /firefox/i, /edge/i, /opera/i
  ];

  if (!browserPatterns.some(pattern => pattern.test(userAgent))) {
    return { allowed: false, reason: 'Browser access required' };
  }

  // 检查是否为AJAX请求(更严格的内部调用验证)
  const acceptHeader = request.headers.get('accept');
  // 允许包含 application/json 或者 */* 的请求
  if (!acceptHeader || (!acceptHeader.includes('application/json') && !acceptHeader.includes('*/*'))) {
    return { allowed: false, reason: 'Invalid request format' };
  }

  return { allowed: true };
}

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

export async function GET(request: NextRequest) {
  try {
    // 获取客户端IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // 检查频率限制
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({
        error: rateLimitCheck.reason
      }, { status: 429 });
    }

    // 检查内部访问
    const accessCheck = checkInternalAccess(request);
    if (!accessCheck.allowed) {
      console.log(`External API access blocked from IP: ${ip}, Reason: ${accessCheck.reason}`);

      // 对于管理员请求，检查是否有有效的referer和基本的浏览器特征
      const referer = request.headers.get('referer');
      const userAgent = request.headers.get('user-agent');
      const isAdminRequest = new URL(request.url).searchParams.get('admin') === 'true';

      if (isAdminRequest && referer && userAgent) {
        try {
          const refererDomain = new URL(referer).hostname;
          const allowedDomains = ['ggame.ee', 'localhost'];
          const isValidReferer = allowedDomains.some(domain =>
            refererDomain === domain || refererDomain.endsWith('.' + domain)
          );

          if (isValidReferer && userAgent.includes('Mozilla')) {
            // 允许管理员请求通过
            console.log(`Admin request allowed from domain: ${refererDomain}`);
          } else {
            return NextResponse.json({
              error: 'API access restricted to internal use only'
            }, { status: 403 });
          }
        } catch {
          return NextResponse.json({
            error: 'API access restricted to internal use only'
          }, { status: 403 });
        }
      } else {
        return NextResponse.json({
          error: 'API access restricted to internal use only'
        }, { status: 403 });
      }
    }

    const db = await getDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50); // 限制最大50条
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const requestAdmin = searchParams.get('admin') === 'true';

    // 验证admin权限
    let isAdmin = false;
    if (requestAdmin) {
      isAdmin = await verifyAdminAuth(request);

      // 如果请求admin权限但验证失败，返回401
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
      }
    }

    const offset = (page - 1) * limit;

    let query = `
      SELECT g.*, c.name as category_name, c.color as category_color
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.is_active = 1
    `;

    // 如果不是管理后台调用，则只显示已发布的游戏
    if (!isAdmin) {
      query += ' AND (g.status = "published" OR g.status IS NULL)';
    }
    
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
    let countQuery = 'SELECT COUNT(*) as total FROM games WHERE is_active = 1';

    // 如果不是管理后台调用，则只统计已发布的游戏
    if (!isAdmin) {
      countQuery += ' AND (status = "published" OR status IS NULL)';
    }

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
    // 获取客户端IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // 检查频率限制
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({
        error: rateLimitCheck.reason
      }, { status: 429 });
    }

    // 验证管理员身份
    const isAuthorized = await verifyAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

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