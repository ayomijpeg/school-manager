import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: NextRequest) {
  try {
    // 1. Get user from token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload as { userId: string }).userId;

    // 2. Find the studentId linked to this user
    const student = await prisma.student.findFirst({
      where: { userId: userId },
      select: { id: true },
    });
    
    // (We'd add logic here for a PARENT to find their child's ID)
    
    if (!student) {
      return NextResponse.json({ error: 'No student profile found for this user.' }, { status: 404 });
    }

    // 3. Find all invoices for this student
    const invoices = await prisma.invoice.findMany({
      where: { studentId: student.id },
      include: {
        invoiceItems: true, // Show all line items
        payments: true, // Show any payments made
      },
      orderBy: { issueDate: 'desc' },
    });

    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
