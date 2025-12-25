'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-lg transition-colors relative",
          isOpen 
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
      >
        <Bell size={20} />
      </button>

      {/* Popover Content */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Visual Icon */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            {/* Text Content */}
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Notifications are coming!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We&apos;re building a real-time notification system to keep you updated on invoices, results, and events.
              </p>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="mt-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full"
            >
              Got it
            </button>
          </div>

          {/* Footer Decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-2xl opacity-80" />
        </div>
      )}
    </div>
  );
}
