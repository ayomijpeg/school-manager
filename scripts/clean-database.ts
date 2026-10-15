import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function cleanDatabase() {
  const args = process.argv.slice(2);
  const isConfirmed = args.includes('--confirm');
  const wipeTeachers = args.includes('--include-teachers');

  console.log('====================================================');
  console.log('       YOSOLA SCHOOLS - DATABASE CLEAN UTILITY      ');
  console.log('====================================================');

  // 1. Count current records
  const [
    studentCount,
    parentCount,
    invoiceCount,
    paymentCount,
    resultCount,
    attendanceCount,
    promotionCount,
    teacherCount,
    adminCount,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.parent.count(),
    prisma.invoice.count(),
    prisma.payment.count(),
    prisma.result.count(),
    prisma.studentAttendance.count(),
    prisma.promotionHistory.count(),
    prisma.teacher.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ]);

  console.log('\n📊 Current Database Statistics:');
  console.log(`   - Students:           ${studentCount}`);
  console.log(`   - Parents:            ${parentCount}`);
  console.log(`   - Invoices:           ${invoiceCount}`);
  console.log(`   - Payments:           ${paymentCount}`);
  console.log(`   - Results:            ${resultCount}`);
  console.log(`   - Attendance Records: ${attendanceCount}`);
  console.log(`   - Promotion History:  ${promotionCount}`);
  console.log(`   - Teachers:           ${teacherCount}`);
  console.log(`   - Admin Accounts:     ${adminCount}`);

  if (!isConfirmed) {
    console.log('\n⚠️  DRY RUN MODE (No data was deleted)');
    console.log('   To safely backup and clean the test data, run:');
    console.log('   npm run db:clean -- --confirm\n');
    console.log('   Or if you also want to remove test teachers:');
    console.log('   npm run db:clean -- --confirm --include-teachers\n');
    return;
  }

  // 2. Perform Backup
  console.log('\n📦 Creating pre-clean backup in backups/ directory...');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `backup_before_clean_${timestamp}.json`);

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
    counts: {
      students: allStudents.length,
      parents: allParents.length,
      invoices: allInvoices.length,
      payments: allPayments.length,
      results: allResults.length,
    },
    students: allStudents,
    parents: allParents,
    invoices: allInvoices,
    payments: allPayments,
    results: allResults,
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`✅ Backup successfully saved to: ${backupFilePath}`);

  // 3. Clean test/dummy data
  console.log('\n🧹 Purging mock records...');

  await prisma.$transaction(async (tx) => {
    // 3.1 Financials
    await tx.payment.deleteMany();
    await tx.invoiceItem.deleteMany();
    await tx.invoice.deleteMany();

    // 3.2 Academics
    await tx.studentAttendance.deleteMany();
    await tx.result.deleteMany();
    await tx.promotionHistory.deleteMany();
    await tx.enrollment.deleteMany();

    // 3.3 Relationships & Students (Purges students, their photos, and student login accounts)
    await tx.parentStudentLink.deleteMany();
    await tx.student.deleteMany();
    await tx.user.deleteMany({ where: { role: 'STUDENT' } });

    // 3.4 Parents (Preserved by default; only purged if explicitly requested)
    const wipeParents = args.includes('--include-parents');
    if (wipeParents) {
      await tx.parent.deleteMany();
      await tx.user.deleteMany({ where: { role: 'PARENT' } });
    }

    // 3.5 Teachers (Preserved by default; only purged if explicitly requested)
    if (wipeTeachers) {
      await tx.classAssignment.deleteMany();
      await tx.timetableSlot.deleteMany();
      await tx.teacher.deleteMany();
      await tx.user.deleteMany({ where: { role: 'TEACHER' } });
    }
  });

  console.log('✅ Cleanup completed successfully!');
  console.log('🔒 Admin accounts & School Configuration preserved intact.');
  console.log('🎉 The system is now 100% clean and ready for real school data!\n');
}

cleanDatabase()
  .catch((err) => {
    console.error('❌ Clean database error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
