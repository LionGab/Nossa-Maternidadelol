import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, MessageCircle, Smile, Frown, Meh, Battery, Moon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Demo() {
  const [screen, setScreen] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>
        <div className="flex gap-1">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setScreen(num as 1 | 2 | 3)}
              className={`w-2 h-2 rounded-full transition-colors ${
                screen === num ? "bg-pink-accent" : "bg-muted"
              }`}
              data-testid={`nav-dot-${num}`}
            />
          ))}
        </div>
        <div className="w-20"></div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {screen === 1 && <Screen1 />}
          {screen === 2 && <Screen2 />}
          {screen === 3 && <Screen3 />}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t bg-card px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          {screen > 1 && (
            <Button
              variant="outline"
              onClick={() => setScreen((screen - 1) as 1 | 2 | 3)}
              className="flex-1"
              data-testid="button-prev"
            >
              Anterior
            </Button>
          )}
          {screen < 3 && (
            <Button
              onClick={() => setScreen((screen + 1) as 1 | 2 | 3)}
              className="flex-1"
              data-testid="button-next"
            >
              Próximo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Screen1() {
  const tasks = [
    { id: 1, text: "Respirar fundo 3 vezes ao acordar", done: false, time: "2 min" },
    { id: 2, text: "Beber um copo de água", done: false, time: "1 min" },
    { id: 3, text: "Alongamento leve de pescoço", done: false, time: "2 min" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
          Seu Plano de Hoje
        </h1>
        <p className="text-sm text-muted-foreground">
          3 micro-ações personalizadas (5 min total)
        </p>
        <div className="mt-4">
          <Progress value={0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">0 de 3 completas</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4" data-testid={`task-${task.id}`}>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-muted flex-shrink-0 mt-0.5"></div>
              <div className="flex-1">
                <p className="text-foreground font-medium mb-1">{task.text}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{task.time}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-[hsl(var(--primary-light))]/10 border-primary/20">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          <p className="text-sm text-foreground">
            <strong>Dica:</strong> Toque nas tarefas para marcá-las como concluídas (funcionalidade ativa no app completo)
          </p>
        </div>
      </Card>
    </div>
  );
}

function Screen2() {
  const [selected, setSelected] = useState<{ mood?: string; energy?: string; sleep?: string }>({});

  const moods = [
    { value: "great", label: "Ótimo", icon: Smile, color: "text-green-600" },
    { value: "ok", label: "Normal", icon: Meh, color: "text-yellow-600" },
    { value: "bad", label: "Difícil", icon: Frown, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
          Check-in Rápido
        </h1>
        <p className="text-sm text-muted-foreground">
          Como você está hoje? (opcional, mas ajuda a personalizar)
        </p>
      </div>

      <div className="space-y-6">
        {/* Humor */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Como está seu humor?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {moods.map((mood) => {
              const Icon = mood.icon;
              return (
                <Button
                  key={mood.value}
                  variant={selected.mood === mood.value ? "default" : "outline"}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setSelected({ ...selected, mood: mood.value })}
                  data-testid={`mood-${mood.value}`}
                >
                  <Icon className={`w-6 h-6 ${mood.color}`} />
                  <span className="text-xs">{mood.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Energia */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Nível de energia?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["high", "medium", "low"].map((level) => (
              <Button
                key={level}
                variant={selected.energy === level ? "default" : "outline"}
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setSelected({ ...selected, energy: level })}
                data-testid={`energy-${level}`}
              >
                <Battery className="w-6 h-6" />
                <span className="text-xs capitalize">{level === "high" ? "Alta" : level === "medium" ? "Média" : "Baixa"}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sono */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Como dormiu?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["good", "ok", "bad"].map((sleep) => (
              <Button
                key={sleep}
                variant={selected.sleep === sleep ? "default" : "outline"}
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setSelected({ ...selected, sleep })}
                data-testid={`sleep-${sleep}`}
              >
                <Moon className="w-6 h-6" />
                <span className="text-xs">{sleep === "good" ? "Bem" : sleep === "ok" ? "Normal" : "Mal"}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Screen3() {
  const messages = [
    { from: "user", text: "Estou muito cansada e não sei por onde começar hoje..." },
    { from: "nathia", text: "Eu entendo, mãe. Vamos começar bem devagar? Que tal uma respiração profunda agora? Inspira por 4, segura por 4, solta por 6. Só isso já ajuda a acalmar o sistema nervoso." },
    { from: "user", text: "Ok, fiz! Me sinto um pouco melhor" },
    { from: "nathia", text: "Que bom! 💜 Agora, pensa em UMA coisa pequena que você pode fazer por você hoje. Pode ser tomar um copo de água, lavar o rosto, ou 2 minutos de alongamento. O que parece possível agora?" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-pink-accent flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
          Conversa com a NathIA
        </h1>
        <p className="text-sm text-muted-foreground">
          Exemplo de como a assistente funciona
        </p>
      </div>

      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`message-${index}`}
          >
            <Card
              className={`p-3 max-w-[85%] ${
                msg.from === "user"
                  ? "bg-pink-accent text-white"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </Card>
          </div>
        ))}
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="flex gap-2">
          <input
            type="text"
            disabled
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-background rounded-lg px-3 py-2 text-sm text-muted-foreground"
            data-testid="input-chat-disabled"
          />
          <Button disabled size="icon" data-testid="button-send-disabled">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Chat funcional disponível no app completo
        </p>
      </Card>
    </div>
  );
}
