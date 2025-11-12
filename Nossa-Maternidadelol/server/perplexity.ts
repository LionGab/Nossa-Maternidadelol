/**
 * Cliente Perplexity com retry logic
 */
import { retryApiCall } from './utils/retry.js';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY!;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Chama API do Perplexity com retry automático
 */
export async function callPerplexity(messages: Array<{ role: string; content: string }>): Promise<any> {
  return retryApiCall(async () => {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'pplx-70b-online',
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Perplexity API error: ${error.message || response.statusText}`);
    }

    return response.json();
  });
}

