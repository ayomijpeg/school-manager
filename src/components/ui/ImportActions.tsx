'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import BulkImportModal from '@/components/students/BulkImportModal';

export default function ImportActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Import CSV
      </button>

      {/* The Modal lives here, controlled by the state above */}
      <BulkImportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}