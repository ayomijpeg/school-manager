import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Fetch ALL active students
    const students = await prisma.student.findMany({
      where: { deletedAt: null },
      orderBy: { fullName: 'asc' },
      include: {
        level: true,
        department: true,
        user: true, // to get email
      }
    });

    // 2. Define CSV Headers
    const headers = ['Full Name', 'Matric Number', 'Email', 'Gender', 'Level', 'Department', 'Phone', 'Date Created'];
    
    // 3. Map Data to CSV Rows
    const rows = students.map(s => [
      `"${s.fullName}"`, // Quote strings to handle commas in names
      s.matricNumber,
      s.user.email,
      s.gender || 'N/A',
      s.level?.name || 'N/A',
      s.department?.name || 'N/A',
      s.contactPhone || '',
      s.createdAt.toISOString().split('T')[0]
    ]);

    // 4. Combine into single string
    const csvContent = [
      headers.join(','), 
      ...rows.map(r => r.join(','))
    ].join('\n');

    // 5. Return as a File Download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="student_register_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
