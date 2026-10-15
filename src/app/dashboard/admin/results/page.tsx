'use client';

export const dynamic = 'force-dynamic';

import { useDataFetch } from '@/hooks/useDataFetch';
import React, { useState } from 'react';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal'; 
import { Layers, FileBadge, Search, Printer, Trophy, FileSpreadsheet } from 'lucide-react';

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
    position?: number;
    positionText?: string;
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
  <div className="relative">
    <style jsx global>{`
      @media print {
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        body * {
          visibility: hidden !important;
        }
        #official-terminal-report,
        #official-terminal-report * {
          visibility: visible !important;
        }
        #official-terminal-report {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          z-index: 999999 !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `}</style>
    <div id="official-terminal-report" className="bg-white p-6 max-w-2xl mx-auto text-slate-900 border border-slate-200 rounded-xl print:border-none print:p-0 print:m-0 print:max-w-none print:w-full">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">Yosola Schools</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Official Student Terminal Report</p>
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
         <span className="text-slate-500 text-xs block uppercase">Performance & Rank</span>
         <span className="font-bold text-emerald-600 text-lg">{student.summary.average}% Avg</span>
         {student.summary.positionText && (
           <span className="block text-xs font-bold text-slate-700 mt-0.5">Rank: {student.summary.positionText}</span>
         )}
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

    {/* Behavioral & Affective Domain */}
    <div className="mt-6 border border-slate-200 rounded-lg p-3 bg-slate-50">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-bold uppercase text-slate-700">Affective & Psychomotor Domain (Rating: 1 - 5)</span>
        <span className="text-[10px] text-slate-400">5=Excellent, 4=Good, 3=Fair</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          { trait: 'Punctuality', score: 5 },
          { trait: 'Neatness', score: 5 },
          { trait: 'Politeness', score: 5 },
          { trait: 'Honesty', score: 5 },
          { trait: 'Attentiveness', score: 4 },
          { trait: 'Teamwork', score: 5 },
          { trait: 'Sports', score: 4 },
          { trait: 'Handwriting', score: 4 },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-1.5 rounded border border-slate-200 flex justify-between items-center text-[11px]">
            <span className="text-slate-600 truncate">{item.trait}</span>
            <span className="font-bold text-emerald-700 font-mono ml-1">{item.score}/5</span>
          </div>
        ))}
      </div>
    </div>

    {/* Resumption Notice */}
    <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-slate-700">
      <p className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider mb-0.5">Next Term Resumption & Fees Notice</p>
      <p>School resumes on <strong>Monday, 11th January 2027</strong>. Please ensure termly school fees are settled before resumption.</p>
    </div>

    {/* Signatures */}
    <div className="mt-8 grid grid-cols-2 gap-10 pt-4 border-t border-slate-200">
       <div className="border-t border-slate-400 pt-2 text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Class Teacher Signature</p>
       </div>
       <div className="border-t border-slate-400 pt-2 text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Principal Signature & Stamp</p>
       </div>
    </div>
    
    {/* Print Button */}
    <div className="mt-6 flex justify-center gap-4 no-print">
       <Button icon={Printer} onClick={() => window.print()}>Print Report</Button>
    </div>
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

  const handleExportCsv = () => {
    if (!reportData || reportData.length === 0) return;

    // Collect all unique subjects across students
    const subjectNames = Array.from(
      new Set(
        reportData.flatMap((s) => s.results.map((r) => r.course.name))
      )
    );

    // Build CSV Headers
    const headers = [
      'Rank',
      'Student Name',
      'Admission No',
      'Level',
      ...subjectNames.map((subj) => `"${subj} (CA/Exam/Total)"`),
      'Subject Count',
      'Total Score',
      'Average (%)',
    ];

    // Build CSV Rows
    const rows = reportData.map((s, index) => {
      const subjectMap = new Map(s.results.map((r) => [r.course.name, `${r.caScore}/${r.examScore}/${r.totalScore}(${r.grade})`]));
      const subjectCols = subjectNames.map((subj) => subjectMap.get(subj) || '-');

      return [
        index + 1,
        `"${s.fullName.replace(/"/g, '""')}"`,
        `"${s.matricNumber || ''}"`,
        `"${s.level?.name || ''}"`,
        ...subjectCols.map((c) => `"${c}"`),
        s.summary.subjectCount,
        s.summary.totalScore,
        `"${s.summary.average}%"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const levelName = levels?.find((l) => l.id === selectedLevel)?.name || 'Class';
    const examName = exams?.find((e) => e.id === selectedExam)?.name || 'Exam';
    link.href = url;
    link.download = `Broadsheet_${levelName}_${examName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handleSearch} icon={Search} isLoading={isLoading}>
              Load Broadsheet
          </Button>
          {reportData.length > 0 && (
            <Button onClick={handleExportCsv} icon={FileSpreadsheet} variant="secondary">
              Export CSV
            </Button>
          )}
        </div>
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
