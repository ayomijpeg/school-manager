'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, AlertCircle, Save, Loader2 } from 'lucide-react';
import { AttendanceStatus } from '@prisma/client';

type StudentAttendanceRow = {
  studentId: string;
  name: string;
  status: AttendanceStatus | 'PRESENT'; // Default to Present if null
};

export default function AttendanceRegister({ 
  classId, 
  courseId, 
  date, 
  students 
}: { 
  classId: string, 
  courseId: string, 
  date: string, 
  students: StudentAttendanceRow[] 
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
      
      router.refresh(); // Refresh to ensure server data matches
      alert("Attendance Saved!");
    } catch (err) {
      alert("Error saving attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Batch Actions Toolbar */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Batch Actions:</span>
        <button onClick={() => markBatch('PRESENT')} className="text-xs font-medium bg-white border border-gray-200 text-emerald-700 px-3 py-1.5 rounded-md hover:border-emerald-500 transition-colors">Mark All Present</button>
        <button onClick={() => markBatch('ABSENT')} className="text-xs font-medium bg-white border border-gray-200 text-red-700 px-3 py-1.5 rounded-md hover:border-red-500 transition-colors">Mark All Absent</button>
      </div>

      {/* Student List */}
      <div className="divide-y divide-gray-100">
        {students.map((student) => {
          const current = attendanceState[student.studentId];
          
          return (
            <div key={student.studentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  ${current === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 
                    current === 'ABSENT' ? 'bg-red-100 text-red-700' :
                    current === 'LATE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                  {student.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-900">{student.name}</span>
              </div>

              {/* Status Buttons */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
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
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end sticky bottom-0">
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 font-medium"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}

// Sub-component for clean button logic
function StatusBtn({ active, onClick, icon: Icon, label, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${
        active 
          ? `bg-white shadow-sm ${color}` 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
      }`}
      title={label}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
