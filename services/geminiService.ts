import { GoogleGenAI } from "@google/genai";
import { BufferItem } from "../types";

// Safe API Key retrieval (prevents build crash if process is undefined in some envs)
const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("API_KEY not found in process.env. AI features will run in mock mode.");
}

export const distillBufferItem = async (item: BufferItem): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key missing. Returning mock distillation.");
    return `[MOCK DISTILLATION] Processed ${item.content.substring(0, 20)}... extracted constraints: None detected.`;
  }

  try {
    const prompt = `
      SYSTEM: You are the Prompt Distiller Agent. You convert unstructured inputs into standardized prompts for execution.
      
      INPUT DOMAIN: ${item.domain}
      RAW CONTENT: "${item.content}"

      TASK:
      1. Extract key concepts relevant to: Human_layer, Energy_layer, Finance_layer, AI_layer
      2. Identify executable rules vs conceptual notes
      3. Remove all philosophy, identity, and fluff.
      4. Output format: Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No distillation produced.";
  } catch (error) {
    console.error("Gemini Distillation Failed:", error);
    return "Error during AI distillation process.";
  }
};