import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper for Params
type Props = { params: Promise<{ id: string }> };

// 1. Define what we receive from the Frontend
interface IncomingEventBody {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  category?: string;
  audience?: string;
  date?: string; // This is the field we must strip out
}

// 2. Define what we send to the Database (Prisma)
interface DatabaseUpdateData {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  category?: string;
  audience?: string;
}

// DELETE
export async function DELETE(_request: Request, props: Props) {
  try {
    const { id } = await props.params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(request: Request, props: Props) {
  try {
    const { id } = await props.params;
    const body: IncomingEventBody = await request.json();

    // 3. Construct the clean object manually (Best practice for Type Safety)
    // This avoids using 'delete' on an 'any' object
    const dataToUpdate: DatabaseUpdateData = {};

    if (body.title) dataToUpdate.title = body.title;
    if (body.description) dataToUpdate.description = body.description;
    if (body.location) dataToUpdate.location = body.location;
    if (body.category) dataToUpdate.category = body.category;
    if (body.audience) dataToUpdate.audience = body.audience;
    
    // Convert ISO strings to Date objects
    if (body.startTime) {
        dataToUpdate.startTime = new Date(body.startTime);
    }
    if (body.endTime) {
        dataToUpdate.endTime = new Date(body.endTime);
    }

    // Note: We intentionally ignore 'body.date' here, so it never touches Prisma.

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
