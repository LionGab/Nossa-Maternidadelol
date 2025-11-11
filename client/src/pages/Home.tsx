import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Play, CheckCircle, Sparkles, TrendingUp, Send, Heart, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DailyFeatured, Tip, Post, CommunityPost, DailyQuestion } from "@shared/schema";
import { useState } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [chatInput, setChatInput] = useState("");

  const { data: dailyFeatured } = useQuery<DailyFeatured & { tip?: Tip; post?: Post }>({
    queryKey: ["/api/daily-featured"],
  });

  const { data: weekStats } = useQuery<{ completed: number; total: number }>({
    queryKey: ["/api/habits/week-stats"],
  });

  const { data: latestPost } = useQuery<Post>({
    queryKey: ["/api/posts/latest"],
  });

  const { data: dailyQuestion } = useQuery<DailyQuestion | null>({
    queryKey: ["/api/community/question"],
  });

  const { data: questionResponses } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", "question_response"],
    queryFn: () => fetch("/api/community/posts?type=question_response&limit=3").then(r => r.json()),
  });

  const { data: victories } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", "victory"],
    queryFn: () => fetch("/api/community/posts?type=victory&limit=5").then(r => r.json()),
  });

  const weekProgress = weekStats ? Math.round((weekStats.completed / weekStats.total) * 100) : 0;
  
  const quickTopics = ["Sono", "Ansiedade", "Amamentação", "Exercícios", "Alimentação", "Relacionamento"];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      localStorage.setItem("pendingQuestion", chatInput);
      setLocation("/nathia");
    }
  };

  const handleTopicClick = (topic: string) => {
    localStorage.setItem("pendingQuestion", `Me ajude com: ${topic}`);
    setLocation("/nathia");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Minimalista */}
      <header className="bg-gradient-to-br from-[hsl(var(--primary-light))] to-background p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground">Olá, mamãe!</h1>
          <p className="text-sm text-muted-foreground">Seu refúgio sem julgamento</p>
        </div>
      </header>

      {/* Grid Desktop: 2 Colunas */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-2">
        
        {/* COLUNA ESQUERDA: Chat */}
        <div className="space-y-4">
          
          {/* Chat CTA Principal - PRIORIDADE NO TOPO */}
          <Card className="p-5 bg-gradient-to-br from-[hsl(var(--pink-light))]/20 to-card border-pink-accent/20" data-testid="card-chat-hero">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-accent flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Pergunte à NathIA</h2>
                <p className="text-xs text-muted-foreground">Assistência 24/7, sem julgamento</p>
              </div>
            </div>

            {/* Input de Chat Direto */}
            <form onSubmit={handleChatSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-pink-accent/50 transition-all"
                  placeholder="Ex.: Insônia no puerpério, o que fazer?"
                  data-testid="input-chat-home"
                />
                <Button 
                  type="submit"
                  size="icon"
                  className="h-auto w-12 rounded-xl"
                  disabled={!chatInput.trim()}
                  data-testid="button-send-chat"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Chips de Tópicos */}
              <div className="flex flex-wrap gap-2">
                {quickTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className="rounded-full bg-muted/60 hover-elevate active-elevate-2 px-3 py-1.5 text-xs text-foreground transition-all"
                    data-testid={`chip-topic-${topic.toLowerCase()}`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </form>
          </Card>

          {/* Último Vídeo Mobile */}
          {latestPost && (
            <Link href="/mundo-nath" className="md:hidden block">
              <Card className="p-4 hover-elevate active-elevate-2 transition-all" data-testid="card-latest-video-mobile">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-muted">
                    {latestPost.thumbnailUrl ? (
                      <img 
                        src={latestPost.thumbnailUrl} 
                        alt={latestPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary-light))] to-[hsl(var(--pink-light))] flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-3 h-3 text-primary ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-pink-accent font-semibold mb-1">NOVO VÍDEO</p>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight" data-testid="text-video-title">
                      {latestPost.title}
                    </h3>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* COLUNA DIREITA: Ações + Paywall */}
        <div className="space-y-4">
          
          {/* Último Vídeo Desktop */}
          {latestPost && (
            <Link href="/mundo-nath" className="hidden md:block">
              <Card className="p-4 hover-elevate active-elevate-2 transition-all" data-testid="card-latest-video">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-muted">
                    {latestPost.thumbnailUrl ? (
                      <img 
                        src={latestPost.thumbnailUrl} 
                        alt={latestPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary-light))] to-[hsl(var(--pink-light))] flex items-center justify-center">
                        <Play className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-4 h-4 text-primary ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-pink-accent font-semibold mb-1">NOVO VÍDEO</p>
                    <h3 className="font-serif font-semibold text-foreground line-clamp-2 leading-tight">
                      {latestPost.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{latestPost.category}</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {/* Progresso da Semana */}
          {weekStats && weekStats.total > 0 && (
            <Card className="p-4" data-testid="card-progress">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink-accent" />
                    <span className="text-sm font-medium text-foreground">Progresso esta semana</span>
                  </div>
                  <span className="text-sm font-bold text-pink-accent" data-testid="text-week-progress">
                    {weekStats.completed}/{weekStats.total}
                  </span>
                </div>
                <Progress value={weekProgress} className="h-2" data-testid="progress-habits" />
                {weekProgress >= 70 && (
                  <p className="text-xs text-pink-accent font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Continue assim! Você está arrasando
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Ações Rápidas */}
          <div className="grid grid-cols-3 gap-3">
            <Link href="/mundo-nath">
              <Card className="p-3 hover-elevate active-elevate-2 transition-all text-center" data-testid="card-quick-video">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary-light))] flex items-center justify-center mx-auto mb-2">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-foreground">Vídeos</p>
              </Card>
            </Link>

            <Link href="/habitos">
              <Card className="p-3 hover-elevate active-elevate-2 transition-all text-center" data-testid="card-quick-habit">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-foreground">Hábitos</p>
              </Card>
            </Link>

            <Link href="/mae-valente">
              <Card className="p-3 hover-elevate active-elevate-2 transition-all text-center" data-testid="card-quick-refugionath">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--pink-light))] flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-pink-accent" />
                </div>
                <p className="text-xs font-medium text-foreground">RefúgioNath</p>
              </Card>
            </Link>
          </div>

          {/* Dica do Dia (pequena, no final) */}
          {dailyFeatured?.tip && (
            <Card className="p-3 bg-gradient-to-br from-[hsl(var(--primary-light))]/30 to-card" data-testid="card-daily-tip">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-pink-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-primary mb-1">Dica do Dia</p>
                  <p className="text-xs text-foreground/80" data-testid="text-daily-tip">
                    {dailyFeatured.tip.text}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* RefúgioNath - Comunidade */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-accent" />
            <h2 className="text-lg font-semibold text-foreground">RefúgioNath</h2>
          </div>
          <Link href="/mae-valente">
            <Button variant="ghost" size="sm" className="text-xs" data-testid="button-see-all-community">
              Ver tudo
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Pergunta do Dia */}
          {dailyQuestion && (
            <Card className="p-5" data-testid="card-daily-question">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-accent/20 to-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-pink-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Pergunta do Dia</h3>
                  <p className="text-sm text-foreground/90" data-testid="text-daily-question">
                    {dailyQuestion.question}
                  </p>
                </div>
              </div>

              {/* Respostas recentes */}
              <div className="space-y-3">
                {questionResponses && questionResponses.length > 0 ? (
                  questionResponses.map((response) => (
                    <div key={response.id} className="rounded-xl bg-muted/30 p-3" data-testid={`response-${response.id}`}>
                      <div className="flex items-start gap-2 mb-1">
                        <p className="text-xs font-semibold text-primary">{response.authorName}</p>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{response.content}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Heart className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{response.likes}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    Seja a primeira a responder!
                  </p>
                )}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4" 
                data-testid="button-respond-question"
              >
                Responder
              </Button>
            </Card>
          )}

          {/* Mural de Vitórias */}
          <Card className="p-5" data-testid="card-victories">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Mural de Vitórias</h3>
                <p className="text-xs text-muted-foreground">Celebre suas conquistas</p>
              </div>
            </div>

            {/* Lista de vitórias */}
            <div className="space-y-3">
              {victories && victories.length > 0 ? (
                victories.map((victory) => (
                  <div key={victory.id} className="rounded-xl bg-muted/30 p-3" data-testid={`victory-${victory.id}`}>
                    <div className="flex items-start gap-2 mb-1">
                      <p className="text-xs font-semibold text-primary">{victory.authorName}</p>
                      {victory.featured && (
                        <span className="text-xs bg-pink-accent/20 text-pink-accent px-2 py-0.5 rounded-full">
                          Destaque
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{victory.content}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Heart className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{victory.likes}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Nenhuma vitória ainda
                </p>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4" 
              data-testid="button-share-victory"
            >
              Compartilhar Vitória
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
