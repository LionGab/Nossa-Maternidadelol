/**
 * Cliente Gemini com retry logic
 */
import { retryApiCall } from './utils/retry.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Chama API do Gemini com retry automático
 */
export async function callGemini(prompt: string): Promise<any> {
  return retryApiCall(async () => {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Gemini API error: ${error.message || response.statusText}`);
    }

    return response.json();
  });
}

