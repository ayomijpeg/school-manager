import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth'; 

// --- GET: TEACHER DASHBOARD STATS ---
export async function GET() {
  // 1. Get the token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify the custom JWT
  const payload = await verifyJwt(token);

  // payload.sub usually holds the user ID based on your login route
  const userId = payload?.sub as string || payload?.id as string; 

  if (!payload || !userId) {
    return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
  }

  try {
    // 3. Find the Teacher Profile linked to this User ID
    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    // 4. Get their Assignments (Classes & Subjects)
    const assignments = await prisma.classAssignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: {
          include: { 
            _count: { select: { enrollments: true } } // Auto-count students
          }
        },
        course: true,
      }
    });

    // 5. Calculate Stats (include all assignments)
    const totalClasses = assignments.length;
    const totalStudents = assignments.reduce(
      (sum, a) => sum + a.class._count.enrollments,
      0
    );

    // 6. Get Upcoming Events (Next 3)
    const events = await prisma.event.findMany({
      take: 3,
      where: { startTime: { gte: new Date() } },
      orderBy: { startTime: 'asc' }
    });

    // 7. Return Data (include both subject-based and general assignments)
    return NextResponse.json({
      profile: { 
        name: teacher.fullName, 
        staffId: teacher.staffId 
      },
      stats: {
        totalClasses,
        totalStudents
      },
      classes: assignments.map(a => ({
        id: a.class.id,
        name: a.class.name,
        subject: a.course?.name ?? 'General / Class Teacher',
        students: a.class._count.enrollments,
        courseId: a.course?.id ?? null, // null for general assignments
        isGeneral: a.course === null
      })),
      events
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
