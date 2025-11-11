import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Play, Heart, Lock, Clock, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TikTokEmbed, InstagramEmbed } from "react-social-media-embed";
import type { Post, ViralPost } from "@shared/schema";

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "Gestação", label: "Gestação" },
  { id: "Puerpério", label: "Puerpério" },
  { id: "Treinos", label: "Treinos" },
  { id: "Culinária", label: "Culinária" },
];

export default function MundoNath() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", { category: selectedCategory }],
  });

  const { data: favorites = [] } = useQuery<string[]>({
    queryKey: ["/api/favorites"],
  });

  const { data: viralPosts = [], isLoading: viralLoading } = useQuery<ViralPost[]>({
    queryKey: ["/api/viral-posts?featured=true"],
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const isFavorited = favorites.includes(postId);
      if (isFavorited) {
        return apiRequest("DELETE", `/api/favorites/${postId}`, {});
      } else {
        return apiRequest("POST", "/api/favorites", { postId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/10 via-accent/20 to-background p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Mundo Nath
          </h1>
          <p className="text-muted-foreground">
            Conteúdos exclusivos e vínculo com a Nath
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Viral Posts Section */}
        {viralPosts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-accent" />
              <h2 className="text-xl font-serif font-bold text-foreground">
                Viral da Nath
              </h2>
            </div>

            {viralLoading ? (
              <Card className="p-6 animate-pulse">
                <div className="h-96 bg-muted rounded-lg"></div>
              </Card>
            ) : (
              <div className="grid gap-6">
                {viralPosts.map((vpost) => (
                  <Card key={vpost.id} className="overflow-hidden" data-testid={`card-viral-${vpost.id}`}>
                    <div className="p-4 border-b border-border">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="font-serif font-semibold text-foreground mb-1">
                            {vpost.title}
                          </h3>
                          {vpost.description && (
                            <p className="text-sm text-muted-foreground">
                              {vpost.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="flex-shrink-0 gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {vpost.platform === "tiktok" ? "TikTok" : "Instagram"}
                        </Badge>
                      </div>

                      {/* Engagement Metrics */}
                      {(vpost.likes || vpost.comments || vpost.shares) && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {vpost.likes && (
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {vpost.likes.toLocaleString()}
                            </div>
                          )}
                          {vpost.comments && (
                            <div className="flex items-center gap-1">
                              💬 {vpost.comments.toLocaleString()}
                            </div>
                          )}
                          {vpost.shares && (
                            <div className="flex items-center gap-1">
                              🔄 {vpost.shares.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Embed */}
                    <div className="flex justify-center bg-muted/30 p-4">
                      {vpost.platform === "tiktok" ? (
                        <TikTokEmbed url={vpost.embedUrl} width={325} />
                      ) : (
                        <InstagramEmbed url={vpost.embedUrl} width={328} />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card border border-border rounded-full p-1">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-white"
                data-testid={`tab-${cat.id}`}
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => {
              const isFavorited = favorites.includes(post.id);
              const isPremium = post.premium;

              return (
                <Card
                  key={post.id}
                  className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all"
                  onClick={() => !isPremium && setSelectedPost(post)}
                  data-testid={`card-post-${post.id}`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-accent to-primary/20">
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-16 h-16 text-white/50" />
                      </div>
                    )}

                    {/* Overlay elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Category Badge */}
                    <Badge className="absolute top-3 right-3 bg-primary/90 text-white border-none">
                      {post.category}
                    </Badge>

                    {/* Premium Lock */}
                    {isPremium && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-white rounded-full p-4">
                          <Lock className="w-8 h-8 text-pink-accent" />
                        </div>
                      </div>
                    )}

                    {/* Duration */}
                    {post.duration && (
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(post.duration)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-serif font-semibold text-foreground flex-1">
                        {post.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`flex-shrink-0 ${
                          isFavorited ? "text-pink-accent" : "text-muted-foreground"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteMutation.mutate(post.id);
                        }}
                        data-testid={`button-favorite-${post.id}`}
                      >
                        <Heart
                          className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
                        />
                      </Button>
                    </div>

                    {post.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.description}
                      </p>
                    )}

                    {isPremium && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Conteúdo Premium
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {posts.length === 0 && (
              <div className="text-center py-12">
                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Nenhum conteúdo disponível nesta categoria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Paywall for Premium */}
        {selectedPost?.premium && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-pink-accent" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  Conteúdo Premium
                </h3>
                <p className="text-muted-foreground mb-6">
                  Assine para acessar todos os vídeos, artigos e treinos exclusivos da Nath
                </p>
                <p className="text-2xl font-bold text-pink-accent mb-6">
                  R$ 19,90/mês
                </p>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-pink-accent hover:bg-pink-accent/90 text-white font-semibold rounded-full"
                    data-testid="button-subscribe-paywall"
                  >
                    Assinar Agora
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setSelectedPost(null)}
                    data-testid="button-close-paywall"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
