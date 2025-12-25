import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Award, BookOpen, TrendingUp } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton'; // 👈 Import the new button

export default async function ResultsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

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
              }
            }
          }
        }
      }
    }
  });

  const wards = parent?.students.map(link => link.student) || [];

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto min-h-screen">
      {/* PAGE HEADER - HIDDEN ON PRINT */}
      <div className="flex justify-between items-end no-print">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif flex items-center gap-3">
            <Award className="text-amber-500 w-8 h-8" />
            Academic Performance
          </h1>
          <p className="text-slate-500 text-sm mt-1">Terminal reports and ward assessments.</p>
        </div>
      </div>

      <div className="space-y-16">
        {wards.map((ward) => (
          <section key={ward.id} className="relative">
            
            {/* WARD INFO & ACTIONS - HIDDEN ON PRINT */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 no-print">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400">
                  {ward.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold dark:text-white">{ward.fullName}</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{ward.level?.name}</p>
                </div>
              </div>
              
              {/* 🟢 THE FIX: Using the Client Component here */}
              <PrintButton /> 
            </div>

            {/* THE ACTUAL REPORT CARD (This part is formatted for Print) */}
            <div className="print-report p-0 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              
              {/* PRINT-ONLY HEADER */}
              <div className="hidden print:flex flex-col items-center text-center mb-8 border-b-2 border-slate-900 pb-6">
                <h1 className="text-2xl font-black uppercase">Yosola School System</h1>
                <p className="text-sm font-bold">Official Terminal Progress Report</p>
                <div className="mt-4 grid grid-cols-2 gap-x-10 text-xs text-left w-full max-w-2xl">
                    <p><strong>Student:</strong> {ward.fullName}</p>
                    <p><strong>Level:</strong> {ward.level?.name}</p>
                    <p><strong>Term:</strong> First Term 2025</p>
                    <p><strong>Status:</strong> Completed</p>
                </div>
              </div>

              {ward.results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Assessment</th>
                        <th className="px-6 py-4 text-center">Score</th>
                        <th className="px-6 py-4 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {ward.results.map((result: any) => (
                        <tr key={result.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <BookOpen size={16} className="text-blue-500 no-print" />
                              <span className="text-sm font-bold dark:text-white">{result.course?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">{result.exam?.name}</td>
                          <td className="px-6 py-4 text-center font-mono font-bold dark:text-white">{result.totalScore}%</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-xs font-black px-2 py-1 rounded-md ${
                              Number(result.totalScore) >= 70 ? 'text-emerald-600' : 
                              Number(result.totalScore) >= 50 ? 'text-blue-600' : 'text-rose-600'
                            }`}>
                              {result.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <TrendingUp size={40} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 italic">No academic results have been published for this ward.</p>
                </div>
              )}

              {/* PRINT-ONLY SIGNATURE SECTION */}
              <div className="hidden print:grid grid-cols-2 gap-20 mt-20 pt-10 border-t border-slate-200">
                <div className="text-center border-t border-slate-900 pt-2">
                    <p className="text-[10px] font-bold">Class Teacher Signature</p>
                </div>
                <div className="text-center border-t border-slate-900 pt-2">
                    <p className="text-[10px] font-bold">Principal Signature & Stamp</p>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
