// src/app/api/students/me/exam-schedules/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: NextRequest) {
  try {
    // 1. Get user ID and role from token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload as { userId: string }).userId;
    const userRole = (payload as { role: string }).role;

    let studentId: string | null = null;

    // 2. Find the relevant studentId
    if (userRole === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: userId },
        select: { id: true },
      });
      studentId = student?.id ?? null;
    } else if (userRole === 'PARENT') {
      // Find the parent and get the ID of the first linked student (needs refinement for multiple children)
      const parent = await prisma.parent.findUnique({
        where: { userId: userId },
        include: { students: { select: { studentId: true }, take: 1 } },
      });
      studentId = parent?.students?.[0]?.studentId ?? null;
    } else if (userRole === 'ADMIN') {
        // Admins should use the main /api/exam-schedules route with filters
        return NextResponse.json({ error: 'Admins should use the main exam schedule routes' }, { status: 403 });
    }

    if (!studentId) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    // 3. Find the student's current class enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: studentId },
      orderBy: { academicYear: 'desc' },
      select: { classId: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Student is not enrolled in a class.' }, { status: 404 });
    }

    // 4. Find all exam schedules for that specific class
    const schedules = await prisma.examSchedule.findMany({
      where: {
        classId: enrollment.classId,
        // Optional: Filter for upcoming exams only?
        // examDate: { gte: new Date() }
      },
      include: {
        exam: { select: { name: true, academicYear: true } },
        course: { select: { name: true } },
      },
      orderBy: { examDate: 'asc' },
    });

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
