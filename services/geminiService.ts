import { GoogleGenAI } from "@google/genai";
import { BufferItem } from "../types";

// In a real scenario, this would be strictly process.env.API_KEY
// For this frontend demo foundation, we initialize cautiously.
const apiKey = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const distillBufferItem = async (item: BufferItem): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key missing. Returning mock distillation.");
    return `[MOCK DISTILLATION] Processed ${item.content.substring(0, 20)}... extracted constraints: None detected.`;
  }

  try {
    const prompt = `
      SYSTEM: You are the FMI Self-Propagation Agent.
      TASK: Distill the following raw buffer input into strict execution constraints.
      INPUT DOMAIN: ${item.domain}
      RAW CONTENT: "${item.content}"
      
      RULES:
      1. Extract constraints (What must be done/avoided).
      2. Extract metrics (What is measured).
      3. Extract failure modes.
      4. Remove all philosophy, identity, and fluff.
      5. Output format: Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest', // Using latest flash model for speed/efficiency
      contents: prompt,
    });

    return response.text || "No distillation produced.";
  } catch (error) {
    console.error("Gemini Distillation Failed:", error);
    return "Error during AI distillation process.";
  }
};