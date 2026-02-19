'use client';

import { useEffect, useState } from 'react';
import { X, Mail, Phone, Building2, BookOpen, School, Loader2, LucideIcon } from 'lucide-react';

// ✅ 1. More permissive Types
interface Teacher {
  id: string;
  fullName: string;
  staffId?: string | null;
  contactPhone?: string | null;
  department?: { name: string } | null;
  user?: { email: string | null } | null; // Allow nulls
}

interface Assignment {
  id: string;
  class?: { name: string };
  course?: { name: string };
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null; 
};

export default function ViewTeacherModal({ isOpen, onClose, teacher }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && teacher?.id) {
      setLoading(true);
      
      const fetchAssignments = async () => {
        try {
          const res = await fetch(`/api/teachers/assignments?teacherId=${teacher.id}`);
          const data = await res.json();
          setAssignments(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to load assignments", error);
          setAssignments([]);
        } finally {
          setLoading(false);
        }
      };

      fetchAssignments();
    }
  }, [isOpen, teacher]); 

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose} 
            aria-label="Close Modal" 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xl shadow-lg">
              {teacher.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{teacher.fullName}</h2>
              <p className="text-slate-300 text-sm flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-500/30">Active Staff</span>
                • Staff ID: {teacher.staffId || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Section 1: Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Safe Access to nested properties */}
            <InfoItem icon={Mail} label="Email Address" value={teacher.user?.email || 'N/A'} />
            <InfoItem icon={Phone} label="Phone Number" value={teacher.contactPhone || 'Not set'} />
            <InfoItem icon={Building2} label="Department" value={teacher.department?.name || 'General'} />
          </div>

          {/* Section 2: Workload */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Assigned Classes & Subjects
            </h3>

            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-gray-300" /></div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No active teaching assignments.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignments.map((assign) => (
                  <div key={assign.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <School size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{assign.class?.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{assign.course?.name ?? 'General / Class Teacher'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Icon size={14} />
        <span className="text-xs font-semibold uppercase">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-900 truncate" title={value}>{value}</p>
    </div>
  );
}
