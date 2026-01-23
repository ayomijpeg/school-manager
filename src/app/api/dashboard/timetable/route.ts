import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

// Helper to sort days correctly
const DAY_ORDER = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7
};

// 1. Define the shape of the slot for the frontend
interface FormattedSlot {
  id: string;
  className: string;
  subject: string;
  code: string | null;
  venue: string;
  startTime: string;
  endTime: string;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (payload.sub || payload.id) as string;

  try {
    // 1. Find Teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    // 2. Fetch Slots for THIS Teacher
    const slots = await prisma.timetableSlot.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: { select: { name: true } },
        course: { select: { name: true, code: true } },
        venue: { select: { name: true } } // Assuming you added Venue model, optional
      },
      orderBy: { startTime: 'asc' }
    });

    // 3. Group & Format for Frontend
    const grouped = slots.reduce((acc, slot) => {
      const day = slot.day;
      if (!acc[day]) acc[day] = [];
      
      acc[day].push({
        id: slot.id,
        className: slot.class.name,
        subject: slot.course.name,
        code: slot.course.code,
        venue: slot.venue?.name || "Classroom",
        // Format dates to simple time strings "08:30 AM"
        startTime: new Date(slot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        endTime: new Date(slot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      });
      return acc;
    }, {} as Record<string, FormattedSlot[]>); // ✅ FIXED: Replaced 'any[]' with 'FormattedSlot[]'

    // Sort days logically
    const sortedDays = Object.keys(grouped).sort((a, b) => 
      (DAY_ORDER[a as keyof typeof DAY_ORDER] || 0) - (DAY_ORDER[b as keyof typeof DAY_ORDER] || 0)
    );

    return NextResponse.json({ schedule: grouped, days: sortedDays });

  } catch (error) {
    console.error("Timetable Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
