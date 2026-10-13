'use client';

import React from 'react';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export default function PrintButton({
  label = 'Print',
  className = 'flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer',
}: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
    >
      <Printer size={18} />
      <span>{label}</span>
    </button>
  );
}
