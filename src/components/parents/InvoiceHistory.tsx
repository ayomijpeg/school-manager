import React from 'react';
import { Award, TrendingUp } from 'lucide-react';

export default function AcademicSummary({ recentResults }: { recentResults: any[] }) {
  if (!recentResults || recentResults.length === 0) return null;

  return (
    <div className="bg-linear-to-br from-emerald-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-lg mb-1">Recent Performance</h3>
            <p className="text-emerald-200 text-xs opacity-80">Latest published grades across all wards.</p>
          </div>
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
            <TrendingUp size={20} className="text-emerald-300" />
          </div>
        </div>

        <div className="space-y-3">
          {recentResults.slice(0, 3).map((res, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div>
                <p className="font-bold text-sm">{res.course?.name}</p>
                <p className="text-[10px] text-emerald-200/70 uppercase">{res.exam?.name}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black px-2 py-0.5 rounded ${
                  Number(res.totalScore) >= 70 ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  {res.grade}
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
