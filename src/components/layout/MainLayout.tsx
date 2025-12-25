'use client';

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import type { SchoolConfig } from '@prisma/client';

type MainLayoutProps = {
  children: React.ReactNode;
  schoolConfig?: Pick<
    SchoolConfig,
    'schoolName' | 'schoolType' | 'academicYear' | 'offersNursery' | 'offersPrimary' | 'offersSecondary'
  > | null;
};

export default function MainLayout({ children, schoolConfig }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // Root container
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Pass the toggle function to Header.
         This allows the "Hamburger" icon inside Header to open the Sidebar.
      */}
      <Header 
        schoolConfig={schoolConfig} 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />

      {/* Content Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Desktop sidebar - Hidden on mobile, sticky on desktop */}
        <div className="hidden md:block h-[calc(100vh-64px)] sticky top-16 shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay - Only visible when isSidebarOpen is true */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Slide-in Sidebar */}
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-300">
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
               {children}
            </div>
        </main>
      </div>
    </div>
  );
}
