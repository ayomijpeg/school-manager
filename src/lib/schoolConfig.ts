import { prisma } from '@/lib/prisma';

export async function getSchoolSetupStatus() {
  try{
  const config = await prisma.schoolConfig.findFirst();
     return {
      exists: !!config,
      isSetupDone: config?.isSetupDone ?? false,
      error: null
    };
  } catch (error) {
    console.error("⚠️ Database connection failed:", error);
     return {
      exists: false,
      isSetupDone: false,
      error: "Database Unreachable" 
    };
  }
}
