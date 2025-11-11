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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progresso Pessoal */}
        <Card className="p-6 animate-in fade-in slide-in-from-bottom duration-700" data-testid="card-progress">
          <div className="flex items-start gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-pink-accent flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-1">
                Seu Progresso
              </h2>
              <p className="text-sm text-muted-foreground">
                Continue assim, você está arrasando!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Hábitos da Semana */}
            {loadingStats ? (
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ) : weekStats && weekStats.total > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Hábitos esta semana
                  </span>
                  <span className="text-sm font-bold text-pink-accent" data-testid="text-week-progress">
                    {weekStats.completed} de {weekStats.total}
                  </span>
                </div>
                <Progress value={weekProgress} className="h-2" data-testid="progress-habits" />
                {weekProgress >= 70 && (
                  <p className="text-xs text-pink-accent mt-2 font-medium">
                    🎉 Incrível! Você está muito consistente!
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Comece a registrar seus hábitos!
                </p>
                <Link href="/habitos">
                  <Button variant="outline" size="sm" className="mt-2" data-testid="button-start-habits">
                    Criar Hábitos
                  </Button>
                </Link>
              </div>
            )}

            {/* Dias de Uso */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground" data-testid="text-days-using">{daysUsingApp}</span> {daysUsingApp === 1 ? 'dia' : 'dias'} com a gente
              </span>
            </div>
          </div>
        </Card>

        {/* Último Vídeo da Nath */}
        {loadingPost ? (
          <Card className="p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-32 h-20 bg-muted rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ) : latestPost ? (
          <Link href={`/mundo-nath`}>
            <Card className="p-5 hover-elevate active-elevate-2 cursor-pointer transition-all animate-in fade-in slide-in-from-bottom duration-700 delay-100" data-testid="card-latest-video">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-muted">
                  {latestPost.thumbnailUrl ? (
                    <img 
                      src={latestPost.thumbnailUrl} 
                      alt={latestPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary-light))] to-[hsl(var(--pink-light))] flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs" data-testid="badge-video-new">
                      Novo
                    </Badge>
                    {latestPost.premium && (
                      <Badge variant="default" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-serif font-semibold text-foreground mb-1 line-clamp-2" data-testid="text-video-title">
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

        {/* NathIA em Destaque */}
        <Card className="p-6 bg-gradient-to-br from-[hsl(var(--pink-light))] to-card animate-in fade-in slide-in-from-bottom duration-700 delay-200" data-testid="card-nathia-featured">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-pink-accent/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-pink-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-1">
                NathIA - Sua Assistente 24/7
              </h2>
              <p className="text-sm text-muted-foreground">
                Assistência empática sempre que precisar
              </p>
            </div>
          </div>

          {recentAiMessages && recentAiMessages.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Última conversa:</p>
                <p className="text-sm text-foreground line-clamp-2" data-testid="text-last-message">
                  {recentAiMessages[recentAiMessages.length - 1]?.content}
                </p>
              </div>
              <Link href="/nathia">
                <Button variant="outline" className="w-full" data-testid="button-continue-chat">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Continuar Conversa
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Pergunta sugerida:</p>
                <p className="text-sm text-foreground italic" data-testid="text-suggested-question">
                  "{randomQuestion}"
                </p>
              </div>
              <Link href="/nathia">
                <Button className="w-full" data-testid="button-start-chat">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conversar com NathIA
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Ações Rápidas */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <h2 className="text-lg font-serif font-semibold text-foreground">
            Ações Rápidas
          </h2>

          <Link href="/mundo-nath">
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid="card-quick-video">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary-light))] flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    Explorar Conteúdos
                  </h3>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/mae-valente">
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid="card-quick-search">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    MãeValente (Pesquisar)
                  </h3>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/habitos">
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid="card-quick-habit">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--pink-light))] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-pink-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    Registrar Hábitos
                  </h3>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Dica do Dia (menor) */}
        {dailyFeatured?.tip && (
          <Card className="p-4 bg-gradient-to-br from-[hsl(var(--primary-light))] to-card animate-in fade-in slide-in-from-bottom duration-700 delay-400" data-testid="card-daily-tip">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-pink-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-serif font-semibold text-primary mb-1">
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
