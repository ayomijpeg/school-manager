import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Award, BookOpen, TrendingUp, ShieldCheck, UserX } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';
import { Prisma } from '@prisma/client';
import Button from '@/components/ui/Button';

// Define the specific type for a Result
type ResultWithDetails = Prisma.ResultGetPayload<{
  include: { course: true; exam: true }
}>;

export default async function PersonalResultsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  // --- 1. HANDLE ADMIN/TEACHER REDIRECT UX ---
  if (user.role === 'ADMIN' || user.role === 'TEACHER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
           <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-900">You are an Admin</h2>
             <p className="text-slate-500 mt-2 text-sm">
               This page is for parents to view their child's report card. To view class results, please use the Broadsheet.
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
            My Report Cards
          </h1>
          <p className="text-slate-500 text-sm mt-1">Terminal academic performance reports.</p>
        </div>
        <PrintButton />
      </div>

      <div className="space-y-16">
        {wards.map((ward) => {
           // Basic logic to get header info from the first result found
           const currentExamName = ward.results[0]?.exam?.name || 'Academic Report';
           const currentYear = ward.results[0]?.exam?.academicYear || new Date().getFullYear();

           return (
            <section key={ward.id} className="relative">
              
              {/* WARD HEADER */}
              <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-6 no-print">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 text-xl">
                  {ward.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{ward.fullName}</h2>
                  <div className="flex gap-3 text-xs text-slate-500 font-medium uppercase tracking-wider">
                     <span>{ward.level?.name}</span>
                     <span>•</span>
                     <span>{ward.matricNumber}</span>
                  </div>
                </div>
              </div>

              {/* REPORT CARD CONTAINER */}
              <div className="print-report bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                
                {/* OFFICIAL PRINT HEADER (Visible mostly on Print) */}
                <div className="p-8 border-b-2 border-slate-900 text-center">
                  <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Yosola Schools</h1>
                  <p className="text-sm font-bold text-slate-600 uppercase mt-1">Terminal Progress Report</p>
                  
                  <div className="mt-6 grid grid-cols-2 gap-y-2 text-sm text-left max-w-lg mx-auto bg-slate-50 p-4 rounded-lg border border-slate-200 print:border-none print:bg-transparent print:p-0">
                      <div className="text-slate-500">Student Name:</div>
                      <div className="font-bold text-slate-900">{ward.fullName}</div>
                      
                      <div className="text-slate-500">Class:</div>
                      <div className="font-bold text-slate-900">{ward.level?.name}</div>
                      
                      <div className="text-slate-500">Examination:</div>
                      <div className="font-bold text-slate-900">{currentExamName}</div>
                      
                      <div className="text-slate-500">Session:</div>
                      <div className="font-bold text-slate-900">{String(currentYear)}</div>
                  </div>
                </div>

                {ward.results.length > 0 ? (
                  <>
                    <div className="p-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 border-r border-slate-200">Subject</th>
                            <th className="px-4 py-3 text-center border-r border-slate-200 w-24">C.A (40)</th>
                            <th className="px-4 py-3 text-center border-r border-slate-200 w-24">Exam (60)</th>
                            <th className="px-4 py-3 text-center border-r border-slate-200 w-24">Total</th>
                            <th className="px-4 py-3 text-center w-20">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {ward.results.map((result: ResultWithDetails) => (
                            <tr key={result.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-3 border-r border-slate-100 font-medium text-slate-800">
                                {result.course?.name}
                              </td>
                              <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-500">
                                {Number(result.caScore)}
                              </td>
                              <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-500">
                                {Number(result.examScore)}
                              </td>
                              <td className="px-4 py-3 text-center border-r border-slate-100 font-bold text-slate-800">
                                {Number(result.totalScore)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block w-8 text-center font-bold ${
                                  Number(result.totalScore) >= 70 ? 'text-emerald-600' : 
                                  Number(result.totalScore) < 40 ? 'text-red-600' : 'text-slate-700'
                                }`}>
                                  {result.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* FOOTER SIGNATURES */}
                    <div className="grid grid-cols-2 gap-20 p-8 mt-4 page-break-avoid">
                      <div className="text-center pt-8 border-t border-slate-300">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Class Teacher</p>
                      </div>
                      <div className="text-center pt-8 border-t border-slate-300">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Principal</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center">
                    <TrendingUp size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 italic">No academic results released yet.</p>
                  </div>
                )}
              </div>
            </section>
        )})}
      </div>
    </div>
  );
}
