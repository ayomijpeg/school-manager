'use client';

import React from 'react';
import { Cake, Sparkles, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export interface BirthdayCelebrant {
  id: string;
  fullName: string;
  className?: string | null;
  dateOfBirth: string | Date;
  isToday: boolean;
  formattedDate: string;
}

interface BirthdayWidgetProps {
  celebrants: BirthdayCelebrant[];
}

export default function BirthdayWidget({ celebrants }: BirthdayWidgetProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-amber-800">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Cake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-tight">
              Morning Assembly Celebrants
            </h3>
            <p className="text-[11px] text-amber-700 font-medium">Birthdays this week</p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100/80 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>{celebrants.length} Celebrant{celebrants.length !== 1 ? 's' : ''}</span>
        </span>
      </div>

      {celebrants.length > 0 ? (
        <div className="space-y-2 mt-3">
          {celebrants.map((c) => (
            <div
              key={c.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                c.isToday
                  ? 'bg-white border-amber-300 shadow-sm ring-1 ring-amber-300'
                  : 'bg-white/80 border-slate-200/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    c.isToday
                      ? 'bg-amber-500 text-white animate-bounce'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {c.isToday ? '🎂' : c.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {c.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {c.className || 'General'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {c.isToday ? (
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Today! 🎉
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {c.formattedDate}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-white/60 rounded-xl border border-dashed border-amber-200/80 mt-2">
          <Cake className="w-6 h-6 text-amber-300 mx-auto mb-1" />
          <p className="text-xs text-slate-500 font-medium">No student birthdays this week</p>
          <p className="text-[10px] text-slate-400">Add dates of birth on student profiles</p>
        </div>
      )}
    </div>
  );
}
