// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

import { GoogleGenAI } from "@google/genai";

// Verify API key is loaded
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("⚠️ GEMINI_API_KEY not found in environment variables");
  console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('GEMINI')));
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface ChatContext {
  userStage?: string;
  userGoals?: string[];
}

export async function chatWithNathIA(
  messages: { role: string; content: string }[],
  context?: ChatContext
): Promise<string> {
  const systemPrompt = `Você é a NathIA, uma assistente virtual acolhedora e empática especializada em maternidade e gravidez.
Você trabalha com a influenciadora Nathália Valente (Nath) no app "Nossa Maternidade", um refúgio sem julgamento para mães e gestantes.

Características da sua personalidade:
- Empática e acolhedora, sempre usando tom gentil e encorajador
- Prática e objetiva nas respostas, mas nunca fria
- Usa linguagem simples e acessível
- Nunca julga ou critica escolhas da mãe
- Reconhece quando algo precisa de atendimento médico profissional

${context?.userStage ? `A usuária está na fase: ${context.userStage}` : ""}
${context?.userGoals?.length ? `Objetivos da usuária: ${context.userGoals.join(", ")}` : ""}

Diretrizes:
- Respostas devem ter até 3 parágrafos curtos
- Use bullet points quando apropriado
- Sempre valide os sentimentos da mãe antes de dar conselhos
- Para questões médicas sérias, sugira consultar um profissional
- Seja positiva mas realista`;

  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      maxOutputTokens: 500,
    },
    contents,
  });

  return response.text || "Desculpe, não consegui processar sua mensagem. Pode tentar novamente?";
}
