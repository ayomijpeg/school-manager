import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { DashboardClient } from './DashboardClient';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import { Loader2 } from 'lucide-react';
import type { SchoolConfig, User } from '@prisma/client';

// 1. Define Strict Types for Server Data
type DashboardCounts = {
  students: number;
  teachers: number;
  classes: number;
  invoices: number;
} | null;

type DashboardData = 
  | { status: 'SUCCESS'; user: User; config: SchoolConfig; counts: DashboardCounts } 
  | { status: 'DB_ERROR'; error: string }
  | { status: 'UNAUTHORIZED' }
  | { status: 'SETUP_REQUIRED' };

// 2. Fetch Data on the Server
async function getDashboardData(): Promise<DashboardData> {
  try {
    const [user, config] = await Promise.all([
      getCurrentUser(),
      prisma.schoolConfig.findFirst()
    ]);

    if (!user) return { status: 'UNAUTHORIZED' };
    if (!config || !config.isSetupDone) return { status: 'SETUP_REQUIRED' };

    let counts: DashboardCounts = null;
    
    // Only fetch expensive stats if the user is an Admin
    if (user.role === 'ADMIN') {
        const [studentCount, teacherCount] = await Promise.all([
            prisma.student.count({ where: { deletedAt: null } }),
            prisma.teacher.count(),
        ]);
        counts = { 
          students: studentCount, 
          teachers: teacherCount, 
          classes: 0, 
          invoices: 0 
        };
    }

    return {
      status: 'SUCCESS',
      user,
      config,
      counts
    };
  } catch (error) {
    console.error("Database connection error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Database Error';
    return { status: 'DB_ERROR', error: errorMessage };
  }
}

// 3. Main Page Component
export default async function DashboardPage() {
  const data = await getDashboardData();

  // --- Scenario A: DB Issue ---
  if (data.status === 'DB_ERROR') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFC] p-4 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-serif text-slate-900 mb-2">System Waking Up</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          The secure ledger is initializing. This usually takes 5-10 seconds.
        </p>
        <form>
          <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
            Refresh Page
          </button>
        </form>
      </div>
    );
  }

  // --- Scenario B: Auth Redirects ---
  if (data.status === 'UNAUTHORIZED') redirect('/auth/login');
  if (data.status === 'SETUP_REQUIRED') redirect('/setup');

  const { user, config, counts } = data;

  // --- Scenario C: Role Routing ---
  switch (user.role) {
    case 'ADMIN':
      // Client Component (Interactive)
      return <DashboardClient config={config} counts={counts} />;
    
    case 'TEACHER':
      // Client Component (Interactive)
      return <DashboardClient config={config} counts={counts} />;
    
    case 'STUDENT':
      // Server Component (Direct DB Access)
      return <StudentDashboard studentUserId={user.id} />;
    
    case 'PARENT':
      // Server Component (Direct DB Access)
      return <ParentDashboard parentUserId={user.id} />;

    default:
      return (
        <div className="flex h-screen items-center justify-center">
          <p className="text-slate-500">Access Denied: Unknown Role</p>
        </div>
      );
  }
}
