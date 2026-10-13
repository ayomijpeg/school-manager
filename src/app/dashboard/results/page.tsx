import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Award, BookOpen, TrendingUp, ShieldCheck, UserX, Star, Calendar, CheckCircle } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';
import { Prisma } from '@prisma/client';
import Button from '@/components/ui/Button';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { buildReportCardNoticeMessage } from '@/lib/whatsapp';

// Define the specific type for a Result
type ResultWithDetails = Prisma.ResultGetPayload<{
  include: { course: true; exam: true }
}>;

// Helper to determine automated Nigerian teacher remark based on average
function getAutomatedRemarks(average: number) {
  if (average >= 80) {
    return {
      teacher: "An exceptionally brilliant performance! Maintained an exemplary standard of diligence throughout the term.",
      principal: "Outstanding academic excellence! Promoted with flying colors. Keep soaring high!"
    };
  }
  if (average >= 70) {
    return {
      teacher: "A very commendable result. Shows great intellectual focus and consistent participation in class.",
      principal: "Splendid achievement. With continued hard work, greater heights will be attained."
    };
  }
  if (average >= 60) {
    return {
      teacher: "Good overall effort. Can improve significantly with more attention given to challenging subjects.",
      principal: "A satisfactory term's work. Encouraged to aim higher next term."
    };
  }
  if (average >= 50) {
    return {
      teacher: "A fair attempt. Needs to double up personal study time at home to avoid slipping.",
      principal: "Pass. More seriousness and active concentration required in class."
    };
  }
  return {
    teacher: "Performance is below acceptable standard. Requires intensive revision and parental supervision.",
    principal: "Weak performance. Urgent academic intervention recommended before next session."
  };
}

export default async function PersonalResultsPage() {
  const [user, config] = await Promise.all([
    getCurrentUser(),
    prisma.schoolConfig.findFirst(),
  ]);

  if (!user) redirect('/auth/login');

  const schoolName = config?.schoolName || 'Yosola Schools';
  const schoolAddress = config?.address || 'School Campus';
  const schoolMotto = config?.motto || 'Knowledge, Discipline & Excellence';

  // --- 1. HANDLE ADMIN/TEACHER REDIRECT UX ---
  if (user.role === 'ADMIN' || user.role === 'TEACHER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
           <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-900">Administrator / Teacher View</h2>
             <p className="text-slate-500 mt-2 text-sm">
               This page displays terminal report cards. To compile marks or inspect full class broadsheets, use the links below.
             </p>
           </div>
           <div className="flex flex-col gap-3">
             <Link href="/dashboard/admin/results" className="w-full">
                <Button className="w-full justify-center">Go to Admin Broadsheet</Button>
             </Link>
             <Link href="/dashboard/results/entry" className="w-full">
                <Button variant="secondary" className="w-full justify-center">Go to Result Entry</Button>
             </Link>
           </div>
        </div>
      </div>
    );
  }

  // --- 2. FETCH DATA FOR PARENTS/STUDENTS ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wards: any[] = [];

  if (user.role === 'PARENT') {
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: {
        students: {
          include: {
            student: {
              include: {
                level: true,
                results: {
                  include: { course: true, exam: true },
                  orderBy: { course: { name: 'asc' } }
                }
              }
            }
          }
        }
      }
    });
    wards = parent?.students.map(link => link.student) || [];
  
  } else if (user.role === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      include: {
        level: true,
        results: {
          include: { course: true, exam: true },
          orderBy: { course: { name: 'asc' } }
        }
      }
    });
    if (student) wards = [student];
  }

  // --- 3. HANDLE NO DATA ---
  if (wards.length === 0) {
    return (
         <div className="p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
               <UserX size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Student Linked</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
               We could not find any student records linked to your account. Please contact the school administrator.
            </p>
         </div>
    );
  }

  // --- 4. RENDER REPORT CARDS ---
  return (
    <div className="p-4 md:p-8 space-y-10 max-w-5xl mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-end no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif flex items-center gap-3">
            <Award className="text-amber-500 w-8 h-8" />
            Official Terminal Report Cards
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Terminal academic progress, cognitive scores, and character evaluation.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="space-y-16">
        {wards.map((ward) => {
           const currentExamName = ward.results[0]?.exam?.name || 'Third Term Examination';
           const currentYear = ward.results[0]?.exam?.academicYear || config?.academicYear || '2025/2026';
           const totalSubjects = ward.results.length;
           const totalScore = ward.results.reduce((acc: number, r: ResultWithDetails) => acc + Number(r.totalScore), 0);
           const averageScore = totalSubjects > 0 ? (totalScore / totalSubjects) : 0;
           const remarks = getAutomatedRemarks(averageScore);

           const whatsappShareMsg = buildReportCardNoticeMessage({
             studentName: ward.fullName,
             term: config?.currentTerm || 'Current Term',
             academicYear: String(currentYear),
             schoolName: schoolName,
           });

           return (
            <section key={ward.id} className="relative">
              
              {/* WARD HEADER */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 no-print">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 text-xl font-serif">
                    {ward.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{ward.fullName}</h2>
                    <div className="flex gap-3 text-xs text-slate-500 font-medium uppercase tracking-wider">
                       <span>{ward.level?.name || 'Class'}</span>
                       <span>•</span>
                       <span>{ward.matricNumber || 'Admission No'}</span>
                    </div>
                  </div>
                </div>

                <WhatsAppButton
                  message={whatsappShareMsg}
                  label="Share on WhatsApp"
                  variant="secondary"
                />
              </div>

              {/* REPORT CARD CONTAINER */}
              <div className="print-report bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden print:border-none print:shadow-none">
                
                {/* OFFICIAL PRINT HEADER */}
                <div className="p-8 border-b-2 border-slate-900 text-center">
                  <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
                    {schoolName}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                    {schoolMotto}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{schoolAddress}</p>
                  <div className="inline-block px-4 py-1 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mt-3">
                    Terminal Academic Progress Report
                  </div>
                  
                  {/* STUDENT & EXAM METADATA GRID */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-left max-w-2xl mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border-slate-300">
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[10px]">Student Name</span>
                        <span className="font-bold text-slate-900 text-sm">{ward.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[10px]">Class / Level</span>
                        <span className="font-bold text-slate-900 text-sm">{ward.level?.name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[10px]">Admission No</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{ward.matricNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[10px]">Session & Term</span>
                        <span className="font-bold text-slate-900 text-sm">{String(currentYear)}</span>
                      </div>
                  </div>
                </div>

                {ward.results.length > 0 ? (
                  <>
                    {/* ACADEMIC SUBJECTS TABLE */}
                    <div className="p-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 border-r border-slate-200">Subject</th>
                            <th className="px-4 py-3 text-center border-r border-slate-200 w-24">C.A (40)</th>
                            <th className="px-4 py-3 text-center border-r border-slate-200 w-24">Exam (60)</th>
                            <th className="px-4 py-3 text-center border-r border-slate-200 w-24">Total (100)</th>
                            <th className="px-4 py-3 text-center w-20">Grade</th>
                            <th className="px-4 py-3 border-l border-slate-200">Remark</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {ward.results.map((result: ResultWithDetails) => {
                            const tot = Number(result.totalScore);
                            return (
                              <tr key={result.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-3 border-r border-slate-100 font-semibold text-slate-900">
                                  {result.course?.name}
                                </td>
                                <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-600 font-mono">
                                  {Number(result.caScore)}
                                </td>
                                <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-600 font-mono">
                                  {Number(result.examScore)}
                                </td>
                                <td className="px-4 py-3 text-center border-r border-slate-100 font-bold text-slate-900 font-mono">
                                  {tot}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-block w-8 text-center font-bold ${
                                    tot >= 70 ? 'text-emerald-700 bg-emerald-50 rounded' : 
                                    tot < 40 ? 'text-red-700 bg-red-50 rounded' : 'text-slate-800'
                                  }`}>
                                    {result.grade || '—'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 border-l border-slate-100 text-xs text-slate-500 italic">
                                  {result.remark || (tot >= 70 ? 'Distinction' : tot >= 50 ? 'Credit' : 'Pass')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* OVERALL PERFORMANCE SUMMARY BAR */}
                    <div className="bg-slate-50 border-y border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 uppercase font-bold">Total Score:</span>{' '}
                        <strong className="text-slate-900 font-mono text-sm">{totalScore}</strong> / {totalSubjects * 100}
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold">Terminal Average:</span>{' '}
                        <strong className="text-emerald-700 font-mono text-sm">{averageScore.toFixed(1)}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold">Subjects Sat:</span>{' '}
                        <strong className="text-slate-900 font-mono text-sm">{totalSubjects}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold">Decision:</span>{' '}
                        <strong className="text-slate-900 text-sm">
                          {averageScore >= 50 ? 'PASSED / PROMOTED' : 'ADVISED TO WORK HARDER'}
                        </strong>
                      </div>
                    </div>

                    {/* AFFECTIVE & PSYCHOMOTOR DOMAIN (NON-COGNITIVE BEHAVIOR EVALUATION) */}
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-amber-500" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                          Character & Behavioral Evaluation (Affective & Psychomotor Domain)
                        </h3>
                        <span className="text-[10px] text-slate-400 ml-auto">Key: 5=Excellent, 4=Very Good, 3=Good, 2=Fair, 1=Poor</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { trait: 'Punctuality', score: 5 },
                          { trait: 'Neatness & Dressing', score: 5 },
                          { trait: 'Politeness & Courtesy', score: 5 },
                          { trait: 'Honesty & Integrity', score: 5 },
                          { trait: 'Classroom Attentiveness', score: 4 },
                          { trait: 'Relationship with Peers', score: 5 },
                          { trait: 'Games & Sports', score: 4 },
                          { trait: 'Handwriting & Book Work', score: 4 },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-600 text-[11px] font-medium">{item.trait}</span>
                            <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                              {item.score} / 5
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RESUMPTION & NEXT TERM FEES NOTICE */}
                    <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 text-xs">
                      <div className="flex items-center gap-2 mb-2 font-bold text-emerald-900 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-emerald-700" />
                        Official Next Term Resumption & Fees Notice
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                        <p>
                          <strong>School Resumes For Next Term:</strong> Monday, 11th January 2027. All pupils are expected on campus by 7:45 AM prompt.
                        </p>
                        <p>
                          <strong>School Fees Deadline:</strong> Kindly remit next term&apos;s tuition on or before resumption date to enable prompt issuance of examination passes.
                        </p>
                      </div>
                    </div>

                    {/* TEACHER & PRINCIPAL REMARKS & SIGNATURES */}
                    <div className="p-6 space-y-6">
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Class Teacher&apos;s Remarks:
                        </span>
                        <p className="text-sm font-serif italic text-slate-800">&ldquo;{remarks.teacher}&rdquo;</p>
                        <div className="mt-4 pt-2 border-t border-slate-200 text-right">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Class Teacher Signature & Date</span>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Principal / Head of School&apos;s Remarks:
                        </span>
                        <p className="text-sm font-serif italic text-slate-800">&ldquo;{remarks.principal}&rdquo;</p>
                        <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-end">
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                            OFFICIAL SCHOOL STAMP
                          </span>
                          <span className="text-xs font-semibold text-slate-500 uppercase">
                            Principal Signature & Stamp
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center">
                    <TrendingUp size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 italic">No academic results released yet for this session.</p>
                  </div>
                )}
              </div>
            </section>
        )})}
      </div>
    </div>
  );
}
