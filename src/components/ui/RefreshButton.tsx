'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

type RefreshButtonProps = {
  onRefresh?: () => void | Promise<void>;
  className?: string;
  size?: number;
};

export default function RefreshButton({ onRefresh, className = '', size = 18 }: RefreshButtonProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        router.refresh(); // This re-runs the server component logic
      }
    } finally {
      // Reset spinner after a short delay for visual feedback
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-700 rounded-lg shadow-sm dark:shadow-slate-900/50 transition-all active:scale-95 disabled:opacity-70 ${className}`}
      title="Refresh data"
      aria-label="Refresh data"
    >
      <RefreshCw 
        size={size} 
        className={isRefreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''} 
      />
    </button>
  );
}
