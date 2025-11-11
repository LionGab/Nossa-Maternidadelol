import { Card } from "@/components/ui/card";
import { Moon, Heart, Users, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Moon,
    title: "Sono melhor",
    description: "Técnicas e rotinas para descanso real",
  },
  {
    icon: Heart,
    title: "Menos estresse",
    description: "Ferramentas para aliviar a sobrecarga mental",
  },
  {
    icon: Users,
    title: "Rede de apoio",
    description: "Comunidade que entende sem julgar",
  },
  {
    icon: Sparkles,
    title: "Autocuidado possível",
    description: "Micro-momentos que cabem na sua rotina",
  },
];

export function Benefits() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-3">
            Benefícios reais para o seu dia a dia
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="p-6" data-testid={`benefit-${index}`}>
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary-light))] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
