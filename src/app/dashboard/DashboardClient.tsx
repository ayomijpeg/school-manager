'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import Spinner from '@/components/ui/Spinner';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import type { SchoolConfig } from '@prisma/client';

// Define the exact shape of the counts object
type DashboardCounts = {
  students: number;
  teachers: number;
  classes: number;
  invoices: number;
};

type DashboardDataProps = {
  config: SchoolConfig;
  // Counts can be null if the user is not an Admin
  counts: DashboardCounts | null;
};

export function DashboardClient({ config, counts }: DashboardDataProps) {
  const { user, isLoading, isAuthenticated } = useUser();
  const router = useRouter();

  // 1. Handle Auth Redirects inside useEffect to avoid render errors
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-slate-400">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  // 3. Prevent rendering if not logged in (redirect handled above)
  if (!user) return null;

  const isTertiary = config.schoolType === 'TERTIARY';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- GLOBAL HEADER (Visible to Admin & Teacher) --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
              isTertiary 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}>
              {isTertiary ? 'Higher Ed' : 'Basic Ed'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-500">
              Session {config.academicYear}
            </span>
          </div>
          <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-100 tracking-tight">
            {config.schoolName}
          </h1>
        </div>

        <div className="text-right hidden md:block">
           <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Logged in as</p>
           <div className="flex items-center justify-end gap-3">
             <div className="text-right">
               <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                 {user.fullName || user.email}
               </p>
               <p className="text-xs text-slate-500 capitalize">
                 {user.role.toLowerCase()}
               </p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-serif font-bold">
               {(user.fullName?.[0] || user.email?.[0] || 'U').toUpperCase()}
             </div>
           </div>
        </div>
      </div>

      {/* --- ROLE SWITCHING --- */}
      <main>
        {user.role === 'ADMIN' ? (
           <AdminDashboard 
             schoolName={config.schoolName}
             schoolType={config.schoolType}
             counts={counts}
           />
        ) : user.role === 'TEACHER' ? (
           <TeacherDashboard user={user} />
        ) : (
           // Fallback for Student/Parent if they accidentally hit this Client Component
           <div className="p-12 text-center border-2 border-dashed border-red-200 rounded-xl bg-red-50 text-red-800">
             <p className="font-bold">Dashboard Error</p>
             <p className="text-sm mt-1">
                Student and Parent dashboards are loading incorrectly. <br />
                Please refresh the page or contact support.
             </p>
           </div>
        )}
      </main>
    </div>
  );
}
