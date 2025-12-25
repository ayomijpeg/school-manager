import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Wallet, AlertCircle, CheckCircle2, LucideIcon, Search, ClipboardCheck } from 'lucide-react';
import InvoiceGenerator from '@/components/finance/InvoiceGenerator';
import InvoiceList from '@/components/finance/InvoiceList'; 
import PaymentSettingsModal from '@/components/finance/PaymentSettingsModal';
import TablePagination from '@/components/ui/TablePagination'; 
import { formatCurrency } from '@/lib/utils';

// Define Props for SearchParams (Next.js 15 Standard)
type SearchParams = Promise<{ page?: string; query?: string }>;

interface PaymentSettingsModalProps {
  initialConfig?: any; 
}

export default async function FinancePage({ searchParams }: { searchParams: SearchParams }) {
  // 1. Parse URL Params
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const query = params.query || '';
  const ITEMS_PER_PAGE = 10;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // 2. Build Filter
  const whereCondition = query ? {
    OR: [
      { student: { fullName: { contains: query, mode: 'insensitive' as const } } },
      { invoiceNumber: { contains: query, mode: 'insensitive' as const } }
    ]
  } : {};

  // 3. Fetch Data in Parallel (Added Pending Payments Count)
  const [rawInvoices, totalCount, stats, levels, config, pendingCount] = await Promise.all([
    // A. Fetch Paginated Invoices
    prisma.invoice.findMany({
        where: whereCondition,
        take: ITEMS_PER_PAGE,
        skip: skip,
        orderBy: { issueDate: 'desc' },
        include: { 
            student: { include: { level: true } } 
        }
    }),
    // B. Count Total Invoices
    prisma.invoice.count({ where: whereCondition }),
    // C. Get Stats
    prisma.invoice.aggregate({
        _sum: { totalAmount: true, amountPaid: true }
    }),
    // D. Dropdown Data
    prisma.level.findMany({ orderBy: { name: 'asc' } }),
    prisma.schoolConfig.findFirst(),
    // E. NEW: Count Pending Payments for the Badge
    prisma.payment.count({ where: { status: 'PENDING' } })
  ]);

  // 4. Safe Data Conversion
  const invoices = rawInvoices.map(inv => ({
      ...inv,
      totalAmount: Number(inv.totalAmount),
      amountPaid: Number(inv.amountPaid)
  }));

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const totalBilled = Number(stats._sum.totalAmount || 0);
  const totalCollected = Number(stats._sum.amountPaid || 0);
  const totalPending = totalBilled - totalCollected;

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Finance Ledger</h1>
          <p className="text-slate-500 mt-1">Track revenue, manage billing, and verify payments.</p>
        </div>
        
        <div className="flex items-center gap-3">
           {/* NEW: Verify Payments Button with Badge */}
           <Link 
             href="/dashboard/finance/verification"
             className="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
           >
             <ClipboardCheck size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
             Verify Claims
             {pendingCount > 0 && (
               <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                 {pendingCount}
               </span>
             )}
           </Link>

           <PaymentSettingsModal initialConfig={config} /> 
           <InvoiceGenerator levels={levels} />
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <StatCard label="Total Expected" value={totalBilled} icon={Wallet} color="blue" />
         <StatCard label="Total Collected" value={totalCollected} icon={CheckCircle2} color="emerald" />
         <StatCard label="Pending / Overdue" value={totalPending} icon={AlertCircle} color="amber" />
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <form className="relative max-w-md">
           <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
           <input 
             name="query"
             defaultValue={query}
             placeholder="Search by student name or invoice #..."
             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm"
           />
        </form>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
         <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700 font-serif">Invoice History</h3>
            <span className="text-xs text-slate-400">
                Showing {invoices.length} of {totalCount} records
            </span>
         </div>
         
         {invoices.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <p>No invoices found matching your criteria.</p>
            </div>
         ) : (
             <InvoiceList initialInvoices={invoices} />
         )}

         {/* PAGINATION CONTROLS */}
         <div className="p-4 border-t border-slate-100">
            <TablePagination totalPages={totalPages} currentPage={currentPage} />
         </div>
      </div>

    </div>
  );
}

// ... StatCard Component (Unchanged)
interface StatCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    color: 'blue' | 'emerald' | 'amber';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700'
    };
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-mono font-bold text-slate-900">{formatCurrency(value)}</p>
            </div>
            <div className={`p-3 rounded-xl ${colors[color]}`}>
                <Icon size={24} />
            </div>
        </div>
    )
}
