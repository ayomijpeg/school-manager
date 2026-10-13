'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, AlertCircle, Save, Loader2, MessageSquare, ShieldAlert } from 'lucide-react';
import { AttendanceStatus } from '@prisma/client';
import { toast } from 'sonner';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { buildAbsenceAlertMessage } from '@/lib/whatsapp';

export type StudentAttendanceRow = {
  studentId: string;
  name: string;
  status: AttendanceStatus | 'PRESENT'; // Default to Present if null
  parentPhone?: string | null;
  parentName?: string | null;
};

export default function AttendanceRegister({ 
  classId, 
  courseId, 
  date, 
  students,
  className = 'Class'
}: { 
  classId: string; 
  courseId: string; 
  date: string; 
  students: StudentAttendanceRow[];
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Initialize state with fetched data or default to PRESENT
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>(
    students.reduce((acc, s) => ({
      ...acc,
      [s.studentId]: s.status || 'PRESENT'
    }), {})
  );

  const handleToggle = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const markBatch = (status: AttendanceStatus) => {
    const newState: Record<string, AttendanceStatus> = {};
    students.forEach(s => newState[s.studentId] = status);
    setAttendanceState(newState);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        classId,
        courseId,
        attendanceDate: date,
        records: Object.entries(attendanceState).map(([id, status]) => ({
          studentId: id,
          status: status
        }))
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed");
      
      toast.success("Attendance saved successfully!");
      router.refresh();
    } catch (err) {
      toast.error("Error saving attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Find absent students for proactive WhatsApp follow-up
  const absentStudents = students.filter(s => attendanceState[s.studentId] === 'ABSENT');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Batch Actions Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Quick Batch:</span>
            <button 
              type="button"
              onClick={() => markBatch('PRESENT')} 
              className="text-xs font-bold bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              ✓ Mark All Present (1-Click)
            </button>
            <button 
              type="button"
              onClick={() => markBatch('ABSENT')} 
              className="text-xs font-medium bg-white border border-slate-200 text-red-700 px-3 py-1.5 rounded-lg hover:border-red-400 transition-colors"
            >
              Mark All Absent
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Students: <strong>{students.length}</strong>
          </div>
        </div>

        {/* Student List */}
        <div className="divide-y divide-slate-100">
          {students.map((student) => {
            const current = attendanceState[student.studentId];
            
            return (
              <div key={student.studentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${current === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 
                      current === 'ABSENT' ? 'bg-red-100 text-red-700' :
                      current === 'LATE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{student.name}</span>
                    {student.parentName && (
                      <span className="text-xs text-slate-400">
                        Parent: {student.parentName} {student.parentPhone ? `(${student.parentPhone})` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Buttons */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  <StatusBtn 
                    active={current === 'PRESENT'} 
                    onClick={() => handleToggle(student.studentId, 'PRESENT')}
                    icon={Check} label="Present" color="text-emerald-700" 
                  />
                  <StatusBtn 
                    active={current === 'LATE'} 
                    onClick={() => handleToggle(student.studentId, 'LATE')}
                    icon={Clock} label="Late" color="text-orange-700" 
                  />
                  <StatusBtn 
                    active={current === 'ABSENT'} 
                    onClick={() => handleToggle(student.studentId, 'ABSENT')}
                    icon={X} label="Absent" color="text-red-700" 
                  />
                  <StatusBtn 
                    active={current === 'EXCUSED'} 
                    onClick={() => handleToggle(student.studentId, 'EXCUSED')}
                    icon={AlertCircle} label="Excused" color="text-blue-700" 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Save Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center sticky bottom-0">
          <span className="text-xs text-slate-500">
            {absentStudents.length > 0 ? (
              <span className="text-red-600 font-bold">{absentStudents.length} marked absent today</span>
            ) : (
              <span className="text-emerald-600 font-bold">All pupils marked present!</span>
            )}
          </span>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 font-bold text-sm shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* PROACTIVE ABSENTEE PARENT ALERTS (WHATSAPP) */}
      {absentStudents.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900 text-sm">
              Today&apos;s Absentee Follow-Up ({absentStudents.length} {absentStudents.length === 1 ? 'Pupil' : 'Pupils'})
            </h3>
          </div>
          <p className="text-xs text-amber-700 mb-4">
            Send immediate WhatsApp notifications to parents to check on absent children.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {absentStudents.map(student => {
              const msg = buildAbsenceAlertMessage({
                parentName: student.parentName,
                studentName: student.name,
                date: date,
                className: className,
                schoolName: 'Yosola Schools'
              });

              return (
                <div key={student.studentId} className="bg-white border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-800">{student.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {student.parentPhone || 'No phone recorded'}
                    </p>
                  </div>
                  <WhatsAppButton
                    phone={student.parentPhone}
                    message={msg}
                    label="Send Absent Alert"
                    variant="secondary"
                    title={`Send WhatsApp absence notification for ${student.name}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for status button logic
function StatusBtn({ active, onClick, icon: Icon, label, color }: { active: boolean; onClick: () => void; icon: any; label: string; color: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold ${
        active 
          ? `bg-white shadow-sm ring-1 ring-slate-200 ${color}` 
          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
      }`}
      title={label}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
