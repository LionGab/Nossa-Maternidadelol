/**
 * Tipos compartilhados da NAT-IA
 * Sistema de IA empático para Nossa Maternidade
 */

// ============= Chat Empático =============

export interface ChatContext {
  user_id: string;
  conversation_history?: ChatMessage[];
  user_profile?: UserProfile;
  current_mood?: string;
  session_id?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  resposta: string;
  acoes: SuggestedAction[];
  next_step?: string;
  sentiment_detected?: SentimentAnalysis;
}

export interface SuggestedAction {
  type: 'navigation' | 'content' | 'group' | 'habit' | 'support';
  label: string;
  action: string;
  params?: Record<string, any>;
}

// ============= Triagem =============

export type RiskLevel = 'ok' | 'watch' | 'risk';

export interface SentimentAnalysis {
  sentimento: string;
  intensidade: number; // 0-10
  valence: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

export interface RiskAssessment {
  nivel: RiskLevel;
  sinais: string[];
  confidence: number; // 0-1
  requires_human_review: boolean;
  suggested_resources?: string[];
}

export interface SOSActionResult {
  sent_to_moderation: boolean;
  resources_displayed: string[];
  support_contacts: SupportContact[];
  timestamp: Date;
}

export interface SupportContact {
  name: string;
  phone: string;
  description: string;
  available_24_7: boolean;
}

// ============= Onboarding =============

export interface OnboardingResponse {
  question_id: string;
  answer: string;
  timestamp: Date;
}

export interface OnboardingAnalysis {
  stage: 'early' | 'mid' | 'late' | 'postpartum' | 'ttc' | 'other';
  concerns: string[];
  perfil: UserProfile;
  confidence_score: number;
}

export interface UserProfile {
  stage?: string;
  interests?: string[];
  concerns?: string[];
  goals?: string[];
  preferred_content_type?: ('article' | 'video' | 'audio' | 'checklist')[];
  risk_factors?: string[];
}

export interface StarterPack {
  grupos: GroupRecommendation[];
  conteudo: ContentRecommendation[];
  objetivo: string;
  welcome_message: string;
}

export interface GroupRecommendation {
  id: string;
  name: string;
  description: string;
  match_score: number;
  reason: string;
}

export interface ContentRecommendation {
  id: string;
  title: string;
  type: 'article' | 'video' | 'audio' | 'checklist';
  match_score: number;
  reason: string;
  estimated_time: string;
}

// ============= Curadoria =============

export interface ConteudoResumo {
  original_length: number;
  resumo: string;
  key_points: string[];
  reading_time_minutes: number;
}

export interface CincoMinutos {
  bullets: string[];
  total_time_minutes: number;
  action_items?: string[];
}

export interface Checklist {
  title: string;
  items: ChecklistItem[];
  estimated_completion_time: string;
}

export interface ChecklistItem {
  text: string;
  is_critical: boolean;
  order: number;
}

export interface SimplifiedText {
  original: string;
  simplified: string;
  readability_score_before: number;
  readability_score_after: number;
}

// ============= Moderação =============

export interface ModerationAnalysis {
  judgement_score: number; // 0-1
  toxicity_score: number; // 0-1
  is_safe: boolean;
  concerns: string[];
  suggested_rewrite?: string;
  rationale: string;
}

// ============= Recomendações =============

export interface RecommendationContext {
  user_id: string;
  recent_activity?: string[];
  current_mood?: string;
  current_stage?: string;
  preferences?: UserProfile;
}

export interface ContentRecommendations {
  itens: ContentRecommendation[];
  justificativa: string;
  algorithm_version: string;
}

export interface CircleRecommendations {
  circulos: GroupRecommendation[];
  match_scores: Record<string, number>;
}

export interface HabitRecommendation {
  habito: Habit;
  micro_objetivos: MicroGoal[];
  justificativa: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============= Hábitos =============

export interface MicroGoal {
  titulo: string;
  passos: string[];
  prazo_dias: number;
  difficulty: 'easy' | 'medium' | 'hard';
  parent_goal?: string;
}

export interface MotivationalMessage {
  mensagem: string;
  tone: 'encouraging' | 'celebrating' | 'gentle_reminder' | 'supportive';
  avoid_comparison: boolean;
}

export interface HabitProgress {
  user_id: string;
  habito_id: string;
  streak: number;
  completude: number; // 0-100
  last_completed: Date | null;
  total_completions: number;
}

// ============= Analytics =============

export interface ContentLabels {
  tema: string[];
  humor: 'positive' | 'neutral' | 'negative' | 'mixed';
  fase: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface AnonymizedData {
  session_id: string;
  timestamp: Date;
  interaction_type: string;
  metadata: Record<string, any>;
  // Explicitly NO: user_id, name, email, phone, IP, etc.
}

export interface AnalyticsMetrics {
  topics_freq: Record<string, number>;
  sentiment_dist: {
    positive: number;
    neutral: number;
    negative: number;
  };
  engagement: {
    avg_session_length: number;
    interactions_per_session: number;
    return_rate: number;
  };
  time_range: {
    start: Date;
    end: Date;
  };
}

// ============= Copys =============

export interface PushNotification {
  titulo: string;
  corpo: string;
  action?: string;
  requires_human_review: boolean;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
  requires_human_review: boolean;
}

export interface AppStoreCopy {
  titulo: string;
  descricao: string;
  keywords: string[];
  screenshots_suggestions?: string[];
  requires_human_review: boolean;
}

// ============= Erros =============

export class NathiaError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'NathiaError';
  }
}

export class ValidationError extends NathiaError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AIServiceError extends NathiaError {
  constructor(message: string, details?: any) {
    super(message, 'AI_SERVICE_ERROR', details);
    this.name = 'AIServiceError';
  }
}
