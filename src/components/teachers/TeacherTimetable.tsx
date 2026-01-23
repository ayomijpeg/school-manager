'use client';

import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Calendar, Loader2, BookOpen } from 'lucide-react';

type Slot = {
  id: string;
  className: string;
  subject: string;
  code: string | null;
  venue: string;
  startTime: string;
  endTime: string;
};

type ScheduleData = {
  schedule: Record<string, Slot[]>;
  days: string[];
};

export default function TeacherTimetable() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/teacher/timetable')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  if (!data || data.days.length === 0) {
    return (
      <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-gray-900 font-semibold">No Schedule Found</h3>
        <p className="text-gray-500 text-sm">Your timetable hasn't been set up yet.</p>
      </div>
    );
  }

  // Get current day to highlight it
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  return (
    <div className="space-y-6">
      {data.days.map((day) => {
        const slots = data.schedule[day];
        const isToday = day === currentDay;

        return (
          <div key={day} className={`rounded-xl border overflow-hidden ${isToday ? 'border-indigo-200 ring-4 ring-indigo-50/50 shadow-md' : 'border-gray-200 bg-white'}`}>
            {/* Day Header */}
            <div className={`px-6 py-3 border-b flex justify-between items-center ${isToday ? 'bg-indigo-50' : 'bg-gray-50'}`}>
              <h3 className={`font-bold tracking-wide text-sm ${isToday ? 'text-indigo-700' : 'text-gray-600'}`}>
                {day}
              </h3>
              {isToday && <span className="text-[10px] font-bold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full uppercase">Today</span>}
            </div>

            {/* Slots List */}
            <div className="divide-y divide-gray-100">
              {slots.map((slot) => (
                <div key={slot.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors group">
                  
                  {/* Time Column */}
                  <div className="min-w-[140px] flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <div className="text-sm font-medium">
                      <span className="block text-gray-900">{slot.startTime}</span>
                      <span className="text-gray-400 text-xs">to {slot.endTime}</span>
                    </div>
                  </div>

                  {/* Class Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                        {slot.className}
                      </h4>
                      {slot.code && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 font-mono">
                          {slot.code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="w-3.5 h-3.5" />
                      {slot.subject}
                    </div>
                  </div>

                  {/* Venue / Location */}
                  <div className="sm:text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">
                      <MapPin className="w-3 h-3" />
                      {slot.venue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
