import { prisma } from '@/lib/prisma';
import { CalendarDays, MapPin, Clock, Users } from 'lucide-react';
import CreateEventButton from '@/components/events/CreateEventButton';
import EventActions from '@/components/events/EventActions'; // New Import
import { format } from 'date-fns'; 

async function getEvents() {
  const events = await prisma.event.findMany({
    // Removed strict future filter so you can see today's events easily during demo
    orderBy: { startTime: 'asc' }
  });
  return events;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 min-h-screen">
      
      {/* HEADER */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 tracking-tight">School Agenda</h1>
          <p className="text-slate-500 mt-1">Upcoming academic and social activities.</p>
        </div>
        <CreateEventButton />
      </div>

      {/* THE TIMELINE */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        
        {events.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed relative z-10">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No upcoming events scheduled.</p>
           </div>
        ) : (
           events.map((event) => (
             <EventCard key={event.id} event={event} />
           ))
        )}

      </div>
    </div>
  );
}

// --- SUB-COMPONENT: THE EVENT CARD ---
function EventCard({ event }: { event: any }) {
  const isToday = new Date(event.startTime).toDateString() === new Date().toDateString();
  
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      
      {/* TIMELINE DOT */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#FDFDFC] bg-slate-200 group-hover:bg-emerald-500 transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
          {isToday && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-pulse" />}
      </div>
      
      {/* CONTENT CARD */}
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-emerald-200 transition-all relative">
        
        {/* DELETE BUTTON (Top Right) */}
        <div className="absolute top-4 right-4 z-20">
           <EventActions event={event} />
        </div>
        
        {/* Date Header */}
        <div className="flex items-center justify-between mb-3 pr-8">
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                event.category === 'ACADEMIC' ? 'bg-indigo-50 text-indigo-700' : 
                event.category === 'SPORTS' ? 'bg-orange-50 text-orange-700' :
                'bg-slate-100 text-slate-600'
            }`}>
                {event.category}
            </span>
        </div>

        <h3 className="font-serif text-lg font-bold text-slate-900 mb-1 pr-6">
            {event.title}
        </h3>
        
        {event.description && (
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {event.description}
            </p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{format(new Date(event.startTime), 'MMM d, yyyy')}</span>
             </div>
             <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{format(new Date(event.startTime), 'h:mm a')}</span>
             </div>
             {event.location && (
                <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{event.location}</span>
                </div>
             )}
             <div className="flex items-center gap-2 col-span-2 text-slate-400 mt-1">
                <Users className="w-3 h-3" />
                <span>Visible to: {event.audience === 'ALL' ? 'Everyone' : event.audience}</span>
             </div>
        </div>

      </div>
    </div>
  );
}
