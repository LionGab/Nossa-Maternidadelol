import { Card } from "@/components/ui/card";
import { ClipboardList, Calendar, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Responda 5 perguntas",
    description: "Conte sobre sua rotina, necessidades e momento atual",
  },
  {
    icon: Calendar,
    title: "Receba um plano diário de 5 min",
    description: "Micro-ações personalizadas para o seu dia a dia",
  },
  {
    icon: MessageCircle,
    title: "Conte com a NathIA",
    description: "Assistente 24/7 para dúvidas, apoio e orientações sem julgamento",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-3">
            Como funciona
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Três passos simples para começar sua jornada de autocuidado
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="p-6 text-center" data-testid={`step-${index}`}>
                <div className="w-16 h-16 rounded-full bg-pink-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-pink-accent" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
