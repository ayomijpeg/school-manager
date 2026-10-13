import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center mb-4 shadow-sm">
        <Loader2 className="w-7 h-7 text-emerald-700 dark:text-emerald-400 animate-spin" />
      </div>
      <h3 className="text-base font-serif font-bold text-slate-800 dark:text-slate-100">
        Loading...
      </h3>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Fetching records from the school ledger.
      </p>
    </div>
  );
}
