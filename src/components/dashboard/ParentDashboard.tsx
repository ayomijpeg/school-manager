import React from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Wallet, Bell } from 'lucide-react';

// Make sure these paths match exactly where you saved your files
import WardCard from '../parents/WardCard';
import Timetable from '../parents/Timetable';
import AcademicSummary from '../parents/AcademicSummary'; // The file we just fixed

type Props = { parentUserId: string };

type RichParent = Prisma.ParentGetPayload<{
  include: {
    students: {
      include: {
        student: {
          include: {
            level: true, 
            invoices: true,
            results: {
              include: { course: true, exam: true },
              orderBy: { id: 'desc' },
              take: 5
            }
          }
        }
      }
    }
  }
}>;

export default async function ParentDashboard({ parentUserId }: Props) {
  const parent = await prisma.parent.findUnique({
    where: { userId: parentUserId },
    include: {
      students: {
        include: {
          student: {
            include: {
              level: true, 
              invoices: { 
                where: { status: { not: 'PAID' } },
                orderBy: { issueDate: 'desc' }
              },
              results: {
                include: { course: true, exam: true },
                orderBy: { id: 'desc' },
                take: 5 
              }
            }
          }
        }
      }
    }
  }) as RichParent | null;

  if (!parent) return <div>Record not found.</div>;

  // LOGIC
  const wards = parent.students.map(link => link.student);
  
  let totalOutstanding = 0;
  wards.forEach(s => {
    s.invoices.forEach(inv => {
      totalOutstanding += (Number(inv.totalAmount) - Number(inv.amountPaid || 0));
    });
  });

  // Aggregate results safely
  const allRecentResults = wards.flatMap(s => s.results).slice(0, 5);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif">
            Hello, {parent.fullName.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-sm">Here is what is happening with your wards today.</p>
        </div>
        
        <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-900/20">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase opacity-60">Total Balance Due</p>
            <p className="text-xl font-bold">₦ {totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Registered Wards</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wards.map(w => <WardCard key={w.id} ward={w} />)}
            </div>
          </section>
        </div>

        {/* RIGHT: Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* 🔴 FIXED: Passing 'allRecentResults' into the 'results' prop */}
          <AcademicSummary results={allRecentResults} />

          {/* Timetable Widget */}
          <Timetable schedule={[
             { time: "08:00", subject: "Mathematics", type: "Core" },
             { time: "09:00", subject: "English", type: "Core" },
          ]} />
          
          {/* Newsletter */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
             <div className="relative z-10">
                <h3 className="font-bold mb-2">School Newsletter</h3>
                <p className="text-xs opacity-80 mb-4">Download the latest monthly newsletter.</p>
                <button className="w-full py-2 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
                  Download PDF
                </button>
             </div>
             <Bell className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
