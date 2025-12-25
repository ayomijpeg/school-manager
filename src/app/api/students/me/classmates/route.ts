// src/app/api/students/me/classmates/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: NextRequest) {
  try {
    // 1. Get user ID from token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload as { userId: string }).userId;
    // We don't strictly need the role here unless we add parent logic later

    // 2. Find the studentId linked to this user
    const student = await prisma.student.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    // 3. Find the student's current class enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: student.id },
      orderBy: { academicYear: 'desc' },
      select: { classId: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Student is not enrolled in any class.' }, { status: 404 });
    }

    // 4. Find all *other* enrollments for that class
    const classmatesEnrollments = await prisma.enrollment.findMany({
      where: {
        classId: enrollment.classId,
        studentId: {
          not: student.id, // Exclude the student themselves
        },
        // Optional: Filter by current academic year if needed
      },
      include: {
        student: { // Get classmate details
          select: {
            id: true,
            fullName: true,
            // Include other non-sensitive fields if needed
          },
        },
      },
      orderBy: {
        student: { fullName: 'asc' },
      },
    });

    // 5. Extract just the student data
    const classmates = classmatesEnrollments.map(e => e.student);

    return NextResponse.json(classmates, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
