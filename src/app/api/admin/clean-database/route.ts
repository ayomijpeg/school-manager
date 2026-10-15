import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only administrators can perform this action.' }, { status: 403 });
    }

    const body = await req.json();
    const { password, confirmPhrase, includeTeachers } = body;

    if (confirmPhrase !== 'CLEAN TEST DATA') {
      return NextResponse.json(
        { error: 'Confirmation phrase mismatch. Please type "CLEAN TEST DATA" exactly.' },
        { status: 400 }
      );
    }

    // Verify admin password
    const adminUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password || '', adminUser.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Incorrect administrator password.' }, { status: 401 });
    }

    // Attempt backup before deletion
    let backupFileName = '';
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupFileName = `backup_before_clean_${timestamp}.json`;
      const backupFilePath = path.join(backupDir, backupFileName);

      const [allStudents, allParents, allInvoices, allPayments, allResults, config] =
        await Promise.all([
          prisma.student.findMany({ include: { level: true, user: true } }),
          prisma.parent.findMany({ include: { user: true } }),
          prisma.invoice.findMany({ include: { invoiceItems: true, payments: true } }),
          prisma.payment.findMany(),
          prisma.result.findMany(),
          prisma.schoolConfig.findFirst(),
        ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        config,
        students: allStudents,
        parents: allParents,
        invoices: allInvoices,
        payments: allPayments,
        results: allResults,
      };

      fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
    } catch (backupErr) {
      console.warn('Backup warning (proceeding with clean):', backupErr);
    }

    // Perform atomic cleanup
    const counts = await prisma.$transaction(async (tx) => {
      const payments = await tx.payment.deleteMany();
      const invoiceItems = await tx.invoiceItem.deleteMany();
      const invoices = await tx.invoice.deleteMany();
      const attendances = await tx.studentAttendance.deleteMany();
      const results = await tx.result.deleteMany();
      const promotions = await tx.promotionHistory.deleteMany();
      const enrollments = await tx.enrollment.deleteMany();
      const parentLinks = await tx.parentStudentLink.deleteMany();
      const students = await tx.student.deleteMany();
      const studentUsers = await tx.user.deleteMany({ where: { role: 'STUDENT' } });
      
      let parentsDeleted = 0;
      if (body.includeParents) {
        const parents = await tx.parent.deleteMany();
        const parentUsers = await tx.user.deleteMany({ where: { role: 'PARENT' } });
        parentsDeleted = parents.count;
      }

      let teacherUsersDeleted = 0;
      if (includeTeachers) {
        await tx.classAssignment.deleteMany();
        await tx.timetableSlot.deleteMany();
        await tx.teacher.deleteMany();
        const teachersDel = await tx.user.deleteMany({ where: { role: 'TEACHER' } });
        teacherUsersDeleted = teachersDel.count;
      }

      return {
        students: students.count,
        parents: parentsDeleted,
        invoices: invoices.count,
        payments: payments.count,
        results: results.count,
        attendances: attendances.count,
        teachers: teacherUsersDeleted,
      };
    }, {
      maxWait: 20000,
      timeout: 60000,
    });

    return NextResponse.json({
      success: true,
      message: 'Test data purged successfully. The school system is clean and ready for real data!',
      backupFileName,
      counts,
    });
  } catch (error: any) {
    console.error('Clean Database API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to clean database' },
      { status: 500 }
    );
  }
}
