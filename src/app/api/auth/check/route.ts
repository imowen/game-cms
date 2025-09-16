import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // 简单验证token格式和时间 (生产环境中应该使用更安全的验证)
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [user, timestamp] = decoded.split(':');
      
      if (user === 'woshi404page' && timestamp) {
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        const maxAge = 60 * 60 * 24 * 1000; // 24小时
        
        if (now - tokenTime < maxAge) {
          return NextResponse.json({ authenticated: true });
        }
      }
    } catch {
      // Token无效
    }
    
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}