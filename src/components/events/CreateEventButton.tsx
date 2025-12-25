'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateEventButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: 'GENERAL',
    audience: 'ALL'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Combine Date + Time into ISO Strings
    const startISO = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const endISO = new Date(`${formData.date}T${formData.endTime}`).toISOString();

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            startTime: startISO,
            endTime: endISO
        })
      });

      if (!res.ok) throw new Error("Failed");
      
      toast.success("Event scheduled successfully");
      setIsOpen(false);
      setFormData({ title: '', description: '', date: '', startTime: '', endTime: '', location: '', category: 'GENERAL', audience: 'ALL' }); // Reset
      router.refresh();
    } catch (error) {
      toast.error("Could not schedule event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 text-white rounded-full text-sm font-medium hover:bg-emerald-900 shadow-lg shadow-emerald-900/20 transition-all"
      >
        <Plus className="w-4 h-4" /> Schedule Event
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-serif font-bold text-lg text-slate-800">New School Event</h2>
                <button onClick={() => setIsOpen(false)} aria-label="Close modal">
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600"/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Title & Category */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label htmlFor="event-title" className="text-xs font-bold text-slate-500 uppercase block mb-1">Event Title</label>
                        <input 
                            id="event-title"
                            required 
                            className="w-full border rounded-lg p-2.5 bg-slate-50" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            placeholder="e.g. Sports Day" 
                        />
                    </div>
                    <div>
                        <label htmlFor="event-category" className="text-xs font-bold text-slate-500 uppercase block mb-1">Type</label>
                        <select 
                            id="event-category"
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

                {/* Timing */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="event-date" className="text-xs font-bold text-slate-500 uppercase block mb-1">Date</label>
                        <input 
                            id="event-date"
                            required 
                            type="date" 
                            className="w-full border rounded-lg p-2.5 bg-slate-50 text-sm"
                            value={formData.date} 
                            onChange={e => setFormData({...formData, date: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label htmlFor="event-start" className="text-xs font-bold text-slate-500 uppercase block mb-1">Start</label>
                        <input 
                            id="event-start"
                            required 
                            type="time" 
                            className="w-full border rounded-lg p-2.5 bg-slate-50 text-sm"
                            value={formData.startTime} 
                            onChange={e => setFormData({...formData, startTime: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label htmlFor="event-end" className="text-xs font-bold text-slate-500 uppercase block mb-1">End</label>
                        <input 
                            id="event-end"
                            required 
                            type="time" 
                            className="w-full border rounded-lg p-2.5 bg-slate-50 text-sm"
                            value={formData.endTime} 
                            onChange={e => setFormData({...formData, endTime: e.target.value})} 
                        />
                    </div>
                </div>

                {/* Location & Audience */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label htmlFor="event-location" className="text-xs font-bold text-slate-500 uppercase block mb-1">Location</label>
                         <input 
                            id="event-location"
                            className="w-full border rounded-lg p-2.5 bg-slate-50" 
                            value={formData.location} 
                            onChange={e => setFormData({...formData, location: e.target.value})} 
                            placeholder="e.g. Main Hall" 
                        />
                    </div>
                    <div>
                        <label htmlFor="event-audience" className="text-xs font-bold text-slate-500 uppercase block mb-1">Who sees this?</label>
                        <select 
                            id="event-audience"
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

                {/* Description */}
                <div>
                     <label htmlFor="event-description" className="text-xs font-bold text-slate-500 uppercase block mb-1">Description (Optional)</label>
                     <textarea 
                        id="event-description"
                        className="w-full border rounded-lg p-2.5 bg-slate-50 h-20 text-sm" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        placeholder="Details about the event..." 
                    />
                </div>

                <div className="pt-2">
                    <button disabled={isLoading} className="w-full bg-emerald-800 text-white rounded-xl py-3 font-medium hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                        Publish Event
                    </button>
                </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
