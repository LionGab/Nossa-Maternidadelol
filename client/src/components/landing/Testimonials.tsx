import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  "Finalmente um app que me entende sem me fazer sentir culpada. A NathIA me ajuda todos os dias.",
  "Os 5 minutos diários fazem uma diferença enorme. Consigo me cuidar sem abandonar a rotina.",
  "A comunidade é incrível. Não estou mais sozinha nessa jornada da maternidade.",
];

export function Testimonials() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-3">
            O que as mães estão dizendo
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6" data-testid={`testimonial-${index}`}>
              <Quote className="w-8 h-8 text-pink-accent mb-4 opacity-50" />
              <p className="text-sm text-foreground italic leading-relaxed">
                {testimonial}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
