
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EnergyLevel, ENERGY_META, JournalEntry } from '../types';
import { generateDailyInsight } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface DailyModalProps {
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  history: JournalEntry[];
  initialEntry?: JournalEntry;
}

const DailyModal: React.FC<DailyModalProps> = ({ onClose, onSave, history, initialEntry }) => {
  const [energy, setEnergy] = useState<EnergyLevel>(initialEntry?.energy || EnergyLevel.NEUTRAL);
  const [content, setContent] = useState(initialEntry?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialEntry?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1000; 
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      let imageUrl = initialEntry?.image || null;

      if (imageFile) {
        setIsCompressing(true);
        const compressedBlob = await compressImage(imageFile);
        const fileExt = 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('vibes')
          .upload(fileName, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`[Lỗi Storage] ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('vibes')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
        setIsCompressing(false);
      }

      const aiInsightResult = await generateDailyInsight(energy, content, history);
      
      const payload = {
        energy: energy,
        content: content,
        image: imageUrl,
        aiInsight: aiInsightResult,
        date: initialEntry ? initialEntry.date : getLocalDateString()
      };

      let result;
      if (initialEntry) {
        const { data, error } = await supabase
          .from('entries')
          .update(payload)
          .eq('id', initialEntry.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('entries')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      
      onSave(result as JournalEntry);
    } catch (err: any) {
      console.error("Chi tiết lỗi:", err);
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`Không thể lưu bài viết: \n\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setIsCompressing(false);
    }
  }, [content, energy, imageFile, isSubmitting, onSave, history, initialEntry]);

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-in zoom-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="p-2 hover:bg-white rounded-full text-slate-400 disabled:opacity-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          
          <h2 className="text-lg font-black text-slate-800 tracking-tight">{initialEntry ? 'Cập nhật Vibe ✨' : 'Vibe Check-in! ☁️'}</h2>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
              isSubmitting || !content.trim() 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Lưu Cloud 🚀"}
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Mức năng lượng</label>
            <div className="flex justify-between gap-1.5">
              {(Object.keys(ENERGY_META) as unknown as EnergyLevel[]).map((level) => (
                <button
                  key={level}
                  disabled={isSubmitting}
                  onClick={() => setEnergy(Number(level))}
                  className={`flex-1 flex flex-col items-center py-3 px-1 rounded-2xl transition-all duration-300 border-2 ${
                    energy === Number(level) 
                    ? 'bg-brand-light border-brand text-brand' 
                    : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl mb-0.5">{ENERGY_META[level].emoji}</span>
                  <span className="text-[8px] font-black uppercase text-center">{ENERGY_META[level].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hôm nay thế nào?</label>
              <button 
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className="text-[10px] font-black uppercase text-brand hover:underline"
              >
                {imagePreview ? 'Đổi ảnh' : 'Thêm ảnh'}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            {imagePreview && (
              <div className="relative mb-4 group animate-in fade-in zoom-in">
                <img src={imagePreview} className="w-full h-48 object-cover rounded-3xl shadow-md border-2 border-slate-50" />
                <button 
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            )}

            <textarea
              autoFocus
              value={content}
              disabled={isSubmitting}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi lại khoảnh khắc đáng nhớ..."
              className="w-full h-32 p-5 bg-slate-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-3xl text-slate-700 font-medium resize-none transition-all outline-none"
            />
          </div>
          
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
            {isCompressing ? 'Đang nén ảnh...' : (isSubmitting ? 'Đang phân tích Vibe...' : 'Đã sẵn sàng lưu giữ kỷ niệm!')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyModal;
