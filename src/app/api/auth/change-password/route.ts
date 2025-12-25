import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    // 1. Get Cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No session found.' }, { status: 401 });
    }

    // 2. Verify Token
    const payload = await verifyJwt(token);
    
    if (!payload) {
       return NextResponse.json({ error: 'Unauthorized: Token expired or invalid.' }, { status: 401 });
    }

    const userId = (payload.userId || payload.id || payload.sub) as string;

    if (!userId) {
       console.log("❌ Error: Token payload is missing User ID.");
       return NextResponse.json({ error: 'Unauthorized: Invalid token structure' }, { status: 401 });
    }

    // 3. Process Request
    const body = await request.json();
    const { newPassword, email } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
       return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    // 4. Check if Email is taken (by a DIFFERENT user)
    const existingUser = await prisma.user.findFirst({
        where: {
            email: email,
            id: { not: userId } // Must not be THIS user
        }
    });

    if (existingUser) {
        return NextResponse.json({ error: 'This email is already in use by another account.' }, { status: 409 });
    }

    // 5. Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update Database (Email + Password)
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: email, // Update Email
        passwordHash: hashedPassword, // Update Password
        passwordResetRequired: false, // Mark setup as done
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Account Setup Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
