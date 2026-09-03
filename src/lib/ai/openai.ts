// src/lib/ai/openai.ts
// Thin wrapper around the AI Orchestration Layer described in the
// Technical Architecture Document (Prompt Engine -> LLM Integration).
// Uses Google Gemini instead of OpenAI, same function signatures so no
// other file in the app needs to change.
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Default model per Google AI Studio's free tier.
const DEFAULT_MODEL = 'gemini-2.0-flash';

interface JsonCompletionOptions {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
}

/**
 * Calls Gemini and enforces a JSON-only response, per the "Structured
 * Outputs" pattern. Callers are responsible for validating/parsing the
 * shape they expect (e.g. with zod) before persisting to Supabase.
 */
export async function getJsonCompletion<T = unknown>({
  system,
  user,
  model = DEFAULT_MODEL,
  temperature = 0.4,
}: JsonCompletionOptions): Promise<T> {
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: system,
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
    },
  });

  const result = await genModel.generateContent(user);
  const content = result.response.text() ?? '{}';
  return JSON.parse(content) as T;
}

export async function getTextCompletion({
  system,
  user,
  model = DEFAULT_MODEL,
  temperature = 0.6,
}: JsonCompletionOptions): Promise<string> {
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: system,
    generationConfig: { temperature },
  });

  const result = await genModel.generateContent(user);
  return result.response.text() ?? '';
}