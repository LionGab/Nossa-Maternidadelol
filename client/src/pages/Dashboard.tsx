import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Play, CheckCircle, Sparkles, TrendingUp, Send, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { DailyFeatured, Tip, Post, CommunityPost } from "@shared/schema";
import { useState } from "react";

export default function Dashboard() {
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

  const { data: featuredPosts = [] } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", "featured"],
    queryFn: async () => {
      const response = await fetch("/api/community/posts?featured=true&limit=3");
      if (!response.ok) throw new Error("Erro ao carregar posts");
      return response.json();
    },
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

            <Link href="/refugio-nath">
              <Card className="p-3 hover-elevate active-elevate-2 transition-all text-center" data-testid="card-quick-community">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--pink-light))] flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-pink-accent" />
                </div>
                <p className="text-xs font-medium text-foreground">RefúgioNath</p>
              </Card>
            </Link>
          </div>

          {/* Destaques da Comunidade */}
          {featuredPosts.length > 0 && (
            <Card className="p-4" data-testid="card-community-preview">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-accent" />
                  <span className="text-sm font-semibold text-foreground">Destaques da Comunidade</span>
                </div>
                <Link href="/refugio-nath">
                  <Button variant="ghost" size="sm" className="h-auto text-xs text-pink-accent" data-testid="button-view-all-posts">
                    Ver todos
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {featuredPosts.slice(0, 3).map((post) => (
                  <Link key={post.id} href="/refugio-nath">
                    <div className="p-3 rounded-lg bg-muted/30 hover-elevate active-elevate-2 transition-all" data-testid={`preview-post-${post.id}`}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs font-medium text-foreground/90">{post.authorName}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {post.type === "desabafo" ? "Desabafo" : post.type === "vitoria" ? "Vitória" : post.type === "apoio" ? "Apoio" : "Reflexão"}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span>{post.reactionCount} reações</span>
                        <span>{post.commentCount} comentários</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

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
    </div>
  );
}
