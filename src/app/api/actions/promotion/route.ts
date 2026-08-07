    import { NextResponse } from 'next/server';
    import { prisma } from '@/lib/prisma';
    import { getCurrentUser } from '@/lib/session';
    import { Prisma } from '@prisma/client'; 

    export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { studentId, newLevelId, newClassId, newAcademicYear } = body;

        const result = await prisma.$transaction(async (tx) => {
        const currentStudent = await tx.student.findUnique({
            where: { id: studentId },
            select: { levelId: true, fullName: true }
        });

        await tx.student.update({
            where: { id: studentId },
            data: {
            levelId: newLevelId,
            status: 'PROMOTED',
            },
        });

        await tx.enrollment.create({
            data: {
            studentId,
            classId: newClassId,
            academicYear: newAcademicYear,
            },
        });

        // tx.promotionHistory should work after running 'npx prisma generate'
        await tx.promotionHistory.create({
            data: {
            studentId,
            fromLevelId: currentStudent?.levelId,
            toLevelId: newLevelId,
            toClassId: newClassId,
            academicYear: newAcademicYear,
            },
        });

        return { name: currentStudent?.fullName };
        });

        return NextResponse.json({ success: true, name: result.name });

    } catch (error: unknown) {
        console.error("Promotion API Error:", error);
        let errorMessage = "An unexpected error occurred";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            errorMessage = "Student is already enrolled in this academic year";
        } else {
            errorMessage = `Database Error: ${error.message}`;
        }
        } else if (error instanceof Error) {
        errorMessage = error.message;
        }
        
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    }
