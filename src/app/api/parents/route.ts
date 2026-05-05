export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs'; // Ensure npm install bcryptjs is done
import { Prisma } from '@prisma/client';

// 1. FLEXIBLE SCHEMA
const createParentSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.union([z.literal(''), z.string().email(), z.undefined()]),
  contactPhone: z.union([z.literal(''), z.string(), z.undefined()]),
  studentIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createParentSchema.parse(body);
    
    const fullName = `${data.lastName} ${data.firstName}`;

    // 2. STABLE HASHING LOGIC
    // We explicitly generate a salt to prevent the "dO1" corruption error
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('parent@123', salt);
    
    // 3. EMAIL GENERATOR & LOWERCASE FIX
    let emailToUse = data.email;

    if (!emailToUse) {
        const cleanLast = data.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanFirstInit = data.firstName.toLowerCase().charAt(0);
        const shortCode = Math.floor(1000 + Math.random() * 9000);
        emailToUse = `${cleanLast}${cleanFirstInit}.${shortCode}@yosola.com`;
    }
    
    const finalEmail = emailToUse.toLowerCase(); // Vital for production login
    const phoneToUse = data.contactPhone || "";

    // 4. TRANSACTION WITH EXPLICIT TYPES
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // Create User Login
      const user = await tx.user.create({
        data: {
          email: finalEmail,
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
          contactPhone: phoneToUse,
        },
      });

      // Link Children
      if (data.studentIds && data.studentIds.length > 0) {
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

      return { ...parent, generatedEmail: finalEmail };

    }, {
      maxWait: 5000,
      timeout: 10000, 
    });

    return NextResponse.json(result, { status: 201 });

  } catch (err: unknown) {
    console.error("Create Parent Error:", err);

    // 5. SECURE & TYPE-SAFE ERROR HANDLING
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
        }
    }
    
    if (err instanceof z.ZodError) {
      const msg = err.issues[0]?.message || 'Invalid input data';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (err instanceof Error) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// 6. GET HANDLER (Optimized)
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
  } catch (err: unknown) {
    console.error("Fetch Parents Error:", err);
    return NextResponse.json({ error: "Failed to fetch parents" }, { status: 500 });
  }
}
