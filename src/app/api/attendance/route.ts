// src/app/api/attendance/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, AttendanceStatus } from '@prisma/client';

// 1. Zod schema for a single student's attendance record
const attendanceRecordSchema = z.object({
  studentId: z.string().uuid(),
  status: z.nativeEnum(AttendanceStatus), // PRESENT, ABSENT, LATE, EXCUSED
  remarks: z.string().optional(),
});

// 2. Zod schema for the entire attendance submission
const submitAttendanceSchema = z.object({
  classId: z.string().uuid(),
  courseId: z.string().uuid(),
  attendanceDate: z.string().date(), // Expects "YYYY-MM-DD"
  records: z.array(attendanceRecordSchema).min(1, 'No records submitted'),
});

// --- SUBMIT ATTENDANCE FOR A CLASS (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classId, courseId, attendanceDate, records } =
      submitAttendanceSchema.parse(body);

    // 3. Prepare the data for a bulk-create
    // We use .map() to format the list of records
    const dataToCreate = records.map((record) => ({
      studentId: record.studentId,
      classId: classId,
      courseId: courseId,
      attendanceDate: new Date(attendanceDate),
      status: record.status,
      remarks: record.remarks,
    }));

    // 4. Use Prisma's 'createMany' to insert all records in one database call
    // This is extremely fast and efficient.
    const result = await prisma.studentAttendance.createMany({
      data: dataToCreate,
      skipDuplicates: true, // If teacher submits twice, don't throw an error
    });

    return NextResponse.json(
      { message: `Attendance recorded for ${result.count} students.` },
      { status: 201 },
    );
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
          { error: 'The specified Student, Class, or Course does not exist.' },
          { status: 404 },
        );
      }
    }
    
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
