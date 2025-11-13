import { GoogleGenAI } from "@google/genai";
import { logger, logAICall } from "../logger";
import type { AgentType } from "@shared/schema";
import type { ChatContext } from "../gemini";
import { getGeneralPrompt } from "./prompts/general-prompt";
import { getHabitsPrompt, type HabitsContext } from "./prompts/habits-prompt";
import { getContentPrompt, type ContentContext } from "./prompts/content-prompt";
import { getCommunityPrompt, type CommunityContext } from "./prompts/community-prompt";

// Using Google Gemini API directly (not Replit AI Integrations)
// Requires GEMINI_API_KEY environment variable

// Lazy initialization - only create client when actually used
let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!_ai) {
    if (!process.env.GEMINI_API_KEY) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "GEMINI_API_KEY é obrigatória em produção. Configure a variável de ambiente no arquivo .env.\n" +
          "Obtenha uma API key em: https://aistudio.google.com/app/apikey"
        );
      }
      throw new Error(
        "GEMINI_API_KEY não configurada. Configure a variável de ambiente no arquivo .env.\n" +
        "Obtenha uma API key em: https://aistudio.google.com/app/apikey"
      );
    }

    _ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return _ai;
}

// Temperature por agente (ajustável)
const AGENT_TEMPERATURES: Record<AgentType, number> = {
  general: 0.8,
  habits: 0.8, // Encorajador e energético
  content: 0.7, // Mais objetivo e curatorial
  community: 0.9, // Mais empático e acolhedor
};

// Max tokens por agente
const AGENT_MAX_TOKENS: Record<AgentType, number> = {
  general: 250,
  habits: 250,
  content: 300, // Pode precisar de mais para recomendações detalhadas
  community: 250,
};

export async function chatWithAgent(
  agentType: AgentType,
  messages: { role: string; content: string }[],
  context?: ChatContext | HabitsContext | ContentContext | CommunityContext
): Promise<string> {
  // Selecionar prompt baseado no tipo de agente
  let systemPrompt: string;
  
  switch (agentType) {
    case "habits":
      systemPrompt = getHabitsPrompt(context as HabitsContext);
      break;
    case "content":
      systemPrompt = getContentPrompt(context as ContentContext);
      break;
    case "community":
      systemPrompt = getCommunityPrompt(context as CommunityContext);
      break;
    case "general":
    default:
      systemPrompt = getGeneralPrompt(context);
      break;
  }

  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const startTime = Date.now();
  const temperature = AGENT_TEMPERATURES[agentType];
  const maxTokens = AGENT_MAX_TOKENS[agentType];

  try {
    logAICall("gemini", "generateContent", {
      agentType,
      messageCount: messages.length,
      userStage: context?.userStage,
    });

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature,
        maxOutputTokens: maxTokens,
      },
      contents,
    });

    const duration = Date.now() - startTime;

    // Enhanced error handling with detailed logging
    if (!response.candidates || response.candidates.length === 0) {
      logger.error({
        service: "gemini",
        agentType,
        finishReason: response.promptFeedback?.blockReason,
        safetyRatings: response.promptFeedback?.safetyRatings,
        duration,
        msg: `Agent ${agentType}: No candidates in response`,
      });
      return "Desculpe, não consegui processar sua mensagem. Pode tentar reformular?";
    }

    const candidate = response.candidates[0];

    // Log finish reason if content is blocked
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      logger.warn({
        service: "gemini",
        agentType,
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        duration,
        msg: `Agent ${agentType}: Response blocked or incomplete`,
      });
    }

    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      logger.error({
        service: "gemini",
        agentType,
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        duration,
        msg: `Agent ${agentType}: No content parts in response`,
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
        agentType,
        duration,
        msg: `Agent ${agentType}: Empty response text after filtering`,
      });
      return "Desculpe, não consegui gerar uma resposta. Pode tentar novamente?";
    }

    logger.info({
      service: "gemini",
      agentType,
      duration,
      responseLength: responseText.length,
      msg: `Agent ${agentType}: Successfully generated response`,
    });

    return responseText;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    logger.error({
      service: "gemini",
      agentType,
      err: error,
      duration,
      msg: `Agent ${agentType}: Gemini API Error`,
    });
    
    // Better error messages based on error type
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 429) {
      return "O serviço está com muitas requisições no momento. Por favor, aguarde alguns segundos e tente novamente.";
    }
    
    return "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.";
  }
}

