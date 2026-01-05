import { EnergyLevel, ENERGY_META, JournalEntry } from "../types";

export const generateDailyInsight = async (
  energy: EnergyLevel,
  journal: string,
  history: JournalEntry[] = []
) => {
  const timeoutMessage = "HA'm nay b §­n Ž`Aœ c ¯` g §_ng r §t nhi ¯?u r ¯\"i! ƒo\"\"";
  const errorMessage = "HA'm nay b §­n Ž`Aœ lAÿm r §t t ¯`t r ¯\"i! Ngh ¯% ng’­i thA'i nAÿo! ƒo\"\"";
  const fallbackMessage = "C ¯` g §_ng lA¦n nhAc, ngAÿy mai s §« t ¯`t h’­n!";

  const energyLabel = ENERGY_META[energy].label;

  // L §y t ¯`i Ž`a 5 ngAÿy g §n nh §t Ž` ¯Ÿ lAÿm ng ¯_ c §œnh
  const recentHistory = history
    .slice(0, 5)
    .map(
      (h) =>
        `- NgAÿy ${h.date}: NŽŸng l’ø ¯œng ${ENERGY_META[h.energy].label}, n ¯Ti dung: "${h.content.substring(0, 50)}..."`
    )
    .join("\n");

  const prompt = `
        B §­n lAÿ m ¯Tt "Ng’ø ¯?i b §­n thA›n Gen Z" c ¯ñc k ¯3 tinh t §¨, sA›u s §_c vAÿ bi §¨t l §_ng nghe. 
        HAœy phA›n tA-ch c §œm xA§c hA'm nay d ¯ña trA¦n nh §-t kA« vAÿ so sA­nh v ¯>i hAÿnh trAªnh vAÿi ngAÿy qua Ž` ¯Ÿ Ž`’øa ra m ¯Tt l ¯?i nh §-n xAct/Ž` ¯Tng viA¦n mang tA-nh cA­ nhA›n hA3a cao.

        THA"NG TIN HA"M NAY:
        - NŽŸng l’ø ¯œng: ${energyLabel} (${energy}/5)
        - Nh §-t kA«: "${journal}"

        L ¯SCH S ¯ª G §ÝN Ž?A,Y:
        ${recentHistory || "Ž?A›y lAÿ ngAÿy Ž` §u tiA¦n ho §úc khA'ng cA3 d ¯_ li ¯Øu cc."}

        NHI ¯+M V ¯:
        1. Nh §-n di ¯Øn xu h’ø ¯>ng (vA- d ¯: NŽŸng l’ø ¯œng Ž`ang tŽŸng lA¦n, hay Ž`ang cA3 m ¯Tt chu ¯-i ngAÿy m ¯Øt m ¯?i, ho §úc hA'm nay lAÿ m ¯Tt cA§ s ¯t gi §œm b §t ng ¯?).
        2. Vi §¨t m ¯Tt cA›u ph §œn h ¯"i ng §_n g ¯?n (d’ø ¯>i 40 t ¯®).
        3. Phong cA­ch: Tr §¯ trung (Gen Z), chA›n thAÿnh, khA'ng sA­o r ¯-ng, s ¯- d ¯ng icon phA1 h ¯œp. 
        4. N §¨u th §y chu ¯-i ngAÿy m ¯Øt m ¯?i, hAœy khuyA¦n h ¯? yA¦u th’ø’­ng b §œn thA›n. N §¨u th §y nŽŸng l’ø ¯œng Ž`ang "on fire", hAœy cA1ng ŽŸn m ¯®ng.
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
