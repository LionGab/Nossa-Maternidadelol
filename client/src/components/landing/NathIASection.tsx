import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const sampleQuestions = [
  "Estou exausta, por onde começo hoje?",
  "Como peço ajuda sem me sentir culpada?",
  "Dica rápida para dormir melhor?",
];

export function NathIASection() {
  return (
    <section className="py-16 bg-gradient-to-br from-[hsl(var(--pink-light))]/10 to-background">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-pink-accent flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-3">
              Conheça a NathIA
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Assistente de inteligência artificial disponível 24/7 para responder suas dúvidas com empatia e sem julgamento
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <p className="text-sm font-medium text-muted-foreground text-center mb-4">
              Exemplos de perguntas:
            </p>
            {sampleQuestions.map((question, index) => (
              <Card 
                key={index} 
                className="p-4 bg-muted/30 border-pink-accent/20" 
                data-testid={`sample-question-${index}`}
              >
                <p className="text-sm text-foreground italic">"{question}"</p>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/nathia">
              <Button size="lg" className="gap-2" data-testid="button-talk-nathia">
                <MessageCircle className="w-4 h-4" />
                Falar com a NathIA
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
