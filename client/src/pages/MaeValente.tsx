import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Heart, Sparkles, BookOpen, Brain, Leaf, Crown, Star, TrendingUp, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedQa } from "@shared/schema";

interface SearchResult {
  question: string;
  answer: string;
  sources: { title: string; url: string }[] | null;
}

const GROWTH_CATEGORIES = [
  {
    id: "forca",
    label: "Força Interior",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    description: "Desenvolva sua força e coragem interior",
  },
  {
    id: "sabedoria",
    label: "Sabedoria",
    icon: Brain,
    color: "from-blue-500 to-purple-500",
    description: "Conhecimento que transforma vidas",
  },
  {
    id: "serenidade",
    label: "Serenidade",
    icon: Leaf,
    color: "from-green-500 to-teal-500",
    description: "Encontre paz e equilíbrio interior",
  },
  {
    id: "autoamor",
    label: "Autoamor",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    description: "Cultive o amor próprio",
  },
];

const EMPOWERMENT_TOPICS = [
  { category: "forca", title: "Como desenvolver resiliência emocional", icon: "💪" },
  { category: "forca", title: "Estabelecendo limites saudáveis", icon: "🛡️" },
  { category: "forca", title: "Superando o medo e a insegurança", icon: "🦁" },
  { category: "sabedoria", title: "Inteligência emocional na maternidade", icon: "🧠" },
  { category: "sabedoria", title: "Desenvolvendo pensamento crítico", icon: "💡" },
  { category: "sabedoria", title: "Aprendizado contínuo e crescimento", icon: "📚" },
  { category: "serenidade", title: "Práticas de mindfulness para mães", icon: "🧘‍♀️" },
  { category: "serenidade", title: "Gerenciando stress e ansiedade", icon: "🌸" },
  { category: "serenidade", title: "Encontrando momentos de paz", icon: "☮️" },
  { category: "autoamor", title: "Praticando autocompaixão", icon: "💝" },
  { category: "autoamor", title: "Celebrando suas conquistas", icon: "🎉" },
  { category: "autoamor", title: "Priorizando seu autocuidado", icon: "✨" },
];

const INSPIRATIONAL_QUOTES = [
  {
    text: "Você é mais forte do que imagina, mais sábia do que pensa e mais amada do que sente.",
    author: "Comunidade Mãe Valente",
  },
  {
    text: "O amor próprio não é egoísmo, é o primeiro passo para cuidar bem de quem você ama.",
    author: "Nathália Valente",
  },
  {
    text: "Cada dia é uma nova oportunidade de crescer, aprender e se tornar a melhor versão de si mesma.",
    author: "Comunidade Mãe Valente",
  },
];

export default function MaeValente() {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("forca");
  const [currentQuote] = useState(INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)]);

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

  const filteredTopics = EMPOWERMENT_TOPICS.filter(
    (topic) => topic.category === selectedCategory
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 pb-16">
      {/* Header - Inspirador */}
      <header className="bg-gradient-to-r from-pink-accent/10 via-purple-500/10 to-primary/10 border-b border-border px-4 py-6 sm:px-6 sm:py-8 flex-shrink-0 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-accent to-purple-500 mb-4 shadow-lg">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-pink-accent via-purple-500 to-primary bg-clip-text text-transparent mb-2">
              Mãe Valente
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Seu espaço de crescimento, sabedoria e empoderamento
            </p>
          </div>

          {/* Quote do Dia */}
          <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-pink-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-accent/10 to-transparent rounded-full blur-3xl"></div>
            <div className="relative">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-accent mb-3" />
              <p className="text-sm sm:text-base text-foreground italic leading-relaxed mb-2">
                "{currentQuote.text}"
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                — {currentQuote.author}
              </p>
            </div>
          </Card>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-6">
            {/* Search Bar */}
            <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Busque conhecimento que te eleva..."
                  className="flex-1 border-2 focus:border-purple-500 text-sm sm:text-base"
                  data-testid="input-search"
                />
                <Button
                  onClick={() => handleSearch()}
                  disabled={!query.trim() || searchMutation.isPending}
                  className="bg-gradient-to-r from-pink-accent to-purple-500 hover:opacity-90 text-white px-4 sm:px-6 flex-shrink-0"
                  data-testid="button-search"
                >
                  {searchMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>
            </Card>

            {/* Search Result */}
            {searchResult && (
              <Card className="p-4 sm:p-6 bg-card border-2 border-purple-500/20 shadow-lg">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground flex-1">
                    {searchResult.question}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="flex-shrink-0 text-purple-500"
                    data-testid="button-save"
                  >
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>

                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                    {searchResult.answer}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 text-sm sm:text-base border-purple-500/30"
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

            {/* Growth Categories */}
            {!searchResult && (
              <>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 bg-transparent p-0 h-auto">
                    {GROWTH_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          className="data-[state=active]:bg-card data-[state=active]:shadow-md border border-border data-[state=active]:border-pink-accent/30 rounded-xl p-3 sm:p-4 flex flex-col items-center gap-2"
                          data-testid={`tab-${cat.id}`}
                        >
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-foreground">
                            {cat.label}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {GROWTH_CATEGORIES.map((cat) => (
                    <TabsContent key={cat.id} value={cat.id} className="mt-6 space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {cat.description}
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {filteredTopics.map((topic, index) => (
                          <Card
                            key={index}
                            className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all border-border hover:border-pink-accent/30"
                            onClick={() => handleSearch(topic.title)}
                            data-testid={`topic-${index}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl sm:text-3xl flex-shrink-0">
                                {topic.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-semibold text-foreground text-sm sm:text-base">
                                  {topic.title}
                                </h4>
                              </div>
                              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Saved Knowledge */}
                {savedItems.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground">
                        Seu Conhecimento Salvo
                      </h3>
                    </div>
                    {savedItems.map((item) => (
                      <Card
                        key={item.id}
                        className="p-3 sm:p-4 hover-elevate active-elevate-2 cursor-pointer transition-all border-purple-500/20"
                        onClick={() => setSearchResult(item)}
                        data-testid={`saved-item-${item.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                              {item.question}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
