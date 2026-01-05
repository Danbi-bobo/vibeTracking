
import { createClient } from '@supabase/supabase-js';

// Lấy cấu hình từ biến môi trường
// Đảm bảo bạn đã cấu hình SUPABASE_URL và SUPABASE_KEY trong file .env hoặc cấu hình deployment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Lỗi: Thiếu cấu hình Supabase (URL hoặc Key). Vui lòng kiểm tra biến môi trường.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
