import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const slotSchema = z.object({
  classId: z.string(), 
  levelId: z.string().optional(), 
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']), 
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  type: z.enum(['LESSON', 'BREAK', 'ASSEMBLY', 'GENERAL']),
  courseId: z.string().optional(),
  teacherId: z.string().optional(),
});

// ✅ GET Method
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const levelId = searchParams.get('levelId');
  const classId = searchParams.get('classId');

  if (!levelId && !classId) {
    return NextResponse.json({ error: "Level ID or Class ID required" }, { status: 400 });
  }

  try {
    const whereClause: Prisma.TimetableSlotWhereInput = levelId 
      ? { class: { levelId: levelId } } 
      : { classId: classId! };

    const slots = await prisma.timetableSlot.findMany({
      where: whereClause,
      include: {
        course: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, fullName: true } },
        class: { select: { name: true, level: { select: { name: true } } } }, 
        venue: { select: { name: true } }
      },
      orderBy: [
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json(slots);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load timetable" }, { status: 500 });
  }
}

// ✅ POST Method (With Increased Timeout)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = slotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.format() }, { status: 400 });
    }

    const { levelId, day, startTime, endTime, type, courseId, teacherId } = result.data;
    let { classId } = result.data;

    // --- SCENARIO A: WHOLE SCHOOL BROADCAST ---
    if (levelId === 'ALL') {
      const allLevels = await prisma.level.findMany({ select: { id: true } });
      let createdCount = 0;

      // ⚠️ INCREASED TIMEOUT HERE to prevent P2028 Error
      await prisma.$transaction(async (tx) => {
        for (const level of allLevels) {
          // Find/Create General Class for this level
          let generalClass = await tx.class.findFirst({
            where: { levelId: level.id, name: 'General' }
          });

          if (!generalClass) {
            generalClass = await tx.class.create({
              data: { name: 'General', levelId: level.id }
            });
          }

          // Create the slot
          await tx.timetableSlot.create({
            data: {
              classId: generalClass.id,
              day: day, // Matches DB column 'day'
              startTime, 
              endTime, 
              type,
              teacherId 
            }
          });
          createdCount++;
        }
      }, {
        maxWait: 5000, // Max wait to start transaction
        timeout: 20000 // ✅ Max run time: 20 seconds (Plenty for ~20 levels)
      });

      return NextResponse.json({ message: `Broadcasted to ${createdCount} levels` }, { status: 201 });
    }

    // --- SCENARIO B: SINGLE LEVEL GENERAL ---
    if (classId === 'GENERAL') {
      if (!levelId) return NextResponse.json({ error: "Level ID required" }, { status: 400 });

      let generalClass = await prisma.class.findFirst({
        where: { levelId, name: 'General' }
      });

      if (!generalClass) {
        generalClass = await prisma.class.create({
          data: { name: 'General', levelId }
        });
      }
      classId = generalClass.id;
    }

    // --- SCENARIO C: SPECIFIC CLASS ---
    const newSlot = await prisma.timetableSlot.create({
      data: {
        classId,
        day: day, 
        startTime, 
        endTime, 
        type,
        courseId: type === 'LESSON' ? courseId : undefined,
        teacherId
      }
    });

    return NextResponse.json(newSlot, { status: 201 });

  } catch (error) {
    console.error("Timetable Create Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// ✅ DELETE Method
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  try {
    await prisma.timetableSlot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
