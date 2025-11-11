// Using Replit AI Integrations for Gemini (no personal API key needed)
import { GoogleGenAI } from "@google/genai";

// This uses Replit's AI Integrations service - charges are billed to your Replit credits
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        maxOutputTokens: 250,
      },
      contents,
    });

    // Enhanced error handling with detailed logging
    if (!response.candidates || response.candidates.length === 0) {
      console.error("❌ NathIA: No candidates in response", {
        finishReason: response.promptFeedback?.blockReason,
        safetyRatings: response.promptFeedback?.safetyRatings,
      });
      return "Desculpe, não consegui processar sua mensagem. Pode tentar reformular?";
    }

    const candidate = response.candidates[0];
    
    // Log finish reason if content is blocked
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      console.warn("⚠️ NathIA: Response blocked or incomplete", {
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
      });
    }
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error("❌ NathIA: No content parts in response", {
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
      });
      return "Desculpe, não consegui processar sua mensagem. Pode tentar novamente com outras palavras?";
    }

    const textParts = candidate.content.parts
      .filter((part: any) => part.text)
      .map((part: any) => part.text);

    const responseText = textParts.join("\n\n");

    if (!responseText) {
      console.warn("⚠️ NathIA: Empty response text after filtering");
      return "Desculpe, não consegui gerar uma resposta. Pode tentar novamente?";
    }

    return responseText;
  } catch (error: any) {
    console.error("❌ Gemini API Error:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error.errorDetails,
    });
    
    // Better error messages based on error type
    if (error.status === 429) {
      return "O serviço está com muitas requisições no momento. Por favor, aguarde alguns segundos e tente novamente.";
    }
    
    return "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.";
  }
}
