
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

    let data: { label: string; value: number; color: string; date: string; fullDate?: string }[] = [];
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
          date: dateStr,
          fullDate: d.toLocaleDateString('vi-VN')
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
          date: dateStr,
          fullDate: d.toLocaleDateString('vi-VN')
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
          color: monthAvg > 0 ? `hsl(${250 - (monthAvg * 40)}, 70%, 60%)` : '#f1f5f9', // Dynamic color for year view
          date: m,
          fullDate: `Tháng ${idx + 1}/${year}`
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
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col transition-all duration-500 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 relative z-10">
        <div>
           <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
             Xu hướng
             {currentAverage >= 4 && <span className="text-sm animate-bounce">🔥</span>}
           </h2>
           <div className="flex items-center gap-2 mt-1">
             <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                <button onClick={handlePrev} className="p-1 hover:bg-white rounded-md text-slate-400 hover:text-brand hover:shadow-sm transition-all">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <span className="text-[10px] font-bold text-slate-600 px-2 min-w-[80px] text-center uppercase tracking-wider">{dateRangeLabel}</span>
                <button onClick={handleNext} className="p-1 hover:bg-white rounded-md text-slate-400 hover:text-brand hover:shadow-sm transition-all">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                </button>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
           {/* Average Pill */}
           <div className="flex flex-col items-end pr-4 border-r border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Trung bình</span>
              <div className="flex items-baseline gap-0.5">
                 <span className="text-2xl font-black text-brand">{currentAverage > 0 ? currentAverage.toFixed(1) : '-'}</span>
                 <span className="text-xs text-slate-300 font-bold">/5</span>
              </div>
           </div>

           {/* Timeframe Toggle */}
           <div className="flex p-1 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-100">
            {(['week', 'month', 'year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTimeframe(t); setReferenceDate(new Date()); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  timeframe === t 
                    ? 'bg-white text-brand shadow-sm scale-105' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'week' ? 'Tuần' : t === 'month' ? 'Tháng' : 'Năm'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1 min-h-[220px] w-full mt-2">
        {/* Dashed Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
            {[5, 4, 3, 2, 1, 0].map((lvl) => (
                <div key={lvl} className={`w-full border-t flex items-center ${lvl === 0 ? 'border-slate-200' : 'border-slate-100 border-dashed'}`}>
                   {lvl > 0 && <span className="text-[8px] text-slate-300 font-bold absolute -left-0 -translate-y-1/2 opacity-0 sm:opacity-50">{lvl}</span>}
                </div>
            ))}
        </div>

        {/* Scroll Wrapper for Mobile (Mainly Month View) */}
        <div className="overflow-x-auto custom-scrollbar h-full absolute inset-0">
            <div 
              className="flex items-end h-full px-1 pb-6 gap-1 sm:gap-2 md:gap-3"
              style={{ minWidth: timeframe === 'month' ? '600px' : '100%' }}
            >
               {chartData.map((item, idx) => {
                 const heightPercent = (item.value / 5) * 100;
                 const isZero = item.value === 0;
                 
                 return (
                   <div key={`${timeframe}-${idx}`} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                         <div className="bg-slate-800 text-white text-[9px] font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap flex flex-col items-center">
                            <span>{item.fullDate}</span>
                            {!isZero && <span className="text-brand-light text-xs mt-0.5">{item.value.toFixed(1)}/5</span>}
                         </div>
                         <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1"></div>
                      </div>

                      {/* Bar or Dot */}
                      <div className="w-full relative flex justify-center items-end h-full">
                         {isZero ? (
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-100 mb-0.5 transition-all group-hover:bg-slate-200 group-hover:scale-150" />
                         ) : (
                           <div 
                             className="w-full max-w-[24px] rounded-t-xl rounded-b-md transition-all duration-700 ease-out relative shadow-sm group-hover:shadow-md group-hover:brightness-110 opacity-90 hover:opacity-100"
                             style={{ 
                                height: `${heightPercent}%`, 
                                backgroundColor: item.color,
                                boxShadow: timeframe === 'year' ? 'none' : `0 4px 12px -2px ${item.color}60`
                             }}
                           >
                             {/* Glossy highlight effect on top of bar */}
                             <div className="absolute top-1 left-1 right-1 h-[20%] bg-white/20 rounded-t-lg pointer-events-none"></div>
                           </div>
                         )}
                      </div>

                      {/* X-Axis Label */}
                      <span className={`absolute -bottom-0 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider transition-colors mt-2 ${
                        isZero ? 'text-slate-300' : 'text-slate-500 group-hover:text-brand'
                      }`}>
                        {item.label}
                      </span>
                   </div>
                 );
               })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyTrends;
