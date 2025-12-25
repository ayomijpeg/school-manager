// src/app/api/students/me/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { Prisma } from '@prisma/client'; // Import Prisma and Student




// Define the type for the student profile including relations
type StudentProfile = Prisma.StudentGetPayload<{
  include: {
    level: { select: { name: true } };
    enrollments: {
      orderBy: { academicYear: 'desc' };
      take: 1;
      include: {
        class: { select: { name: true } };
      };
    };
  };
}>;

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: NextRequest) {
  try {
    // 1. Get user ID and role from their token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload as { userId: string }).userId;
    const userRole = (payload as { role: string }).role;

    let profileData: StudentProfile | StudentProfile[] | null = null;

    // 2. Fetch based on role
    if (userRole === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: userId },
        include: {
          level: { select: { name: true } },
          enrollments: {
            orderBy: { academicYear: 'desc' },
            take: 1, // Get the latest enrollment
            include: {
              class: { select: { name: true } }, // Get the class name (e.g., "A")
            },
          },
        },
      });
      profileData = student; // Store the single student profile

    } else if (userRole === 'PARENT') {
      const parent = await prisma.parent.findUnique({
        where: { userId: userId },
        include: {
          students: { // Get ALL linked students
            orderBy: { student: { fullName: 'asc' } }, // Order children alphabetically
            include: {
              student: { // Now get each student's details
                include: {
                  level: { select: { name: true } }, // Level name (e.g., "JSS 1")
                  enrollments: {
                    orderBy: { academicYear: 'desc' },
                    take: 1, // Get their latest enrollment
                    include: {
                      class: { select: { name: true } }, // Class name (e.g., "A")
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Extract just the student profiles into an array
      profileData = parent?.students?.map(link => link.student) || [];

    } else if (userRole === 'ADMIN') {
        return NextResponse.json({ error: 'Admins should use specific student routes' }, { status: 403 });
    }

    // Check if we found anything
    if (!profileData || (Array.isArray(profileData) && profileData.length === 0)) {
      return NextResponse.json({ error: 'No student profile(s) found for this user.' }, { status: 404 });
    }

    // Return either the single student object or the array of student objects
    return NextResponse.json(profileData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
