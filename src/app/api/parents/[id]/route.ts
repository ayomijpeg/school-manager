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
    // Note: We don't have deletedAt on Parent schema yet?
    // If not, we should add it. For now, assuming you added it or use Hard Delete.
    // Recommended: Add deletedAt to Parent model.
    // For MVP Hard Delete logic (since Parent is less critical than Student records):
    
    // 1. Unlink students first
    await prisma.parentStudentLink.deleteMany({ where: { parentId: id } });
    
    // 2. Delete Parent Profile
    await prisma.parent.delete({ where: { id } });
    
    // 3. Delete User Login
    // (Fetch userId first if needed, cascading delete might handle this if config is Cascade)
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
