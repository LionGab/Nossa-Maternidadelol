import { AI } from "./constants";
import { fetchWithRetry, isRetryableHttpStatus } from "./utils/retry";
import { getCircuitBreaker } from "./utils/circuit-breaker";
import { logger, logAICall } from "./logger";

export interface PerplexityResponse {
  answer: string;
  sources: { title: string; url: string }[];
}

// Circuit breaker for Perplexity API
const perplexityCircuit = getCircuitBreaker("perplexity_ai", {
  failureThreshold: 3,
  resetTimeout: 30000, // 30s
  isFailure: (error) => {
    // Don't count 400 errors (bad request) as failures
    if (error instanceof Error && error.message.includes("HTTP 4")) {
      const status = parseInt(error.message.match(/\d+/)?.[0] || "0");
      if (status >= 400 && status < 500 && status !== 429) {
        return false; // Client error, not API failure
      }
    }
    return true;
  },
});

export async function searchWithPerplexity(question: string): Promise<PerplexityResponse> {
  const startTime = Date.now();

  logAICall("perplexity", "search", {
    questionLength: question.length,
  });

  try {
    // Execute with circuit breaker protection
    const result = await perplexityCircuit.execute(async () => {
      // Fetch with retry and 10s timeout
      const response = await fetchWithRetry(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-small-128k-online",
            messages: [
              {
                role: "system",
                content: "Você é uma assistente especializada em maternidade e saúde materno-infantil. Forneça respostas precisas, bem fundamentadas e empáticas. Use bullet points quando apropriado. Sempre cite fontes confiáveis.",
              },
              {
                role: "user",
                content: question,
              },
            ],
            temperature: 0.2,
            max_tokens: 800,
            stream: false,
          }),
          signal: AbortSignal.timeout(10000), // 10s timeout
        },
        {
          maxRetries: 2, // Try 3 times total (1 initial + 2 retries)
          baseDelay: 1000, // 1s base delay
        }
      );

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const duration = Date.now() - startTime;

      logger.info({
        service: "perplexity",
        duration,
        questionLength: question.length,
        citationsCount: data.citations?.length || 0,
        msg: "Perplexity search completed",
      });

      const answer = data.choices[0]?.message?.content || "Não consegui encontrar uma resposta.";
      const citations = data.citations || [];

      const sources = citations.map((url: string) => ({
        title: new URL(url).hostname,
        url,
      })).slice(0, AI.PERPLEXITY_MAX_SOURCES);

      return { answer, sources };
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error({
      err: error,
      service: "perplexity",
      duration,
      circuitState: perplexityCircuit.getState(),
      msg: "Perplexity search failed",
    });

    // Check if circuit breaker is open
    if (error instanceof Error && error.name === "CircuitBreakerError") {
      throw new Error(
        "O serviço de busca está temporariamente indisponível. Tente novamente em alguns instantes."
      );
    }

    // Check if timeout
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("A busca demorou muito tempo. Tente uma pergunta mais específica.");
    }

    throw new Error("Não foi possível realizar a busca no momento. Tente novamente.");
  }
}
