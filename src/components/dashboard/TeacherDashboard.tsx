'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, BookOpen, Calendar, ArrowRight, 
  Clock, FileText, CheckCircle2, Loader2, Sparkles,
  LucideIcon 
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// 1. Define Data Types
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

// 2. Component Definition (Removed unused 'user' prop)
export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard/teacher'); 
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-3 text-indigo-500" />
        <p className="text-sm font-medium">Setting up your workspace...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-red-600 max-w-2xl mx-auto mt-10">
        <p className="font-semibold">Unable to load dashboard.</p>
        <p className="text-sm mt-1 mb-4">We couldn&apos;t fetch your classes. Please check your internet connection.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm hover:bg-red-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Banner: Updated bg-gradient-to-r to bg-linear-to-r for Tailwind v4 compatibility */}
      <div className="bg-linear-to-r from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-200 text-sm font-medium uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Teacher Portal
          </div>
          <h1 className="text-3xl font-bold">Welcome back, {data.profile.name}</h1>
          <p className="text-indigo-100 mt-2 text-lg opacity-90 font-light">
            Today is {format(new Date(), 'EEEE, MMMM do')} • Staff ID: <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm">{data.profile.staffId}</span>
          </p>
        </div>
        <div className="absolute right-0 top-0 h-64 w-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 h-32 w-32 bg-indigo-400 opacity-20 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={BookOpen} 
          label="Assigned Classes" 
          value={data.stats.totalClasses} 
          color="bg-blue-50 text-blue-600 border-blue-100"
        />
        <StatCard 
          icon={Users} 
          label="Total Students" 
          value={data.stats.totalStudents} 
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <StatCard 
          icon={Calendar} 
          label="Upcoming Events" 
          value={data.events.length} 
          color="bg-purple-50 text-purple-600 border-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Classes */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-end border-b border-gray-100 pb-3">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              My Classes
            </h2>
            <Link href="/dashboard/teacher/classes" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.classes.slice(0, 4).map((cls) => (
              <div key={cls.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      {cls.subject}
                    </div>
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                   <Link 
                     href={`/dashboard/teacher/attendance/${cls.id}?courseId=${cls.courseId}`}
                     className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 bg-gray-50 hover:bg-white hover:border-gray-300 border border-transparent rounded-lg text-gray-700 transition-all shadow-sm"
                   >
                     <CheckCircle2 className="w-4 h-4" /> Attendance
                   </Link>
                   
                   <Link 
                     href={`/dashboard/teacher/results/${cls.id}?courseId=${cls.courseId}`}
                     className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm shadow-indigo-200"
                   >
                     <FileText className="w-4 h-4" /> Results
                   </Link>
                </div>
              </div>
            ))}
            
            {data.classes.length === 0 && (
               <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                 <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                 </div>
                 <h3 className="font-semibold text-gray-900">No classes assigned</h3>
                 {/* Escaped single quote */}
                 <p className="text-sm text-gray-500 mt-1 max-w-xs">You haven&apos;t been assigned to any subjects yet. Contact the administrator.</p>
               </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Upcoming Events
            </h3>
            
            <div className="space-y-5">
              {data.events.length > 0 ? data.events.map((event) => (
                <div key={event.id} className="flex gap-4 items-start group">
                  {/* Replaced min-w-[3.5rem] with min-w-14 */}
                  <div className="bg-orange-50 text-orange-600 px-3 py-2 rounded-lg text-center min-w-14 border border-orange-100 group-hover:bg-orange-100 transition-colors">
                    <span className="block text-xs font-bold uppercase tracking-wider">{format(new Date(event.startTime), 'MMM')}</span>
                    <span className="block text-xl font-bold leading-none mt-0.5">{format(new Date(event.startTime), 'dd')}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {event.description || "No additional details."}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                   <p className="text-sm text-gray-400 italic">No upcoming events.</p>
                </div>
              )}
            </div>
            
            {data.events.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link href="/dashboard/events" className="text-xs font-semibold text-center block text-gray-500 hover:text-indigo-600 transition-colors">
                  View Full Calendar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Typed Helper Component
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className={`bg-white p-5 rounded-xl border shadow-sm flex items-center gap-5 ${color.replace('bg-', 'border-').split(' ')[2] || 'border-gray-100'}`}>
      <div className={`p-3.5 rounded-xl ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-0.5">{label}</p>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
