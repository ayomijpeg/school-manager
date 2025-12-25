// src/app/api/teachers/me/exam-schedules/route.ts
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
    const userRole = (payload as { role: string }).role;

    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Find the teacherId linked to this user
    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found.' }, { status: 404 });
    }

    // 3. Find all classes/courses this teacher is assigned to
    const assignments = await prisma.classAssignment.findMany({
      where: { teacherId: teacher.id },
      select: { classId: true, courseId: true },
    });

    if (assignments.length === 0) {
      return NextResponse.json([], { status: 200 }); // No assignments, so no schedules
    }

    // 4. Find all exam schedules matching those assignments
    // We need to create OR conditions: (class1 AND course1) OR (class2 AND course2) ...
    const scheduleConditions = assignments.map(a => ({
        classId: a.classId,
        courseId: a.courseId,
    }));

    const schedules = await prisma.examSchedule.findMany({
      where: {
        OR: scheduleConditions,
        // Optional: Filter for upcoming exams only?
        // examDate: { gte: new Date() }
      },
      include: {
        exam: { select: { name: true, academicYear: true } },
        class: { select: { name: true, level: { select: { name: true } } } },
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
