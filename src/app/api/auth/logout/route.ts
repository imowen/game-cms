import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 清除cookie
    const response = NextResponse.json({ success: true, message: 'Logout successful' });
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // 立即过期
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}