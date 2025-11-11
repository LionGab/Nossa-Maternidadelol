import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o acesso ao aplicativo?",
    answer: "Atualmente estamos em teste fechado. Você pode explorar as funcionalidades como convidada ou aguardar o lançamento oficial em breve.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim! Todos os seus dados são criptografados e mantidos em total privacidade. Não compartilhamos suas informações com terceiros.",
  },
  {
    question: "O que é o teste fechado?",
    answer: "É uma fase de testes limitada onde validamos as funcionalidades com um grupo seleto de usuárias antes do lançamento público. Seu feedback é essencial!",
  },
];

export function FAQ() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-3">
            Perguntas Frequentes
          </h2>
        </div>

        <Card className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </section>
  );
}
