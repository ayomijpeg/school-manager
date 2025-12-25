'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh(); // This re-runs the server component logic
    
    // Reset spinner after 1 second just for visual feedback
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-70"
      title="Fetch Latest Data"
    >
      <RefreshCw 
        size={18} 
        className={isRefreshing ? 'animate-spin text-emerald-600' : ''} 
      />
    </button>
  );
}
