'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// 1. Strict Type Definition
interface SchoolEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: Date | string;
  endTime: Date | string;
  location: string | null;
  category: string;
  audience: string;
}

interface EditEventModalProps {
  event: SchoolEvent;
  onClose: () => void;
}

export default function EditEventModal({ event, onClose }: EditEventModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Parse existing dates safely
  const startDateObj = new Date(event.startTime);
  const endDateObj = new Date(event.endTime);

  // Format for inputs: "YYYY-MM-DD" and "HH:mm"
  const defaultDate = startDateObj.toISOString().split('T')[0];
  const defaultStart = startDateObj.toTimeString().substring(0,5);
  const defaultEnd = endDateObj.toTimeString().substring(0,5);

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    date: defaultDate,
    startTime: defaultStart,
    endTime: defaultEnd,
    location: event.location || '',
    category: event.category,
    audience: event.audience
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const startISO = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const endISO = new Date(`${formData.date}T${formData.endTime}`).toISOString();

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            startTime: startISO,
            endTime: endISO
        })
      });

      if (!res.ok) throw new Error("Failed");
      
      toast.success("Event updated");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-serif font-bold text-lg text-slate-800">Edit Event</h2>
            {/* FIXED: Added aria-label for Accessibility */}
            <button onClick={onClose} aria-label="Close modal">
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600"/>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label htmlFor="edit-title" className="text-xs font-bold text-slate-500 uppercase block mb-1">Event Title</label>
                    <input 
                        id="edit-title"
                        required 
                        className="w-full border rounded-lg p-2.5 bg-slate-50" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                </div>
                <div>
                    <label htmlFor="edit-category" className="text-xs font-bold text-slate-500 uppercase block mb-1">Type</label>
                    <select 
                        id="edit-category"
                        className="w-full border rounded-lg p-2.5 bg-slate-50 text-sm"
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="GENERAL">General</option>
                        <option value="ACADEMIC">Academic</option>
                        <option value="SPORTS">Sports</option>
                        <option value="HOLIDAY">Holiday</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="edit-date" className="text-xs font-bold text-slate-500 uppercase block mb-1">Date</label>
                    <input 
                        id="edit-date"
                        required 
                        type="date" 
                        className="w-full border rounded-lg p-2.5 bg-slate-50 text-sm"
                        value={formData.date} 
                        onChange={e => setFormData({...formData, date: e.target.value})} 
                    />
                </div>
                <div>
                    <label htmlFor="edit-start" className="text-xs font-bold text-slate-500 uppercase block mb-1">Start</label>
                    <input 
                        id="edit-start"
                        required 
                        type="time" 
                        className="w-full border rounded-lg p-2.5 bg-slate-50 text-sm"
                        value={formData.startTime} 
                        onChange={e => setFormData({...formData, startTime: e.target.value})} 
                    />
                </div>
                <div>
                    <label htmlFor="edit-end" className="text-xs font-bold text-slate-500 uppercase block mb-1">End</label>
                    <input 
                        id="edit-end"
                        required 
                        type="time" 
                        className="w-full border rounded-lg p-2.5 bg-slate-50 text-sm"
                        value={formData.endTime} 
                        onChange={e => setFormData({...formData, endTime: e.target.value})} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label htmlFor="edit-location" className="text-xs font-bold text-slate-500 uppercase block mb-1">Location</label>
                     <input 
                        id="edit-location"
                        className="w-full border rounded-lg p-2.5 bg-slate-50" 
                        value={formData.location} 
                        onChange={e => setFormData({...formData, location: e.target.value})} 
                    />
                </div>
                <div>
                    <label htmlFor="edit-audience" className="text-xs font-bold text-slate-500 uppercase block mb-1">Audience</label>
                    <select 
                        id="edit-audience"
                        className="w-full border rounded-lg p-2.5 bg-slate-50 text-sm"
                        value={formData.audience} 
                        onChange={e => setFormData({...formData, audience: e.target.value})}
                    >
                        <option value="ALL">Everyone</option>
                        <option value="STUDENTS">Students Only</option>
                        <option value="PARENTS">Parents Only</option>
                        <option value="TEACHERS">Teachers Only</option>
                    </select>
                </div>
            </div>

            <div>
                 <label htmlFor="edit-description" className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                 <textarea 
                    id="edit-description"
                    className="w-full border rounded-lg p-2.5 bg-slate-50 h-20 text-sm" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                />
            </div>

            <div className="pt-2 flex gap-3">
                <button type="button" onClick={onClose} className="px-4 text-slate-500 font-medium">Cancel</button>
                <button disabled={isLoading} className="flex-1 bg-emerald-800 text-white rounded-xl py-3 font-medium hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
