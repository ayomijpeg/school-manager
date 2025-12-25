'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constant';
import {
  LayoutDashboard,
  Layers,
  School,
  BookOpen,
  GraduationCap,
  Users,
  UserCircle,
  Calendar,
  FileText,
  Receipt,
  ClipboardCheck,
  Award,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Building2,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- NAV ITEM COMPONENT (With High Contrast Logic) ---
type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  pathname: string | null;
  onClose?: () => void;
};

const NavItem = ({ href, label, icon: Icon, pathname, onClose }: NavItemProps) => {
  const isActive = pathname === href || (pathname?.startsWith(href) && href !== ROUTES.DASHBOARD);

  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-1 transition-all group relative overflow-hidden",
        isActive 
          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-medium shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-500/20" 
          // INACTIVE STATE: Use brighter text (slate-300) on hover for better visibility
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 dark:bg-emerald-400 rounded-l-xl" />}
      
      <Icon className={cn("w-5 h-5 transition-colors", 
        isActive 
          ? "text-emerald-700 dark:text-emerald-400" 
          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
      )} />
      <span className="text-sm">{label}</span>
      
      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-400 dark:text-emerald-400" />}
    </Link>
  );
};

const SectionHeader = ({ label }: { label: string }) => (
  <div className="mt-6 mb-2 px-4">
    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
      {label}
    </h3>
  </div>
);

// --- MAIN SIDEBAR ---
type SidebarProps = {
  onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  // --- MENU CONFIGURATION ---
  const adminLinks = [
    { href: ROUTES.LEVELS || '/dashboard/levels', label: 'Levels', icon: Layers },
    { href: ROUTES.CLASSES || '/dashboard/classes', label: 'Classes', icon: School },
    { href: ROUTES.COURSES || '/dashboard/courses', label: 'Courses', icon: BookOpen },
    { href: ROUTES.STUDENTS || '/dashboard/students', label: 'Students', icon: GraduationCap },
    { href: ROUTES.TEACHERS || '/dashboard/teachers', label: 'Teachers', icon: Users },
    { href: ROUTES.PARENTS || '/dashboard/parents', label: 'Parents', icon: UserCircle },
    { href: ROUTES.EVENTS || '/dashboard/events', label: 'Events', icon: Calendar },
  ];
  
  const financeLinks = [
    { href: ROUTES.FINANCE || '/dashboard/finance', label: 'Invoices', icon: Receipt }
  ];
  
  const teacherLinks = [
    { href: '/dashboard/my-classes', label: 'My Classes', icon: School },
    { href: ROUTES.ATTENDANCE || '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: ROUTES.RESULTS || '/dashboard/results', label: 'Results Entry', icon: FileText },
  ];
  
  const studentParentLinks = [
    ...(user?.role === 'PARENT' ? [{ href: '/dashboard/children', label: 'My Children', icon: GraduationCap }] : []),
    { href: ROUTES.TIMETABLE || '/dashboard/timetable', label: 'Timetable', icon: Calendar },
    { href: ROUTES.RESULTS || '/dashboard/results', label: 'Results', icon: Award },
    { href: ROUTES.BILLING || '/dashboard/billing', label: 'Invoices', icon: Receipt },
  ];

  if (isLoading) return <aside className="w-64 bg-slate-900 border-r border-slate-800 h-full animate-pulse" />;
  if (!user) return null;

  return (
    // CHANGE: Use 'bg-white dark:bg-[#0f172a]' for high contrast dark mode
    <aside className="w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 h-full flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
        <Link href={ROUTES.DASHBOARD} onClick={onClose} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-slate-900 dark:bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg leading-tight text-slate-900 dark:text-slate-50">Yosola</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider">Manager</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        <NavItem href={ROUTES.DASHBOARD} label="Dashboard" icon={LayoutDashboard} pathname={pathname} onClose={onClose} />

        {user.role === 'ADMIN' && (
          <>
            <SectionHeader label="Academic" />
            {adminLinks.map(link => <NavItem key={link.href} {...link} pathname={pathname} onClose={onClose} />)}
            <SectionHeader label="Financial" />
            {financeLinks.map(link => <NavItem key={link.href} {...link} pathname={pathname} onClose={onClose} />)}
          </>
        )}
        
        {user.role === 'TEACHER' && (
          <>
              <SectionHeader label="Workspace" />
              {teacherLinks.map((link) => (
                <NavItem key={`${link.label}-${link.href}`} {...link} pathname={pathname} onClose={onClose} />
              ))}
          </>
        )}

        {(user.role === 'STUDENT' || user.role === 'PARENT') && (
          <>
            <SectionHeader label="Student Portal" />
            {studentParentLinks.map((link) => (
              <NavItem key={`${link.label}-${link.href}`} {...link} pathname={pathname} onClose={onClose} />
            ))}
          </>
        )}

        <div className="my-4 h-px bg-slate-100 dark:bg-slate-800 mx-2" />
        
        {user.role === 'ADMIN' && <NavItem href={ROUTES.SETTINGS || '/dashboard/settings'} label="System Settings" icon={Settings} pathname={pathname} onClose={onClose} />}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 font-serif font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user.email.split('@')[0]}
            </p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {user.role}
            </p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 transition-all text-xs font-semibold">
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
