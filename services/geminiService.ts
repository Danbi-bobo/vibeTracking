import { GoogleGenAI } from "@google/genai";
import { EnergyLevel, ENERGY_META, JournalEntry } from "../types";

export const generateDailyInsight = async (
  energy: EnergyLevel, 
  journal: string, 
  history: JournalEntry[] = []
) => {
  const timeoutPromise = new Promise<string>((resolve) => 
    setTimeout(() => resolve("Hôm nay bạn đã cố gắng rất nhiều rồi! ✨"), 5000)
  );

  const aiPromise = (async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY");
      }
      const ai = new GoogleGenAI({ apiKey });
      const energyLabel = ENERGY_META[energy].label;
      
      // Lấy tối đa 5 ngày gần nhất để làm ngữ cảnh
      const recentHistory = history
        .slice(0, 5)
        .map(h => `- Ngày ${h.date}: Năng lượng ${ENERGY_META[h.energy].label}, nội dung: "${h.content.substring(0, 50)}..."`)
        .join('\n');

      const prompt = `
        Bạn là một "Người bạn thân Gen Z" cực kỳ tinh tế, sâu sắc và biết lắng nghe. 
        Hãy phân tích cảm xúc hôm nay dựa trên nhật ký và so sánh với hành trình vài ngày qua để đưa ra một lời nhận xét/động viên mang tính cá nhân hóa cao.

        THÔNG TIN HÔM NAY:
        - Năng lượng: ${energyLabel} (${energy}/5)
        - Nhật ký: "${journal}"

        LỊCH SỬ GẦN ĐÂY:
        ${recentHistory || "Đây là ngày đầu tiên hoặc không có dữ liệu cũ."}

        NHIỆM VỤ:
        1. Nhận diện xu hướng (ví dụ: Năng lượng đang tăng lên, hay đang có một chuỗi ngày mệt mỏi, hoặc hôm nay là một cú sụt giảm bất ngờ).
        2. Viết một câu phản hồi ngắn gọn (dưới 40 từ).
        3. Phong cách: Trẻ trung (Gen Z), chân thành, không sáo rỗng, sử dụng icon phù hợp. 
        4. Nếu thấy chuỗi ngày mệt mỏi, hãy khuyên họ yêu thương bản thân. Nếu thấy năng lượng đang "on fire", hãy cùng ăn mừng.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          temperature: 0.9,
          topP: 0.95,
        }
      });

      return response.text?.trim() || "Cố gắng lên nhé, ngày mai sẽ tốt hơn!";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Hôm nay bạn đã làm rất tốt rồi! Nghỉ ngơi thôi nào! ✨";
    }
  })();

  return Promise.race([aiPromise, timeoutPromise]);
};
