import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Health check for deployment and monitoring.
 * GET /api/health returns 200 and optionally checks DB connectivity.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: 'ok', database: 'connected', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Health check DB error:', error);
    }
    return NextResponse.json(
      { status: 'degraded', database: 'disconnected', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
