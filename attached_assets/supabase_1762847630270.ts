import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_CONFIG } from '@/config/api';
import {
  validateProfile,
  validateChatMessage,
  validateUserId,
  validateDailyPlan,
  sanitizeObject,
} from '@/utils/validation';

// ⚠️ SEGURANÇA: Supabase DEVE estar configurado para o app funcionar
// Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env

// Validar que variáveis de ambiente estão configuradas
const supabaseUrl = SUPABASE_CONFIG.URL?.trim();
const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '🔴 ERRO FATAL: Supabase não configurado!\n\n' +
      'Configure as variáveis de ambiente:\n' +
      '- EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
      '- EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima\n\n' +
      'Veja docs/INSTALAR_SUPABASE_CLI_WINDOWS.md para instruções.'
  );
}

// Criar cliente Supabase (com credenciais válidas)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Usar AsyncStorage apenas se não estiver no web (web usa localStorage automaticamente)
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types
export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  type: 'gestante' | 'mae' | 'tentante' | 'puerperio' | 'mae_estabelecida';
  pregnancy_week?: number;
  baby_name?: string;
  preferences: string[];
  subscription_tier: 'free' | 'premium';
  created_at: string;
  daily_interactions: number;
  last_interaction_date: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
  context_data?: any;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  priorities: string[];
  tip: string;
  tip_video_url?: string;
  recipe: string;
  created_at: string;
}

/**
 * Cria um usuário temporário/anônimo para testes ou uso sem autenticação
 *
 * Usa autenticação anônima do Supabase para criar um usuário temporário
 * que pode ser usado para testes ou funcionalidades que não requerem login.
 *
 * @returns Dados do usuário criado (incluindo id, access_token, etc)
 * @throws {Error} Se a criação do usuário anônimo falhar
 *
 * @example
 * const user = await createTemporaryUser();
 * console.log("Usuário temporário criado:", user.id);
 */
export const createTemporaryUser = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
};

/**
 * Salva ou atualiza o perfil do usuário
 *
 * Usa upsert para criar um novo perfil ou atualizar um existente.
 * Se o perfil já existir (baseado no id), será atualizado.
 * Caso contrário, será criado um novo perfil.
 *
 * @param profile - Dados parciais do perfil do usuário para salvar/atualizar
 * @returns Array com o perfil salvo/atualizado
 * @throws {Error} Se a operação de upsert falhar ou validação falhar
 *
 * @example
 * const profile = await saveUserProfile({
 *   id: userId,
 *   name: "Maria",
 *   type: "gestante",
 *   pregnancy_week: 20
 * });
 * console.log("Perfil salvo:", profile[0]);
 */
export const saveUserProfile = async (profile: Partial<UserProfile>) => {
  // Validar dados antes de salvar
  validateProfile(profile);

  // Sanitizar objeto para remover caracteres perigosos
  const sanitizedProfile = sanitizeObject(profile, 1000);

  const { data, error } = await supabase.from('user_profiles').upsert(sanitizedProfile).select();

  if (error) throw error;
  return data;
};

/**
 * Salva uma mensagem de chat no banco de dados
 *
 * Insere uma nova mensagem de chat (pergunta do usuário e resposta da NAT-IA)
 * na tabela chat_messages do Supabase.
 *
 * @param message - Dados parciais da mensagem de chat (user_id, message, response, context_data)
 * @returns Array com a mensagem salva
 * @throws {Error} Se a inserção falhar ou validação falhar
 *
 * @example
 * const chatMessage = await saveChatMessage({
 *   user_id: userId,
 *   message: "Olá!",
 *   response: "Olá! Como posso ajudar?",
 *   context_data: { pregnancy_week: 20 }
 * });
 * console.log("Mensagem salva:", chatMessage[0].id);
 */
export const saveChatMessage = async (message: Partial<ChatMessage>) => {
  // Validar dados antes de salvar
  validateChatMessage(message);

  // Sanitizar objeto para remover caracteres perigosos
  const sanitizedMessage = sanitizeObject(message, 10000);

  const { data, error } = await supabase.from('chat_messages').insert(sanitizedMessage).select();

  if (error) throw error;
  return data;
};

/**
 * Busca o histórico de mensagens de chat do usuário
 *
 * Retorna as mensagens de chat ordenadas cronologicamente (mais antigas primeiro).
 * Por padrão, retorna até 50 mensagens, mas o limite pode ser customizado.
 *
 * @param userId - ID do usuário para buscar o histórico
 * @param limit - Número máximo de mensagens a retornar (padrão: 50, máximo: 100)
 * @returns Array de mensagens de chat ordenadas cronologicamente (mais antigas primeiro)
 * @throws {Error} Se a busca falhar ou validação falhar
 *
 * @example
 * const history = await getChatHistory(userId, 20);
 * console.log(`Histórico com ${history.length} mensagens`);
 * history.forEach(msg => console.log(msg.message));
 */
export const getChatHistory = async (userId: string, limit: number = 50) => {
  // Validar userId
  validateUserId(userId);

  // Validar e limitar o limit
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) throw error;
  return data?.reverse() || [];
};

/**
 * Salva ou atualiza o plano diário do usuário
 *
 * Usa upsert para criar um novo plano diário ou atualizar um existente.
 * O plano diário contém prioridades, dicas, receitas e outras informações
 * personalizadas para o dia específico.
 *
 * @param plan - Dados parciais do plano diário (user_id, date, priorities, tip, recipe, etc)
 * @returns Array com o plano diário salvo/atualizado
 * @throws {Error} Se a operação de upsert falhar ou validação falhar
 *
 * @example
 * const dailyPlan = await saveDailyPlan({
 *   user_id: userId,
 *   date: "2025-01-15",
 *   priorities: ["Descansar", "Hidratar"],
 *   tip: "Dica do dia",
 *   recipe: "Receita saudável"
 * });
 * console.log("Plano diário salvo:", dailyPlan[0].id);
 */
export const saveDailyPlan = async (plan: Partial<DailyPlan>) => {
  // Validar dados antes de salvar
  validateDailyPlan(plan);

  // Sanitizar objeto para remover caracteres perigosos
  const sanitizedPlan = sanitizeObject(plan, 2000);

  const { data, error } = await supabase.from('daily_plans').upsert(sanitizedPlan).select();

  if (error) throw error;
  return data;
};

/**
 * Busca o plano diário do usuário para uma data específica
 *
 * Retorna o plano diário do usuário para a data especificada.
 * Se não houver plano para a data, retorna null (sem lançar erro).
 *
 * @param userId - ID do usuário para buscar o plano
 * @param date - Data no formato YYYY-MM-DD para buscar o plano
 * @returns Plano diário encontrado ou null se não existir
 * @throws {Error} Se a busca falhar (exceto quando não encontrar registro) ou validação falhar
 *
 * @example
 * const plan = await getDailyPlan(userId, "2025-01-15");
 * if (plan) {
 *   console.log("Prioridades:", plan.priorities);
 * } else {
 *   console.log("Nenhum plano encontrado para esta data");
 * }
 */
export const getDailyPlan = async (userId: string, date: string) => {
  // Validar userId
  validateUserId(userId);

  // Validar formato de data
  validateDailyPlan({ user_id: userId, date });

  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
