/**
 * AI Service - NathIA Chat
 *
 * 🔐 SEGURANÇA: Este serviço NÃO expõe API keys.
 * Todas as chamadas de IA são feitas via Edge Functions do Supabase.
 */

export interface ChatContext {
  type?: 'gestante' | 'mae' | 'tentante';
  pregnancy_week?: number;
  baby_name?: string;
  preferences?: string[];
}

/**
 * Chat com NAT-IA via Edge Function (Gemini 2.0 Flash)
 * Usa nathia-chat Edge Function do Supabase
 */
export const chatWithNATIA = async (message: string, context: ChatContext, userId: string): Promise<string> => {
  try {
    const { supabase } = await import('./supabase');

    const { data, error } = await supabase.functions.invoke('nathia-chat', {
      body: {
        userId,
        message,
        context,
      },
    });

    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!data?.response) {
      throw new Error('Resposta vazia da Edge Function');
    }

    return data.response;
  } catch (error: any) {
    // Re-throw para ser tratado pelo retry system
    throw new Error(`NAT-IA API error: ${error.message}`);
  }
};

// 🔴 SEGURANÇA: Funções deletadas para prevenir exposição de API keys
// As seguintes funções foram REMOVIDAS porque expunham API keys no cliente:
// - chatWithAI (usava CLAUDE_API_KEY) → Use chatWithNATIA (Edge Function)
// - validateWithGPT (usava OPENAI_API_KEY) → Validação agora no backend
// - generateDailyPlan (usava OPENAI_API_KEY) → Use daily-insight Edge Function
// - generateImage (usava OPENAI_API_KEY) → Funcionalidade removida
//
// ⚠️ NUNCA exponha API keys no código cliente! Sempre use Edge Functions.

export const detectUrgency = (message: string): boolean => {
  const urgencyKeywords = [
    'sangrando',
    'sangramento',
    'sangue',
    'dor forte',
    'muita dor',
    'dor insuportável',
    'desmaio',
    'desmaiei',
    'febre alta',
    'convulsão',
    'não me sinto bem',
    'emergência',
    'urgente',
  ];

  const lowerMessage = message.toLowerCase();
  return urgencyKeywords.some((keyword) => lowerMessage.includes(keyword));
};
