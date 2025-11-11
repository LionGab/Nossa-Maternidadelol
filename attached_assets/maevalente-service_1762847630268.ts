import { supabase } from './supabase';

export interface QASource {
  title: string;
  url: string;
  snippet: string;
}

export interface QAAnswer {
  answer: string;
  sources: QASource[];
  cached: boolean;
}

export interface QAError {
  error: string;
  limit_exceeded?: boolean;
}

/**
 * MãeValente Q&A Service
 * Usa Gemini Flash via Edge Function com cache e rate limiting
 */
export class MaeValenteService {
  private static readonly FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/perplexity-qa`;

  /**
   * Faz uma pergunta e retorna a resposta com fontes
   */
  static async askQuestion(question: string, userId?: string): Promise<QAAnswer> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(this.FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ question, userId }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData: QAError = await response.json();
          throw new Error(errorData.error || 'Limite de perguntas atingido');
        }
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data: QAAnswer = await response.json();
      return data;
    } catch (error: any) {
      console.error('[MaeValente] Error asking question:', error);
      throw error;
    }
  }

  /**
   * Salva uma pergunta/resposta nos favoritos do usuário
   */
  static async saveFavorite(userId: string, question: string, answer: string): Promise<void> {
    try {
      const { error } = await supabase.from('user_qa_favorites').insert({
        user_id: userId,
        question,
        answer,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('[MaeValente] Error saving favorite:', error);
      throw error;
    }
  }

  /**
   * Obtém perguntas favoritas do usuário
   */
  static async getFavorites(userId: string): Promise<Array<{ question: string; answer: string }>> {
    try {
      const { data, error } = await supabase
        .from('user_qa_favorites')
        .select('question, answer, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[MaeValente] Error fetching favorites:', error);
      return [];
    }
  }

  /**
   * Sugestões de perguntas populares
   */
  static getPopularQuestions(): string[] {
    return [
      'Como aliviar enjoos matinais na gravidez?',
      'Quando devo começar o pré-natal?',
      'Quais alimentos evitar durante a amamentação?',
      'Como lidar com cólicas do bebê?',
      'Posso fazer exercícios durante a gravidez?',
      'Sinais de alerta no pós-parto',
      'Como aumentar a produção de leite materno?',
      'Desenvolvimento do bebê nos primeiros meses',
    ];
  }
}
