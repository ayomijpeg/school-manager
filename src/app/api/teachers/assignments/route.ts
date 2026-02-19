import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const assignSchema = z.object({
  teacherId: z.string().uuid(),
  classId: z.string(), // Accepts UUID, "all-arms", or "auto-create"
  courseId: z.string().uuid().optional().nullable(), // Omit or null = General / Class Teacher
  levelId: z.string().optional().nullable(),
});

// ✅ GET: Fetch Assignments for a specific teacher (Admin View)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId');

  if (!teacherId) return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });

  try {
    const assignments = await prisma.classAssignment.findMany({
      where: { teacherId },
      include: {
        class: { include: { level: true } },
        course: true,
      }
    });
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// ✅ POST: Create Assignment (Single, Bulk, or Auto-Create)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = assignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const { teacherId, classId, courseId, levelId } = result.data;

    // Helper: existence check that works when courseId can be null
    const existsWhere = (cId: string) => ({
      teacherId,
      classId: cId,
      ...(courseId != null ? { courseId } : { courseId: null }),
    });

    // SCENARIO 1: AUTO-CREATE 'General' CLASS
    if (classId === 'auto-create') {
      if (!levelId) return NextResponse.json({ error: "Level required" }, { status: 400 });

      let defaultClass = await prisma.class.findFirst({
        where: { levelId, name: 'General' }
      });

      if (!defaultClass) {
        defaultClass = await prisma.class.create({
          data: { name: 'General', levelId }
        });
      }

      const exists = await prisma.classAssignment.findFirst({
        where: existsWhere(defaultClass.id)
      });

      if (exists) return NextResponse.json({ error: "Already assigned" }, { status: 409 });

      const newAssignment = await prisma.classAssignment.create({
        data: { teacherId, classId: defaultClass.id, ...(courseId ? { courseId } : {}) },
        include: { class: { include: { level: true } }, course: true }
      });

      return NextResponse.json(newAssignment, { status: 201 });
    }

    // SCENARIO 2: BULK ASSIGN (All Arms)
    if (classId === 'all-arms') {
      if (!levelId) return NextResponse.json({ error: "Level required" }, { status: 400 });

      const allClasses = await prisma.class.findMany({
        where: { levelId },
        select: { id: true }
      });

      if (allClasses.length === 0) return NextResponse.json({ error: "No classes found" }, { status: 404 });

      let count = 0;
      await prisma.$transaction(async (tx) => {
        for (const cls of allClasses) {
          const exists = await tx.classAssignment.findFirst({
            where: existsWhere(cls.id)
          });
          if (!exists) {
            await tx.classAssignment.create({
              data: { teacherId, classId: cls.id, ...(courseId ? { courseId } : {}) }
            });
            count++;
          }
        }
      });

      return NextResponse.json({ message: `Assigned to ${count} classes`, isBulk: true }, { status: 201 });
    }

    // SCENARIO 3: STANDARD ASSIGN
    const exists = await prisma.classAssignment.findFirst({
      where: existsWhere(classId)
    });

    if (exists) return NextResponse.json({ error: "Already assigned" }, { status: 409 });

    const newAssignment = await prisma.classAssignment.create({
      data: { teacherId, classId, ...(courseId ? { courseId } : {}) },
      include: { class: { include: { level: true } }, course: true }
    });

    return NextResponse.json(newAssignment, { status: 201 });

  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// ✅ DELETE: Remove Assignment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.classAssignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
