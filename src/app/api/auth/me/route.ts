// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

type JWTPayload = { userId: string; role: string; email: string };

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[GET /api/auth/me] Missing JWT_SECRET');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token.value, secret) as JWTPayload;
    } catch (e) {
      console.warn('[GET /api/auth/me] Invalid or expired token', e);
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        passwordResetRequired: true,
      },
    });

    if (!user) {
      console.warn('[GET /api/auth/me] User not found for token', payload.userId);
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/auth/me] Unexpected error', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
