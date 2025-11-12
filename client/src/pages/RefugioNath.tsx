import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, HandHeart, Sparkles, MessageCircle, Plus, Flag, ChevronDown, ChevronUp, Quote } from "lucide-react";
import type { CommunityPost, Comment } from "@shared/schema";

// Testimonials data with beautiful photos
const TESTIMONIALS = [
  {
    id: 1,
    name: "Ana Carolina",
    role: "Mãe de 2",
    content: "Aqui encontrei o apoio que precisava. Sem julgamentos, apenas acolhimento.",
    photo: "https://api.dicebear.com/7.x/lorelei/svg?seed=ana&backgroundColor=ffd5dc&scale=85",
    bgColor: "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
  },
  {
    id: 2,
    name: "Juliana Santos",
    role: "Gestante de 7 meses",
    content: "A comunidade mais acolhedora que já participei. Me sinto em casa aqui.",
    photo: "https://api.dicebear.com/7.x/lorelei/svg?seed=juliana&backgroundColor=dfe7fd&scale=85",
    bgColor: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
  },
  {
    id: 3,
    name: "Mariana Oliveira",
    role: "Mãe solo",
    content: "Finalmente um espaço onde posso ser eu mesma. Obrigada por existirem!",
    photo: "https://api.dicebear.com/7.x/lorelei/svg?seed=mariana&backgroundColor=fef3c7&scale=85",
    bgColor: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
  },
  {
    id: 4,
    name: "Beatriz Lima",
    role: "Mãe de primeira viagem",
    content: "Cada desabafo aqui me faz sentir menos sozinha. Vocês são incríveis!",
    photo: "https://api.dicebear.com/7.x/lorelei/svg?seed=beatriz&backgroundColor=d9f99d&scale=85",
    bgColor: "from-lime-50 to-green-50 dark:from-lime-950/20 dark:to-green-950/20",
  },
  {
    id: 5,
    name: "Camila Ferreira",
    role: "Mãe de gêmeos",
    content: "Aqui aprendi que não preciso ser perfeita. Posso simplesmente ser mãe.",
    photo: "https://api.dicebear.com/7.x/lorelei/svg?seed=camila&backgroundColor=e9d5ff&scale=85",
    bgColor: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
  },
];

const POST_TYPES = {
  desabafo: {
    label: "Desabafo",
    maxChars: 300,
    tags: ["#Exaustão", "#Culpa", "#Sobrecarga"],
    color: "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300",
  },
  vitoria: {
    label: "Vitória",
    maxChars: 200,
    tags: ["#Vitória", "#Autocuidado", "#Orgulho"],
    color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
  },
  apoio: {
    label: "Apoio",
    maxChars: 300,
    tags: ["#NãoAguento", "#Socorro", "#Exaustão"],
    color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  },
  reflexao: {
    label: "Reflexão",
    maxChars: 250,
    tags: ["#Pensamento", "#Identidade", "#Maternidade"],
    color: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  },
};

const REACTION_TYPES = {
  heart: { icon: Heart, label: "Apoio", color: "text-pink-500" },
  hands: { icon: HandHeart, label: "Empatia", color: "text-blue-500" },
  sparkles: { icon: Sparkles, label: "Força", color: "text-yellow-500" },
};

export default function RefugioNath() {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    type: "desabafo" as keyof typeof POST_TYPES,
    content: "",
    tag: "",
    authorName: "",
  });
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      const response = await fetch(`/api/community/posts?${params}`);
      if (!response.ok) throw new Error("Erro ao carregar posts");
      const result = await response.json();
      // API returns paginated response { data: [], meta: {} }
      return result.data || result;
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: typeof newPost) => {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setIsCreateModalOpen(false);
      setNewPost({ type: "desabafo", content: "", tag: "", authorName: "" });
      toast({ description: "Post publicado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ description: error.message, variant: "destructive" });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content, authorName }: { postId: string; content: string; authorName: string }) => {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, authorName }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar comentário");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", variables.postId, "comments"] });
      setNewCommentContent((prev) => ({ ...prev, [variables.postId]: "" }));
      toast({ description: "Comentário adicionado!" });
    },
    onError: (error: Error) => {
      toast({ description: error.message, variant: "destructive" });
    },
  });

  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async ({ postId, type, action }: { postId: string; type: string; action: "add" | "remove" }) => {
      if (action === "add") {
        const response = await fetch(`/api/community/posts/${postId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao adicionar reação");
        }
        return response.json();
      } else {
        const response = await fetch(`/api/community/posts/${postId}/reactions/${type}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao remover reação");
        }
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const handleSubmitPost = () => {
    if (!newPost.authorName.trim()) {
      toast({ description: "Por favor, digite seu nome", variant: "destructive" });
      return;
    }
    if (!newPost.content.trim()) {
      toast({ description: "Por favor, escreva algo", variant: "destructive" });
      return;
    }
    if (!newPost.tag) {
      toast({ description: "Por favor, escolha uma tag", variant: "destructive" });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const handleSubmitComment = (postId: string, authorName: string) => {
    const content = newCommentContent[postId]?.trim();
    if (!content || !authorName.trim()) {
      toast({ description: "Por favor, preencha seu nome e comentário", variant: "destructive" });
      return;
    }

    createCommentMutation.mutate({ postId, content, authorName });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const currentMaxChars = POST_TYPES[newPost.type].maxChars;
  const charsRemaining = currentMaxChars - newPost.content.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif text-foreground mb-1" data-testid="text-page-title">
            RefúgioNath
          </h1>
          <p className="text-muted-foreground text-sm" data-testid="text-page-subtitle">
            Fala a verdade, a gente segura junto.
          </p>
        </div>
      </div>

      {/* Testimonials Section - Mobile-First Horizontal Scroll */}
      <div className="bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/10 dark:to-rose-950/10 border-y">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif text-foreground mb-2">
              Vozes da Nossa Comunidade
            </h2>
            <p className="text-sm text-muted-foreground">
              Histórias reais de mães que encontraram apoio aqui
            </p>
          </div>

          {/* Mobile-first horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-[280px] snap-center"
              >
                <Card className={`h-full bg-gradient-to-br ${testimonial.bgColor} border-2`}>
                  <CardContent className="p-5 space-y-4">
                    {/* Quote Icon */}
                    <Quote className="h-6 w-6 text-primary/40" />

                    {/* Testimonial Text */}
                    <p className="text-sm leading-relaxed text-foreground/90 italic min-h-[80px]">
                      "{testimonial.content}"
                    </p>

                    {/* Author Info with Photo */}
                    <div className="flex items-center gap-3 pt-3 border-t border-primary/10">
                      <img
                        src={testimonial.photo}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                      />
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Scroll hint for mobile */}
          <p className="text-xs text-center text-muted-foreground mt-2">
            ← Deslize para ver mais →
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Filters + Create Button */}
        <div className="flex items-center justify-between gap-4">
          <Tabs value={typeFilter} onValueChange={setTypeFilter} className="flex-1">
            <TabsList className="w-full grid grid-cols-5" data-testid="tabs-filter">
              <TabsTrigger value="all" data-testid="tab-all">Todos</TabsTrigger>
              <TabsTrigger value="desabafo" data-testid="tab-desabafo">Desabafo</TabsTrigger>
              <TabsTrigger value="vitoria" data-testid="tab-vitoria">Vitória</TabsTrigger>
              <TabsTrigger value="apoio" data-testid="tab-apoio">Apoio</TabsTrigger>
              <TabsTrigger value="reflexao" data-testid="tab-reflexao">Reflexão</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="icon" data-testid="button-create-post">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" data-testid="dialog-create-post">
              <DialogHeader>
                <DialogTitle>Novo Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Seu nome</Label>
                  <Input
                    value={newPost.authorName}
                    onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                    placeholder="Como você quer ser chamada?"
                    maxLength={50}
                    data-testid="input-author-name"
                  />
                </div>

                <div>
                  <Label>Tipo de post</Label>
                  <Select
                    value={newPost.type}
                    onValueChange={(value) =>
                      setNewPost({ ...newPost, type: value as keyof typeof POST_TYPES, tag: "" })
                    }
                  >
                    <SelectTrigger data-testid="select-post-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(POST_TYPES).map(([key, config]) => (
                        <SelectItem key={key} value={key} data-testid={`select-option-${key}`}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tag</Label>
                  <Select value={newPost.tag} onValueChange={(value) => setNewPost({ ...newPost, tag: value })}>
                    <SelectTrigger data-testid="select-post-tag">
                      <SelectValue placeholder="Escolha uma tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_TYPES[newPost.type].tags.map((tag) => (
                        <SelectItem key={tag} value={tag} data-testid={`select-option-tag-${tag}`}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Mensagem</Label>
                    <span
                      className={`text-xs ${charsRemaining < 20 ? "text-destructive" : "text-muted-foreground"}`}
                      data-testid="text-char-count"
                    >
                      {charsRemaining} caracteres
                    </span>
                  </div>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Escreva o que você está sentindo..."
                    maxLength={currentMaxChars}
                    rows={5}
                    data-testid="textarea-post-content"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitPost}
                    className="flex-1"
                    disabled={createPostMutation.isPending}
                    data-testid="button-submit-post"
                  >
                    {createPostMutation.isPending ? "Publicando..." : "Publicar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    data-testid="button-cancel-post"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Nenhum post ainda. Seja a primeira a compartilhar!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isExpanded={expandedComments.has(post.id)}
                onToggleComments={() => toggleComments(post.id)}
                onToggleReaction={(type, action) =>
                  toggleReactionMutation.mutate({ postId: post.id, type, action })
                }
                commentContent={newCommentContent[post.id] || ""}
                onCommentContentChange={(content) =>
                  setNewCommentContent((prev) => ({ ...prev, [post.id]: content }))
                }
                onSubmitComment={handleSubmitComment}
                isSubmittingComment={createCommentMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PostCardProps {
  post: CommunityPost;
  isExpanded: boolean;
  onToggleComments: () => void;
  onToggleReaction: (type: string, action: "add" | "remove") => void;
  commentContent: string;
  onCommentContentChange: (content: string) => void;
  onSubmitComment: (postId: string, authorName: string) => void;
  isSubmittingComment: boolean;
}

function PostCard({
  post,
  isExpanded,
  onToggleComments,
  onToggleReaction,
  commentContent,
  onCommentContentChange,
  onSubmitComment,
  isSubmittingComment,
}: PostCardProps) {
  const { toast } = useToast();
  const [commentAuthorName, setCommentAuthorName] = useState("");
  const postType = POST_TYPES[post.type as keyof typeof POST_TYPES];

  // Fetch comments when expanded
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/community/posts", post.id, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/community/posts/${post.id}/comments`);
      if (!response.ok) throw new Error("Erro ao carregar comentários");
      return response.json();
    },
    enabled: isExpanded,
  });

  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleReport = () => {
    setIsReporting(true);
  };

  const submitReport = () => {
    if (!reportReason.trim()) return;

    fetch(`/api/community/posts/${post.id}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao reportar post");
        }
        return response.json();
      })
      .then(() => {
        toast({ description: "Post reportado. Obrigada por ajudar a manter a comunidade segura." });
        setIsReporting(false);
        setReportReason("");
      })
      .catch((error: Error) => {
        toast({ description: error.message, variant: "destructive" });
      });
  };

  const charsRemaining = 150 - commentContent.length;

  return (
    <>
      <Dialog open={isReporting} onOpenChange={setIsReporting}>
        <DialogContent data-testid={`dialog-report-${post.id}`}>
          <DialogHeader>
            <DialogTitle>Reportar Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Por que você está reportando este post?</Label>
              <Textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Descreva o motivo do reporte..."
                rows={3}
                maxLength={200}
                data-testid={`textarea-report-reason-${post.id}`}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReporting(false);
                  setReportReason("");
                }}
                data-testid={`button-cancel-report-${post.id}`}
              >
                Cancelar
              </Button>
              <Button
                onClick={submitReport}
                disabled={!reportReason.trim()}
                data-testid={`button-submit-report-${post.id}`}
              >
                Reportar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card data-testid={`card-post-${post.id}`} className="hover-elevate">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm" data-testid={`text-author-${post.id}`}>
                {post.authorName}
              </span>
              <Badge variant="secondary" className={postType.color} data-testid={`badge-type-${post.id}`}>
                {postType.label}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={handleReport}
              data-testid={`button-report-${post.id}`}
            >
              <Flag className="h-3 w-3" />
            </Button>
          </div>
        {post.tag && (
          <Badge variant="outline" className="w-fit text-xs" data-testid={`badge-tag-${post.id}`}>
            {post.tag}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed" data-testid={`text-content-${post.id}`}>
          {post.content}
        </p>

        {/* Reactions */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(REACTION_TYPES).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className="gap-1 h-8"
                onClick={() => onToggleReaction(type, "add")}
                data-testid={`button-reaction-${type}-${post.id}`}
              >
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </Button>
            );
          })}
          <div className="flex-1"></div>
          <span className="text-xs text-muted-foreground" data-testid={`text-reaction-count-${post.id}`}>
            {post.reactionCount} reações
          </span>
        </div>

        {/* Comments Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 justify-start"
          onClick={onToggleComments}
          data-testid={`button-toggle-comments-${post.id}`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">
            {post.commentCount} {post.commentCount === 1 ? "comentário" : "comentários"}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </Button>

        {/* Comments Section */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t" data-testid={`section-comments-${post.id}`}>
            {/* Existing Comments */}
            {comments.length > 0 && (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-muted/50 rounded-lg p-3 space-y-1"
                    data-testid={`comment-${comment.id}`}
                  >
                    <span className="font-medium text-xs text-foreground">{comment.authorName}</span>
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* New Comment Input */}
            {post.commentCount < 5 ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={commentAuthorName}
                    onChange={(e) => setCommentAuthorName(e.target.value)}
                    placeholder="Seu nome"
                    maxLength={50}
                    className="flex-1"
                    data-testid={`input-comment-author-${post.id}`}
                  />
                </div>
                <div className="flex justify-between">
                  <Label className="text-xs">Seu comentário (máx 150 caracteres)</Label>
                  <span
                    className={`text-xs ${charsRemaining < 20 ? "text-destructive" : "text-muted-foreground"}`}
                    data-testid={`text-comment-char-count-${post.id}`}
                  >
                    {charsRemaining}
                  </span>
                </div>
                <Textarea
                  value={commentContent}
                  onChange={(e) => onCommentContentChange(e.target.value)}
                  placeholder="Deixe uma mensagem de apoio..."
                  maxLength={150}
                  rows={2}
                  data-testid={`textarea-comment-${post.id}`}
                />
                <Button
                  size="sm"
                  onClick={() => onSubmitComment(post.id, commentAuthorName)}
                  disabled={!commentContent.trim() || !commentAuthorName.trim() || isSubmittingComment}
                  data-testid={`button-submit-comment-${post.id}`}
                >
                  {isSubmittingComment ? "Enviando..." : "Comentar"}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Este post já atingiu o máximo de 5 comentários.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
