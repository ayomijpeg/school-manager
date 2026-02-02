'use client';

import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Coffee, Megaphone, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
interface Child {
  id: string;
  firstName: string;
  lastName: string;
  class?: { name: string };
}

interface Slot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: 'LESSON' | 'BREAK' | 'ASSEMBLY' | 'GENERAL';
  course?: { name: string };
  class?: { name: string };
  teacher?: { fullName: string };
}

interface ProfileResponse {
  parent?: {
    students: Array<{ student: Child }>;
  };
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export default function ParentTimetablePage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [timetable, setTimetable] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Parent's Children on Mount
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch('/api/auth/profile');
        const data: ProfileResponse = await res.json(); // ✅ Fixed 'any'
        
        if (data.parent?.students) {
          const kids = data.parent.students.map(s => s.student);
          setChildren(kids);
          if (kids.length > 0) setSelectedChildId(kids[0].id);
        }
      } catch (error) {
        console.error("Failed to load children", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChildren();
  }, []);

  // 2. Fetch Timetable when Selected Child Changes
  useEffect(() => {
    if (!selectedChildId) return;

    async function getSchedule() {
      setLoading(true);
      try {
        const res = await fetch(`/api/student/timetable?studentId=${selectedChildId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTimetable(data);
        }
      } catch {
        // ✅ Fixed unused variable 'e'
        toast.error("Could not load timetable");
      } finally {
        setLoading(false);
      }
    }
    getSchedule();
  }, [selectedChildId]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* HEADER: Child Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-indigo-600" /> 
            Class Timetable
          </h1>
          {/* ✅ Fixed unescaped apostrophe */}
          <p className="text-slate-500 text-sm mt-1">
            Viewing schedule for <span className="font-bold text-slate-700">{selectedChild?.firstName}&apos;s</span> class
          </p>
        </div>

        {/* Child Switcher (Only show if > 1 kid) */}
        {children.length > 1 && (
          <div className="relative">
            <select 
              aria-label="Select Child" // ✅ Fixed Accessibility
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/>
          </div>
        )}
      </div>

      {/* TIMETABLE GRID */}
      <div className="grid gap-6">
        {loading ? (
           <div className="text-center py-20 text-slate-400">Loading schedule...</div>
        ) : (
          DAYS.map(day => {
            const daySlots = timetable.filter(t => t.dayOfWeek === day);
            if (daySlots.length === 0) return null;

            return (
              <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Day Header */}
                <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-700">{day}</h3>
                  <span className="text-xs font-medium text-slate-400">{daySlots.length} Activities</span>
                </div>

                {/* Slots List */}
                <div className="divide-y divide-slate-100">
                  {daySlots.map(slot => (
                    <div key={slot.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors items-center">
                      
                      {/* Time Column */}
                      <div className="flex flex-col items-center w-20 shrink-0">
                        <span className="text-sm font-bold text-slate-800">{slot.startTime}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{slot.endTime}</span>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1">
                        {/* Event Tag */}
                        <div className="flex items-center gap-2 mb-1">
                          {slot.type === 'LESSON' && (
                             <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 uppercase">
                               Subject
                             </span>
                          )}
                          {slot.type === 'BREAK' && (
                             <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 uppercase">
                               Break
                             </span>
                          )}
                          {(slot.type === 'ASSEMBLY' || slot.type === 'GENERAL') && (
                             <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100 uppercase">
                               General
                             </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-slate-800">
                          {slot.type === 'LESSON' ? slot.course?.name : 
                           slot.type === 'BREAK' ? 'Break Time' : 
                           slot.type === 'ASSEMBLY' ? 'School Assembly' : 'General Activity'}
                        </h4>

                        {/* Teacher / Detail */}
                        {slot.teacher && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Teacher: {slot.teacher.fullName}
                          </p>
                        )}
                      </div>

                      {/* Icon Column */}
                      <div className="text-slate-300">
                         {slot.type === 'LESSON' ? <BookOpen size={20}/> : 
                          slot.type === 'BREAK' ? <Coffee size={20}/> : 
                          <Megaphone size={20}/>}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
