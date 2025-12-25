import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// 1. Updated Schema: Department is now a valid field
const createStudentSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email().optional().or(z.literal('')), 
  levelId: z.string().uuid('Level is required'), // "JSS1" or "100 Level"
  departmentId: z.string().uuid().optional(),    // "Science Dept" or "Computer Sci"
  dateOfBirth: z.string().optional(), 
  contactPhone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
});

// --- HELPER: SMART MATRIC GENERATOR ---
async function generateMatricNumber(tx: any, departmentId?: string) {
  const currentYear = new Date().getFullYear();
  
  // 1. Get a prefix. If Tertiary & Dept exists, try to get Dept Code (e.g., COM, ECO)
  // For MVP, we will use a generic 'STU' or 'UNI' prefix, 
  // but a Senior Dev would eventually look up the Department.code here.
  let prefix = 'STU';
  
  // 2. Count specific sequence
  const count = await tx.student.count({
    where: {
      createdAt: { gte: new Date(`${currentYear}-01-01`) },
    },
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  
  // Format: 2024/STU/0056
  return `${currentYear}/${prefix}/${sequence}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createStudentSchema.parse(body);
    
    const fullName = `${data.lastName} ${data.firstName}`;
    const defaultPassword = await bcrypt.hash(`Student@123`, 10);
    // Generate unique email placeholder if none provided
    const email = data.email || `${data.firstName}.${data.lastName}.${Date.now()}@school.local`.toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      
      const activeSession = await tx.academicSession.findFirst({
        where: { isCurrent: true }
      });
      
      if (!activeSession) {
        throw new Error("No Active Academic Session found.");
      }

      const matricNumber = await generateMatricNumber(tx, data.departmentId);

      // Create User
      const user = await tx.user.create({
        data: {
          email: email,
          passwordHash: defaultPassword,
          role: 'STUDENT',
          passwordResetRequired: true, 
        },
      });

      // Create Student (NOW WITH DEPARTMENT)
      const student = await tx.student.create({
        data: {
          userId: user.id,
          fullName: fullName,
          matricNumber: matricNumber,
          levelId: data.levelId,
          departmentId: data.departmentId, // <--- CRITICAL FOR TERTIARY
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          contactPhone: data.contactPhone,
        },
      });

      // --- ENROLLMENT LOGIC (The "Core vs Flex" Part) ---
      
      // If it's BASIC education, we usually assign them to a specific CLASS immediately (e.g. JSS1 A).
      // If it's TERTIARY, we assign them to a DEPARTMENT (done above), but not a "Class Room".
      // We check if a default class exists for this level/dept combination.
      
      const defaultClass = await tx.class.findFirst({
        where: { 
            levelId: data.levelId,
            // If department is provided, try to find a class in that department
            departmentId: data.departmentId || undefined 
        }
      });

      if (defaultClass) {
        // Basic Ed Flow: Put them in a class
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            classId: defaultClass.id,
            academicYear: activeSession.code,
          }
        });
      } else {
        // Tertiary Flow: They are "Enrolled" in the school via Department connection,
        // but haven't registered for specific courses yet. This is valid for Uni.
      }

      return student;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("[Create Student Error]", error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Admission failed' }, { status: 500 });
  }
}

// GET remains the same...
export async function GET(request: Request) {
  // ... (Keep the GET function from the previous message)
  // Just ensure you add 'department: { select: { name: true } }' to the 'include' block
  // so you can see their Major/Dept in the list.
  
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const students = await prisma.student.findMany({
      where: {
        deletedAt: null, 
        OR: search ? [
          { fullName: { contains: search, mode: 'insensitive' } },
          { matricNumber: { contains: search, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        level: { select: { name: true } },
        department: { select: { name: true } }, // <--- ADD THIS
        user: { select: { email: true } },
        enrollments: {
          where: { class: { isNot: null } },
          take: 1,
          orderBy: { academicYear: 'desc' },
          select: {
            class: { select: { name: true } },
            academicYear: true,
          }
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
