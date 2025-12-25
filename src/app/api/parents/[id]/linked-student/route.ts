// src/app/api/parents/[parentId]/link-student/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Zod schema for the request body
const linkStudentSchema = z.object({
  studentId: z.string().uuid('Invalid Student ID'),
});

// --- LINK A STUDENT TO A PARENT (POST) ---
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }, // Get parentId from URL
) {
  try {
    const parentId = params.id;
    const body = await request.json();
    const { studentId } = linkStudentSchema.parse(body);

    // 2. Create the link record in the join table
    const link = await prisma.parentStudentLink.create({
      data: {
        parentId: parentId,
        studentId: studentId,
      },
      include: {
        // Include names for confirmation message
        parent: { select: { fullName: true } },
        student: { select: { fullName: true } },
      },
    });

    return NextResponse.json(
      {
        message: `Successfully linked ${link.parent.fullName} to ${link.student.fullName}.`,
        data: link,
      },
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
      // "Unique constraint failed" - Link already exists
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'This parent is already linked to this student.' },
          { status: 409 },
        );
      }
      // "Foreign key constraint failed" - Parent or Student ID is invalid
      if (error.code === 'P2003') {
         return NextResponse.json(
          { error: 'The specified Parent or Student does not exist.' },
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
