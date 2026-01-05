import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prompt } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim()) {
    res.status(400).json({ error: "Missing prompt" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
      },
    });

    res.status(200).json({ text: response.text?.trim() || "" });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Gemini request failed" });
  }
}
