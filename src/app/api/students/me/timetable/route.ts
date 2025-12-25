// src/app/api/students/me/timetable/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: NextRequest) {
  try {
    // 1. Get user ID from their token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload as { userId: string }).userId;

    // 2. Find the studentId linked to this user
    const student = await prisma.student.findFirst({
      where: { userId: userId },
      select: { id: true },
    });
    
    if (!student) {
      return NextResponse.json({ error: 'No student profile found for this user.' }, { status: 404 });
    }

    // 3. Find the student's *current* class enrollment
    // We'll just find the most recent one for now
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: student.id },
      orderBy: { academicYear: 'desc' },
      select: { classId: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Student is not enrolled in any class.' }, { status: 404 });
    }

    // 4. Find all timetable slots for that class
    const timetable = await prisma.timetableSlot.findMany({
      where: { classId: enrollment.classId },
      include: {
        course: { select: { name: true } },
        teacher: { select: { fullName: true } },
      },
      orderBy: [
        { day: 'asc' },   // Order by day
        { startTime: 'asc' }, // Then by time
      ],
    });

    return NextResponse.json(timetable, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
