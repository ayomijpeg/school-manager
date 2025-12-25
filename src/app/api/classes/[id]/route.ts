// src/app/api/classes/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Next.js 16 context type
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Validation schema for updates
const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  levelId: z.string().uuid().optional(),
  // Optional department FK
  departmentId: z.string().uuid().nullable().optional(),
  // If you DO NOT have roomNumber in Prisma, remove it completely.
//   roomNumber: z.string().nullable().optional(),
});

// PUT (Update Class)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const validation = updateClassSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const data = validation.data;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.levelId && { levelId: data.levelId }),
        // Explicitly handle nullable FK
        ...(data.departmentId !== undefined && {
          departmentId: data.departmentId ?? null,
        }),
        // If you later add roomNumber to Prisma, you can map it similarly.
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error('[PUT Class] Error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Class name already exists in this level' },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE (Remove Class)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.class.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('[DELETE Class] Error:', error);

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete class: It has students enrolled.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
