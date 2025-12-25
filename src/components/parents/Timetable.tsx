import React from 'react';
import { BookOpen, Coffee } from 'lucide-react';

interface TimetableItem {
  time: string;
  subject: string;
  type: 'Core' | 'Elective' | 'Science' | 'Other';
}

interface TimetableProps {
  schedule?: TimetableItem[]; // Made optional for safety
}

export default function Timetable({ schedule }: TimetableProps) {
  // Fallback if no schedule is provided (Empty State)
  if (!schedule || schedule.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <p className="text-slate-400 text-sm">No classes scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Today&apos;s Schedule</h3>
        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-600 rounded">LIVE</span>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {schedule.map((item, i) => (
          <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-slate-400 w-12">{item.time}</span>
              <div className="h-8 w-[2px] bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.subject}</p>
                <p className={`text-[10px] uppercase font-bold ${
                  item.type === 'Core' ? 'text-emerald-600' :
                  item.type === 'Science' ? 'text-blue-600' : 
                  'text-slate-400'
                }`}>
                  {item.type}
                </p>
              </div>
            </div>
            {item.type !== 'Other' ? (
              <BookOpen size={14} className="text-slate-300" />
            ) : (
              <Coffee size={14} className="text-amber-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
