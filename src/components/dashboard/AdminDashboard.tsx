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
} from 'lucide-react';
import Card from '@/components/ui/Card';
import RefreshButton from '@/components/ui/RefreshButton';
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
}

export default function AdminDashboard({
  schoolName,
  schoolType,
  counts,
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
                Manage {labels.students.toLowerCase()}, staff, and academic records.
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
            <ActionCard label="Generate invoice" href="/dashboard/finance" icon={Receipt} />
            <ActionCard label="Attendance" href="/dashboard/teachers/attendance" icon={ClipboardCheck} />
            <ActionCard label="Results & transcripts" href="/dashboard/results" icon={FileText} />
            <ActionCard label="Settings" href="/dashboard/settings" icon={Settings} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/students" className="text-sm text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-2 py-1.5">
                  <Users className="w-4 h-4 text-slate-400" /> Student directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard/parents" className="text-sm text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-2 py-1.5">
                  <Users className="w-4 h-4 text-slate-400" /> Parents & guardians
                </Link>
              </li>
              <li>
                <Link href="/dashboard/events" className="text-sm text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-2 py-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Events & calendar
                </Link>
              </li>
            </ul>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Recent enrolments</h3>
            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">View new students in the directory.</p>
              <Link href="/dashboard/students" className="text-xs font-medium text-emerald-700 hover:underline mt-1 inline-block">
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
    <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group bg-white dark:bg-slate-900 rounded-2xl">
      <div className="flex justify-between items-start mb-3">
        <div
          className={`p-2.5 rounded-xl transition-colors ${
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
      <p className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{trend}</p>
    </Card>
  );
}

function ActionCard({ label, href, icon: Icon }: { label: string; href: string; icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all group text-center min-h-[100px]"
    >
      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-400">{label}</span>
    </Link>
  );
}
