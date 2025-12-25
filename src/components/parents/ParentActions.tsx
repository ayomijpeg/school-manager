'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2, FileText, Loader2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ParentActions({ parentId, parentName }: { parentId: string, parentName: string }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX - 140 });
    }
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const close = () => setIsMenuOpen(false);
    window.addEventListener('scroll', close);
    return () => window.removeEventListener('scroll', close);
  }, []);

  // DELETE LOGIC
  const handleArchive = async () => {
    setIsDeleting(true);
    try {
      // Matches your route: src/app/api/parents/[id]/route.ts
      const res = await fetch(`/api/parents/${parentId}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to archive");
      }

      toast.success("Parent account archived successfully");
      router.refresh();
      setShowDeleteModal(false);
    } catch (error: any) {
      toast.error(error.message || "Could not archive parent");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* TRIGGER */}
      <button 
        ref={buttonRef}
        onClick={toggleMenu}
        className={`p-2 rounded-lg transition-all ${isMenuOpen ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'}`}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {/* DROPDOWN */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          <div 
            className="fixed z-50 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button 
              onClick={() => router.push(`/dashboard/parents/edit/${parentId}`)}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
            <button 
              onClick={() => router.push(`/dashboard/parents/${parentId}`)}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> View Details
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
            <button 
              onClick={() => { setIsMenuOpen(false); setShowDeleteModal(true); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Archive Account
            </button>
          </div>
        </>
      )}

      {/* MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)} />
          
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-2">Archive Guardian Account?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                You are about to archive <strong>{parentName}</strong>. This will revoke their portal access.
              </p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleArchive}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
