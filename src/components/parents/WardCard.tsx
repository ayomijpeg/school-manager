import React from 'react';
import Link from 'next/link';
import { User, GraduationCap, FileText, CalendarDays } from 'lucide-react';

export default function WardCard({ ward }: { ward: any }) {
  // Safe calculation: Handles potential nulls/undefined in the invoice array
  const debt = ward.invoices?.reduce((acc: number, inv: any) => 
    acc + (Number(inv.totalAmount) - Number(inv.amountPaid || 0)), 0) || 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-none">{ward.fullName}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <GraduationCap size={12} /> {ward.level?.name || 'Class Unassigned'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Balance Display */}
        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Fees Balance</span>
          <span className={`text-sm font-black ${debt > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            ₦ {debt.toLocaleString()}
          </span>
        </div>

        {/* Action Buttons with Links */}
        <div className="grid grid-cols-2 gap-2">
          <Link 
            href="/dashboard/results"
            className="flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
          >
            <FileText size={14} /> Result
          </Link>
          <Link 
            href="/dashboard/timetable"
            className="flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
          >
            <CalendarDays size={14} /> Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
