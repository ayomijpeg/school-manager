// src/app/api/notifications/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { z } from 'zod';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// --- GET MY NOTIFICATIONS (GET) ---
export async function GET(request: NextRequest) {
  try {
    // 1. Get user ID from token
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload as { userId: string }).userId;

    // 2. Find notifications for this user
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }, // Show newest first
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// Zod schema for marking notifications as read
const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1, 'At least one notification ID is required'),
});

// --- MARK NOTIFICATIONS AS READ (PATCH) ---
export async function PATCH(request: NextRequest) {
   try {
    // 1. Get user ID from token
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload as { userId: string }).userId;

    // 2. Validate input body
    const body = await request.json();
    const { notificationIds } = markReadSchema.parse(body);

    // 3. Update the specified notifications FOR THIS USER ONLY
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: userId, // Ensure user can only update their own notifications
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ message: `Marked ${result.count} notifications as read.`}, { status: 200 });

  } catch (error) {
     if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
