// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// This creates a global instance of the Prisma client
// It prevents creating too many connections during development

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
