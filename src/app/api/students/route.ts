export const dynamic = 'force-dynamic';


import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

// 1. UPDATED SCHEMA
const createStudentSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email().optional().or(z.literal('')), 
  levelId: z.string().uuid('Level is required'),
  departmentId: z.string().uuid().optional(),    
  dateOfBirth: z.string().optional(), 
  contactPhone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
});

// Helper: Generate Matric Number
async function generateMatricNumber(tx: Prisma.TransactionClient) {
  const currentYear = new Date().getFullYear();
  const prefix = 'STU'; 
  
  const count = await tx.student.count({
    where: {
      createdAt: { gte: new Date(`${currentYear}-01-01`) },
    },
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  return `${currentYear}/${prefix}/${sequence}`;
}

// Helper: Generate Unique Email
async function generateUniqueEmail(tx: Prisma.TransactionClient, firstName: string, lastName: string) {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domain = 'school.local'; 

    let email = `${cleanFirst}.${cleanLast}@${domain}`;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        const existingUser = await tx.user.findUnique({
            where: { email: email }
        });

        if (!existingUser) {
            isUnique = true;
        } else {
            const randomCode = Math.floor(100 + Math.random() * 900);
            email = `${cleanFirst}.${cleanLast}${randomCode}@${domain}`;
        }
        attempts++;
    }

    if (!isUnique) throw new Error("Could not generate a unique email after multiple attempts.");
    return email;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createStudentSchema.parse(body);
    
    const fullName = `${data.lastName} ${data.firstName}`;
    const defaultPassword = await bcrypt.hash(`Student@123`, 10);

    const result = await prisma.$transaction(async (tx) => {
      
      const activeSession = await tx.academicSession.findFirst({
        where: { isCurrent: true }
      });
      
      if (!activeSession) {
        throw new Error("No Active Academic Session found.");
      }

      const emailToUse = data.email && data.email.length > 0 
          ? data.email 
          : await generateUniqueEmail(tx, data.firstName, data.lastName);

      const matricNumber = await generateMatricNumber(tx);

      const user = await tx.user.create({
        data: {
          email: emailToUse,
          passwordHash: defaultPassword,
          role: 'STUDENT',
          passwordResetRequired: true, 
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          fullName: fullName,
          matricNumber: matricNumber,
          levelId: data.levelId,
          departmentId: data.departmentId, 
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          contactPhone: data.contactPhone,
        },
      });

      const defaultClass = await tx.class.findFirst({
        where: { 
            levelId: data.levelId,
            departmentId: data.departmentId || undefined 
        }
      });

      if (defaultClass) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            classId: defaultClass.id,
            academicYear: activeSession.code,
          }
        });
      }

      return student;
    }, {
      maxWait: 5000, 
      timeout: 10000,
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: unknown) {
    console.error("[Create Student Error]", error);

    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'User with this email already exists manually.' }, { status: 409 });
        }
    }

    const errorMessage = error instanceof Error ? error.message : 'Admission failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const students = await prisma.student.findMany({
      where: {
        deletedAt: null,
        OR: search ? [
          { fullName: { contains: search, mode: 'insensitive' } },
          { matricNumber: { contains: search, mode: 'insensitive' } }, // 🟢 Allows searching by ID
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ] : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      
      select: {
        id: true,
        fullName: true,
        matricNumber: true, // 🟢 Required by frontend
        createdAt: true,
        
        level: { 
            select: { name: true } // 🟢 Required for the dropdown class display
        },
        department: { 
            select: { name: true } 
        },
        user: { 
            select: { 
                email: true,
                role: true
            } 
        }
      }
    });

    return NextResponse.json(students);

  } catch (error: unknown) {
    console.error("[API Error] Failed to fetch students:", error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
