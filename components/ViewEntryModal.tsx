import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { JournalEntry, ENERGY_META } from '../types';

interface ViewEntryModalProps {
  entry: JournalEntry;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const ViewEntryModal: React.FC<ViewEntryModalProps> = ({ entry, onClose, onDelete }) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const energyInfo = ENERGY_META[entry.energy];
  
  // Important: Use T00:00:00 to prevent timezone shifts when parsing date-only strings
  const displayDate = new Date(entry.date + 'T00:00:00');
  const [activeInsightTab, setActiveInsightTab] = useState<'trend' | 'note'>('trend');

  const insightSections = useMemo(() => {
    const raw = entry.aiInsight || '';
    const cleaned = raw.replace(/\*\*/g, '');
    const marker = /Lời nhắn\s*:/i;
    if (!marker.test(cleaned)) {
      return { trend: cleaned.trim(), note: '' };
    }
    const [trendPart, notePart] = cleaned.split(marker);
    return {
      trend: trendPart.replace(/Xu hướng\s*:/i, '').trim(),
      note: notePart.trim(),
    };
  }, [entry.aiInsight]);

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[2.75rem] w-full max-w-3xl overflow-hidden shadow-2xl transform transition-all animate-in zoom-in slide-in-from-bottom-12 duration-500 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <span className="text-2xl">{energyInfo.emoji}</span>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-0.5">Trạng thái năng lượng</p>
                <p className="text-xs font-bold text-slate-700">{energyInfo.label}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 md:px-7 md:py-6 space-y-6">
          {entry.image ? (
            <div className="flex flex-col items-center">
              {/* Polaroid Layout */}
              <div className="bg-white p-3 pb-7 shadow-xl border border-slate-100 -rotate-1 hover:rotate-0 transition-transform duration-500 w-full max-w-sm">
                <div className="aspect-[4/3] w-full bg-slate-50 overflow-hidden mb-3 rounded-md border border-slate-50">
                  <img 
                    src={entry.image} 
                    alt="Kỷ niệm" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center px-2">
                   <p className="font-serif text-slate-400 text-xs italic">
                      {displayDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                   </p>
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center">
                <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mb-2">Nhật ký ngày</p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {displayDate.toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
             </div>
          )}

          {/* Diary Content + Insight */}
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="relative">
                <svg className="absolute -top-5 -left-4 w-10 h-10 text-brand opacity-10" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
                </svg>
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium relative z-10 text-left whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            </div>

            {entry.aiInsight && (
              <div className="relative md:sticky md:top-2 self-start">
                <div className="relative overflow-hidden rounded-[2.25rem] border border-brand/20 bg-gradient-to-br from-brand/10 via-white to-brand/5 p-5 md:p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.6)]">
                  <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
                  <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand/15 text-base text-brand">
                          ✨
                        </span>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand/80">AI Vibe</p>
                          <p className="text-xs font-semibold text-slate-500">Phân tích cảm xúc</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-white/90 p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setActiveInsightTab('trend')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                            activeInsightTab === 'trend'
                              ? 'bg-brand text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Xu hướng
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInsightTab('note')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                            activeInsightTab === 'note'
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Lời nhắn
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/85 p-4 shadow-inner">
                      {activeInsightTab === 'trend' && (
                        <p className="text-left text-sm md:text-base font-semibold text-slate-800 leading-relaxed">
                          {insightSections.trend || entry.aiInsight}
                        </p>
                      )}
                      {activeInsightTab === 'note' && (
                        <p className="text-left text-sm md:text-base font-semibold text-slate-800 leading-relaxed">
                          {insightSections.note || 'Chưa có lời nhắn riêng trong phản hồi.'}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-brand/70">
                      <span className="h-px w-10 bg-brand/30" />
                      <span className="px-3 py-1 rounded-full bg-brand/10 animate-pulse">Insight</span>
                      <span className="h-px w-10 bg-brand/30" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
          <button 
            onClick={() => onDelete(entry.id)}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 transition-all font-black text-[9px] uppercase tracking-widest"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span>Xóa kỷ niệm</span>
          </button>

          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEntryModal;
