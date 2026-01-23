import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

const attendanceRecordSchema = z.object({
  studentId: z.string().uuid(),
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().optional(),
});

const submitAttendanceSchema = z.object({
  classId: z.string().uuid(),
  courseId: z.string().uuid(),
  attendanceDate: z.string().date(), 
  records: z.array(attendanceRecordSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classId, courseId, attendanceDate, records } = submitAttendanceSchema.parse(body);
    const dateObj = new Date(attendanceDate);

    // SENIOR DEV TIP: Use a Transaction of Upserts.
    // This allows the teacher to "Overwrite" previous mistakes.
    await prisma.$transaction(
      records.map((record) => 
        prisma.studentAttendance.upsert({
          where: {
            studentId_courseId_attendanceDate: {
              studentId: record.studentId,
              courseId: courseId,
              attendanceDate: dateObj
            }
          },
          // If they hit save again, UPDATE the status
          update: { 
            status: record.status,
            remarks: record.remarks 
          },
          // If it's the first time, CREATE it
          create: {
            studentId: record.studentId,
            classId,
            courseId,
            attendanceDate: dateObj,
            status: record.status,
            remarks: record.remarks
          }
        })
      )
    );

    return NextResponse.json({ message: "Attendance saved successfully" });

  } catch (error) {
    console.error("Attendance Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
