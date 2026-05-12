'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {  Save, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'sonner';

type StudentResult = {
  studentId: string;
  studentName: string;
  currentCa: number;
  currentExam: number;
};

type Props = {
  classId: string;
  courseId: string;
  students: StudentResult[];
};

export default function ResultEntryForm({ classId, courseId, students: initialStudents }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [edits, setEdits] = useState<Record<string, { ca: number; exam: number }>>({});

  const handleChange = (studentId: string, field: 'ca' | 'exam', value: string) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    setEdits(prev => ({
      ...prev,
      [studentId]: {
        ca: prev[studentId]?.ca ?? initialStudents.find(s => s.studentId === studentId)?.currentCa ?? 0,
        exam: prev[studentId]?.exam ?? initialStudents.find(s => s.studentId === studentId)?.currentExam ?? 0,
        [field]: numValue
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      classId,
      courseId,
      results: initialStudents.map(s => ({
        studentId: s.studentId,
        caScore: edits[s.studentId]?.ca ?? s.currentCa,
        examScore: edits[s.studentId]?.exam ?? s.currentExam
      }))
    };

    try {
      const res = await fetch('/api/teachers/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Results updated", {
        description: "All student scores have been synced to the server.",
        icon: <CheckCircle className="text-emerald-500" />
      });
      
      router.refresh();
    } catch  {
      toast.error("Save Failed", { description: "Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 text-center">CA (30)</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 text-center">Exam (70)</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialStudents.map((student) => {
              const ca = edits[student.studentId]?.ca ?? student.currentCa ?? 0;
              const exam = edits[student.studentId]?.exam ?? student.currentExam ?? 0;
              
              return (
                <tr key={student.studentId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{student.studentName}</td>
                  <td className="p-4">
                    <input
                     title='Score'
                      type="number"
                      className="w-full border border-slate-200 p-2 rounded-lg text-center focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      defaultValue={student.currentCa || ""}
                      onChange={(e) => handleChange(student.studentId, 'ca', e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <input
                      title='Score'
                      type="number"
                      className="w-full border border-slate-200 p-2 rounded-lg text-center focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      defaultValue={student.currentExam || ""}
                      onChange={(e) => handleChange(student.studentId, 'exam', e.target.value)}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-bold px-2 py-1 rounded ${ca + exam >= 40 ? 'text-slate-700 bg-slate-100' : 'text-red-600 bg-red-50'}`}>
                        {ca + exam}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          isLoading={loading}
          icon={Save}
        >
          {loading ? "Saving..." : "Save All Results"}
        </Button>
      </div>
    </div>
  );
}
