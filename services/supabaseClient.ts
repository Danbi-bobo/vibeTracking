/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// SỬA LỖI: Dùng import.meta.env cho Vite Frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Cảnh báo: Thiếu cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_KEY. Kiểm tra lại file .env hoặc Environment Variables trên Vercel.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');