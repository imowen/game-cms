import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = 'woshi404page';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // 支持环境变量，默认admin123

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password === ADMIN_PASSWORD) {
      // 创建一个简单的token (在生产环境中应该使用更安全的方法)
      const token = Buffer.from(`${ADMIN_USERNAME}:${Date.now()}`).toString('base64');
      
      // 设置cookie
      const response = NextResponse.json({ success: true, message: 'Login successful' });
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24小时
      });
      
      return response;
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}