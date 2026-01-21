export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs'; // Using bcryptjs for better stability
import { Prisma } from '@prisma/client';

// 1. FLEXIBLE SCHEMA (Handles empty strings)
const createParentSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  // Accepts: undefined, empty string, or valid email
  email: z.union([z.literal(''), z.string().email(), z.undefined()]),
  // Accepts: undefined, empty string, or text
  contactPhone: z.union([z.literal(''), z.string(), z.undefined()]),
  studentIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createParentSchema.parse(body);
    
    const fullName = `${data.lastName} ${data.firstName}`;
    // Default password is simplified for parents: 'password' or '123456'
    // You can change this to whatever default you prefer
    const defaultPassword = await bcrypt.hash(`password123`, 10);
    
    // 2. SHORT & UNIQUE EMAIL GENERATOR
    let emailToUse = data.email;

    if (!emailToUse) {
        // Pattern: lastname + first_initial + 4_random_digits
        // Example: If name is "John Doe", email becomes "doej.4821@school.local"
        const cleanLast = data.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanFirstInit = data.firstName.toLowerCase().charAt(0);
        const shortCode = Math.floor(1000 + Math.random() * 9000); // Generates 1000-9999
        
        // Use a generic domain like 'school.local' or your actual domain 'yosolaschools.com'
        emailToUse = `${cleanLast}${cleanFirstInit}.${shortCode}@yosola.com`;
    }
    
    // Clean Phone (ensure it's not undefined)
    const phoneToUse = data.contactPhone || "";

    const result = await prisma.$transaction(async (tx) => {
      
      // Create User Login
      const user = await tx.user.create({
        data: {
          email: emailToUse as string, // Assert string since we generated one if missing
          passwordHash: defaultPassword,   // NOTE: Check if your schema uses 'password' or 'passwordHash'
          role: 'PARENT',
          passwordResetRequired: true, // Force them to change it on login
        },
      });

      // Create Parent Profile
      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          fullName: fullName,
          contactPhone: phoneToUse,
        },
      });

      // Link Children (if any selected)
      if (data.studentIds && data.studentIds.length > 0) {
         // Using the implicit relation logic which works with most standard Prisma schemas
         // This is safer than guessing the table name 'ParentStudentLink' vs 'ParentStudent'
         await tx.parent.update({
            where: { id: parent.id },
            data: {
                students: {
                    create: data.studentIds.map(studentId => ({
                        studentId: studentId
                    }))
                }
            }
         });
      }

      return { ...parent, generatedEmail: emailToUse }; // Return email so you can show it to Admin

    }, {
      maxWait: 5000,
      timeout: 10000, 
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("Create Parent Error:", error);

    // Handle Duplicate Email (Collision unlikely with 4 digits, but possible)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'System generated a duplicate ID. Please try again.' }, { status: 409 });
        }
    }
    
    if (error instanceof z.ZodError) {
      const msg = error.issues[0]?.message || 'Invalid input data';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    
    return NextResponse.json({ error: error.message || 'Creation failed' }, { status: 500 });
  }
}

// GET Handler (Standardized)
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
            student: { select: { id: true, fullName: true, matricNumber: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(parents);
  } catch (error) {
    console.error("Fetch Parents Error:", error);
    return NextResponse.json({ error: "Failed to fetch parents" }, { status: 500 });
  }
}
