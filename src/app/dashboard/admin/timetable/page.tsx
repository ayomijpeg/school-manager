'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, BookOpen, Coffee, Save, Loader2, Layers, Megaphone, Users, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface LevelOption { id: string; name: string }
interface ClassOption { id: string; name: string }
interface CourseOption { id: string; name: string }

interface Slot { 
  id: string; 
  dayOfWeek: string; 
  startTime: string; 
  endTime: string; 
  type: 'LESSON' | 'BREAK' | 'ASSEMBLY' | 'GENERAL';
  course?: { name: string };
  class?: { name: string; level?: { name: string } }; 
}

export default function AdminTimetablePage() {
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("GENERAL"); 
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formDay, setFormDay] = useState("MONDAY");
  const [formStart, setFormStart] = useState("08:00");
  const [formEnd, setFormEnd] = useState("08:40");
  const [formType, setFormType] = useState("LESSON");
  const [formCourse, setFormCourse] = useState("");

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  useEffect(() => {
    async function init() {
      try {
        const [lvlRes, crsRes] = await Promise.all([
          fetch('/api/levels').then(r => r.json()),
          fetch('/api/courses').then(r => r.json()) 
        ]);
        if (Array.isArray(lvlRes)) setLevels(lvlRes);
        if (Array.isArray(crsRes)) setCourses(crsRes);
      } catch (e) {
        console.error("Init failed", e);
      }
    }
    init();
  }, []);

  const fetchTimetable = useCallback(() => {
    // If "Whole School" is selected (ALL), we can't really "fetch" a combined view easily 
    // without a messy API. For now, let's only fetch if a real level is selected.
    if (!selectedLevelId || selectedLevelId === 'ALL') return;

    setLoading(true);
    fetch(`/api/admin/timetable?levelId=${selectedLevelId}`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setSlots(data);
      })
      .finally(() => setLoading(false));
  }, [selectedLevelId]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  useEffect(() => {
     if(!selectedLevelId || selectedLevelId === 'ALL') { setClasses([]); return; }
     
     fetch(`/api/classes?levelId=${selectedLevelId}`)
       .then(r => r.json())
       .then(d => setClasses(d));
     setSelectedClassId("GENERAL"); 
  }, [selectedLevelId]);

  const handleAddSlot = async () => {
    if (!selectedLevelId) return toast.error("Select a Level first");
    if (formType === 'LESSON' && !formCourse) return toast.error("Select a subject");

    setIsSaving(true);
    try {
      const payload = {
        classId: selectedLevelId === 'ALL' ? 'GENERAL' : selectedClassId,
        levelId: selectedLevelId, // "ALL" or UUID
        day: formDay, 
        startTime: formStart,
        endTime: formEnd,
        type: formType,
        courseId: formType === 'LESSON' ? formCourse : undefined
      };

      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      
      toast.success(selectedLevelId === 'ALL' ? "Broadcasted to Whole School!" : "Period added!");
      
      // If we just broadcasted to ALL, we can't refresh a specific view.
      // But if we are on a specific level, refresh it.
      if (selectedLevelId !== 'ALL') fetchTimetable(); 
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Remove this period?")) return;
    try {
      await fetch(`/api/admin/timetable?id=${id}`, { method: 'DELETE' });
      setSlots(prev => prev.filter(s => s.id !== id));
      toast.success("Removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Timetable Manager</h1>
          <p className="text-slate-500">Configure class schedules for students and teachers.</p>
        </div>

        <div className="flex gap-4">
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Level Scope</label>
             <select 
                 aria-label="Select Level"
                 className={`px-4 py-2 border rounded-lg min-w-[180px] font-medium ${
                   selectedLevelId === 'ALL' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-300'
                 }`}
                 value={selectedLevelId}
                 onChange={(e) => setSelectedLevelId(e.target.value)}
               >
                 <option value="">Select Level...</option>
                 <option value="ALL" className="font-bold">🌍 Whole School</option>
                 <option disabled>──────────</option>
                 {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
             </select>
           </div>

           <div>
             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Audience</label>
             <select 
                aria-label="Select Target"
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white min-w-[220px]"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={!selectedLevelId || selectedLevelId === 'ALL'} // Disable if Whole School
             >
               {selectedLevelId === 'ALL' ? (
                 <option>Everyone</option>
               ) : (
                 <>
                   <option value="GENERAL" className="font-bold text-indigo-600">General (Entire Level)</option>
                   <option disabled>──────────</option>
                   {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </>
               )}
             </select>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Plus size={18} className="text-indigo-600"/> Add Period
            </h3>
            
            <div className="space-y-5">
              
              {/* Context Warning */}
              {selectedLevelId === 'ALL' ? (
                <div className="bg-purple-50 text-purple-700 p-3 rounded-lg text-xs font-medium flex gap-2">
                   <Globe size={16} />
                   This will apply to <strong>EVERY STUDENT</strong> in the school.
                </div>
              ) : selectedClassId === 'GENERAL' ? (
                <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-xs font-medium flex gap-2">
                   <Megaphone size={16} />
                   This will apply to all <strong>{levels.find(l => l.id === selectedLevelId)?.name}</strong> students.
                </div>
              ) : (
                <div className="bg-slate-50 text-slate-600 p-3 rounded-lg text-xs font-medium flex gap-2">
                   <Users size={16} />
                   This applies ONLY to <strong>{classes.find(c => c.id === selectedClassId)?.name}</strong>.
                </div>
              )}

              {/* Day, Times, Type, Subject inputs (Same as before) */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Day of Week</label>
                <select aria-label="Day" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" value={formDay} onChange={e => setFormDay(e.target.value)}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Start</label>
                  <input type="time" aria-label="Start Time" className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={formStart} onChange={e => setFormStart(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">End</label>
                  <input type="time" aria-label="End Time" className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={formEnd} onChange={e => setFormEnd(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['LESSON', 'BREAK', 'ASSEMBLY', 'GENERAL'].map(t => (
                    <button key={t} onClick={() => setFormType(t as any)} className={`py-2 text-[10px] font-bold rounded-lg border ${formType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>{t}</button>
                  ))}
                </div>
              </div>

              {formType === 'LESSON' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Subject</label>
                  <select aria-label="Subject" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" value={formCourse} onChange={e => setFormCourse(e.target.value)}>
                    <option value="">Select Subject...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <button onClick={handleAddSlot} disabled={!selectedLevelId || isSaving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex justify-center gap-2 items-center">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                {selectedLevelId === 'ALL' ? 'Broadcast to School' : 'Save Period'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: DISPLAY */}
        <div className="lg:col-span-8 space-y-6">
          {selectedLevelId === 'ALL' ? (
             <div className="h-full flex flex-col items-center justify-center bg-purple-50 rounded-xl border-2 border-dashed border-purple-200 p-12 text-center min-h-[400px]">
                <Globe size={48} className="text-purple-300 mb-4"/>
                <h3 className="text-lg font-bold text-purple-700">Whole School Mode</h3>
                <p className="text-purple-600 max-w-sm mx-auto mt-2">
                  You are adding events for <strong>Every Level</strong>. 
                  <br/>Switch to a specific level to view or edit individual schedules.
                </p>
             </div>
          ) : !selectedLevelId ? (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-12 text-center min-h-[400px]">
              <Layers size={48} className="text-slate-300 mb-4"/>
              <h3 className="text-lg font-bold text-slate-600">No Level Selected</h3>
              <p className="text-slate-400">Select a Level to view timetable.</p>
            </div>
          ) : loading ? (
             <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 size={32} className="animate-spin text-indigo-600 mb-2" />
                <p>Loading schedule...</p>
             </div>
          ) : (
            days.map(day => {
              const daySlots = slots.filter(s => s.dayOfWeek === day);
              return (
                <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-bold text-slate-700">{day}</h4>
                    <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{daySlots.length} Periods</span>
                  </div>
                  
                  {daySlots.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400 italic bg-white">No activities.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {daySlots.map(slot => (
                        <div key={slot.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 group">
                          {/* Time */}
                          <div className="flex flex-col items-center w-16 shrink-0">
                             <span className="text-xs font-bold text-slate-700">{slot.startTime}</span>
                             <div className="h-4 w-0.5 bg-slate-200 my-0.5"></div>
                             <span className="text-[10px] text-slate-400">{slot.endTime}</span>
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               {slot.class?.name === 'General' && (
                                 <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                   GENERAL
                                 </span>
                               )}
                               {slot.class?.name !== 'General' && (
                                 <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                   {slot.class?.name}
                                 </span>
                               )}
                             </div>

                             {slot.type === 'BREAK' ? (
                                <span className="inline-flex items-center gap-2 text-orange-600 font-bold text-sm"><Coffee size={14}/> Break</span>
                             ) : slot.type === 'ASSEMBLY' ? (
                                <span className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm"><Megaphone size={14}/> Assembly</span>
                             ) : slot.type === 'GENERAL' ? (
                                <span className="inline-flex items-center gap-2 text-purple-600 font-bold text-sm"><Layers size={14}/> Activity</span>
                             ) : (
                                <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2"><BookOpen size={16} className="text-indigo-500"/>{slot.course?.name}</h5>
                             )}
                          </div>

                          <button onClick={() => handleDelete(slot.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  );
}
