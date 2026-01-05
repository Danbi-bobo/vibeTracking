
import React, { useState, useMemo } from 'react';
import { JournalEntry, ENERGY_META } from '../types';

interface EnergyTrendsProps {
  entries: JournalEntry[];
}

type Timeframe = 'week' | 'month' | 'year';

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const EnergyTrends: React.FC<EnergyTrendsProps> = ({ entries }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [referenceDate, setReferenceDate] = useState(new Date());

  const handlePrev = () => {
    const newDate = new Date(referenceDate);
    if (timeframe === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (timeframe === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (timeframe === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
    setReferenceDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(referenceDate);
    if (timeframe === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (timeframe === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (timeframe === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
    setReferenceDate(newDate);
  };

  const { chartData, currentAverage, dateRangeLabel } = useMemo(() => {
    const entryMap = new Map<string, JournalEntry>();
    entries.forEach(e => entryMap.set(e.date, e));

    let data: { label: string; value: number; color: string; date: string }[] = [];
    let rangeLabel = '';

    if (timeframe === 'week') {
      const startOfWeek = getStartOfWeek(referenceDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      rangeLabel = `${startOfWeek.getDate()} Th${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()} Th${endOfWeek.getMonth() + 1}`;

      const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = toLocalDateString(d);
        const entry = entryMap.get(dateStr);

        data.push({
          label: daysOfWeek[i],
          value: entry ? entry.energy : 0,
          color: entry ? ENERGY_META[entry.energy].color : '#f1f5f9',
          date: dateStr
        });
      }
    } else if (timeframe === 'month') {
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      rangeLabel = `Tháng ${month + 1}, ${year}`;

      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const dateStr = toLocalDateString(d);
        const entry = entryMap.get(dateStr);

        data.push({
          label: i.toString(),
          value: entry ? entry.energy : 0,
          color: entry ? ENERGY_META[entry.energy].color : '#f1f5f9',
          date: dateStr
        });
      }
    } else if (timeframe === 'year') {
      const year = referenceDate.getFullYear();
      rangeLabel = `Năm ${year}`;
      const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      
      data = months.map((m, idx) => {
        const monthEntries = entries.filter(e => {
          const d = new Date(e.date + 'T00:00:00');
          return d.getFullYear() === year && d.getMonth() === idx;
        });
        
        const monthAvg = monthEntries.length 
          ? monthEntries.reduce((sum, e) => sum + e.energy, 0) / monthEntries.length
          : 0;
          
        return {
          label: m,
          value: monthAvg,
          color: monthAvg > 0 ? 'var(--brand-color)' : '#f1f5f9',
          date: m
        };
      });
    }

    const activePoints = data.filter(d => d.value > 0);
    const avg = activePoints.length > 0 
      ? activePoints.reduce((acc, curr) => acc + curr.value, 0) / activePoints.length 
      : 0;

    return { chartData: data, currentAverage: avg, dateRangeLabel: rangeLabel };
  }, [entries, timeframe, referenceDate]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col transition-all duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <div className="flex items-center justify-between lg:justify-start gap-4">
             <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Xu hướng</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span>{dateRangeLabel}</span>
                </div>
             </div>
             
             {/* Navigation Controls */}
             <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
               <button onClick={handlePrev} className="p-1.5 hover:bg-white hover:text-brand rounded-lg transition-all text-slate-400">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
               </button>
               <button onClick={handleNext} className="p-1.5 hover:bg-white hover:text-brand rounded-lg transition-all text-slate-400">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
               </button>
             </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center gap-3 w-full lg:w-auto">
          {/* Average Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-brand/5 rounded-2xl border border-brand/10 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              TB {timeframe === 'week' ? 'Tuần' : timeframe === 'month' ? 'Tháng' : 'Năm'}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black text-brand leading-none">
                {currentAverage > 0 ? currentAverage.toFixed(1) : '-'}
              </span>
              <span className="text-[10px] font-bold text-brand/50 mb-1">v</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100 self-end sm:self-auto w-full sm:w-auto">
            {(['week', 'month', 'year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTimeframe(t); setReferenceDate(new Date()); }}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  timeframe === t 
                    ? 'bg-white text-brand shadow-sm border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'week' ? 'Tuần' : t === 'month' ? 'Tháng' : 'Năm'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section - Horizontal Scroll wrapper for mobile */}
      <div className="relative flex-1 min-h-[220px]">
        {/* Scrollable Container */}
        <div className="overflow-x-auto custom-scrollbar h-full pb-2">
            <div 
              className="flex items-end gap-1 sm:gap-1.5 md:gap-3 px-1 h-full relative"
              style={{ minWidth: timeframe === 'month' ? '600px' : '100%' }} 
            >
              {/* Grid lines - absolute to the scrollable content to maintain width */}
              <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none opacity-5 z-0 w-full">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-slate-900"></div>
                ))}
              </div>

              {chartData.map((item, idx) => (
                <div key={`${timeframe}-${idx}`} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                  <div 
                    className="w-full rounded-t-lg sm:rounded-t-xl transition-all duration-700 ease-out relative shadow-sm group-hover:shadow-md group-hover:opacity-80"
                    style={{ 
                      height: item.value > 0 ? `${(item.value / 5) * 100}%` : '4px', 
                      backgroundColor: item.color,
                      minHeight: item.value > 0 ? '10px' : '4px',
                      transitionDelay: `${idx * 10}ms`
                    }}
                  >
                    {item.value > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
                        {item.value.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <span className="mt-2 sm:mt-3 text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase group-hover:text-brand transition-colors whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
        </div>
        
        {/* Gradient fade for mobile scroll hint (only for Month view) */}
        {timeframe === 'month' && (
           <div className="absolute top-0 right-0 bottom-8 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
        )}
      </div>
      
      {/* Footer Legend */}
      <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap justify-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand"></div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dữ liệu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-100"></div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest">Trống</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyTrends;
