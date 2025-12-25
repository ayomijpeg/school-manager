// src/app/api/timetable/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma, DayOfWeek } from '@prisma/client';

// 1. Zod schema for creating a timetable slot
const timeSlotSchema = z.object({
  classId: z.string().uuid(),
  courseId: z.string().uuid(),
  teacherId: z.string().uuid(),
  day: z.nativeEnum(DayOfWeek),
  startTime: z.string().time(), // Expects "HH:MM:SS" or "HH:MM"
  endTime: z.string().time(),
});

// Helper to convert "HH:MM" string to a Date object (UTC) for storage
function timeStringToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setUTCHours(hours, minutes, 0, 0); // Store time in UTC
  return date;
}

// --- CREATE A NEW TIMETABLE SLOT (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = timeSlotSchema.parse(body);

    // Basic validation: Ensure end time is after start time
    if (data.endTime <= data.startTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 },
      );
    }

    const newSlot = await prisma.timetableSlot.create({
      data: {
        classId: data.classId,
        courseId: data.courseId,
        teacherId: data.teacherId,
        day: data.day,
        startTime: timeStringToDate(data.startTime), // Convert string to Date
        endTime: timeStringToDate(data.endTime),   // Convert string to Date
      },
    });

    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // "Foreign key constraint failed"
      if (error.code === 'P2003') {
         return NextResponse.json(
          { error: 'The specified Class, Course, or Teacher does not exist.' },
          { status: 404 },
        );
      }
      // Consider adding checks for overlapping slots if needed (P2002 on a unique constraint)
    }
    
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}

// --- GET TIMETABLE SLOTS (GET) ---
// Optional: Filter by classId via query param ?classId=uuid
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    const whereClause = classId ? { classId: classId } : {};

    const slots = await prisma.timetableSlot.findMany({
      where: whereClause,
      orderBy: [
        { day: 'asc' },   // Sort primarily by day
        { startTime: 'asc' }, // Then by start time
      ],
      include: {
        class: { select: { name: true, level: { select: { name: true } } } },
        course: { select: { name: true } },
        teacher: { select: { fullName: true } },
      },
    });

    // Format times back to "HH:MM" for easier frontend use
    const formattedSlots = slots.map(slot => ({
      ...slot,
      startTime: slot.startTime.toISOString().substring(11, 16), // Extract HH:MM from ISO string
      endTime: slot.endTime.toISOString().substring(11, 16),
    }))

    return NextResponse.json(formattedSlots, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
