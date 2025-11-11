import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AiMessage } from "@shared/schema";
import nathPortrait from "@assets/nat2_1762840094067.png";

const SUGGESTED_PROMPTS = [
  "Como lidar com o enjoo matinal?",
  "Dicas para amamentação",
  "Exercícios seguros na gravidez",
  "Como cuidar do meu bem-estar emocional?",
  "Rotina de sono do bebê",
  "Alimentação saudável para gestantes",
];

export default function NathIA() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<AiMessage[]>({
    queryKey: [`/api/nathia/messages/${sessionId}`],
    enabled: !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/nathia/chat", {
        sessionId,
        message: content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/nathia/messages/${sessionId}`] });
      setInput("");
    },
  });

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input.trim());
  };

  const handlePromptClick = (prompt: string) => {
    if (sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(prompt);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background via-accent/5 to-background pb-16">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <img 
              src={nathPortrait} 
              alt="Nath" 
              className="w-12 h-12 rounded-full object-cover border-2 border-pink-accent shadow-md dark:shadow-lg"
            />
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">
                NathIA
              </h1>
              <p className="text-sm text-muted-foreground">
                Sua assistente acolhedora
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <div className="px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-3">
              Sugestões de perguntas:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover-elevate active-elevate-2 py-2 px-3 border-2 border-accent text-foreground rounded-full"
                  onClick={() => handlePromptClick(prompt)}
                  data-testid={`prompt-${index}`}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="max-w-2xl mx-auto py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-pink-accent mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Olá! Como posso ajudar você hoje?
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.role}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card text-card-foreground shadow-sm rounded-bl-sm border border-border"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-card text-card-foreground rounded-lg rounded-bl-sm px-4 py-3 shadow-sm border border-border">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-card border-t border-border p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite sua mensagem..."
            className="resize-none rounded-xl border-2 focus:border-primary min-h-[44px] max-h-32"
            rows={1}
            data-testid="input-message"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="bg-pink-accent hover:bg-pink-accent/90 text-white rounded-full w-12 h-12 flex-shrink-0"
            size="icon"
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
