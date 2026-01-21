import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation Schema
const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().datetime(), 
  endTime: z.string().datetime(),
  location: z.string().optional(),
  category: z.enum(['GENERAL', 'ACADEMIC', 'SPORTS', 'HOLIDAY']).default('GENERAL'),
  audience: z.enum(['ALL', 'STUDENTS', 'PARENTS', 'TEACHERS']).default('ALL'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || '',
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || 'School Premises',
        category: data.category,
        audience: data.audience,
      },
    });

    return NextResponse.json(event, { status: 201 });

  } catch (error: unknown) { // 🟢 FIX 1: Use 'unknown' instead of 'any'
    console.error("Create Event Error:", error);
    
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to schedule event" }, { status: 500 });
  }
}

// 🟢 FIX 2: Removed unused 'request' parameter
export async function GET() { 
  try {
    const events = await prisma.event.findMany({
      orderBy: { startTime: 'asc' },
      where: {
        startTime: {
            gte: new Date(new Date().setDate(new Date().getDate() - 1)) 
        }
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    // 🟢 FIX 3: Log 'error' so it is considered "used"
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
