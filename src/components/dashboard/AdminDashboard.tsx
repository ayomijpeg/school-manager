import React from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  GraduationCap,
  Receipt,
  ArrowUpRight,
  Plus,
  Calendar,
  Settings,
  FileText,
  ClipboardCheck,
  AlertCircle,
  ShieldCheck,
  IdCard,
  ChevronRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import RefreshButton from '@/components/ui/RefreshButton';
import BirthdayWidget, { BirthdayCelebrant } from '@/components/dashboard/BirthdayWidget';
import { format } from 'date-fns';

interface AdminDashboardProps {
  schoolName: string;
  schoolType: 'BASIC' | 'TERTIARY';
  counts: {
    students: number;
    teachers: number;
    classes: number;
    invoices: number;
    pendingRevenue?: number;
  } | null;
  celebrants?: BirthdayCelebrant[];
}

export default function AdminDashboard({
  schoolName,
  schoolType,
  counts,
  celebrants,
}: AdminDashboardProps) {
  const isTertiary = schoolType === 'TERTIARY';
  const c = counts ?? { students: 0, teachers: 0, classes: 0, invoices: 0, pendingRevenue: 0 };

  const labels = {
    students: isTertiary ? 'Undergraduates' : 'Students',
    teachers: isTertiary ? 'Lecturers' : 'Teachers',
    classes: isTertiary ? 'Active Courses' : 'Classes',
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {greeting()} • {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
        <RefreshButton />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label={labels.students}
          value={c.students}
          icon={Users}
          trend="Enrolled"
          isFinance={false}
        />
        <MetricCard
          label={labels.teachers}
          value={c.teachers}
          icon={GraduationCap}
          trend="Staff"
          isFinance={false}
        />
        <MetricCard
          label={labels.classes}
          value={c.classes}
          icon={BookOpen}
          trend={isTertiary ? 'Courses' : 'Classes'}
          isFinance={false}
        />
        <MetricCard
          label="Pending revenue"
          value={typeof c.pendingRevenue === 'number' ? `₦ ${c.pendingRevenue.toLocaleString()}` : '₦ 0'}
          icon={Receipt}
          trend={`${c.invoices} unpaid invoice${c.invoices !== 1 ? 's' : ''}`}
          isFinance
        />
      </div>

      {/* Registrar's Office */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">Registrar&apos;s Office</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage {labels.students.toLowerCase()}, staff, exams, and financial operations.
              </p>
            </div>
            <Link
              href="/dashboard/students/add"
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-900/10"
            >
              <Plus className="w-4 h-4" />
              Enroll New {isTertiary ? 'Student' : 'Pupil'}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ActionCard label={`Add ${labels.teachers}`} href="/dashboard/teachers" icon={GraduationCap} />
            <ActionCard label={isTertiary ? 'Courses' : 'Classes'} href="/dashboard/admin/classes" icon={BookOpen} />
            <ActionCard label="Fee Debtors" href="/dashboard/finance/defaulters" icon={AlertCircle} />
            <ActionCard label="Exam Passes" href="/dashboard/finance/exam-passes" icon={ShieldCheck} />
            <ActionCard label="Print ID Cards" href="/dashboard/students/id-cards" icon={IdCard} />
            <ActionCard label="Attendance" href="/dashboard/teachers/attendance" icon={ClipboardCheck} />
            <ActionCard label="Results & broadsheet" href="/dashboard/results" icon={FileText} />
            <ActionCard label="Finance ledger" href="/dashboard/finance" icon={Receipt} />
            <ActionCard label="Settings" href="/dashboard/settings" icon={Settings} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <BirthdayWidget celebrants={celebrants || []} />

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Quick links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/finance/defaulters"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">Fee debtors list</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/finance/exam-passes"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Exam clearance dockets</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/students/id-cards"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      <IdCard className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Print student ID cards</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/students"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Student directory</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/parents"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Parents & guardians</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/events"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Events & calendar</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Recent enrolments</h3>
            <div className="text-center py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">View new students in the directory.</p>
              <Link href="/dashboard/students" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline mt-1 inline-block cursor-pointer">
                Open directory →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend: string;
  isFinance: boolean;
}

function MetricCard({ label, value, icon: Icon, trend, isFinance }: MetricCardProps) {
  return (
    <Card className="p-5 sm:p-6 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group bg-white dark:bg-slate-900 rounded-2xl">
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div
          className={`p-2 sm:p-2.5 rounded-xl transition-colors ${
            isFinance
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30'
              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30'
          }`}
        >
          <Icon size={20} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
      </div>
      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</h4>
      <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{trend}</p>
    </Card>
  );
}

function ActionCard({ label, href, icon: Icon }: { label: string; href: string; icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all active:scale-[0.97] group text-center min-h-[100px] cursor-pointer"
    >
      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-400">{label}</span>
    </Link>
  );
}
