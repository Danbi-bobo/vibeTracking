import { createClient } from '@supabase/supabase-js';

// SỬA LỖI: Dùng (import.meta as any).env để tránh lỗi TypeScript khi thiếu type definition cho Vite
// Accessing import.meta.env via any cast to bypass "Property 'env' does not exist on type 'ImportMeta'"
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Cảnh báo: Thiếu cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_KEY. Kiểm tra lại file .env hoặc Environment Variables trên Vercel.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');