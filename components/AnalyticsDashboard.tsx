
import React from 'react';
import { JournalEntry } from '../types';

interface AnalyticsDashboardProps {
  entries: JournalEntry[];
  streak: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ entries, streak }) => {
  // Stats calculations
  const avgEnergy = entries.length 
    ? (entries.reduce((acc, curr) => acc + curr.energy, 0) / entries.length).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {/* Streak Card */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
        <div className="w-14 h-14 rounded-3xl bg-orange-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔥</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Chuỗi duy trì</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{streak}</span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ngày</span>
          </div>
        </div>
      </div>

      {/* Vibe Avg Card */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
        <div className="w-14 h-14 rounded-3xl bg-emerald-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚡</div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Năng lượng TB</p>
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{avgEnergy}</span>
              <span className="text-xs font-bold text-slate-300">/5</span>
            </div>
            <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden hidden md:block">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${(Number(avgEnergy) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
