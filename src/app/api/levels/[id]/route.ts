import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// -----------------------------------------------------------------------------
// 1. TYPE DEFINITIONS & SCHEMA
// -----------------------------------------------------------------------------

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateLevelSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  section: z.enum(['PRIMARY', 'SECONDARY', 'NURSERY']).optional(), 
  fee: z.coerce.number().min(0, 'Fee must be positive').optional(),
});

// -----------------------------------------------------------------------------
// 2. GET SINGLE LEVEL
// -----------------------------------------------------------------------------
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const level = await prisma.level.findUniqueOrThrow({
      where: { id },
    });

    return NextResponse.json(level);
  } catch (error) {
    // Type-safe error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Level not found' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// 3. PUT (UPDATE) LEVEL
// -----------------------------------------------------------------------------
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const validation = updateLevelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid Input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, section, fee } = validation.data;

    const updatedLevel = await prisma.level.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(section && { section }),
        ...(fee !== undefined && { fee }),
      },
    });

    return NextResponse.json(updatedLevel);

  } catch (error) {
    console.error("[PUT /api/levels/[id]] Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record Not Found
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Level not found' }, { status: 404 });
      }
      // Unique Constraint Violation
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A level with this name already exists.' }, { status: 409 });
      }
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// 4. DELETE LEVEL
// -----------------------------------------------------------------------------
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.level.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("[DELETE /api/levels/[id]] Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Level not found' }, { status: 404 });
      }
      // Foreign Key Constraint
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Cannot delete: Classes or Students are linked to this level.' }, 
          { status: 409 }
        );
      }
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
