/**
 * Exemplos de Testes para NAT-IA
 * Copie e adapte estes testes para seu projeto
 */

import {
  // Módulo 1: Chat
  chatEmpatico,
  createChatContext,
  addToHistory,
  truncateHistory,

  // Módulo 2: Triagem
  classificarSentimento,
  detectarRisco,

  // Módulo 3: Onboarding
  analisarRespostas,
  gerarStarterPack,
  isOnboardingComplete,

  // Módulo 4: Curadoria
  resumirConteudo,
  criarCincoMinutos,
  gerarChecklist,
  validateChecklist,

  // Módulo 5: Moderação
  analisarMensagem,
  decidirAcao,

  // Módulo 6: Recomendações
  recomendarConteudo,

  // Módulo 7: Hábitos
  criarMicroObjetivo,
  gerarMensagemMotivacional,

  // Módulo 8: Analytics
  extrairRotulos,
  anonimizar,
  validarConformidadeLGPD,

  // Módulo 9: Copys
  gerarPushNotification,
  validarCopyBrand,

  // Utils
  healthCheck,

  // Tipos
  ValidationError,
  NathiaError,
} from '../index';
import type { Checklist, ModerationAnalysis } from '../types';

// ============= MÓDULO 1: CHAT =============

describe('Módulo 1: Chat Empático', () => {
  describe('chatEmpatico', () => {
    it('deve processar mensagem com contexto válido', async () => {
      const contexto = createChatContext('user_123', {
        user_profile: { stage: 'mid' },
      });

      const resposta = await chatEmpatico('Estou preocupada', contexto);

      expect(resposta).toHaveProperty('resposta');
      expect(resposta).toHaveProperty('acoes');
      expect(resposta).toHaveProperty('next_step');
      expect(Array.isArray(resposta.acoes)).toBe(true);
    });

    it('deve rejeitar mensagem vazia', async () => {
      const contexto = createChatContext('user_123');

      await expect(chatEmpatico('', contexto)).rejects.toThrow(ValidationError);
    });

    it('deve rejeitar contexto sem user_id', async () => {
      await expect(chatEmpatico('teste', {} as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('Gerenciamento de histórico', () => {
    it('deve adicionar mensagem ao histórico', () => {
      const contexto = createChatContext('user_123');
      const updated = addToHistory(contexto, 'user', 'Olá');

      expect(updated.conversation_history).toHaveLength(1);
      expect(updated.conversation_history![0].role).toBe('user');
      expect(updated.conversation_history![0].content).toBe('Olá');
    });

    it('deve truncar histórico longo', () => {
      let contexto = createChatContext('user_123');

      // Adicionar 50 mensagens
      for (let i = 0; i < 50; i++) {
        contexto = addToHistory(contexto, 'user', `Mensagem ${i}`);
      }

      const truncado = truncateHistory(contexto, 20);
      expect(truncado.conversation_history).toHaveLength(20);
    });
  });
});

// ============= MÓDULO 2: TRIAGEM =============

describe('Módulo 2: Triagem Emocional & Risco', () => {
  describe('classificarSentimento', () => {
    it('deve detectar sentimento positivo', async () => {
      const sentimento = await classificarSentimento('Estou muito feliz, meu bebê dormiu a noite toda!');

      expect(sentimento.valence).toBe('positive');
      expect(sentimento.intensidade).toBeGreaterThan(5);
      expect(sentimento.keywords.length).toBeGreaterThan(0);
    });

    it('deve detectar sentimento negativo', async () => {
      const sentimento = await classificarSentimento('Estou muito triste e preocupada');

      expect(sentimento.valence).toBe('negative');
    });

    it('deve rejeitar mensagem vazia', async () => {
      await expect(classificarSentimento('')).rejects.toThrow(ValidationError);
    });
  });

  describe('detectarRisco', () => {
    it('deve detectar alto risco em mensagem crítica', async () => {
      const risco = await detectarRisco('Não aguento mais viver');

      expect(risco.nivel).toBe('risk');
      expect(risco.confidence).toBeGreaterThan(0.5);
      expect(risco.requires_human_review).toBe(true);
      expect(risco.sinais.length).toBeGreaterThan(0);
    });

    it('deve detectar nível ok em mensagem normal', async () => {
      const risco = await detectarRisco('Como está o tempo hoje?');

      expect(risco.nivel).toBe('ok');
      expect(risco.confidence).toBeLessThan(0.3);
    });

    it('deve detectar nível watch em mensagem preocupante', async () => {
      const risco = await detectarRisco('Estou muito cansada e sozinha');

      expect(['watch', 'ok']).toContain(risco.nivel);
    });
  });
});

// ============= MÓDULO 3: ONBOARDING =============

describe('Módulo 3: Onboarding Inteligente', () => {
  describe('analisarRespostas', () => {
    it('deve analisar respostas completas', async () => {
      const respostas = [
        { question_id: 'stage', answer: 'Segundo trimestre', timestamp: new Date() },
        { question_id: 'concerns', answer: 'Sono,Saúde', timestamp: new Date() },
        { question_id: 'support', answer: 'Tenho apoio', timestamp: new Date() },
      ];

      const analise = await analisarRespostas(respostas);

      expect(analise.stage).toBe('mid');
      expect(analise.concerns).toContain('sono');
      expect(analise.perfil).toBeDefined();
      expect(analise.confidence_score).toBeGreaterThan(0);
    });

    it('deve rejeitar array vazio', async () => {
      await expect(analisarRespostas([])).rejects.toThrow(ValidationError);
    });
  });

  describe('gerarStarterPack', () => {
    it('deve gerar pack completo', async () => {
      const perfil = {
        stage: 'mid' as const,
        concerns: ['sono', 'amamentacao'],
        goals: ['entender_desenvolvimento'],
      };

      const pack = await gerarStarterPack(perfil);

      expect(pack.grupos.length).toBeGreaterThan(0);
      expect(pack.conteudo.length).toBeGreaterThan(0);
      expect(pack.objetivo).toBeTruthy();
      expect(pack.welcome_message).toBeTruthy();
    });
  });

  describe('isOnboardingComplete', () => {
    it('deve retornar true para onboarding completo', () => {
      const respostas = [
        { question_id: 'stage', answer: 'Mid', timestamp: new Date() },
        { question_id: 'concerns', answer: 'Sono', timestamp: new Date() },
        { question_id: 'support', answer: 'Sim', timestamp: new Date() },
        { question_id: 'goals', answer: 'Aprender', timestamp: new Date() },
      ];

      expect(isOnboardingComplete(respostas)).toBe(true);
    });

    it('deve retornar false para onboarding incompleto', () => {
      const respostas = [{ question_id: 'stage', answer: 'Mid', timestamp: new Date() }];

      expect(isOnboardingComplete(respostas)).toBe(false);
    });
  });
});

// ============= MÓDULO 4: CURADORIA =============

describe('Módulo 4: Curadoria de Conteúdo', () => {
  const textoExemplo = `
    A amamentação é um processo natural mas que pode ter desafios.
    É importante buscar apoio quando necessário.
    Cada bebê tem seu próprio ritmo.
    Não existem regras fixas sobre horários.
    O importante é que mãe e bebê estejam bem.
  `.repeat(10); // Repetir para ter texto suficiente

  describe('resumirConteudo', () => {
    it('deve criar resumo válido', async () => {
      const resumo = await resumirConteudo(textoExemplo);

      expect(resumo.original_length).toBe(textoExemplo.length);
      expect(resumo.key_points).toBeDefined();
      expect(resumo.reading_time_minutes).toBeGreaterThan(0);
    });

    it('deve rejeitar texto muito curto', async () => {
      await expect(resumirConteudo('abc')).rejects.toThrow(ValidationError);
    });
  });

  describe('criarCincoMinutos', () => {
    it('deve criar versão 5 minutos', async () => {
      const cincoMin = await criarCincoMinutos(textoExemplo);

      expect(cincoMin.total_time_minutes).toBe(5);
      expect(cincoMin.bullets).toBeDefined();
    });
  });

  describe('validateChecklist', () => {
    it('deve validar checklist bem formada', () => {
      const checklist: Checklist = {
        title: 'Mala da Maternidade',
        items: [
          { text: 'Separar documentos', is_critical: true, order: 1 },
          { text: 'Preparar roupas do bebê', is_critical: false, order: 2 },
        ],
        estimated_completion_time: '30 min',
      };

      expect(validateChecklist(checklist)).toBe(true);
    });

    it('deve rejeitar checklist sem título', () => {
      const checklist: Checklist = {
        title: '',
        items: [],
        estimated_completion_time: '30 min',
      };

      expect(validateChecklist(checklist)).toBe(false);
    });
  });
});

// ============= MÓDULO 5: MODERAÇÃO =============

describe('Módulo 5: Moderação Assistida', () => {
  describe('analisarMensagem', () => {
    it('deve detectar julgamento alto', async () => {
      const analise = await analisarMensagem('Você DEVERIA amamentar! Mães de verdade fazem isso');

      expect(analise.judgement_score).toBeGreaterThan(0.5);
      expect(analise.is_safe).toBe(false);
      expect(analise.concerns.length).toBeGreaterThan(0);
    });

    it('deve aprovar mensagem segura', async () => {
      const analise = await analisarMensagem('Amamentação funcionou bem para mim. Cada mãe sabe o que é melhor.');

      expect(analise.judgement_score).toBeLessThan(0.5);
      expect(analise.toxicity_score).toBeLessThan(0.5);
      expect(analise.is_safe).toBe(true);
    });
  });

  describe('decidirAcao', () => {
    it('deve recomendar reject para scores altos', () => {
      const analise: ModerationAnalysis = {
        judgement_score: 0.9,
        toxicity_score: 0.8,
        is_safe: false,
        concerns: ['julgamento'],
        rationale: '',
      };

      expect(decidirAcao(analise)).toBe('reject');
    });

    it('deve recomendar approve para scores baixos', () => {
      const analise: ModerationAnalysis = {
        judgement_score: 0.1,
        toxicity_score: 0.1,
        is_safe: true,
        concerns: [],
        rationale: '',
      };

      expect(decidirAcao(analise)).toBe('approve');
    });
  });
});

// ============= MÓDULO 7: HÁBITOS =============

describe('Módulo 7: Hábitos & Coaching', () => {
  describe('criarMicroObjetivo', () => {
    it('deve criar micro-objetivo válido', async () => {
      const micro = await criarMicroObjetivo('Quero começar a meditar');

      expect(micro.titulo).toBeTruthy();
      expect(micro.passos.length).toBeGreaterThan(0);
      expect(micro.prazo_dias).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(micro.difficulty);
    });

    it('deve rejeitar objetivo muito curto', async () => {
      await expect(criarMicroObjetivo('abc')).rejects.toThrow(ValidationError);
    });
  });

  describe('gerarMensagemMotivacional', () => {
    it('deve gerar mensagem de celebração para streak alto', () => {
      const progresso = {
        user_id: 'user_123',
        habito_id: 'habit_1',
        streak: 5,
        completude: 70,
        last_completed: new Date(),
        total_completions: 20,
      };

      const msg = gerarMensagemMotivacional(progresso);

      expect(msg.mensagem).toBeTruthy();
      expect(msg.tone).toBe('celebrating');
      expect(msg.avoid_comparison).toBe(true); // SEMPRE true
    });
  });
});

// ============= MÓDULO 8: ANALYTICS =============

describe('Módulo 8: Analytics', () => {
  describe('anonimizar', () => {
    it('deve remover todos os campos PII', () => {
      const dados = {
        user_id: 'user_123',
        name: 'Maria Silva',
        email: 'maria@email.com',
        phone: '11999999999',
        message: 'Mensagem teste',
      };

      const anonimo = anonimizar(dados);

      expect(anonimo).not.toHaveProperty('user_id');
      expect(anonimo).not.toHaveProperty('name');
      expect(anonimo).not.toHaveProperty('email');
      expect(anonimo).not.toHaveProperty('phone');
      expect(anonimo).toHaveProperty('session_id');
      expect(anonimo).toHaveProperty('timestamp');
    });
  });

  describe('validarConformidadeLGPD', () => {
    it('deve aprovar dados sem PII', () => {
      const dados = {
        session_id: 'anon_123',
        interaction_type: 'chat',
        timestamp: new Date(),
      };

      const validacao = validarConformidadeLGPD(dados);

      expect(validacao.compliant).toBe(true);
      expect(validacao.violations).toHaveLength(0);
    });

    it('deve detectar violações de PII', () => {
      const dados = {
        user_id: 'user_123',
        email: 'test@test.com',
      };

      const validacao = validarConformidadeLGPD(dados);

      expect(validacao.compliant).toBe(false);
      expect(validacao.violations.length).toBeGreaterThan(0);
    });
  });
});

// ============= MÓDULO 9: COPYS =============

describe('Módulo 9: Copys Operacionais', () => {
  describe('gerarPushNotification', () => {
    it('deve gerar push válida', async () => {
      const push = await gerarPushNotification({ user_stage: 'mid' }, 'content_alert');

      expect(push.titulo).toBeTruthy();
      expect(push.corpo).toBeTruthy();
      expect(push.titulo.length).toBeLessThanOrEqual(40);
      expect(push.corpo.length).toBeLessThanOrEqual(120);
      expect(push.requires_human_review).toBe(true); // SEMPRE
    });
  });

  describe('validarCopyBrand', () => {
    it('deve detectar tom julgamental', () => {
      const copy = 'Você deveria fazer X. É o correto.';
      const validacao = validarCopyBrand(copy);

      expect(validacao.valid).toBe(false);
      expect(validacao.issues.length).toBeGreaterThan(0);
      expect(validacao.suggestions.length).toBeGreaterThan(0);
    });

    it('deve aprovar copy empático', () => {
      const copy = 'Você pode considerar fazer X. Cada família escolhe o melhor.';
      const validacao = validarCopyBrand(copy);

      expect(validacao.valid).toBe(true);
      expect(validacao.issues).toHaveLength(0);
    });
  });
});

// ============= HEALTH CHECK =============

describe('Health Check', () => {
  it('deve retornar status saudável', () => {
    const health = healthCheck();

    expect(health.status).toBe('healthy');
    expect(health.config_valid).toBe(true);
    expect(health.version).toBe('1.0.0');

    // Verificar todos os módulos
    expect(health.modules.chat).toBe(true);
    expect(health.modules.triagem).toBe(true);
    expect(health.modules.onboarding).toBe(true);
    expect(health.modules.curadoria).toBe(true);
    expect(health.modules.moderacao).toBe(true);
    expect(health.modules.recomendacoes).toBe(true);
    expect(health.modules.habitos).toBe(true);
    expect(health.modules.analytics).toBe(true);
    expect(health.modules.copys).toBe(true);
  });
});

// ============= INTEGRAÇÃO =============

describe('Testes de Integração', () => {
  it('deve processar fluxo completo: chat + triagem + recomendações', async () => {
    const mensagem = 'Estou preocupada com o sono do meu bebê';
    const userId = 'test_user_123';

    // 1. Triagem
    const [sentimento, risco] = await Promise.all([classificarSentimento(mensagem), detectarRisco(mensagem)]);

    expect(sentimento).toBeDefined();
    expect(risco).toBeDefined();

    // 2. Chat
    const contexto = createChatContext(userId);
    const resposta = await chatEmpatico(mensagem, contexto);

    expect(resposta.resposta).toBeDefined();
    expect(resposta.acoes.length).toBeGreaterThan(0);

    // 3. Recomendações
    const recs = await recomendarConteudo(userId, {
      current_mood: sentimento.valence,
    });

    expect(recs.itens).toBeDefined();

    // 4. Analytics
    const labels = await extrairRotulos(mensagem);
    const dadosAnonimos = anonimizar({ message: mensagem, labels });

    expect(dadosAnonimos.session_id).toBeTruthy();
    expect(dadosAnonimos).not.toHaveProperty('user_id');
  });
});
