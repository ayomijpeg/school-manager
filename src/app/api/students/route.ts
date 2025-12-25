import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// 1. UPDATED SCHEMA: Matches the "Admission Page" fields
const createStudentSchema = z.object({
  firstName: z.string().min(2, 'First name required'), // Form sends this
  lastName: z.string().min(2, 'Last name required'),   // Form sends this
  email: z.string().email().optional().or(z.literal('')), 
  levelId: z.string().uuid('Level is required'),
  departmentId: z.string().uuid().optional(),    
  dateOfBirth: z.string().optional(), 
  contactPhone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  // NOTE: We do NOT require 'password' or 'fullName' here. 
  // We generate them in the function below.
});

// --- HELPER: MATRIC NUMBER GENERATOR ---
async function generateMatricNumber(tx: any, departmentId?: string) {
  const currentYear = new Date().getFullYear();
  let prefix = 'STU'; // You can make this dynamic later based on Dept
  
  const count = await tx.student.count({
    where: {
      createdAt: { gte: new Date(`${currentYear}-01-01`) },
    },
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  return `${currentYear}/${prefix}/${sequence}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createStudentSchema.parse(body);
    
    // 2. LOGIC: Auto-generate the missing fields
    const fullName = `${data.lastName} ${data.firstName}`;
    const defaultPassword = await bcrypt.hash(`Student@123`, 10); // Default password
    const email = data.email || `${data.firstName}.${data.lastName}.${Date.now()}@school.local`.toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      
      const activeSession = await tx.academicSession.findFirst({
        where: { isCurrent: true }
      });
      
      if (!activeSession) {
        throw new Error("No Active Academic Session found.");
      }

      const matricNumber = await generateMatricNumber(tx, data.departmentId);

      // Create User Account
      const user = await tx.user.create({
        data: {
          email: email,
          passwordHash: defaultPassword,
          role: 'STUDENT',
          passwordResetRequired: true, 
        },
      });

      // Create Student Profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          fullName: fullName, // We calculated this above
          matricNumber: matricNumber,
          levelId: data.levelId,
          departmentId: data.departmentId, 
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          contactPhone: data.contactPhone,
        },
      });

      // Enroll in Default Class if available
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
          
      maxWait: 5000,  // Wait 5s for connection
      timeout: 10000,
      });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("[Create Student Error]", error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Admission failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    console.log(`[API] Searching students for: "${search}"`);

    const students = await prisma.student.findMany({
      where: {
        // Only show active students
        deletedAt: null, 
        
        // Search Logic
        OR: search ? [
          { fullName: { contains: search, mode: 'insensitive' } },
          { matricNumber: { contains: search, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to 20 for dropdown performance
      
      // Select fields needed for the dropdown (lighter query)
      select: {
        id: true,
        fullName: true,
        matricNumber: true,
        level: { select: { name: true } },
        department: { select: { name: true } }
      }
    });

    console.log(`[API] Found ${students.length} students`);
    return NextResponse.json(students);

  } catch (error: any) {
    console.error("[API Error] Failed to fetch students:", error);
    
    // Check if it's the specific "deletedAt" error
    if (error.message?.includes('deletedAt')) {
        return NextResponse.json(
            { error: "Database Schema mismatch: deletedAt field missing. Run 'npx prisma db push'" }, 
            { status: 500 }
        );
    }
    
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
