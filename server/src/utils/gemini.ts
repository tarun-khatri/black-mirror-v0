import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINIAPI_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getGeminiSummary(posts: string[]): Promise<string> {
  const prompt = `Summarize the following tweets in a concise, high-level way for a competitor analysis. Focus on what the company is talking about and any key trends or topics.\n\n${posts.join('\n')}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
  });
  return response.text || '';
} 