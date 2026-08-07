"use client"

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, TrendingUp, X } from 'lucide-react';

interface Level {
  id: string;
  name: string;
  classes: { id: string; name: string }[];
}

interface PromoteModalProps {
  student: { id: string; fullName: string; levelId: string | null };
  levels: Level[];
  currentYear: string;
}

export default function PromoteStudentModal({ student, levels, currentYear }: PromoteModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [targetYear, setTargetYear] = useState(currentYear);

  const handlePromote = () => {
    if (!selectedLevel || !selectedClass) {
        setError("Please select both a level and a class.");
        return;
    }

    // Using startTransition to handle the loading state automatically
    startTransition(async () => {
      setError(null);
      try {
        const response = await fetch('/api/actions/promotion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            newLevelId: selectedLevel,
            newClassId: selectedClass,
            newAcademicYear: targetYear,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setIsOpen(false);
          router.refresh(); // Tells Next.js to fetch fresh data for the list
        } else {
          setError(data.error || "An error occurred during promotion");
        }
      } catch  {
        setError("Failed to connect to the server.");
      }
    });
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100"
    >
      <TrendingUp size={14} />
      Promote
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-serif font-bold text-slate-900">Promote Student</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
             <p className="text-xs text-blue-600 font-bold uppercase mb-1">Student</p>
             <p className="text-sm font-bold text-slate-700">{student.fullName}</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Level</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setSelectedClass(''); 
              }}
            >
              <option value="">Select Level</option>
              {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Class</label>
            <select 
              disabled={!selectedLevel}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all disabled:opacity-50"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {levels.find(l => l.id === selectedLevel)?.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Academic Session</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              value={targetYear}
              onChange={(e) => setTargetYear(e.target.value)}
              placeholder="e.g. 2024/2025"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            disabled={isPending}
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button 
            disabled={isPending}
            onClick={handlePromote}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm Promotion'}
          </button>
        </div>
      </div>
    </div>
  );
}
