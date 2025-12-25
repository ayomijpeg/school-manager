'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  School,
  Menu // Added Menu icon
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { getInitials } from '@/lib/utils';
import { ROUTES } from '@/lib/constant';
import type { SchoolConfig } from '@prisma/client';
import NotificationPopover from '@/components/notification/NotificationPopover';

type HeaderProps = {
  schoolConfig?: Pick<
    SchoolConfig,
    'schoolName' | 'schoolType' | 'academicYear'
  > | null;
  onMenuClick: () => void; // New prop for mobile toggle
};

export default function Header({ schoolConfig, onMenuClick }: HeaderProps) {
  const { user, logout, isLoading } = useAuth();
  const { isAdmin } = useUser();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const handleProfileClick = () => {
    router.push(ROUTES.SETTINGS); 
    setShowUserMenu(false);
  };

  const handleSettingsClick = () => {
    router.push(ROUTES.SETTINGS);
    setShowUserMenu(false);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalQuery.trim()) {
      router.push(`/dashboard/students?search=${encodeURIComponent(globalQuery)}`);
      setShowUserMenu(false);
    }
  };

  const userEmail = user?.email ?? '';
  const userRole = user?.role ?? '';
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName}` : (userEmail.split('@')[0] || 'User');
  const userInitials = isLoading ? '?' : getInitials(userEmail) || 'U';
  const typeLabel = schoolConfig?.schoolType === 'TERTIARY' ? 'Higher Ed.' : 'Basic Ed.';

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* LEFT: Mobile Toggle + Active School Info */}
      <div className="flex items-center gap-3 min-w-0">
        
        {/* Mobile Toggle Button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hidden md:block">
            <School className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        </div>
        {schoolConfig ? (
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px] md:max-w-[200px] leading-tight">
              {schoolConfig.schoolName}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide hidden sm:inline-block">
                {typeLabel}
              </span>
              <span>{schoolConfig.academicYear}</span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400 italic">No school configured</span>
        )}
      </div>

      {/* CENTER: Search Bar */}
      <div className="flex-1 max-w-sm mx-6 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search students... (Press Enter)"
            className="w-full pl-9 pr-4 py-2 h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-1 md:gap-2">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Component */}
        <NotificationPopover />

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userInitials}
            </div>
            <div className="hidden md:block text-left mr-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none mb-0.5">
                    {isLoading ? '...' : displayName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                    {isLoading ? '...' : userRole}
                </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 md:hidden">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{userEmail}</p>
                  <p className="text-xs text-slate-500">{userRole}</p>
                </div>

                <div className="p-1">
                    <button onClick={handleProfileClick} className="w-full px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors">
                      <User size={16} /> My Account
                    </button>

                    {isAdmin && (
                      <button onClick={handleSettingsClick} className="w-full px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors">
                        <Settings size={16} /> System Settings
                      </button>
                    )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                <div className="p-1">
                    <button onClick={handleLogout} className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center gap-3 transition-colors">
                      <LogOut size={16} /> Sign Out
                    </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
