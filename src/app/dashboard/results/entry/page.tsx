'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For navigation
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import CsvResultUploader from '@/components/results/CsvResultUploader';
import Modal from '@/components/ui/Modal';
import { useDataFetch } from '@/hooks/useDataFetch';
import { 
  UploadCloud, 
  Save, 
  Search, 
  AlertCircle, 
  Layers, 
  BookOpen, 
  FileBadge,
  CheckCircle2,
  ArrowRight,
  Printer,
  RotateCcw
} from 'lucide-react';

// --- TYPES ---
interface StudentResult {
  id: string;
  fullName: string;
  matricNumber: string;
  enrollments?: { class: { name: string } }[];
}

interface ScoreData {
  ca: number;
  exam: number;
}

interface DropdownItem {
  id: string;
  name: string;
}

export default function ResultEntryPage() {
  const router = useRouter();

  // --- STATE ---
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedExam, setSelectedExam] = useState('');

  const [students, setStudents] = useState<StudentResult[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreData>>({});
  
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  
  // 🟢 NEW: Enhanced Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'CONFIRM' | 'SAVING' | 'SUCCESS'>('CONFIRM');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // --- HELPER ---
  const fetcher = (url: string) => async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  // --- FETCHING METADATA ---
  const { data: levels, isLoading: loadingLevels } = useDataFetch<DropdownItem[]>(fetcher('/api/levels'));
  const { data: courses, isLoading: loadingCourses } = useDataFetch<DropdownItem[]>(fetcher('/api/courses'));
  const { data: exams, isLoading: loadingExams } = useDataFetch<DropdownItem[]>(fetcher('/api/exams'));

  // --- 🛑 GUARD CLAUSE ---
  const isMissingSetup = !loadingLevels && !loadingCourses && !loadingExams && 
    (levels?.length === 0 || courses?.length === 0 || exams?.length === 0);

  if (isMissingSetup) {
    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen flex items-center">
             <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-8 shadow-sm">
                {/* ... (Keep existing Empty State UI) ... */}
                <h2 className="text-2xl font-bold text-amber-900">Academic Setup Required</h2>
                <div className="flex justify-center gap-4">
                     <Link href="/dashboard/admin/levels"><Button variant="secondary">Create Level</Button></Link>
                     <Link href="/dashboard/admin/courses"><Button variant="secondary">Create Subject</Button></Link>
                     <Link href="/dashboard/admin/exams"><Button variant="secondary">Create Exam</Button></Link>
                </div>
            </div>
        </div>
    );
  }

  // --- LOGIC ---

  const fetchSheet = async () => {
    if (!selectedLevel || !selectedCourse || !selectedExam) {
      toast.error("Please select Level, Subject, and Exam first.");
      return;
    }
    setIsLoadingSheet(true);
    setStudents([]);

    try {
      const url = `/api/results/sheet?levelId=${selectedLevel}&courseId=${selectedCourse}&examId=${selectedExam}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load sheet");
      
      setStudents(data.students);

      const initialScores: Record<string, ScoreData> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.students.forEach((s: any) => {
        const existing = s.results?.[0]; 
        initialScores[s.id] = {
            ca: existing ? Number(existing.caScore) : 0,
            exam: existing ? Number(existing.examScore) : 0
        };
      });
      setScores(initialScores);
      toast.info(`Loaded ${data.students.length} students.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not fetch student list.");
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleScoreChange = (studentId: string, field: 'ca' | 'exam', value: string) => {
    let numVal = parseFloat(value);
    if (isNaN(numVal)) numVal = 0;
    if (field === 'ca' && numVal > 40) numVal = 40;
    if (field === 'exam' && numVal > 60) numVal = 60;

    setScores(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], [field]: numVal }
    }));
  };

  const handleCsvDataLoaded = (newScores: Record<string, ScoreData>) => {
    setScores(prev => ({ ...prev, ...newScores }));
    setIsCsvModalOpen(false);
    toast.success("CSV Data applied! Review and click Save.");
  };

  const handleSaveClick = () => {
    if (students.length === 0) return;
    setModalStep('CONFIRM'); // Start at confirmation
    setIsModalOpen(true);
  };

  const executeBulkSave = async () => {
    setModalStep('SAVING');
    try {
        const payload = {
            examId: selectedExam,
            courseId: selectedCourse,
            results: students.map(s => {
                const sScore = scores[s.id] || { ca: 0, exam: 0 };
                const total = sScore.ca + sScore.exam;
                
                let grade = 'F';
                if (total >= 70) grade = 'A';
                else if (total >= 60) grade = 'B';
                else if (total >= 50) grade = 'C';
                else if (total >= 45) grade = 'D';

                return {
                    studentId: s.id,
                    caScore: sScore.ca,
                    examScore: sScore.exam,
                    totalScore: total,
                    grade: grade,
                    comments: '' 
                };
            })
        };

        const res = await fetch('/api/results/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await res.json();

        if (!res.ok) throw new Error(responseData.error || "Failed to save results");
        
        // 🟢 ON SUCCESS: Don't close. Switch to Success View.
        setLastSaved(new Date());
        setModalStep('SUCCESS');
        
    } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error saving results.");
        setModalStep('CONFIRM'); // Go back to allow retry
    }
  };

  // Actions for the Success Modal
  const handleReset = () => {
    setStudents([]);
    setSelectedCourse('');
    setScores({});
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Result Entry Sheet</h1>
          <p className="text-sm text-gray-500">Record marks for continuous assessment and exams.</p>
        </div>
      </div>

      {/* FILTER BAR (Keep existing code) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* ... (Keep your Select Inputs exactly as they were) ... */}
        
        {/* Level Select */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Layers size={14} className="text-gray-400"/> Level</label>
          <select className="w-full border border-gray-300 p-2 rounded-lg bg-white" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}>
            <option value="">Select Level...</option>
            {levels?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Subject Select */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><BookOpen size={14} className="text-gray-400"/> Subject</label>
          <select className="w-full border border-gray-300 p-2 rounded-lg bg-white" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Select Subject...</option>
            {courses?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Exam Select */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><FileBadge size={14} className="text-gray-400"/> Exam</label>
          <select className="w-full border border-gray-300 p-2 rounded-lg bg-white" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
            <option value="">Select Exam...</option>
            {exams?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
            <Button onClick={fetchSheet} isLoading={isLoadingSheet} icon={Search} className="flex-1">Load</Button>
            {students.length > 0 && (
              <Button variant="secondary" icon={UploadCloud} onClick={() => setIsCsvModalOpen(true)} title="Import" />
            )}
        </div>
      </div>

      {/* DATA TABLE */}
      {isLoadingSheet ? (
         <div className="py-20 flex justify-center"><Spinner /></div>
      ) : students.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* ... (Table code remains exactly the same) ... */}
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                      <tr>
                          <th className="p-4 border-b">Student</th>
                          <th className="p-4 border-b w-32 text-center">C.A (40)</th>
                          <th className="p-4 border-b w-32 text-center">Exam (60)</th>
                          <th className="p-4 border-b w-24 text-center">Total</th>
                          <th className="p-4 border-b w-20 text-center">Grade</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {students.map((student) => {
                          const sScore = scores[student.id] || { ca: 0, exam: 0 };
                          const total = (sScore.ca || 0) + (sScore.exam || 0);
                          const grade = total >= 70 ? 'A' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 45 ? 'D' : 'F';
                          const classArm = student.enrollments?.[0]?.class?.name || '';
                          return (
                              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="p-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <span>{student.fullName}</span>
                                        {classArm && <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1 rounded">{classArm}</span>}
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono">{student.matricNumber}</div>
                                  </td>
                                  <td className="p-3"><input type="number" className="w-full border border-gray-300 p-2 rounded-md text-center focus:ring-2 ring-emerald-500 outline-none font-mono" value={sScore.ca || ''} placeholder="0" onChange={(e) => handleScoreChange(student.id, 'ca', e.target.value)} onFocus={(e) => e.target.select()}/></td>
                                  <td className="p-3"><input type="number" className="w-full border border-gray-300 p-2 rounded-md text-center focus:ring-2 ring-emerald-500 outline-none font-mono" value={sScore.exam || ''} placeholder="0" onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)} onFocus={(e) => e.target.select()}/></td>
                                  <td className="p-4 text-center font-bold text-gray-700">{total}</td>
                                  <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${grade === 'A' ? 'bg-emerald-100 text-emerald-700' : grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{grade}</span></td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center sticky bottom-0 bg-white/95 backdrop-blur-sm z-10">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                   {lastSaved ? (
                     <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 size={16} /> Last saved: {lastSaved.toLocaleTimeString()}
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-gray-500">
                        <AlertCircle size={16} /> Ensure all entries are correct before saving.
                     </span>
                   )}
                </div>
                <Button variant="primary" onClick={handleSaveClick} icon={Save} className="w-48 shadow-lg shadow-emerald-200">
                    Save All Results
                </Button>
            </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
           <p className="text-gray-400">Select options above and click &quot;Load&quot; to start grading.</p>
        </div>
      )}

      <CsvResultUploader 
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        students={students} 
        onDataLoaded={handleCsvDataLoaded}
      />

      {/* 🟢 ENHANCED MODAL: Handles Confirm, Saving, and Success states */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalStep === 'SUCCESS' ? 'Success!' : 'Confirm Save'}>
        <div className="space-y-6">
            
            {/* 1. CONFIRMATION STATE */}
            {modalStep === 'CONFIRM' && (
                <>
                    <div className="bg-emerald-50 p-4 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-emerald-900">Ready to save?</h4>
                            <p className="text-sm text-emerald-700 mt-1">
                                You are about to update results for <strong className="text-black">{students.length} students</strong>.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={executeBulkSave}>Yes, Save Results</Button>
                    </div>
                </>
            )}

            {/* 2. LOADING STATE */}
            {modalStep === 'SAVING' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <Spinner size="lg" />
                    <p className="text-gray-500">Saving results, please wait...</p>
                </div>
            )}

            {/* 3. SUCCESS STATE - THE "WHAT'S NEXT" */}
            {modalStep === 'SUCCESS' && (
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce-short">
                        <CheckCircle2 size={32} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Results Saved Successfully!</h3>
                        <p className="text-gray-500 mt-2">The results are now live for parents to see.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {/* Option A: Enter New Subject */}
                        <button 
                            onClick={handleReset}
                            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-gray-50 hover:border-emerald-200 transition-all group"
                        >
                            <div className="bg-gray-100 p-2 rounded-full mb-2 group-hover:bg-emerald-100">
                                <RotateCcw size={20} className="text-gray-600 group-hover:text-emerald-600" />
                            </div>
                            <span className="font-bold text-gray-800 text-sm">Next Subject</span>
                            <span className="text-xs text-gray-400">Clear form & start new</span>
                        </button>

                        {/* Option B: View Reports */}
                        <Link 
                            href="/dashboard/admin/results" // Or wherever you view final reports
                            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-gray-50 hover:border-emerald-200 transition-all group"
                        >
                             <div className="bg-gray-100 p-2 rounded-full mb-2 group-hover:bg-emerald-100">
                                <Printer size={20} className="text-gray-600 group-hover:text-emerald-600" />
                            </div>
                            <span className="font-bold text-gray-800 text-sm">View Reports</span>
                            <span className="text-xs text-gray-400">See final report cards</span>
                        </Link>
                    </div>

                    <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full">
                        Stay on this page
                    </Button>
                </div>
            )}
        </div>
      </Modal>

    </div>
  );
}
