'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Loader2, BookOpen, School, Layers, CheckCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Interfaces
interface Assignment {
  id: string;
  class: { id: string; name: string; level?: { name: string } };
  course: { id: string; name: string } | null;
}

interface ClassOption {
  id: string;
  name: string;
  levelId: string;
}

interface LevelOption {
  id: string;
  name: string;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  teacherName: string;
  levels: LevelOption[];
  classes: ClassOption[];
  courses: { id: string; name: string }[];
};

export default function ManageAssignmentsModal({ 
  isOpen, onClose, teacherId, teacherName, levels, classes, courses 
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const GENERAL_COURSE_VALUE = "__general__"; // sent when "General / Class Teacher" is chosen
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🟢 SMART FILTER: Adds "Auto-create" or "All Arms" option
  const filteredClasses = useMemo(() => {
    if (!selectedLevel) return [];
    
    // Get actual classes for this level
    const specificClasses = classes.filter(c => c.levelId === selectedLevel);
    
    // SCENARIO 1: No classes exist yet (User just created levels)
    if (specificClasses.length === 0) {
      return [
        { id: 'auto-create', name: '✨ Auto-create "General" Class', levelId: selectedLevel }
      ];
    }

    // SCENARIO 2: Classes exist, include "All Arms" option
    return [
      { id: 'all-arms', name: '⚡ Assign to ALL Arms', levelId: selectedLevel },
      ...specificClasses
    ];
  }, [selectedLevel, classes]);

  // Auto-select "Auto-create" if it's the only option
  useEffect(() => {
    if (filteredClasses.length === 1 && filteredClasses[0].id === 'auto-create') {
      setSelectedClass('auto-create');
    }
  }, [filteredClasses]);

  // Fetch logic
  useEffect(() => {
    if (isOpen && teacherId) {
      setLoading(true);
      fetch(`/api/teachers/assignments?teacherId=${teacherId}`)
        .then(res => res.json())
        .then(data => { if(Array.isArray(data)) setAssignments(data); })
        .catch(() => toast.error("Failed to load assignments"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, teacherId]);

  const handleLevelChange = (levelId: string) => {
    setSelectedLevel(levelId);
    setSelectedClass(""); 
  };

  const handleAssign = async () => {
    const isGeneral = selectedCourse === GENERAL_COURSE_VALUE || !selectedCourse;
    if (!selectedClass || (!isGeneral && !selectedCourse)) {
      toast.error("Please select a Class and a Subject (or General / Class Teacher).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        teacherId, 
        classId: selectedClass, 
        ...(isGeneral ? {} : { courseId: selectedCourse }),
        levelId: selectedLevel 
      };

      const res = await fetch('/api/teachers/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 🛑 FIX: Safely parse JSON to avoid crashes
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON:", text);
        throw new Error("Server response was invalid.");
      }

      if (!res.ok) throw new Error(data.error || "Failed");

      // Handle Success
      if (data.isBulk || selectedClass === 'auto-create') {
        toast.success(selectedClass === 'auto-create' ? "Class created & assigned!" : data.message);
        setLoading(true);
        // Refresh full list from server
        fetch(`/api/teachers/assignments?teacherId=${teacherId}`)
          .then(r => r.json())
          .then(d => setAssignments(d))
          .finally(() => setLoading(false));
      } else {
        toast.success("Assigned successfully");
        const assignedClass = classes.find(c => c.id === selectedClass);
        const assignedLevel = levels?.find(l => l.id === selectedLevel);
        const assignedCourse = courses.find(c => c.id === selectedCourse);

        const newAssignment: Assignment = {
          id: data.id,
          class: { 
            id: selectedClass, 
            name: assignedClass?.name || "Unknown",
            level: { name: assignedLevel?.name || "" }
          },
          course: isGeneral ? null : (assignedCourse || { id: selectedCourse, name: "Unknown" })
        };
        setAssignments(prev => [...prev, newAssignment]);
      }
      
      // Reset logic
      if (selectedClass !== 'all-arms' && selectedClass !== 'auto-create') {
         setSelectedClass("");
      } else {
         setSelectedLevel("");
         setSelectedClass("");
      }
      setSelectedCourse("");
      router.refresh(); 

    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    const previous = [...assignments];
    setAssignments(assignments.filter(a => a.id !== id));
    try {
        const res = await fetch(`/api/teachers/assignments?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Failed");
        toast.success("Removed");
        router.refresh();
    } catch {
        setAssignments(previous);
        toast.error("Failed to remove");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Manage Assignments</h3>
            <p className="text-sm text-gray-500">For <span className="text-indigo-600 font-medium">{teacherName}</span></p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Plus size={14}/> Assign New Subject
            </h4>
            
            <div className="space-y-3">
              {/* Level */}
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">1. Select Level</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <select 
                    aria-label="Select Level"
                    className="w-full bg-white border border-gray-200 text-sm rounded-lg pl-9 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedLevel}
                    onChange={(e) => handleLevelChange(e.target.value)}
                  >
                    <option value="">Choose Level...</option>
                    {levels?.length > 0 ? (
                      levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)
                    ) : (
                      <option disabled>No levels found</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">2. Select Class Arm</label>
                  <select 
                    aria-label="Select Class"
                    className={`w-full border border-gray-200 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none ${selectedClass === 'auto-create' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium' : selectedClass === 'all-arms' ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-medium' : 'bg-white'}`}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={!selectedLevel}
                  >
                    <option value="">{selectedLevel ? "Select Arm..." : "Select Level First"}</option>
                    {filteredClasses.map(c => (
                      <option key={c.id} value={c.id} className={c.id === 'all-arms' ? 'font-bold text-indigo-600' : c.id === 'auto-create' ? 'font-bold text-emerald-600' : ''}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">3. Subject (or General)</label>
                  <select 
                    aria-label="Select Subject or General"
                    className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select Subject...</option>
                    <option value={GENERAL_COURSE_VALUE} className="font-medium text-indigo-600">— General / Class Teacher —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handleAssign}
                disabled={isSubmitting || !selectedClass || (selectedCourse !== GENERAL_COURSE_VALUE && !selectedCourse)}
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 selectedClass === 'all-arms' ? <><CheckCheck className="w-4 h-4" /> Bulk Assign</> : 
                 selectedClass === 'auto-create' ? <><Sparkles className="w-4 h-4" /> Auto-Create & Assign</> :
                 <><Plus className="w-4 h-4" /> Assign</> 
                }
              </button>
            </div>
          </div>

          {/* List of Assignments */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              Current Assignments ({assignments.length})
            </h4>
            
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-sm text-gray-400">No classes assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {assignments.map((assign) => (
                  <div key={assign.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                          <BookOpen size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{assign.course?.name ?? 'General / Class Teacher'}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 font-medium text-gray-600">
                             {assign.class?.level?.name || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <School size={10} /> {assign.class?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemove(assign.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove assignment"
                      aria-label="Remove assignment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
