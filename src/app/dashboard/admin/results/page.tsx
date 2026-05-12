'use client';

export const dynamic = 'force-dynamic';

import { useDataFetch } from '@/hooks/useDataFetch';
import React, { useState } from 'react';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal'; 
import { Layers, FileBadge, Search, Printer, Trophy } from 'lucide-react';

// --- TYPES ---
interface SubjectResult {
  course: { name: string; code: string };
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
}

interface StudentReport {
  id: string;
  fullName: string;
  matricNumber: string;
  level: { name: string };
  results: SubjectResult[];
  summary: {
    totalScore: number;
    average: string;
    subjectCount: number;
  };
}

interface DropdownItem { id: string; name: string; }

// --- HELPERS (MOVED OUTSIDE TO FIX ESLINT) ---
const getGradeColor = (grade: string) => {
  if (grade === 'A') return 'text-emerald-600 bg-emerald-50';
  if (grade === 'F') return 'text-red-600 bg-red-50';
  return 'text-slate-700 bg-slate-50';
};

// --- COMPONENT: THE REPORT CARD PREVIEW (MOVED OUTSIDE TO FIX ESLINT) ---
const ReportCardView = ({ student }: { student: StudentReport }) => (
  <div className="bg-white p-4 max-w-2xl mx-auto text-slate-900">
    {/* Header */}
    <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
      <h2 className="text-2xl font-black uppercase">Yosola Schools</h2>
      <p className="text-sm font-bold text-slate-500 uppercase">Official Terminal Report</p>
    </div>

    {/* Student Details */}
    <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div>
        <span className="text-slate-500 text-xs block uppercase">Student Name</span>
        <span className="font-bold text-lg">{student.fullName}</span>
      </div>
      <div className="text-right">
        <span className="text-slate-500 text-xs block uppercase">Level</span>
        <span className="font-bold">{student.level.name}</span>
      </div>
      <div>
         <span className="text-slate-500 text-xs block uppercase">Admission No</span>
         <span className="font-mono">{student.matricNumber}</span>
      </div>
      <div className="text-right">
         <span className="text-slate-500 text-xs block uppercase">Performance</span>
         <span className="font-bold text-emerald-600 text-lg">{student.summary.average}% Avg</span>
      </div>
    </div>

    {/* Results Table */}
    <table className="w-full text-sm border-collapse border border-slate-300">
      <thead>
        <tr className="bg-slate-100 text-slate-700 text-xs uppercase">
          <th className="border border-slate-300 p-2 text-left">Subject</th>
          <th className="border border-slate-300 p-2 text-center w-16">C.A</th>
          <th className="border border-slate-300 p-2 text-center w-16">Exam</th>
          <th className="border border-slate-300 p-2 text-center w-16">Total</th>
          <th className="border border-slate-300 p-2 text-center w-16">Grade</th>
        </tr>
      </thead>
      <tbody>
        {student.results.map((res, idx) => (
          <tr key={idx}>
            <td className="border border-slate-300 p-2 font-medium">{res.course.name}</td>
            <td className="border border-slate-300 p-2 text-center text-slate-500">{Number(res.caScore)}</td>
            <td className="border border-slate-300 p-2 text-center text-slate-500">{Number(res.examScore)}</td>
            <td className="border border-slate-300 p-2 text-center font-bold">{Number(res.totalScore)}</td>
            <td className={`border border-slate-300 p-2 text-center font-bold ${getGradeColor(res.grade)}`}>{res.grade}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Signatures */}
    <div className="mt-10 grid grid-cols-2 gap-10 pt-4 border-t border-slate-200">
       <div className="border-t border-slate-400 pt-2 text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Class Teacher</p>
       </div>
       <div className="border-t border-slate-400 pt-2 text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Principal</p>
       </div>
    </div>
    
    {/* Print Button */}
    <div className="mt-6 flex justify-center gap-4 no-print">
       <Button icon={Printer} onClick={() => window.print()}>Print Report</Button>
    </div>
  </div>
);

export default function AdminResultsPage() {
  // --- STATE ---
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  
  const [reportData, setReportData] = useState<StudentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [viewingStudent, setViewingStudent] = useState<StudentReport | null>(null);

  // --- FETCH HELPERS ---
  const fetcher = (url: string) => async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed');
    return res.json();
  };

  const { data: levels } = useDataFetch<DropdownItem[]>(fetcher('/api/levels'));
  const { data: exams } = useDataFetch<DropdownItem[]>(fetcher('/api/exams'));

  const handleSearch = async () => {
    if (!selectedLevel || !selectedExam) return;
    setIsLoading(true);
    setReportData([]); 
    
    try {
      const res = await fetch(`/api/results/broadsheet?levelId=${selectedLevel}&examId=${selectedExam}`);
      const data = await res.json();
      setReportData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Broadsheet & Results</h1>
           <p className="text-slate-500 text-sm">View class performance, positions, and generate report cards.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-64">
           <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
              <Layers size={14} /> Level
           </label>
           <select 
             aria-label="Select Level"
             className="w-full border p-2 rounded-lg bg-slate-50 outline-none focus:ring-2 ring-emerald-500" 
             value={selectedLevel} 
             onChange={e => setSelectedLevel(e.target.value)}
           >
              <option value="">Select Level...</option>
              {levels?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
           </select>
        </div>
        
        <div className="w-full md:w-64">
           <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
              <FileBadge size={14} /> Exam
           </label>
           <select 
             aria-label="Select Exam"
             className="w-full border p-2 rounded-lg bg-slate-50 outline-none focus:ring-2 ring-emerald-500" 
             value={selectedExam} 
             onChange={e => setSelectedExam(e.target.value)}
           >
              <option value="">Select Exam...</option>
              {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
           </select>
        </div>
        
        <Button onClick={handleSearch} icon={Search} isLoading={isLoading}>
            Load Broadsheet
        </Button>
      </div>

      {reportData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
                   <tr>
                      <th className="p-4 w-16 text-center">Pos</th>
                      <th className="p-4">Student</th>
                      <th className="p-4 text-center">Subjects</th>
                      <th className="p-4 text-center">Total Score</th>
                      <th className="p-4 text-center">Average</th>
                      <th className="p-4 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {reportData.map((student, index) => (
                      <tr 
                        key={student.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => setViewingStudent(student)}
                      >
                          <td className="p-4 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                  index === 0 ? 'bg-amber-100 text-amber-700' : 
                                  index === 1 ? 'bg-slate-200 text-slate-700' :
                                  index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-500'
                              }`}>
                                  {index + 1}
                              </span>
                          </td>
                          <td className="p-4 font-medium">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                      {student.fullName.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="text-slate-900 group-hover:text-emerald-700 transition-colors">{student.fullName}</div>
                                      <div className="text-xs text-slate-400 font-mono">{student.matricNumber}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="p-4 text-center text-sm text-slate-500">{student.summary.subjectCount}</td>
                          <td className="p-4 text-center font-bold text-slate-600">{student.summary.totalScore}</td>
                          <td className="p-4 text-center">
                             <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                                {student.summary.average}%
                             </span>
                          </td>
                          <td className="p-4 text-right">
                             <Button size="sm" variant="secondary">View Report</Button>
                          </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      ) : (
        !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <Trophy size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-500">No Results Loaded</h3>
                <p className="text-slate-400 text-sm">Select a Level and Exam above to view the class broadsheet.</p>
            </div>
        )
      )}

      <Modal 
        isOpen={!!viewingStudent} 
        onClose={() => setViewingStudent(null)} 
        title="Report Card Preview"
      >
         {viewingStudent && <ReportCardView student={viewingStudent} />}
      </Modal>
    </div>
  );
}
