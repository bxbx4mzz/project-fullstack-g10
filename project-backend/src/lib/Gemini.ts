import { GoogleGenerativeAI } from "@google/generative-ai";

export const gemini = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export const CHAT_MODEL = "gemini-3.1-flash-lite";