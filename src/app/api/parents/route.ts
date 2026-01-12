export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

// 1. ROBUST SCHEMA
const createParentSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  // Allow empty string OR valid email
  email: z.string().email().optional().or(z.literal('')), 
  contactPhone: z.string().min(10, 'Phone number required'),
  studentIds: z.array(z.string().uuid()).optional(), 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createParentSchema.parse(body);
    
    const fullName = `${data.lastName} ${data.firstName}`;
    const defaultPassword = await bcrypt.hash(`Parent@123`, 10);
    
    // Generate placeholder email if empty (User model requires unique email)
    const emailToUse = data.email || `parent.${Date.now()}@school.local`;

    // 2. TIMEOUT CONFIGURATION
    const result = await prisma.$transaction(async (tx) => {
      
      // Create User
      const user = await tx.user.create({
        data: {
          email: emailToUse,
          passwordHash: defaultPassword,
          role: 'PARENT',
          passwordResetRequired: true,
        },
      });

      // Create Parent Profile
      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          fullName: fullName,
          contactPhone: data.contactPhone,
        },
      });

      // Link Children
      if (data.studentIds && data.studentIds.length > 0) {
        await tx.parentStudentLink.createMany({
          data: data.studentIds.map(studentId => ({
            parentId: parent.id,
            studentId: studentId
          }))
        });
      }

      return parent;

    }, {
      // FIX: Prevent Database Timeout Errors
      maxWait: 5000,
      timeout: 10000, 
    });

    return NextResponse.json(result, { status: 201 });

  // 3. SAFE ERROR HANDLING (Fixed Types)
  } catch (error: unknown) {
    console.error("Create Parent Error:", error);

    // Handle Prisma Unique Constraint Errors (e.g. Email exists)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email or Phone already exists' }, { status: 409 });
        }
    }
    
    // Handle Zod Validation Errors
    if (error instanceof z.ZodError) {
      // Use .issues instead of .errors to fix the TS error
      const msg = error.issues[0]?.message || 'Invalid input data';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Creation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET remains the same
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const parents = await prisma.parent.findMany({
      where: {
        OR: search ? [
          { fullName: { contains: search, mode: 'insensitive' } },
          { contactPhone: { contains: search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        user: { select: { email: true } },
        students: {
          include: {
            student: { select: { fullName: true, matricNumber: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(parents);
  } catch (error) {
    // FIX: Log the error so it is 'used' to satisfy ESLint
    console.error("Fetch Parents Error:", error);
    return NextResponse.json({ error: "Failed to fetch parents" }, { status: 500 });
  }
}
