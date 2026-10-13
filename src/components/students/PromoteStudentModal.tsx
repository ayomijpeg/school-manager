"use client"

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, TrendingUp, X } from 'lucide-react';
import { toast } from 'sonner';

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

  // Compute next year helper (e.g. 2025/2026 -> 2026/2027)
  const computeNextYear = (curr: string) => {
    const parts = curr.split('/');
    if (parts.length === 2) {
      const y1 = parseInt(parts[0], 10);
      const y2 = parseInt(parts[1], 10);
      if (!isNaN(y1) && !isNaN(y2)) return `${y1 + 1}/${y2 + 1}`;
    }
    return curr;
  };
  const nextYearSuggestion = computeNextYear(currentYear);

  const handlePromote = () => {
    if (!selectedLevel || !selectedClass) {
        setError("Please select both a level and a class.");
        return;
    }

    if (!targetYear.trim()) {
      setError("Please specify the target academic session.");
      return;
    }

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
            newAcademicYear: targetYear.trim(),
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          toast.success(`${student.fullName} promoted to new class!`);
          setIsOpen(false);
          router.refresh();
        } else {
          setError(data.error || "An error occurred during promotion");
        }
      } catch {
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
              placeholder="e.g. 2025/2026"
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => setTargetYear(currentYear)}
                className={`px-2 py-0.5 rounded text-xs font-medium border ${targetYear === currentYear ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                Current ({currentYear})
              </button>
              {nextYearSuggestion !== currentYear && (
                <button
                  type="button"
                  onClick={() => setTargetYear(nextYearSuggestion)}
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${targetYear === nextYearSuggestion ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                >
                  Next ({nextYearSuggestion})
                </button>
              )}
            </div>
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
