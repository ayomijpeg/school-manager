import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Admin User Only...');

  const adminEmail = 'yosola@school.com';
  // In production, this would be dynamic or set during sign-up
  const hashedPassword = await bcrypt.hash('admin321', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      passwordResetRequired: false,
    },
  });

  // NOTICE: We are NOT creating SchoolConfig or Faculties here.
  // The Admin must do that in the UI.
  
  console.log(`✅ Admin created: ${adminEmail}`);
  console.log('🚀 Ready for Onboarding!');
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
