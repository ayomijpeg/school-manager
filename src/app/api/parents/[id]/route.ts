import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch for Editing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      user: true,
      students: {
        include: { student: true } // Fetch linked kids details
      }
    }
  });
  
  if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(parent);
}

// PATCH: Update Profile & Re-link Children
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const fullName = `${body.lastName} ${body.firstName}`;

    // Transaction: Update Info + Reset Links
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Update Basic Info
      const parent = await tx.parent.update({
        where: { id },
        data: {
          fullName, // Regenerate full name
          contactPhone: body.contactPhone,
        }
      });

      // 2. Update Email (User Table)
      if (body.email) {
        await tx.user.update({
          where: { id: parent.userId },
          data: { email: body.email }
        });
      }

      // 3. Handle Child Re-linking (The "Smart" Part)
      if (body.studentIds) {
        // A. Remove ALL existing links for this parent
        await tx.parentStudentLink.deleteMany({
          where: { parentId: id }
        });

        // B. Create NEW links
        if (body.studentIds.length > 0) {
          await tx.parentStudentLink.createMany({
            data: body.studentIds.map((sid: string) => ({
              parentId: id,
              studentId: sid
            }))
          });
        }
      }

      return parent;
    }, {
      // ✅ FIX: Increase timeout to 20 seconds (Default is 5s)
      maxWait: 5000, 
      timeout: 20000 
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Update failed", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE: Soft Delete (Archive)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Unlink students first
    await prisma.parentStudentLink.deleteMany({ where: { parentId: id } });
    
    // 2. Delete Parent Profile
    await prisma.parent.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
