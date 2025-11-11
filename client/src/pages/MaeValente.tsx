import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Heart, Phone, ExternalLink, Clock, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedQa } from "@shared/schema";
import supportImage from "@assets/nat1_1762840094067.png";

interface SearchResult {
  question: string;
  answer: string;
  sources: { title: string; url: string }[];
}

const SUGGESTED_TOPICS = [
  "Como lidar com a ansiedade materna?",
  "Sinais de depressão pós-parto",
  "Autocuidado para mães exaustas",
  "Burnout materno: o que fazer?",
  "Relacionamento após o bebê",
  "Culpa materna: é normal sentir?",
  "Como pedir ajuda sem julgamento",
  "Equilibrar maternidade e identidade",
];

const EMERGENCY_RESOURCES = [
  {
    title: "CVV - Centro de Valorização da Vida",
    contact: "Ligue 188 (24h, gratuito)",
    description: "Apoio emocional e prevenção do suicídio",
    icon: Phone,
  },
  {
    title: "Precisa de Ajuda Urgente?",
    contact: "SAMU 192 | Bombeiros 193",
    description: "Emergências médicas ou de risco imediato",
    icon: Heart,
  },
];

export default function MaeValente() {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);

  const { data: savedItems = [] } = useQuery<SavedQa[]>({
    queryKey: ["/api/mae-valente/saved"],
  });

  const searchMutation = useMutation({
    mutationFn: async (question: string) => {
      return apiRequest("POST", "/api/mae-valente/search", { question });
    },
    onSuccess: (data: any) => {
      setSearchResult(data as SearchResult);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!searchResult) return;
      return apiRequest("POST", "/api/mae-valente/save", searchResult);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mae-valente/saved"] });
    },
  });

  const handleSearch = (topic?: string) => {
    const searchQuery = topic || query.trim();
    if (!searchQuery || searchMutation.isPending) return;
    setQuery(searchQuery);
    searchMutation.mutate(searchQuery);
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-16">
      {/* Header */}
      <header className="bg-gradient-to-br from-pink-accent/10 via-accent/20 to-background p-6 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-pink-accent/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-pink-accent" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-1">
                Mãe Valente
              </h1>
              <p className="text-muted-foreground">
                Seu espaço seguro de autocuidado emocional
              </p>
            </div>
          </div>
          
          {/* Emergency Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-pink-accent/30 text-pink-accent hover:bg-pink-accent/10"
            onClick={() => setShowEmergency(!showEmergency)}
            data-testid="button-emergency"
          >
            <Phone className="w-4 h-4 mr-2" />
            {showEmergency ? "Ocultar" : "Preciso de ajuda urgente"}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Emergency Resources */}
            {showEmergency && (
              <Card className="p-5 bg-pink-accent/5 border-pink-accent/30">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-accent" />
                  Recursos de Emergência
                </h3>
                <div className="space-y-3">
                  {EMERGENCY_RESOURCES.map((resource, index) => {
                    const Icon = resource.icon;
                    return (
                      <div
                        key={index}
                        className="bg-card p-4 rounded-xl border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-accent/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-pink-accent" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">
                              {resource.title}
                            </h4>
                            <p className="text-sm font-medium text-pink-accent mb-1">
                              {resource.contact}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Heart className="w-4 h-4 text-pink-accent" />
                  <p className="text-xs text-muted-foreground text-center">
                    Você não está sozinha. Pedir ajuda é um ato de coragem.
                  </p>
                </div>
              </Card>
            )}

            {/* Welcome Card with Image */}
            {!searchResult && (
              <Card className="p-6 bg-gradient-to-br from-accent/20 via-accent/10 to-card border-none">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <img 
                    src={supportImage} 
                    alt="Apoio Materno" 
                    className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover flex-shrink-0 border-2 border-accent/30 shadow-md dark:border-border"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                      Bem-vinda ao seu espaço seguro
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Aqui você encontra informações confiáveis sobre saúde mental materna, 
                      autocuidado e bem-estar emocional. Sem julgamentos, só acolhimento.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Search Input */}
            <Card className="p-4">
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Como você está se sentindo hoje?"
                  className="flex-1 border-2 focus:border-pink-accent"
                  data-testid="input-search"
                />
                <Button
                  onClick={() => handleSearch()}
                  disabled={!query.trim() || searchMutation.isPending}
                  className="bg-pink-accent hover:bg-pink-accent/90 text-white px-6"
                  data-testid="button-search"
                >
                  {searchMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </Card>

            {/* Suggested Topics */}
            {!searchResult && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground px-1">
                  Tópicos que podem te ajudar:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS.map((topic, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover-elevate active-elevate-2 py-2 px-4 border-2 border-accent/50 text-foreground rounded-full text-sm"
                      onClick={() => handleSearch(topic)}
                      data-testid={`topic-${index}`}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search Result */}
            {searchResult && (
              <Card className="p-6 bg-card border-2 border-pink-accent/20">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-lg font-heading font-semibold text-foreground flex-1">
                    {searchResult.question}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="flex-shrink-0 text-pink-accent"
                    data-testid="button-save"
                  >
                    <BookmarkPlus className="w-5 h-5" />
                  </Button>
                </div>

                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {searchResult.answer}
                  </p>
                </div>

                {searchResult.sources && searchResult.sources.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                      Fontes Consultadas:
                    </h4>
                    <div className="space-y-2">
                      {searchResult.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                          data-testid={`source-${index}`}
                        >
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    setSearchResult(null);
                    setQuery("");
                  }}
                  data-testid="button-new-search"
                >
                  Nova Busca
                </Button>
              </Card>
            )}

            {/* Saved Items */}
            {savedItems.length > 0 && !searchResult && (
              <div className="space-y-3">
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Salvos para Você
                </h3>
                {savedItems.map((item) => (
                  <Card
                    key={item.id}
                    className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all"
                    onClick={() => setSearchResult(item)}
                    data-testid={`saved-item-${item.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-accent/10 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-pink-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {item.question}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.answer}
                        </p>
                        {item.sources && item.sources.length > 0 && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {item.sources.length} fonte{item.sources.length > 1 ? "s" : ""}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
