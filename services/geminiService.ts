import { EnergyLevel, ENERGY_META, JournalEntry } from "../types";

export const generateDailyInsight = async (
  energy: EnergyLevel,
  journal: string,
  history: JournalEntry[] = []
) => {
  const timeoutMessage = "Hôm nay bạn đã cố gắng rất nhiều rồi! :)";
  const errorMessage = "Hôm nay bạn đã làm rất tốt rồi! Nghỉ ngơi nhé! :)";
  const fallbackMessage = "Cố gắng lên nhé, ngày mai sẽ tốt hơn!";

  const energyLabel = ENERGY_META[energy].label;

  // Lấy tối đa 5 ngày gần nhất làm ngữ cảnh
  const recentHistory = history
    .slice(0, 5)
    .map(
      (h) =>
        `- Ngày ${h.date}: Năng lượng ${ENERGY_META[h.energy].label}, nội dung: "${h.content.substring(0, 50)}..."`
    )
    .join("\n");

  const prompt = `
        Bạn là "người bạn thân Gen Z" tinh tế, sâu sắc và biết lắng nghe.
        Hãy phân tích cảm xúc hôm nay dựa trên nhật ký và so sánh với hành trình vài ngày qua để đưa ra một lời nhắn động viên mang tính cá nhân.
        Trả lời bằng tiếng Việt có dấu.

        THÔNG TIN HÔM NAY:
        - Năng lượng: ${energyLabel} (${energy}/5)
        - Nhật ký: "${journal}"

        LỊCH SỬ GẦN ĐÂY:
        ${recentHistory || "Đây là ngày đầu tiên hoặc không có dữ liệu cũ."}

        NHIỆM VỤ:
        1. Nhận diện xu hướng (ví dụ: năng lượng tăng dần, giảm dần, hay hôm nay sụt giảm).
        2. Viết 1 câu phản hồi ngắn gọn (dưới 40 từ).
        3. Phong cách: trẻ trung (Gen Z), chân thành, không sáo rỗng, dùng icon phù hợp.
        4. Nếu thấy chuỗi ngày mệt mỏi, khuyên bạn yêu thương bản thân. Nếu thấy "on fire", hãy cố gắng động viên.
      `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.text?.trim() || fallbackMessage;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return timeoutMessage;
    }
    console.error("Gemini Error:", error);
    return errorMessage;
  } finally {
    clearTimeout(timeoutId);
  }
};
