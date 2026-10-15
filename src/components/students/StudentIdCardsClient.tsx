'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Printer,
  CheckSquare,
  Square,
  IdCard,
  Info,
  Check,
  X,
  Sparkles,
  Scissors,
  Eye,
} from 'lucide-react';
import StudentPhotoUpload from './StudentPhotoUpload';

interface StudentData {
  id: string;
  fullName: string;
  matricNumber: string | null;
  photoUrl: string | null;
  contactPhone: string | null;
  level: {
    name: string;
  } | null;
  parents: Array<{
    parent: {
      contactPhone: string | null;
    } | null;
  }>;
}

interface StudentIdCardsClientProps {
  students: StudentData[];
  schoolName: string;
  academicYear: string;
  schoolMotto: string;
  initialStudentId?: string;
  initialAutoPrint?: boolean;
}

export default function StudentIdCardsClient({
  students,
  schoolName,
  academicYear,
  schoolMotto,
  initialStudentId,
  initialAutoPrint,
}: StudentIdCardsClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (initialStudentId) {
      return new Set([initialStudentId]);
    }
    return new Set();
  });
  const [singlePrintId, setSinglePrintId] = useState<string | null>(null);
  const [showPrintTips, setShowPrintTips] = useState(false);

  // Auto-print single student if requested via query param
  useEffect(() => {
    if (initialAutoPrint && initialStudentId) {
      setSinglePrintId(initialStudentId);
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialAutoPrint, initialStudentId]);

  // Clean up single-print state after printing
  useEffect(() => {
    const handleAfterPrint = () => {
      setSinglePrintId(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const toggleSelectStudent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(students.map((s) => s.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const printAllCards = () => {
    setSinglePrintId(null);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const printSelectedCards = () => {
    if (selectedIds.size === 0) return;
    setSinglePrintId(null);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const printSingleStudent = (id: string) => {
    setSinglePrintId(id);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const allSelected = students.length > 0 && selectedIds.size === students.length;
  const isPrintingSelection = selectedIds.size > 0 && singlePrintId === null;

  return (
    <div>
      {/* SCREEN CONTROLS BAR (Hidden in print) */}
      <div className="print:hidden space-y-4 mb-6">
        {/* ACTION BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* SELECTION STATS & ACTIONS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={allSelected ? clearSelection : selectAll}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              {allSelected ? (
                <>
                  <CheckSquare size={16} className="text-emerald-700" /> Deselect All
                </>
              ) : (
                <>
                  <Square size={16} className="text-slate-400" /> Select All ({students.length})
                </>
              )}
            </button>

            {selectedIds.size > 0 && (
              <>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Clear ({selectedIds.size})
                </button>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedIds.size} student{selectedIds.size === 1 ? '' : 's'} selected
                </span>
              </>
            )}
          </div>

          {/* PRINT BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrintTips(!showPrintTips)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Info size={14} className="text-amber-500" />
              <span>Print Guide & Tips</span>
            </button>

            {selectedIds.size > 0 ? (
              <button
                type="button"
                onClick={printSelectedCards}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all animate-pulse"
              >
                <Printer size={16} />
                <span>Print Selected ({selectedIds.size})</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={printAllCards}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
            >
              <Printer size={16} />
              <span>Print All Cards ({students.length})</span>
            </button>
          </div>
        </div>

        {/* PRINT GUIDE & QUALITY ACCURACY BANNER */}
        {showPrintTips && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <Scissors size={14} className="text-amber-700" />
                How ID cards are sized & how prints will come out:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800/90 pl-1">
                <li>
                  <strong>Multiple Cards (8 per A4 sheet):</strong> Arranged in 2 neat columns with dashed cut lines. Perfect for standard paper or card stock to laminate.
                </li>
                <li>
                  <strong>Single Card:</strong> Prints 1 standard card (85.6mm × 54mm) without stretching, ready for PVC card tray or single badge pouch.
                </li>
                <li>
                  <strong>Browser Print Settings:</strong> In the print preview, check{' '}
                  <span className="font-bold underline">"Background graphics"</span> and set{' '}
                  <span className="font-bold underline">Margins to "None" or "Minimum"</span> for sharp colors and exact fit.
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowPrintTips(false)}
              className="text-amber-700 hover:text-amber-900 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* PRINT STYLES EMBEDDED */}
      <style jsx global>{`
        @media print {
          /* Page setup for standard A4 ID card sheets */
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          /* General hide */
          .screen-only,
          .no-print,
          header,
          nav,
          aside,
          button,
          input[type='checkbox'] {
            display: none !important;
          }

          body {
            background: white !important;
            color: #000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Multi-card grid print (8 cards per A4 page) */
          .id-cards-print-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6mm !important;
            width: 100% !important;
            margin: 0 auto !important;
          }

          /* Single-card print: centered compact layout */
          .id-cards-single-print {
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            padding-top: 15mm !important;
          }

          /* ID Card Item */
          .id-card-item {
            display: block !important;
            width: 86mm !important;
            min-height: 54mm !important;
            margin: 0 auto 4mm auto !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border: 1.5px dashed #94a3b8 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .id-card-item.hidden-in-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ID CARDS GRID */}
      <div
        className={
          singlePrintId
            ? 'id-cards-single-print max-w-5xl mx-auto'
            : 'id-cards-print-grid grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 max-w-5xl mx-auto'
        }
      >
        {students.map((student) => {
          const emergencyPhone =
            student.parents[0]?.parent?.contactPhone || student.contactPhone || '—';
          const isSelected = selectedIds.has(student.id);

          // Filtering visibility during printing
          let isHiddenInPrint = false;
          if (singlePrintId) {
            // Only the selected single card prints
            isHiddenInPrint = student.id !== singlePrintId;
          } else if (isPrintingSelection) {
            // Only user-selected cards print
            isHiddenInPrint = !isSelected;
          }

          return (
            <div
              key={student.id}
              className={`id-card-item ${
                isHiddenInPrint ? 'hidden-in-print' : ''
              } border-2 ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-dashed border-slate-300'
              } print:border-dashed print:border-slate-400 rounded-2xl p-4 bg-white shadow-sm print:shadow-none relative overflow-hidden transition-all`}
              style={{ minHeight: '220px' }}
            >
              {/* SCREEN-ONLY TOP ACTION BAR FOR EACH CARD */}
              <div className="screen-only print:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectStudent(student.id)}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-slate-300 cursor-pointer"
                  />
                  <span className="font-semibold text-[11px]">
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => printSingleStudent(student.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                    title={`Print ID card for ${student.fullName}`}
                  >
                    <Printer size={12} />
                    <span>Print Card</span>
                  </button>
                  <Link
                    href={`/dashboard/students/${student.id}`}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="View Profile"
                  >
                    <Eye size={13} />
                  </Link>
                </div>
              </div>

              {/* ID CARD HEADER (Vibrant Emerald with Crest & Motto) */}
              <div className="bg-emerald-800 text-white p-3 -mx-4 -mt-2 mb-3 rounded-t-lg flex items-center justify-between print-exact">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white text-emerald-800 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                    Y
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider leading-tight">
                      {schoolName}
                    </h3>
                    <p className="text-[9px] text-emerald-200 leading-none">{schoolMotto}</p>
                  </div>
                </div>
                <span className="text-[8px] bg-emerald-900/80 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border border-emerald-700">
                  STUDENT ID
                </span>
              </div>

              {/* CARD BODY: PHOTO + STUDENT DETAILS */}
              <div className="flex gap-3 items-center mb-3">
                {/* PASSPORT PHOTO */}
                <div className="w-16 h-20 bg-slate-100 border-2 border-emerald-600 rounded-lg flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden group shadow-inner">
                  {student.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={student.photoUrl}
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-slate-50 to-emerald-50 flex items-center justify-center font-bold text-xl text-emerald-800 font-serif">
                      {student.fullName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/85 text-[7px] text-white text-center py-0.5 uppercase tracking-tighter z-10 font-mono">
                    OFFICIAL
                  </span>
                  <StudentPhotoUpload
                    studentId={student.id}
                    studentName={student.fullName}
                    currentPhoto={student.photoUrl}
                    variant="overlay"
                  />
                </div>

                {/* DETAILS */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-slate-900 truncate uppercase tracking-tight">
                    {student.fullName}
                  </h4>

                  <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                    <p className="flex items-center">
                      <span className="text-slate-400 w-16 inline-block font-semibold shrink-0">
                        Adm No:
                      </span>
                      <strong className="font-mono text-slate-900 truncate">
                        {student.matricNumber || 'PENDING'}
                      </strong>
                    </p>
                    <p className="flex items-center">
                      <span className="text-slate-400 w-16 inline-block font-semibold shrink-0">
                        Class:
                      </span>
                      <strong className="text-slate-800 truncate">
                        {student.level?.name || '—'}
                      </strong>
                    </p>
                    <p className="flex items-center">
                      <span className="text-slate-400 w-16 inline-block font-semibold shrink-0">
                        Session:
                      </span>
                      <span className="truncate">{academicYear}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="text-slate-400 w-16 inline-block font-semibold shrink-0">
                        Emergency:
                      </span>
                      <span className="font-mono text-[10px] text-slate-700 truncate">
                        {emergencyPhone}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[8px] text-slate-400">
                <span>Card Ref: YOS-{student.id.slice(0, 6).toUpperCase()}</span>
                <div className="text-right">
                  <span className="border-t border-slate-300 px-3 uppercase font-bold text-slate-500">
                    Principal Signature
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {students.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl">
            <IdCard size={48} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No students found</h3>
            <p className="text-sm text-slate-400 mt-1">
              Try selecting a different level or clearing filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
