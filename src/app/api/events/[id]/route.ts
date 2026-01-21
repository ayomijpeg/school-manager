import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 🔴 FIX: Define types locally instead of importing from Prisma
// (This fixes the error if your DB schema uses Strings instead of Enums)
type EventCategory = 'GENERAL' | 'ACADEMIC' | 'SPORTS' | 'HOLIDAY';
type EventAudience = 'ALL' | 'STUDENTS' | 'PARENTS' | 'TEACHERS';

// Helper for Next.js Dynamic Route Params
type Props = { params: Promise<{ id: string }> };

// 1. Define what we receive from the Frontend (Input)
interface IncomingEventBody {
  title?: string;
  description?: string;
  startTime?: string; // ISO String from JSON
  endTime?: string;   // ISO String from JSON
  location?: string;
  category?: EventCategory;
  audience?: EventAudience;
  date?: string;      // ⚠️ We must strip this out
}

// 2. Define what we send to Prisma (Output)
interface DatabaseUpdateData {
  title?: string;
  description?: string;
  startTime?: Date;   // Converted Date Object
  endTime?: Date;     // Converted Date Object
  location?: string;
  category?: EventCategory;
  audience?: EventAudience;
}

// DELETE Operation
export async function DELETE(_request: Request, props: Props) {
  try {
    const { id } = await props.params;

    await prisma.event.delete({ 
        where: { id } 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

// PATCH Operation (Update)
export async function PATCH(request: Request, props: Props) {
  try {
    const { id } = await props.params;
    const body: IncomingEventBody = await request.json();

    // 3. Manually construct the clean update object.
    const dataToUpdate: DatabaseUpdateData = {};

    if (body.title) dataToUpdate.title = body.title;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.location) dataToUpdate.location = body.location;
    
    // Cast strict types if your DB expects strings or Enums
    if (body.category) dataToUpdate.category = body.category as EventCategory;
    if (body.audience) dataToUpdate.audience = body.audience as EventAudience;
    
    // Convert ISO strings to Date objects for Prisma
    if (body.startTime) {
        dataToUpdate.startTime = new Date(body.startTime);
    }
    if (body.endTime) {
        dataToUpdate.endTime = new Date(body.endTime);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Update Event Error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
