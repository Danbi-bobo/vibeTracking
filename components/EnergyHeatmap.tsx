
import React, { useMemo } from 'react';
import { JournalEntry, EnergyLevel, ENERGY_META } from '../types';

interface EnergyHeatmapProps {
  entries: JournalEntry[];
  onSelectDay: (date: string) => void;
  selectedDate: string | null;
}

// Helper để lấy chuỗi YYYY-MM-DD từ đối tượng Date theo giờ địa phương
const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EnergyHeatmap: React.FC<EnergyHeatmapProps> = ({ entries, onSelectDay, selectedDate }) => {
  const currentYear = new Date().getFullYear();
  
  const calendarData = useMemo(() => {
    const data: { [key: string]: JournalEntry } = {};
    entries.forEach(entry => {
      // Đảm bảo key luôn là YYYY-MM-DD
      const dateKey = entry.date.split(' ')[0].split('T')[0];
      data[dateKey] = entry;
    });
    return data;
  }, [entries]);

  const daysInYear = useMemo(() => {
    const startOfYear = new Date(currentYear, 0, 1);
    // Tính toán ngày bắt đầu trong tuần (Thứ 2 là 0)
    const startDayOfWeek = (startOfYear.getDay() + 6) % 7; 
    
    const days: (string | null)[] = [];
    
    // Thêm các ô trống ở đầu năm để căn chỉnh theo cột Thứ 2
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null); 
    }
    
    // Điền các ngày thực tế của năm
    for (let i = 0; i < 366; i++) {
      const d = new Date(currentYear, 0, 1 + i);
      if (d.getFullYear() !== currentYear) break;
      days.push(toLocalDateString(d));
    }
    return days;
  }, [currentYear]);

  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Bản Đồ Năng Lượng {currentYear}</h3>
          <p className="text-slate-400 text-xs font-medium">Nhấn vào từng ô để xem lại kỷ niệm</p>
        </div>
        <div className="flex gap-2 items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
          <span>Less</span>
          {[1, 2, 3, 4, 5].map(lvl => (
            <div 
              key={lvl}
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: ENERGY_META[lvl as EnergyLevel].color }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-4">
        <div className="flex flex-col gap-2 min-w-[750px]">
          <div className="flex">
            <div className="w-8" /> 
            <div className="flex flex-1 justify-between text-[10px] text-slate-300 font-black px-1">
              {months.map(m => <span key={m} className="w-12 text-center">{m}</span>)}
            </div>
          </div>
          
          <div className="flex">
            <div className="flex flex-col gap-1 pr-3 justify-between text-[10px] text-slate-300 font-black py-1 h-[115px]">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>
            
            <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1.5 h-[115px]">
              {daysInYear.map((day, index) => {
                if (day === null) return <div key={`pad-${index}`} className="w-3.5 h-3.5" />;
                
                const entry = calendarData[day];
                const isSelected = selectedDate === day;
                const color = entry ? ENERGY_META[entry.energy].color : '#f8fafc';
                
                return (
                  <button
                    key={day}
                    onClick={() => entry && onSelectDay(day)}
                    title={`${day}: ${entry ? ENERGY_META[entry.energy].label : 'Chưa ghi'}`}
                    className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 relative ${
                      entry ? 'cursor-pointer hover:scale-150 z-10 hover:shadow-lg' : 'cursor-default opacity-50'
                    } ${isSelected ? 'ring-2 ring-brand ring-offset-2 scale-125 z-20 shadow-md' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyHeatmap;
