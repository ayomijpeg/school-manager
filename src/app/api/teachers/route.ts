import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// Validation Schema
const createTeacherSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required'),
  contactPhone: z.string().optional(),
  departmentId: z.string().uuid().optional().or(z.literal('')), 
});

// --- POST: ONBOARD TEACHER ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Sanitize
    if (body.departmentId === "") body.departmentId = undefined;
    
    // Validate
    const data = createTeacherSchema.parse(body);

    const fullName = `${data.lastName} ${data.firstName}`;
    const defaultPassword = await bcrypt.hash(`Teacher@123`, 10); 

    // ID GENERATION
    const year = new Date().getFullYear();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const staffId = `STAFF/${year}/${randomCode}`; 

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: defaultPassword,
          role: 'TEACHER',
          passwordResetRequired: true,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          fullName: fullName,
          staffId: staffId, 
          contactPhone: data.contactPhone,
          departmentId: data.departmentId || null,
        },
      });

      return teacher;
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: unknown) { // FIXED: Use 'unknown' instead of 'any'
    console.error("[Create Teacher Error]", error);
    
    // Handle Unique Constraint (P2002)
    // We check if it's an object with a code property
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
        return NextResponse.json({ error: 'Email or Staff ID already exists' }, { status: 409 });
    }
    
    // Handle Zod Error
    if (error instanceof z.ZodError) {
        // Use .issues for better compatibility
        const message = error.issues[0]?.message || "Validation failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Onboarding failed' }, { status: 500 });
  }
}

// --- GET: LIST TEACHERS ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        deletedAt: null, 
        OR: search ? [
          { fullName: { contains: search, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: { fullName: 'asc' },
      include: {
        department: true,
        user: { select: { email: true } }, 
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Get Teachers Error", error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}
