'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, Pencil, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import EditEventModal from './EditEventModal'; // Ensure you created this from the previous step

export default function EventActions({ event }: { event: any }) {
  const router = useRouter();
  
  // State for modals
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // State for loading
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      
      if (!res.ok) throw new Error("Failed");
      
      toast.success("Event removed successfully");
      router.refresh(); // Removes card from UI
      setIsDeleteModalOpen(false); // Close modal
    } catch (error) {
      toast.error("Could not delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* 1. The Action Buttons (Pill Design) */}
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors">
        <button 
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
          title="Edit Event"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        
        <div className="w-px h-3 bg-slate-200" /> {/* Vertical Divider */}

        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Delete Event"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. The Edit Modal (Logic from previous step) */}
      {isEditing && (
        <EditEventModal event={event} onClose={() => setIsEditing(false)} />
      )}

      {/* 3. The Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)} 
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                Delete this Event?
              </h3>
              
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800">{event.title}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>

            {/* Decorative bottom bar */}
            <div className="h-1.5 w-full bg-slate-100">
                <div className="h-full bg-red-500 w-full animate-pulse" style={{ width: isDeleting ? '100%' : '0%', transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
