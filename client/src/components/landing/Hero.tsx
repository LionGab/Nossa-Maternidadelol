import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import heroImage from "@assets/nat1_1762840094067.png";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[hsl(var(--pink-light))]/20 via-background to-[hsl(var(--primary-light))]/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                Acolhimento, orientação e rotina leve — em 5 minutos por dia.
              </h1>
              <p className="text-lg text-muted-foreground">
                Criado com a Nathália Valente para quem quer menos culpa e mais apoio de verdade.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/demo">
                <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-demo">
                  Entrar como Convidada
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/nathia">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 backdrop-blur-sm" data-testid="button-nathia">
                  <MessageCircle className="w-4 h-4" />
                  Falar com a NathIA
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-accent"></div>
                <span>Sem julgamentos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-accent"></div>
                <span>Conteúdo feito por mães</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-accent"></div>
                <span>Teste fechado</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Nossa Maternidade"
                width="600"
                height="600"
                loading="eager"
                className="w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
