import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

// ✅ GET: Fetch Logged-in Teacher's Assignments
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // 1. Verify Authentication
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload || payload.role !== 'TEACHER') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (payload.sub || payload.id) as string;

  try {
    // 2. Find the Teacher Profile linked to this User
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    // 3. Fetch Assignments for this Teacher
    const assignments = await prisma.classAssignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: {
          include: {
            level: true, 
            _count: {
              select: { enrollments: true } 
            }
          }
        },
        course: true,
      }
    });

    // 4. Format Data for the Dashboard UI
    const formattedClasses = assignments.map(a => ({
      id: a.class.id,
      className: `${a.class.level?.name || ''} ${a.class.name}`, // e.g., "JSS 1 A"
      subject: a.course.name, 
      subjectId: a.course.id,
      students: a.class._count.enrollments,
    }));

    return NextResponse.json(formattedClasses);

  } catch (error) {
    console.error("Teacher Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}
