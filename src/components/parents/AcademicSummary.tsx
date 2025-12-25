import React from 'react';
import { Award, TrendingUp } from 'lucide-react';

interface AcademicSummaryProps {
  results: any[];
}

export default function AcademicSummary({ results }: AcademicSummaryProps) {
  // 🔴 CRITICAL FIX: Safety check for undefined or null results
  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800">
        <p className="text-slate-400 text-sm">No academic data available yet.</p>
      </div>
    );
  }

  // 1. Calculate Average Score safely
  const numericScores = results.map(r => Number(r.totalScore)).filter(n => !isNaN(n));
  
  const averageScore = numericScores.length > 0 
    ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1)
    : 'N/A';

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-lg mb-1">Recent Performance</h3>
            <p className="text-emerald-200 text-xs opacity-80">
              Average Score: <span className="font-bold text-white">{averageScore}%</span>
            </p>
          </div>
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
            <TrendingUp size={20} className="text-emerald-300" />
          </div>
        </div>

        <div className="space-y-3">
          {results.slice(0, 3).map((res, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div>
                <p className="font-bold text-sm truncate max-w-[120px]">
                  {res.course?.name || 'Subject'}
                </p>
                <p className="text-[10px] text-emerald-200/70 uppercase">
                  {res.exam?.name || 'Assessment'}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black px-2 py-0.5 rounded ${
                  Number(res.totalScore) >= 70 ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  {res.grade || '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Background Pattern */}
      <Award className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-500/10 rotate-12" />
    </div>
  );
}
