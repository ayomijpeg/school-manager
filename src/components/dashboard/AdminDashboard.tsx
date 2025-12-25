import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Receipt, 
  ArrowUpRight, 
  Plus 
} from 'lucide-react';
import Card from '@/components/ui/Card';

// --- Types Contract ---
// We explicitly define what data this dashboard needs to render.
interface AdminDashboardProps {
  schoolName: string;
  schoolType: 'BASIC' | 'TERTIARY';
  counts: {
    students: number;
    teachers: number;
    classes: number; // or courses
    invoices: number;
  };
}

export default function AdminDashboard({ 
  schoolName, 
  schoolType, 
  counts 
}: AdminDashboardProps) {
  
  const isTertiary = schoolType === 'TERTIARY';

  // Polymorphic Labels
  const labels = {
    students: isTertiary ? 'Undergraduates' : 'Students',
    teachers: isTertiary ? 'Lecturers' : 'Teachers',
    classes: isTertiary ? 'Active Courses' : 'Classes',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. High-Level Metrics (The "Ledger" Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard 
          label={labels.students}
          value={counts.students}
          icon={Users}
          trend="+12 this week"
        />
        <MetricCard 
          label={labels.teachers}
          value={counts.teachers}
          icon={GraduationCap}
          trend="Staff fully onboarded"
        />
        <MetricCard 
          label={labels.classes}
          value={counts.classes}
          icon={BookOpen}
          trend={isTertiary ? "Registration open" : "Academic session active"}
        />
        <MetricCard 
          label="Pending Revenue"
          value="₦ 0.00" // We will hook this up later
          icon={Receipt}
          trend="0 Unpaid Invoices"
          isFinance
        />
      </div>

      {/* 2. Operational Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Action Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-serif text-slate-800">Registrar's Office</h2>
              <p className="text-sm text-slate-500">Manage {labels.students.toLowerCase()} and academic records.</p>
            </div>
            {/* Primary Call to Action */}
            <Link 
              href="/dashboard/students/add" 
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-emerald-900/10"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New {isTertiary ? 'Student' : 'Pupil'}</span>
            </Link>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ActionCard label={`Add ${labels.teachers}`} href="/dashboard/admin/teachers" />
            <ActionCard label={`Create ${isTertiary ? 'Course' : 'Class'}`} href="/dashboard/admin/classes" />
            <ActionCard label="Generate Invoice" href="/dashboard/finance/invoice" />
            <ActionCard label="Record Attendance" href="/dashboard/attendance" />
            <ActionCard label="Print Transcripts" href="/dashboard/results" />
            <ActionCard label="System Settings" href="/settings" />
          </div>
        </div>

        {/* Sidebar: Recent Activity (The "Ticker") */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
            Recent Enrolments
          </h3>
          <div className="space-y-6">
            {/* Empty State for MVP */}
            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No new students this week.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components (Styled for Ivy & Ink) ---

function MetricCard({ label, value, icon: Icon, trend, isFinance }: any) {
  const safeValue = value ?? 0; 

  return (
    <Card className="p-6 border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-all group bg-white">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl transition-colors ${
          isFinance 
            ? 'bg-amber-50 text-amber-700 group-hover:bg-amber-100' 
            : 'bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100'
        }`}>
          <Icon size={20} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-500 mb-1">{label}</h4>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-serif font-semibold text-slate-900">
            {/* Now safe to call methods on the number */}
            {safeValue.toLocaleString()}
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {trend}
        </p>
      </div>
    </Card>
  );
}

function ActionCard({ label, href }: { label: string; href: string }) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group text-center h-24"
    >
      <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-800">
        {label}
      </span>
    </Link>
  );
}
