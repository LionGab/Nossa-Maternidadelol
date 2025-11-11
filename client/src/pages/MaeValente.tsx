import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, BookmarkPlus, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedQa } from "@shared/schema";

interface SearchResult {
  question: string;
  answer: string;
  sources: { title: string; url: string }[];
}

export default function MaeValente() {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

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

  const handleSearch = () => {
    if (!query.trim() || searchMutation.isPending) return;
    searchMutation.mutate(query.trim());
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-16">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/10 via-accent/20 to-background p-6 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Mãe Valente
          </h1>
          <p className="text-muted-foreground">
            Respostas fundamentadas e curadas
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
                  placeholder="Faça sua pergunta..."
                  className="flex-1 rounded-xl border-2 focus:border-primary"
                  data-testid="input-search"
                />
                <Button
                  onClick={handleSearch}
                  disabled={!query.trim() || searchMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full"
                  size="icon"
                  data-testid="button-search"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </Card>

            {/* Search Result */}
            {searchMutation.isPending && (
              <Card className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p>Buscando as melhores respostas...</p>
                </div>
              </Card>
            )}

            {searchResult && !searchMutation.isPending && (
              <Card className="p-6" data-testid="card-search-result">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    {searchResult.question}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    data-testid="button-save-result"
                  >
                    <BookmarkPlus className="w-5 h-5 text-pink-accent" />
                  </Button>
                </div>

                <div className="prose prose-sm max-w-none mb-6">
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {searchResult.answer}
                  </div>
                </div>

                {searchResult.sources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Fontes:
                    </h4>
                    <div className="space-y-2">
                      {searchResult.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline p-2 rounded-lg hover-elevate"
                          data-testid={`link-source-${index}`}
                        >
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 line-clamp-1">{source.title || source.url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Saved Items */}
            {savedItems.length > 0 && (
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">
                  Meus Itens Salvos
                </h2>
                <div className="space-y-3">
                  {savedItems.map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                      data-testid={`card-saved-${item.id}`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-2">
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
              </div>
            )}

            {/* Empty State */}
            {!searchResult && savedItems.length === 0 && !searchMutation.isPending && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Faça sua primeira pergunta
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Pesquise sobre maternidade, gestação, cuidados com o bebê e muito mais.
                  Respostas fundamentadas com fontes confiáveis.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
