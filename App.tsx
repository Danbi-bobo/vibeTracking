
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { JournalEntry, ENERGY_META, THEMES, Theme } from './types';
import EnergyHeatmap from './components/EnergyHeatmap';
import EnergyTrends from './components/EnergyTrends';
import DailyModal from './components/DailyModal';
import ViewEntryModal from './components/ViewEntryModal';
import { supabase } from './services/supabaseClient';

// Helper đồng nhất lấy ngày địa phương YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('vibetrack-reminders') === 'enabled' && Notification.permission === 'granted';
  });
  
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('vibetrack-theme');
    return THEMES.find(t => t.id === saved) || THEMES[0];
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-color', activeTheme.main);
    root.style.setProperty('--brand-light', activeTheme.light);
    root.style.setProperty('--brand-hover', activeTheme.hover);
    localStorage.setItem('vibetrack-theme', activeTheme.id);
  }, [activeTheme]);

  // Load from Supabase với chuẩn hóa ngày tháng
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        // Chuẩn hóa triệt để: Chuyển mọi timestamp về chuỗi YYYY-MM-DD địa phương
        const normalizedData = (data || []).map(entry => {
          const rawDate = new Date(entry.date.replace(' ', 'T')); // Handle cả format space và T
          return {
            ...entry,
            date: getLocalDateString(isNaN(rawDate.getTime()) ? new Date() : rawDate)
          };
        });
        
        setEntries(normalizedData);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const todayStr = useMemo(() => getLocalDateString(), []);
  const todayEntry = useMemo(() => entries.find(e => e.date === todayStr), [entries, todayStr]);

  const handleSaveEntry = useCallback((newEntry: JournalEntry) => {
    const cleanDate = newEntry.date.split('T')[0].split(' ')[0];
    const normalizedEntry = { ...newEntry, date: cleanDate };

    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== cleanDate);
      return [normalizedEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    });
    
    setIsModalOpen(false);
    setSelectedDate(cleanDate);
  }, []);

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa kỷ niệm này không?")) {
      const { error } = await supabase.from('entries').delete().eq('id', id);
      if (error) {
        alert("Có lỗi khi xóa: " + error.message);
      } else {
        setEntries(prev => prev.filter(e => e.id !== id));
        setSelectedDate(null);
      }
    }
  };

  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    
    const entryDates = new Set(entries.map(e => e.date));
    let count = 0;
    let checkDate = new Date();
    
    // Nếu hôm nay chưa có, bắt đầu kiểm tra từ hôm qua
    if (!entryDates.has(getLocalDateString(checkDate))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (entryDates.has(getLocalDateString(checkDate))) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
      if (count > 1000) break; // Safety break
    }
    
    return count;
  }, [entries]);

  const avgEnergy = useMemo(() => {
    if (entries.length === 0) return "0.0";
    return (entries.reduce((acc, curr) => acc + curr.energy, 0) / entries.length).toFixed(1);
  }, [entries]);

  const viewingEntry = useMemo(() => 
    entries.find(e => e.date === selectedDate), 
    [entries, selectedDate]
  );

  const handleToggleNotifications = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === 'granted') {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      localStorage.setItem('vibetrack-reminders', newState ? 'enabled' : 'disabled');
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('vibetrack-reminders', 'enabled');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Đang đồng bộ...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 bg-[#fcfdff]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm/50">
        <div className="max-w-4xl mx-auto p-4 md:px-8 flex flex-col gap-4">
          
          {/* Top Row: Logo and Settings */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter cursor-default">
                Vibe<span className="text-brand">Track</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme)}
                    title={theme.name}
                    className={`w-4 h-4 rounded-full transition-all border-2 ${
                      activeTheme.id === theme.id ? 'border-slate-300 scale-125' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: theme.main }}
                  />
                ))}
              </div>
              
              <button 
                onClick={handleToggleNotifications}
                className={`p-2 rounded-full transition-all ${notificationsEnabled ? 'text-brand bg-brand/10' : 'text-slate-300 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5" fill={notificationsEnabled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Row: Controls (Streak, Check-in, Avg) */}
          <div className="w-full">
            <div className="flex items-center bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100 gap-2 shadow-inner w-full">
              {/* Streak */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-sm border border-slate-50 flex-1 justify-center">
                <span className="text-sm">🔥</span>
                <span className="font-black text-slate-900 text-xs whitespace-nowrap">{streak}d</span>
              </div>
              
              {/* Action Button - Centered and Prominent */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-hover transition-all shadow-md shadow-brand active:scale-95 flex items-center justify-center gap-2 flex-[2]"
              >
                <span>{!todayEntry ? 'Check-in' : 'Cập nhật'}</span>
                <span className="text-sm">{!todayEntry ? '🚀' : '✨'}</span>
              </button>

              {/* Avg Energy */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-sm border border-slate-50 flex-1 justify-center">
                <span className="text-sm">⚡</span>
                <span className="font-black text-slate-900 text-xs whitespace-nowrap">{avgEnergy}v</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <EnergyHeatmap 
            entries={entries} 
            onSelectDay={setSelectedDate} 
            selectedDate={selectedDate} 
          />
        </section>
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <EnergyTrends entries={entries} />
        </section>

        {/* Supportive AI */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-4">
             <div className="p-3 bg-brand/10 rounded-2xl text-xl">🤖</div>
             <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Supportive AI</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                  "Nhìn vào biểu đồ, bạn có thể thấy rõ những ngày cuối tuần năng lượng thường cao hơn. Hãy thử áp dụng thói quen nghỉ ngơi đó vào giữa tuần xem sao!"
                </p>
             </div>
          </div>
        </section>
      </main>

      {viewingEntry && (
        <ViewEntryModal 
          entry={viewingEntry} 
          onClose={() => setSelectedDate(null)} 
          onDelete={handleDeleteEntry}
        />
      )}

      {isModalOpen && (
        <DailyModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveEntry} 
          history={entries}
          initialEntry={todayEntry}
        />
      )}
    </div>
  );
};

export default App;
