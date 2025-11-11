import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Play, CheckCircle, Sparkles, TrendingUp, Calendar, Brain } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { DailyFeatured, Tip, Post, AiMessage } from "@shared/schema";
import logoImage from "@assets/ChatGPT Image 11 de nov. de 2025, 02_51_10_1762840279465.png";
import { useEffect, useState } from "react";

export default function Home() {
  const [daysUsingApp, setDaysUsingApp] = useState(0);

  // Calculate days using app from localStorage
  useEffect(() => {
    const firstUseDate = localStorage.getItem("firstUseDate");
    if (!firstUseDate) {
      localStorage.setItem("firstUseDate", new Date().toISOString());
      setDaysUsingApp(1);
    } else {
      const daysDiff = Math.floor(
        (new Date().getTime() - new Date(firstUseDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      setDaysUsingApp(daysDiff + 1);
    }
  }, []);

  const { data: dailyFeatured } = useQuery<DailyFeatured & { tip?: Tip; post?: Post }>({
    queryKey: ["/api/daily-featured"],
  });

  const { data: weekStats, isLoading: loadingStats } = useQuery<{ completed: number; total: number }>({
    queryKey: ["/api/habits/week-stats"],
  });

  const { data: latestPost, isLoading: loadingPost } = useQuery<Post>({
    queryKey: ["/api/posts/latest"],
  });

  const { data: recentAiMessages } = useQuery<AiMessage[]>({
    queryKey: ["/api/nathia/recent"],
  });

  const weekProgress = weekStats ? Math.round((weekStats.completed / weekStats.total) * 100) : 0;
  const suggestedQuestions = [
    "Como lidar com a ansiedade na gravidez?",
    "Dicas para amamentação",
    "Exercícios seguros no pós-parto",
  ];
  const randomQuestion = suggestedQuestions[Math.floor(Math.random() * suggestedQuestions.length)];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-[hsl(var(--primary-light))] to-background p-6 animate-in fade-in duration-500">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img 
            src={logoImage} 
            alt="Nossa Maternidade" 
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-primary shadow-sm animate-in zoom-in duration-700"
          />
          <div className="flex-1 animate-in slide-in-from-right duration-500">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
              Olá, mamãe!
            </h1>
            <p className="text-muted-foreground">
              Seu refúgio sem julgamento
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* CTA PRINCIPAL: NathIA em Destaque - TOPO */}
        <Card className="p-6 bg-gradient-to-br from-[hsl(var(--pink-light))] to-card border-pink-accent/20 animate-in fade-in slide-in-from-bottom duration-500" data-testid="card-nathia-hero">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-pink-accent flex items-center justify-center flex-shrink-0 shadow-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-serif font-bold text-foreground mb-1">
                Pergunte à NathIA
              </h2>
              <p className="text-sm text-muted-foreground">
                Assistência empática, sem julgamento, 24/7
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <Link key={idx} href="/nathia">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs hover-elevate"
                    data-testid={`chip-question-${idx}`}
                  >
                    {question}
                  </Button>
                </Link>
              ))}
            </div>
            <Link href="/nathia">
              <Button className="w-full" size="lg" data-testid="button-chat-now">
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Último Vídeo da Nath */}
        {loadingPost ? (
          <Card className="p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-28 h-20 bg-muted rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ) : latestPost ? (
          <Link href="/mundo-nath">
            <Card className="p-5 hover-elevate active-elevate-2 cursor-pointer transition-all animate-in fade-in slide-in-from-bottom duration-500 delay-100" data-testid="card-latest-video">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-muted">
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
                    <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-pink-accent font-semibold mb-1">
                    NOVO VÍDEO
                  </p>
                  <h3 className="font-serif font-semibold text-foreground mb-1 line-clamp-2 leading-tight" data-testid="text-video-title">
                    {latestPost.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {latestPost.category}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ) : null}

        {/* Progresso da Semana (compacto) */}
        {loadingStats ? (
          <Card className="p-4 animate-pulse">
            <div className="h-3 bg-muted rounded w-full"></div>
          </Card>
        ) : weekStats && weekStats.total > 0 ? (
          <Card className="p-4 animate-in fade-in slide-in-from-bottom duration-500 delay-200" data-testid="card-progress">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-accent" />
                  <span className="text-sm font-medium text-foreground">
                    Progresso esta semana
                  </span>
                </div>
                <span className="text-sm font-bold text-pink-accent" data-testid="text-week-progress">
                  {weekStats.completed}/{weekStats.total}
                </span>
              </div>
              <Progress value={weekProgress} className="h-2" data-testid="progress-habits" />
              {weekProgress >= 70 && (
                <p className="text-xs text-pink-accent font-medium">
                  Continue assim! Você está arrasando
                </p>
              )}
            </div>
          </Card>
        ) : null}

        {/* Ações Rápidas (compactas) */}
        <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
          <Link href="/mundo-nath">
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all text-center" data-testid="card-quick-video">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary-light))] flex items-center justify-center mx-auto mb-2">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-foreground">
                Vídeos
              </p>
            </Card>
          </Link>

          <Link href="/habitos">
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all text-center" data-testid="card-quick-habit">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-foreground">
                Hábitos
              </p>
            </Card>
          </Link>

          <Link href="/mae-valente">
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all text-center" data-testid="card-quick-search">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--pink-light))] flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-pink-accent" />
              </div>
              <p className="text-xs font-medium text-foreground">
                Pesquisar
              </p>
            </Card>
          </Link>
        </div>

        {/* Dica do Dia (menor, no final) */}
        {dailyFeatured?.tip && (
          <Card className="p-4 bg-gradient-to-br from-[hsl(var(--primary-light))] to-card animate-in fade-in slide-in-from-bottom duration-500 delay-400" data-testid="card-daily-tip">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-pink-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-primary mb-1">
                  Dica do Dia
                </h3>
                <p className="text-sm text-foreground" data-testid="text-daily-tip">
                  {dailyFeatured.tip.text}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
