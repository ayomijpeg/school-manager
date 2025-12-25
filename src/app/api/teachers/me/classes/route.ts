// src/app/api/teachers/me/classes/route.ts
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

    // Ensure it's a teacher or admin
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

    // 3. Find all assignments for this teacher
    const assignments = await prisma.classAssignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: {
          select: {
            id: true,
            name: true, // e.g., "A"
            level: { select: { name: true } }, // e.g., "JSS 1"
          },
        },
        course: {
          select: {
            id: true,
            name: true, // e.g., "Mathematics"
          },
        },
      },
      orderBy: [
          { class: { level: { name: 'asc' }}},
          { class: { name: 'asc' }},
          { course: { name: 'asc' }}
      ]
    });

    // 4. Format the response for the frontend (optional but helpful)
    const formattedAssignments = assignments.map(a => ({
        classId: a.class.id,
        className: `${a.class.level.name} ${a.class.name}`, // "JSS 1 A"
        courseId: a.course.id,
        courseName: a.course.name,
    }));

    return NextResponse.json(formattedAssignments, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
