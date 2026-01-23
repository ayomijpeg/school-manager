import TeacherTimetable from '@/components/teachers/TeacherTimetable';
import { CalendarRange } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TimetablePage() {
  // Simple Auth Check (Middleware usually handles this, but safety first)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token || !(await verifyJwt(token))) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <CalendarRange className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-500">View your weekly class assignments and venues.</p>
        </div>
      </div>

      <TeacherTimetable />
    </div>
  );
}
