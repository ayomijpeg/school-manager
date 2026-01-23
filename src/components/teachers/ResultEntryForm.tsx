'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import Button from '../ui/Button'; // Your existing Button component

type StudentResult = {
  studentId: string;
  studentName: string;
  currentCa: number;
  currentExam: number;
};

type Props = {
  classId: string;
  courseId: string;
  students: StudentResult[]; // Initial data passed from the Server Page
};

export default function ResultEntryForm({ classId, courseId, students: initialStudents }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State to hold the edits. 
  // Structure: { "student_id": { ca: 10, exam: 50 } }
  const [edits, setEdits] = useState<Record<string, { ca: number; exam: number }>>({});

  // Helper to handle input changes
  const handleChange = (studentId: string, field: 'ca' | 'exam', value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setEdits(prev => ({
      ...prev,
      [studentId]: {
        // Keep existing values or fall back to initial props
        ca: prev[studentId]?.ca ?? initialStudents.find(s => s.studentId === studentId)?.currentCa ?? 0,
        exam: prev[studentId]?.exam ?? initialStudents.find(s => s.studentId === studentId)?.currentExam ?? 0,
        [field]: numValue // Update the specific field being typed in
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Prepare payload
    const payload = {
      classId,
      courseId,
      results: initialStudents.map(s => {
        // Use the edited value, or fall back to the initial value if untouched
        const edited = edits[s.studentId];
        return {
          studentId: s.studentId,
          caScore: edited?.ca ?? s.currentCa,
          examScore: edited?.exam ?? s.currentExam
        };
      })
    };

    try {
      const res = await fetch('/api/teacher/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save");

      alert("Results saved successfully!");
      router.refresh(); // Refreshes the server data to show saved values
    } catch (error) {
      alert("Error saving results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Student Name</th>
              <th className="p-4 font-semibold text-gray-700 w-32">CA (30)</th>
              <th className="p-4 font-semibold text-gray-700 w-32">Exam (70)</th>
              <th className="p-4 font-semibold text-gray-700 w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialStudents.map((student) => {
              // Calculate current values for display
              const edited = edits[student.studentId];
              const ca = edited?.ca ?? student.currentCa ?? 0;
              const exam = edited?.exam ?? student.currentExam ?? 0;
              
              return (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{student.studentName}</td>
                  <td className="p-4">
                    <input
                     aria-label="CA Score"
                      type="number"
                      min="0" max="30"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                      defaultValue={student.currentCa || ""}
                      onChange={(e) => handleChange(student.studentId, 'ca', e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <input
                     aria-label="Exam Score"
                      type="number"
                      min="0" max="70"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                      defaultValue={student.currentExam || ""}
                      onChange={(e) => handleChange(student.studentId, 'exam', e.target.value)}
                    />
                  </td>
                  <td className="p-4 font-bold text-gray-600">
                    {ca + exam}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          icon={loading ? Loader2 : Save}
          className={loading ? "animate-pulse" : ""}
        >
          {loading ? "Saving..." : "Save Results"}
        </Button>
      </div>
    </div>
  );
}
