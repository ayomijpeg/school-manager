// src/components/dashboard/TeacherDashboard.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { BookOpen, Edit, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
// TODO: Import teacherApi, useDataFetch

const TeacherDashboard = () => {
  // TODO: Fetch teacher's assigned classes using useDataFetch(() => teacherApi.getMyClasses())
  const assignedClasses = [ // Placeholder data
    { classId: '1', courseId: 'course-math-1', className: 'JSS 1A', courseName: 'Mathematics', studentCount: 35 },
    { classId: '2', courseId: 'course-math-2', className: 'JSS 1B', courseName: 'Mathematics', studentCount: 32 },
    { classId: '3', courseId: 'course-phy-1', className: 'SS 2 Science', courseName: 'Physics', studentCount: 28 },
  ];

  return (
    <div>
      <h2 className="text-h2 font-semibold text-gray-800 mb-6">My Classes & Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedClasses.map((item) => (
          <Card key={item.classId + item.courseName} padding="md" hover>
            {/* TODO: Add Card Content - Class/Course Name, Student Count */}
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                   <BookOpen className="w-5 h-5 text-indigo-600"/>
               </div>
               <div>
                  <h3 className="text-h5 font-semibold text-gray-900">{item.className}</h3>
                  <p className="text-sm text-gray-600">{item.courseName}</p>
               </div>
           </div>
           <p className="text-sm text-gray-500 mb-4">{item.studentCount} Students</p>
            {/* --- Buttons --- */}
            <div className="flex gap-2">
              {/* Attendance Link */}
              <Link href={`/dashboard/teacher/attendance/${item.classId}?courseId=${item.courseId}`}>
                <Button size="sm" variant="primary" icon={CalendarCheck}>Take Attendance</Button>
              </Link>
              {/* Results Link */}
              <Link href={`/dashboard/teacher/results/enter?classId=${item.classId}&courseId=${item.courseId}`}>
                <Button size="sm" variant="secondary" icon={Edit}>Enter Results</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
      {/* TODO: Add sections for Upcoming Events, Notifications */}
    </div>
  );
}; // <-- Ensure this closing brace exists

export default TeacherDashboard; // <-- Ensure this is the last line
