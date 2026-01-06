import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const depts = await prisma.department.findMany({ 
      orderBy: { name: 'asc' } 
    });
    
    return NextResponse.json(depts);
  } catch (error) {
    console.error('API Error (Departments):', error); // 👈 This will show the real error in your terminal
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}