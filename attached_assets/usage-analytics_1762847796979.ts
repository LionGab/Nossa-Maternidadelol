/**
 * Usage Analytics Service
 *
 * Rastreia padrões de uso da NAT-IA (sem PII):
 * - Temas mais frequentes
 * - Tendências de humor/sentimento
 * - Horários de pico
 * - Distribuição de fases das usuárias
 *
 * PRIVACIDADE: Todos os dados são agregados e anônimos
 */

import { supabase } from '../supabase';
import type { TemaFrequente, HumorTendencia, HorarioPico, FaseUsuarias, UsageAnalytics } from './types';
import { logger } from '@/utils/logger';

// ============= TEMAS MAIS FREQUENTES =============

/**
 * Registra tema de uma conversa (categorizado)
 */
export const trackTema = async (
  session_id: string,
  tema: string,
  categoria: 'saude' | 'emocional' | 'pratico' | 'informacao' | 'emergencia'
): Promise<void> => {
  try {
    const { error } = await supabase.from('nathia_temas').insert({
      session_id,
      tema,
      categoria,
      timestamp: new Date(),
    });

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao registrar tema:', error);
  }
};

/**
 * Retorna temas mais frequentes
 */
export const trackTemasMaisFrequentes = async (
  periodo: string = '30d',
  limit: number = 20
): Promise<TemaFrequente[]> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_temas')
      .select('tema, categoria')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Contar frequência de cada tema
    const temaCount: Record<string, { count: number; categoria: string }> = {};

    data.forEach((d) => {
      if (!temaCount[d.tema]) {
        temaCount[d.tema] = { count: 0, categoria: d.categoria };
      }
      temaCount[d.tema].count++;
    });

    // Converter para array e ordenar por frequência
    const total = data.length;
    const temas: TemaFrequente[] = Object.entries(temaCount)
      .map(([tema, info]) => ({
        tema,
        categoria: info.categoria as any,
        count: info.count,
        percentual: (info.count / total) * 100,
        timestamp_agregacao: new Date(),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return temas;
  } catch (error) {
    logger.error('Erro ao calcular temas frequentes:', error);
    return [];
  }
};

/**
 * Retorna temas agrupados por categoria
 */
export const getTemasPorCategoria = async (periodo: string = '30d'): Promise<Record<string, number>> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_temas')
      .select('categoria')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return {};

    const categoriaCount: Record<string, number> = {};

    data.forEach((d) => {
      categoriaCount[d.categoria] = (categoriaCount[d.categoria] || 0) + 1;
    });

    return categoriaCount;
  } catch (error) {
    logger.error('Erro ao calcular temas por categoria:', error);
    return {};
  }
};

// ============= HUMOR/SENTIMENTO =============

/**
 * Registra sentimento de uma mensagem
 * Sentimento: -1 (muito negativo) a 1 (muito positivo)
 */
export const trackSentimento = async (session_id: string, sentimento_score: number): Promise<void> => {
  try {
    const { error } = await supabase.from('nathia_sentimentos').insert({
      session_id,
      sentimento_score: Math.max(-1, Math.min(1, sentimento_score)), // Limitar entre -1 e 1
      timestamp: new Date(),
    });

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao registrar sentimento:', error);
  }
};

/**
 * Retorna tendência de humor ao longo do tempo
 */
export const trackHumorTendencia = async (periodo: string = '30d'): Promise<HumorTendencia[]> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_sentimentos')
      .select('*')
      .gte('timestamp', dataInicio.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Agrupar por dia
    const porDia: Record<string, number[]> = {};

    data.forEach((d) => {
      const dia = new Date(d.timestamp).toISOString().split('T')[0];
      if (!porDia[dia]) {
        porDia[dia] = [];
      }
      porDia[dia].push(d.sentimento_score);
    });

    // Calcular média e distribuição por dia
    const tendencias: HumorTendencia[] = Object.entries(porDia).map(([dia, scores]) => {
      const sentimento_medio = scores.reduce((acc, s) => acc + s, 0) / scores.length;

      const distribuicao = {
        muito_negativo: scores.filter((s) => s <= -0.6).length,
        negativo: scores.filter((s) => s > -0.6 && s <= -0.2).length,
        neutro: scores.filter((s) => s > -0.2 && s <= 0.2).length,
        positivo: scores.filter((s) => s > 0.2 && s <= 0.6).length,
        muito_positivo: scores.filter((s) => s > 0.6).length,
      };

      return {
        periodo: dia,
        sentimento_medio,
        distribuicao,
      };
    });

    return tendencias;
  } catch (error) {
    logger.error('Erro ao calcular tendência de humor:', error);
    return [];
  }
};

/**
 * Retorna sentimento médio geral
 */
export const getSentimentoMedio = async (periodo: string = '7d'): Promise<number> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_sentimentos')
      .select('sentimento_score')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const soma = data.reduce((acc, d) => acc + d.sentimento_score, 0);
    return soma / data.length;
  } catch (error) {
    logger.error('Erro ao calcular sentimento médio:', error);
    return 0;
  }
};

// ============= HORÁRIOS DE PICO =============

/**
 * Retorna distribuição de interações por horário
 */
export const trackHorariosPico = async (periodo: string = '30d'): Promise<HorarioPico[]> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('chat_messages')
      .select('created_at')
      .gte('created_at', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return [];

    const total = data.length;

    // Contar por hora e dia da semana
    const horarioCount: Record<string, number> = {};

    data.forEach((d) => {
      const date = new Date(d.created_at);
      const hora = date.getHours();
      const diaSemana = date.getDay();
      const key = `${diaSemana}-${hora}`;

      horarioCount[key] = (horarioCount[key] || 0) + 1;
    });

    // Converter para array
    const horarios: HorarioPico[] = Object.entries(horarioCount).map(([key, count]) => {
      const [diaSemana, hora] = key.split('-').map(Number);

      return {
        hora,
        dia_semana: diaSemana,
        volume_interacoes: count,
        percentual_total: (count / total) * 100,
      };
    });

    // Ordenar por volume (maior para menor)
    horarios.sort((a, b) => b.volume_interacoes - a.volume_interacoes);

    return horarios;
  } catch (error) {
    logger.error('Erro ao calcular horários de pico:', error);
    return [];
  }
};

/**
 * Retorna horários de pico consolidados (apenas hora do dia)
 */
export const getHorariosPicoConsolidados = async (
  periodo: string = '30d'
): Promise<Array<{ hora: number; volume: number }>> => {
  try {
    const horarios = await trackHorariosPico(periodo);

    // Consolidar por hora (ignorando dia da semana)
    const horaPico: Record<number, number> = {};

    horarios.forEach((h) => {
      horaPico[h.hora] = (horaPico[h.hora] || 0) + h.volume_interacoes;
    });

    // Converter para array ordenado
    return Object.entries(horaPico)
      .map(([hora, volume]) => ({
        hora: Number(hora),
        volume,
      }))
      .sort((a, b) => a.hora - b.hora);
  } catch (error) {
    logger.error('Erro ao calcular horários consolidados:', error);
    return [];
  }
};

// ============= FASE DAS USUÁRIAS =============

/**
 * Retorna distribuição de usuárias por fase
 */
export const trackFaseUsuarias = async (periodo: string = '30d'): Promise<FaseUsuarias[]> => {
  try {
    const dataInicio = getDataInicio(periodo);

    // Buscar usuárias ativas no período
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_messages')
      .select('user_id')
      .gte('created_at', dataInicio.toISOString());

    if (sessionsError) throw sessionsError;

    if (!sessions || sessions.length === 0) return [];

    // Pegar IDs únicos
    const uniqueUserIds = [...new Set(sessions.map((s) => s.user_id))];

    // Buscar perfis
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('type')
      .in('id', uniqueUserIds);

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) return [];

    const total = profiles.length;

    // Contar por fase
    const faseCount: Record<string, number> = {};

    profiles.forEach((p) => {
      const fase = p.type;
      faseCount[fase] = (faseCount[fase] || 0) + 1;
    });

    // Calcular engajamento (mensagens por usuária)
    const mensagensPorUsuaria = sessions.length / total;

    // Converter para array
    const fases: FaseUsuarias[] = Object.entries(faseCount).map(([fase, count]) => ({
      fase: fase as any,
      count,
      percentual: (count / total) * 100,
      engajamento_medio: mensagensPorUsuaria,
    }));

    // Ordenar por percentual
    fases.sort((a, b) => b.percentual - a.percentual);

    return fases;
  } catch (error) {
    logger.error('Erro ao calcular fases de usuárias:', error);
    return [];
  }
};

// ============= MÉTRICAS CONSOLIDADAS =============

/**
 * Retorna todas as métricas de uso consolidadas
 */
export const getUsageAnalytics = async (periodo: string = '7d'): Promise<UsageAnalytics> => {
  try {
    const dataInicio = getDataInicio(periodo);

    // Buscar sessões e mensagens
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('user_id, created_at')
      .gte('created_at', dataInicio.toISOString());

    if (messagesError) throw messagesError;

    if (!messages || messages.length === 0) {
      return {
        sessoes_diarias: 0,
        usuarios_ativos_diarios: 0,
        mensagens_por_sessao_media: 0,
        tempo_sessao_medio_min: 0,
        taxa_retencao_d7: 0,
        taxa_retencao_d30: 0,
      };
    }

    // Usuários únicos
    const usuarios_unicos = new Set(messages.map((m) => m.user_id)).size;

    // Sessões (assumindo 30min de inatividade = nova sessão)
    const sessoes = contarSessoes(messages);

    // Mensagens por sessão
    const mensagens_por_sessao_media = messages.length / sessoes;

    // Tempo médio de sessão (estimativa)
    const tempo_sessao_medio_min = calcularTempoMedioSessao(messages);

    // Taxas de retenção
    const taxa_retencao_d7 = await calcularRetencao(7);
    const taxa_retencao_d30 = await calcularRetencao(30);

    // Sessões por dia
    const dias = Math.ceil((new Date().getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
    const sessoes_diarias = sessoes / dias;
    const usuarios_ativos_diarios = usuarios_unicos / dias;

    return {
      sessoes_diarias,
      usuarios_ativos_diarios,
      mensagens_por_sessao_media,
      tempo_sessao_medio_min,
      taxa_retencao_d7,
      taxa_retencao_d30,
    };
  } catch (error) {
    logger.error('Erro ao calcular analytics de uso:', error);
    return {
      sessoes_diarias: 0,
      usuarios_ativos_diarios: 0,
      mensagens_por_sessao_media: 0,
      tempo_sessao_medio_min: 0,
      taxa_retencao_d7: 0,
      taxa_retencao_d30: 0,
    };
  }
};

// ============= HELPERS =============

/**
 * Conta número de sessões (30min inatividade = nova sessão)
 */
const contarSessoes = (messages: any[]): number => {
  if (messages.length === 0) return 0;

  // Ordenar por usuário e timestamp
  const sorted = [...messages].sort((a, b) => {
    if (a.user_id !== b.user_id) {
      return a.user_id.localeCompare(b.user_id);
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  let sessoes = 1;
  let ultimoUserId = sorted[0].user_id;
  let ultimoTimestamp = new Date(sorted[0].created_at).getTime();

  for (let i = 1; i < sorted.length; i++) {
    const msg = sorted[i];
    const timestamp = new Date(msg.created_at).getTime();

    // Nova sessão se: outro usuário OU mais de 30min de inatividade
    if (msg.user_id !== ultimoUserId || timestamp - ultimoTimestamp > 30 * 60 * 1000) {
      sessoes++;
    }

    ultimoUserId = msg.user_id;
    ultimoTimestamp = timestamp;
  }

  return sessoes;
};

/**
 * Calcula tempo médio de sessão (em minutos)
 */
const calcularTempoMedioSessao = (messages: any[]): number => {
  if (messages.length === 0) return 0;

  // Agrupar por usuário
  const porUsuario: Record<string, number[]> = {};

  messages.forEach((m) => {
    if (!porUsuario[m.user_id]) {
      porUsuario[m.user_id] = [];
    }
    porUsuario[m.user_id].push(new Date(m.created_at).getTime());
  });

  // Calcular duração de cada sessão
  const duracoes: number[] = [];

  Object.values(porUsuario).forEach((timestamps) => {
    if (timestamps.length < 2) return;

    timestamps.sort((a, b) => a - b);
    const duracao = (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60);
    duracoes.push(duracao);
  });

  if (duracoes.length === 0) return 0;

  const soma = duracoes.reduce((acc, d) => acc + d, 0);
  return soma / duracoes.length;
};

/**
 * Calcula taxa de retenção (% usuários que voltam)
 */
const calcularRetencao = async (dias: number): Promise<number> => {
  try {
    const hoje = new Date();
    const dataInicio = new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000);
    const dataInicioRetencao = new Date(hoje.getTime() - dias * 2 * 24 * 60 * 60 * 1000);

    // Usuários que estavam ativos no período inicial
    const { data: usuariosIniciais, error: error1 } = await supabase
      .from('chat_messages')
      .select('user_id')
      .gte('created_at', dataInicioRetencao.toISOString())
      .lt('created_at', dataInicio.toISOString());

    if (error1) throw error1;

    if (!usuariosIniciais || usuariosIniciais.length === 0) return 0;

    const idsIniciais = new Set(usuariosIniciais.map((u) => u.user_id));

    // Usuários que voltaram no período seguinte
    const { data: usuariosRetorno, error: error2 } = await supabase
      .from('chat_messages')
      .select('user_id')
      .gte('created_at', dataInicio.toISOString());

    if (error2) throw error2;

    if (!usuariosRetorno || usuariosRetorno.length === 0) return 0;

    const idsRetorno = new Set(usuariosRetorno.map((u) => u.user_id));

    // Contar quantos voltaram
    let retornaram = 0;
    idsIniciais.forEach((id) => {
      if (idsRetorno.has(id)) {
        retornaram++;
      }
    });

    return (retornaram / idsIniciais.size) * 100;
  } catch (error) {
    logger.error('Erro ao calcular retenção:', error);
    return 0;
  }
};

/**
 * Converte período em data de início
 */
const getDataInicio = (periodo: string): Date => {
  const agora = new Date();

  switch (periodo) {
    case '1h':
      return new Date(agora.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
};
