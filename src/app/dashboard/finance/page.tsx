export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wallet, AlertCircle, CheckCircle2, Search, ClipboardCheck, Printer, Receipt, ShieldCheck } from 'lucide-react';
import InvoiceGenerator from '@/components/finance/InvoiceGenerator';
import InvoiceList from '@/components/finance/InvoiceList';
import PaymentSettingsModal from '@/components/finance/PaymentSettingsModal';
import TablePagination from '@/components/ui/TablePagination';
import RefreshButton from '@/components/ui/RefreshButton';
import { formatCurrency } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import type { LucideIcon } from 'lucide-react';

type SearchParams = Promise<{ page?: string; query?: string }>;

export default async function FinancePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
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

  // 3. Fetch Data in Parallel
  // FIXED: Changed pendingClaimCount to pendingCount to match JSX usage
  const [rawInvoices, totalCount, stats, levels, config, pendingCount] = await Promise.all([
    prisma.invoice.findMany({
        where: whereCondition,
        take: ITEMS_PER_PAGE,
        skip: skip,
        orderBy: { issueDate: 'desc' },
        include: { 
            student: { include: { level: true } } 
        }
    }),
    prisma.invoice.count({ where: whereCondition }),
    prisma.invoice.aggregate({
        where: { status: { not: 'CANCELLED' } }, // Syncs with Dashboard
        _sum: { totalAmount: true, amountPaid: true }
    }),
    prisma.level.findMany({ orderBy: { name: 'asc' } }),
    prisma.schoolConfig.findFirst(),
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
  
  // FIXED: Removed the duplicate totalPending declaration line
  const totalPending = totalBilled - totalCollected; 

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      
      {/* HEADER */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 tracking-tight">Finance Ledger</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track school revenue, manage fee billing, and monitor collections across all levels.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap lg:flex-nowrap">
            <RefreshButton />
            <PaymentSettingsModal initialConfig={config} /> 
            <InvoiceGenerator levels={levels} />
          </div>
        </div>

        {/* FINANCIAL QUICK ACTIONS BAR */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-3 border-t border-slate-100">
          <Link 
            href="/dashboard/finance/defaulters"
            className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] group"
          >
            <AlertCircle size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Fee Debtors</span>
          </Link>

          <Link 
            href="/dashboard/finance/exam-passes"
            className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] group"
          >
            <ShieldCheck size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Exam Passes</span>
          </Link>

          <Link 
            href="/dashboard/finance/verification"
            className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] group"
          >
            <ClipboardCheck size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            <span>Verify Claims</span>
            {pendingCount > 0 && (
              <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link 
            href={`/dashboard/finance/print?query=${query}`} 
            target="_blank" 
            className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs sm:text-sm hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] sm:ml-auto"
          >
            <Printer size={16} />
            <span>Print List</span>
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[480px]">
         <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700 font-serif">Invoice History</h3>
            <span className="text-xs text-slate-400">
                Showing {invoices.length} of {totalCount} records
            </span>
         </div>
         
         {invoices.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No invoices found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2 text-center">
                {query ? `No invoices match "${query}". Try a different search.` : 'Create your first invoice using the "Create Invoice" button above.'}
              </p>
            </div>
         ) : (
             <InvoiceList initialInvoices={invoices} />
         )}

         <div className="p-4 border-t border-slate-100 mt-auto">
            <TablePagination totalPages={totalPages} currentPage={currentPage} />
         </div>
      </div>

    </div>
  );
}

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
