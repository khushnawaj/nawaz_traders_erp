import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        username: payload.username,
        fullName: payload.fullName,
        role: payload.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, user: null },
      { status: 401 }
    );
  }
}
