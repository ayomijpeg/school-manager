'use client';

import { useEffect } from 'react';
import { Printer } from 'lucide-react';

export default function PrintTrigger() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="hidden md:block print:hidden fixed top-6 right-6">
        <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-lg hover:bg-gray-800"
        >
            <Printer size={16} /> Print Now
        </button>
    </div>
  );
}
