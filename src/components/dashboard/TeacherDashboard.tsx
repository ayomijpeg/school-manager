'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle2,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

type DashboardData = {
  profile: { name: string; staffId: string };
  stats: { totalClasses: number; totalStudents: number };
  classes: Array<{
    id: string;
    name: string;
    subject: string;
    students: number;
    courseId: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    startTime: string;
    description?: string;
  }>;
};

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard/teacher');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium">Loading your workspace...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-red-200 bg-red-50 rounded-2xl text-red-700 max-w-xl mx-auto">
        <p className="font-semibold">Unable to load dashboard</p>
        <p className="text-sm mt-1 mb-4">We couldn&apos;t fetch your classes. Check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-medium uppercase tracking-wider mb-1">Teacher portal</p>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {data.profile.name}</h1>
          <p className="text-emerald-100 mt-2 text-sm sm:text-base">
            {format(new Date(), 'EEEE, MMMM d')} • Staff ID: <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{data.profile.staffId}</span>
          </p>
        </div>
        <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Assigned classes" value={data.stats.totalClasses} />
        <StatCard icon={Users} label="Total students" value={data.stats.totalStudents} />
        <StatCard icon={Calendar} label="Upcoming events" value={data.events.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Classes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              My classes
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/teachers/timetable"
                className="text-sm text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-1.5"
              >
                <CalendarDays className="w-4 h-4" /> Schedule
              </Link>
              <Link href="/dashboard/teachers/classes" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.classes.slice(0, 4).map((cls) => (
              <div
                key={cls.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">{cls.name}</h3>
                    <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                      {cls.subject}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4">{cls.students} students</p>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/teachers/attendance/${cls.id}?courseId=${cls.courseId}`}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-slate-700 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Attendance
                  </Link>
                  <Link
                    href={`/dashboard/teachers/results/${cls.id}?courseId=${cls.courseId}`}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Results
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {data.classes.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
              <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-semibold text-slate-800">No classes assigned</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">Contact the administrator to get assigned to subjects.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Events */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> Upcoming events
            </h3>
            {data.events.length > 0 ? (
              <ul className="space-y-4">
                {data.events.map((event) => (
                  <li key={event.id} className="flex gap-3 items-start">
                    <div className="shrink-0 w-12 py-2 rounded-xl bg-amber-50 text-amber-700 text-center border border-amber-100">
                      <span className="block text-[10px] font-bold uppercase">{format(new Date(event.startTime), 'MMM')}</span>
                      <span className="block text-lg font-bold leading-none mt-0.5">{format(new Date(event.startTime), 'd')}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{event.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{event.description || 'No details'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic py-4">No upcoming events.</p>
            )}
            {data.events.length > 0 && (
              <Link href="/dashboard/events" className="mt-4 pt-4 border-t border-slate-100 text-xs font-medium text-emerald-700 hover:underline block text-center">
                View full calendar
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
