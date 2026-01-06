'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, X, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BulkImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  
  // --- NEW STATE FOR CONTEXT ---
  const [session, setSession] = useState('2025/2026'); 
  const [term, setTerm] = useState('FIRST');

  const router = useRouter();

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]); 
      setSuccessCount(null);
    }
  };

  const processFile = () => {
    if (!file) return;
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await fetch('/api/students/bulk-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              rows: results.data,
              academicYear: session,
              term: term
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            if (data.errors) {
              setErrors(data.errors);
            } else {
              setErrors([data.error || 'Something went wrong']);
            }
          } else {
            setSuccessCount(data.count);
            setTimeout(() => {
              router.refresh();
              onClose(); 
            }, 2000);
          }
        } catch (err) {
          setErrors(['Network error occurred. Please try again.']);
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setLoading(false);
        setErrors([`CSV Parsing Error: ${error.message}`]);
      }
    });
  };

  // --- NEW FUNCTION TO DOWNLOAD TEMPLATE ---
  const handleDownloadTemplate = () => {
    // 1. Define Headers (Must match backend expectations exactly)
    const headers = ['firstName,lastName,email,matricNumber,gender,className'];
    
    // 2. Generate Unique Timestamp so emails don't conflict on repeated tests
    const ts = Date.now();

    // 3. Create 3 Sample Rows
    // We leave 'matricNumber' empty (,,) to test the auto-generation
    const rows = [
      `Test,StudentA,test.student.a.${ts}@demo.com,,MALE,JSS 1`,
      `Test,StudentB,test.student.b.${ts}@demo.com,,FEMALE,SS 2`,
      `Test,StudentC,test.student.c.${ts}@demo.com,,MALE,JSS 3`
    ];
    
    // 4. Combine with newlines
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // 5. Create Blob and Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_import_test_data_${ts}.csv`; // Unique filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Bulk Import Students</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Success State */}
        {successCount !== null ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-emerald-900">Import Successful!</h3>
            <p className="text-emerald-600 mt-2">{successCount} students added successfully.</p>
          </div>
        ) : (
          <>
            {/* --- CONTEXT SELECTORS --- */}
            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Academic Session
                </label>
                <select 
                  value={session} 
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Entry Term
                </label>
                <select 
                  value={term} 
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                >
                  <option value="FIRST">First Term</option>
                  <option value="SECOND">Second Term</option>
                  <option value="THIRD">Third Term</option>
                </select>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="hidden" 
                id="csvInput"
              />
              <label htmlFor="csvInput" className="cursor-pointer flex flex-col items-center">
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-3" />
                <span className="text-sm font-medium text-slate-700">
                  {file ? file.name : "Click to upload CSV"}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Required: Name, Email, Class. <br/>
                  (Leave 'matricNumber' blank to auto-generate)
                </span>
              </label>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 text-red-700 font-medium mb-2 sticky top-0 bg-red-50">
                  <AlertCircle size={16} />
                  <span>Import Failed ({errors.length} errors)</span>
                </div>
                <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                  {errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button 
                type="button"
                onClick={handleDownloadTemplate}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 text-center transition-colors"
              >
                Download Template
              </button>
              <button
                onClick={processFile}
                disabled={!file || loading}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/10"
              >
                {loading ? 'Processing...' : 'Start Import'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}