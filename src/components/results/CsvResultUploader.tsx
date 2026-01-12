'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface CsvResultUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[]; // The list of students currently in the class (to match IDs)
  onDataLoaded: (scores: Record<string, { ca: number; exam: number }>) => void;
}

export default function CsvResultUploader({ isOpen, onClose, students, onDataLoaded }: CsvResultUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ found: number; missing: number } | null>(null);

  // 1. Generate a Template for them to download
  const downloadTemplate = () => {
    // We pre-fill the template with the students in the class!
    // This makes it impossible for teachers to make mistakes with names.
    const csvData = students.map(s => ({
      MatricNumber: s.matricNumber || 'UNKNOWN',
      StudentName: s.fullName,
      CAScore: '',
      ExamScore: ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'result_template.csv');
    document.body.appendChild(link);
    link.click();
  };

  // 2. Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setStats(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processParsedData(results.data);
      },
      error: () => {
        setError("Failed to parse CSV file.");
      }
    });
  };

  // 3. The Logic Engine: Match Matric Numbers
  const processParsedData = (rows: any[]) => {
    const newScores: Record<string, { ca: number; exam: number }> = {};
    let foundCount = 0;
    let missingCount = 0;

    rows.forEach((row) => {
      // Find the student ID based on the Matric Number in the CSV
      const student = students.find(s => 
        s.matricNumber && 
        s.matricNumber.trim().toLowerCase() === row['MatricNumber']?.trim().toLowerCase()
      );

      if (student) {
        newScores[student.id] = {
          ca: parseFloat(row['CAScore']) || 0,
          exam: parseFloat(row['ExamScore']) || 0
        };
        foundCount++;
      } else {
        missingCount++;
      }
    });

    setStats({ found: foundCount, missing: missingCount });

    // Send the mapped data back to the main page
    if (foundCount > 0) {
      onDataLoaded(newScores);
      // Don't close immediately so they can see the stats
    } else {
      setError("No matching students found in this CSV. Did you use the correct template?");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Results from Excel/CSV">
      <div className="space-y-6">
        
        {/* Step 1: Download Template */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-bold text-blue-800 text-sm mb-2">Step 1: Get the Sheet</h4>
          <p className="text-sm text-blue-600 mb-3">
            Download the pre-filled template for this specific class. It contains the names and matric numbers already.
          </p>
          <Button variant="secondary" size="sm" onClick={downloadTemplate} icon={Download}>
            Download Template
          </Button>
        </div>

        {/* Step 2: Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="hidden" 
            id="csv-input"
          />
          <label htmlFor="csv-input" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Click to upload filled CSV</span>
          </label>
        </div>

        {/* Feedback Area */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {stats && (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded text-sm">
            <CheckCircle size={16} />
            <span>Success! Matched {stats.found} students. ({stats.missing} ignored). Results updated on screen.</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
