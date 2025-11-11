import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Play, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DailyFeatured, Tip, Post } from "@shared/schema";
import logoImage from "@assets/ChatGPT Image 11 de nov. de 2025, 02_51_10_1762840279465.png";
import welcomeImage from "@assets/nat3_1762840094066.png";

export default function Home() {
  const { data: dailyFeatured, isLoading: loadingDaily } = useQuery<DailyFeatured & { tip?: Tip; post?: Post }>({
    queryKey: ["/api/daily-featured"],
  });

  const { data: quickActions } = useQuery<Post[]>({
    queryKey: ["/api/posts/featured"],
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/10 via-accent/20 to-background p-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img 
            src={logoImage} 
            alt="Nossa Maternidade" 
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-1">
              Olá, mamãe!
            </h1>
            <p className="text-muted-foreground">
              Seu refúgio sem julgamento
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Daily Featured */}
        {loadingDaily ? (
          <Card className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
          </Card>
        ) : dailyFeatured ? (
          <Card className="bg-gradient-to-br from-accent/30 to-white p-6 border-none shadow-md" data-testid="card-daily-featured">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-pink-accent flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-primary mb-1">
                  Frase do Dia
                </h2>
                {dailyFeatured.quote && (
                  <p className="text-lg italic text-foreground leading-relaxed">
                    "{dailyFeatured.quote}"
                  </p>
                )}
              </div>
            </div>

            {dailyFeatured.tip && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-primary mb-2">
                  Dica Prática
                </h3>
                <p className="text-foreground">
                  {dailyFeatured.tip.text}
                </p>
              </div>
            )}
          </Card>
        ) : null}

        {/* Quote Section with Image */}
        <Card className="p-6 bg-gradient-to-br from-accent/20 to-white border-none">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img 
              src={welcomeImage} 
              alt="Maternidade Acolhedora" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover flex-shrink-0"
            />
            <div className="flex-1 text-center md:text-left">
              <p className="text-xl italic text-foreground leading-relaxed">
                "Você está fazendo um ótimo trabalho, mamãe. Cada dia é uma vitória!"
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Ações Rápidas
          </h2>

          <Link href="/mundo-nath">
            <Card className="p-5 hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid="card-quick-video">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Vídeo Novo da Nath
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Confira o conteúdo exclusivo
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/nathia">
            <Card className="p-5 hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid="card-quick-nathia">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-accent/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-pink-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Pergunte à NathIA
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assistência empática 24/7
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/habitos">
            <Card className="p-5 hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid="card-quick-habit">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Registrar Hábito
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pequenas vitórias diárias
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* CTA for non-subscribers */}
        <Card className="bg-gradient-to-br from-pink-accent/10 to-primary/5 p-6 border-pink-accent/20" data-testid="card-subscribe-cta">
          <div className="text-center">
            <Heart className="w-12 h-12 text-pink-accent mx-auto mb-3" />
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">
              Acesso Completo
            </h3>
            <p className="text-muted-foreground mb-4">
              Conteúdos exclusivos, NathIA ilimitada e muito mais
            </p>
            <p className="text-2xl font-bold text-pink-accent mb-4">
              R$ 19,90/mês
            </p>
            <Button
              className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white font-semibold rounded-full"
              data-testid="button-subscribe"
            >
              Assinar Agora
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
