import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose'; 
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: { select: { fullName: true } },
        teacher: { select: { fullName: true } },
        parent: { select: { fullName: true } },
      }
    });

    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    // 2. Compare Password (THE FIX IS HERE)
    // We switched 'user.password' to 'user.passwordHash' to match your database
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    // 3. Create Token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ 
        id: user.id,      
        sub: user.id,     
        userId: user.id, // Adding all variations to be safe
        email: user.email, 
        role: user.role 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // 4. Set Cookie
    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    // 5. Determine Redirect
    const fullName = user.student?.fullName || user.teacher?.fullName || user.parent?.fullName || 'Admin';
    
    const redirectUrl = user.passwordResetRequired 
      ? '/auth/new-password' 
      : '/dashboard';

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: fullName,
        passwordResetRequired: user.passwordResetRequired,
      },
      redirectUrl 
    });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
