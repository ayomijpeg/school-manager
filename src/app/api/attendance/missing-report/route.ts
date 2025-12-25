// src/app/api/attendance/missing-report/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { DayOfWeek } from '@prisma/client';

// Helper to convert JS Date day (0=Sun) to our DayOfWeek enum (MONDAY, etc.)
const jsDayToEnum = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export async function GET(request: NextRequest) {
  try {
    // 1. Get the date from query params, default to today
    const { searchParams } = new URL(request.url);
    const dateQuery = searchParams.get('date'); // Expects "YYYY-MM-DD"
    const targetDate = dateQuery ? new Date(dateQuery) : new Date();
    
    // Set time to noon to avoid timezone issues
    targetDate.setHours(12, 0, 0, 0); 
    
    const dayOfWeek = jsDayToEnum[targetDate.getDay()] as DayOfWeek;

    // 2. Find all classes that *should* have happened today
    const expectedSlots = await prisma.timetableSlot.findMany({
      where: {
        day: dayOfWeek,
      },
      select: {
        classId: true,
        courseId: true,
        teacher: {
          select: { fullName: true },
        },
        class: {
          select: { name: true, level: { select: { name: true } } },
        },
        course: {
          select: { name: true },
        },
      },
      distinct: ['classId', 'courseId', 'teacherId'],
    });

    // 3. Find all attendance that *was* submitted for today
    const submittedRecords = await prisma.studentAttendance.findMany({
      where: {
        attendanceDate: targetDate,
      },
      select: {
        classId: true,
        courseId: true,
      },
      distinct: ['classId', 'courseId'],
    });

    // 4. Compare the two lists
    const missingReports = expectedSlots.filter((slot) => {
      // Check if any submitted record matches this slot's class and course
      const wasSubmitted = submittedRecords.some(
        (record) =>
          record.classId === slot.classId &&
          record.courseId === slot.courseId,
      );
      return !wasSubmitted; // Keep it if it was NOT submitted
    });

    // 5. Format the report for the Admin
    const formattedReport = missingReports.map(slot => ({
      className: `${slot.class.level.name} ${slot.class.name}`,
      courseName: slot.course.name,
      teacherName: slot.teacher.fullName,
      status: 'MISSING',
    }));

    return NextResponse.json(formattedReport, { status: 200 });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
