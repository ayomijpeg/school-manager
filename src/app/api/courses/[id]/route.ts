import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Zod schema for UPDATING a course (all fields optional)
const updateCourseSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional().nullable(),
  syllabusUrl: z.string().url().optional().nullable(),
  levelId: z.string().uuid('Invalid Level ID').optional().nullable(),
  // Use departmentId FK instead of Department enum
  departmentId: z.string().uuid('Invalid Department ID').optional().nullable(),
});

// --- GET A SINGLE COURSE (GET) ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const course = await prisma.course.findUniqueOrThrow({
      where: { id: params.id },
      include: {
        level: { select: { name: true } },
        department: { select: { name: true } },
      },
    });
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    console.error('[GET /api/courses/[id]] error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// --- UPDATE A SINGLE COURSE (PUT) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const data = updateCourseSchema.parse(body);

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.syllabusUrl !== undefined && { syllabusUrl: data.syllabusUrl }),
        ...(data.levelId !== undefined && { levelId: data.levelId ?? null }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId ?? null }),
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    console.error('[PUT /api/courses/[id]] error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// --- DELETE A SINGLE COURSE (DELETE) ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.course.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    console.error('[DELETE /api/courses/[id]] error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
