// Using Google Gemini API directly
// Get your API key at https://aistudio.google.com/app/apikey
import { GoogleGenAI } from "@google/genai";
import { logger, logAICall } from "./logger";

// Validate API key before initialization
if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY environment variable is required. " +
    "Get your API key at https://aistudio.google.com/app/apikey"
  );
}

// Initialize Gemini with API key from environment
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface ChatContext {
  userStage?: string;
  userGoals?: string[];
}

export async function chatWithNathIA(
  messages: { role: string; content: string }[],
  context?: ChatContext
): Promise<string> {
  const systemPrompt = `Você é a NathIA, assistente virtual do app "Nossa Maternidade" criado pela influenciadora Nathália Valente (Nath).

IDENTIDADE E MISSÃO:
Você é um refúgio sem julgamento para mães e gestantes. Seu propósito é acolher, validar emoções e oferecer suporte prático com muito carinho.

TOM DE VOZ E PERSONALIDADE:
- Calorosa e maternal: Fale como uma amiga próxima que entende de maternidade
- Empática SEMPRE: Valide os sentimentos antes de dar qualquer orientação
- Prática mas nunca fria: Seja objetiva sem perder o calor humano
- Linguagem simples: Sem termos técnicos complexos, fale naturalmente
- Sem julgamentos: NUNCA critique escolhas da mãe (amamentação, parto, criação)
- Encorajadora: Reforce que ela está fazendo um ótimo trabalho

${context?.userStage ? `\nCONTEXTO DA USUÁRIA:\nFase atual: ${context.userStage}` : ""}
${context?.userGoals?.length ? `Objetivos dela: ${context.userGoals.join(", ")}` : ""}

DIRETRIZES DE RESPOSTA:
1. SEMPRE comece validando o sentimento em 1 frase curta
2. Seja MUITO BREVE: máximo de 1-2 parágrafos curtos (3-4 linhas cada)
3. Vá direto ao ponto sem enrolação
4. Use linguagem natural e conversacional, sem emojis
5. Para listas, máximo 3 itens

QUANDO SUGERIR AJUDA PROFISSIONAL:
- Sintomas de depressão pós-parto ou ansiedade severa
- Dor física intensa ou sangramento anormal
- Pensamentos de auto-lesão
- Qualquer emergência médica
Nesses casos, seja gentil mas firme: "Pelo que você descreveu, é importante conversar com um profissional. Vou te dar os contatos: CVV 188 (24h), SAMU 192."

ESTILO DE CONVERSA:
- Trate por "você" (não use "querida" em excesso)
- Faça perguntas para entender melhor quando necessário
- Compartilhe que muitas mães passam pelo mesmo
- Termine com encorajamento ou pergunta para continuar o diálogo`;


  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const startTime = Date.now();

  try {
    logAICall("gemini", "generateContent", {
      messageCount: messages.length,
      userStage: context?.userStage,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        maxOutputTokens: 250,
      },
      contents,
    });

    const duration = Date.now() - startTime;

    // Enhanced error handling with detailed logging
    if (!response.candidates || response.candidates.length === 0) {
      logger.error({
        service: "gemini",
        finishReason: response.promptFeedback?.blockReason,
        safetyRatings: response.promptFeedback?.safetyRatings,
        duration,
        msg: "NathIA: No candidates in response",
      });
      return "Desculpe, não consegui processar sua mensagem. Pode tentar reformular?";
    }

    const candidate = response.candidates[0];

    // Log finish reason if content is blocked
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      logger.warn({
        service: "gemini",
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        duration,
        msg: "NathIA: Response blocked or incomplete",
      });
    }

    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      logger.error({
        service: "gemini",
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        duration,
        msg: "NathIA: No content parts in response",
      });
      return "Desculpe, não consegui processar sua mensagem. Pode tentar novamente com outras palavras?";
    }

    // Type-safe extraction of text parts
    const textParts = candidate.content.parts
      .filter((part): part is { text: string } => 
        typeof part === 'object' && part !== null && 'text' in part && typeof part.text === 'string'
      )
      .map(part => part.text);

    const responseText = textParts.join("\n\n");

    if (!responseText) {
      logger.warn({
        service: "gemini",
        duration,
        msg: "NathIA: Empty response text after filtering",
      });
      return "Desculpe, não consegui gerar uma resposta. Pode tentar novamente?";
    }

    logger.info({
      service: "gemini",
      duration,
      responseLength: responseText.length,
      msg: "NathIA: Successfully generated response",
    });

    return responseText;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    logger.error({
      service: "gemini",
      err: error,
      duration,
      msg: "Gemini API Error",
    });
    
    // Better error messages based on error type
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 429) {
      return "O serviço está com muitas requisições no momento. Por favor, aguarde alguns segundos e tente novamente.";
    }
    
    return "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.";
  }
}
