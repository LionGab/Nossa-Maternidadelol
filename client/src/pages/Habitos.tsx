import { useQuery, useMutation } from "@tanstack/react-query";
import { Droplet, Wind, Move, BookHeart, BookOpen, Award, Flame, Sparkles, Heart, TrendingUp, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Habit, HabitEntry } from "@shared/schema";

const HABIT_ICONS = {
  droplet: Droplet,
  wind: Wind,
  stretch: Move,
  bookHeart: BookHeart,
  bookOpen: BookOpen,
};

export default function Habitos() {
  const today = new Date().toISOString().split("T")[0];

  const { data: habits = [], isLoading } = useQuery<(Habit & { entry?: HabitEntry; streak?: number })[]>({
    queryKey: ["/api/habits"],
  });

  const { data: weekStats } = useQuery<{ completed: number; total: number }>({
    queryKey: ["/api/habits/week-stats"],
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, done }: { habitId: string; done: boolean }) => {
      return apiRequest("POST", "/api/habits/toggle", {
        habitId,
        date: today,
        done,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habits/week-stats"] });
    },
  });

  const completedToday = habits.filter((h) => h.entry?.done).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  const maxStreak = Math.max(...habits.map((h) => h.streak || 0), 0);

  const getMotivationalMessage = () => {
    if (completedToday === 0) return "Comece seu dia com um pequeno passo";
    if (completedToday === totalHabits) return "Incrível! Você completou tudo hoje!";
    if (completedToday >= totalHabits / 2) return "Você está indo muito bem!";
    return "Continue assim, você está no caminho certo!";
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-16">
      {/* Header - Fixed */}
      <header className="bg-gradient-to-br from-pink-accent/5 via-card to-primary/5 border-b border-border px-4 py-4 sm:px-6 sm:py-6 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-pink-accent/20 to-primary/20 flex items-center justify-center flex-shrink-0 border-2 border-pink-accent/30 shadow-md">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-pink-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-0.5 truncate">
                Meus Hábitos
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground truncate">
                Pequenas vitórias, grandes transformações
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Card className="p-3 text-center bg-card/50 backdrop-blur-sm border-pink-accent/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <p className="text-lg sm:text-2xl font-bold text-primary">
                  {completedToday}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Hoje
              </p>
            </Card>
            
            <Card className="p-3 text-center bg-card/50 backdrop-blur-sm border-pink-accent/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-pink-accent" />
                <p className="text-lg sm:text-2xl font-bold text-pink-accent">
                  {weekStats?.completed || 0}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Semana
              </p>
            </Card>
            
            <Card className="p-3 text-center bg-card/50 backdrop-blur-sm border-pink-accent/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                <p className="text-lg sm:text-2xl font-bold text-orange-500">
                  {maxStreak}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Recorde
              </p>
            </Card>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Progress Overview Card */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-pink-accent/10 via-accent/5 to-primary/5 border-pink-accent/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-accent/10 to-transparent rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-serif font-semibold text-foreground mb-1">
                      Progresso de Hoje
                    </h2>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-accent to-primary bg-clip-text text-transparent">
                      {completedToday}/{totalHabits}
                    </p>
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-accent to-primary flex items-center justify-center shadow-lg">
                    {completedToday === totalHabits && totalHabits > 0 ? (
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
                    ) : (
                      <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    )}
                  </div>
                </div>
                
                <Progress 
                  value={progressPercent} 
                  className="h-2 sm:h-3 mb-3" 
                />
                
                <p className="text-center text-xs sm:text-sm text-pink-accent font-medium">
                  {getMotivationalMessage()}
                </p>
              </div>
            </Card>

            {/* Habits List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-serif font-semibold text-foreground">
                  Seus Hábitos
                </h2>
                {totalHabits > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {totalHabits} {totalHabits === 1 ? "hábito" : "hábitos"}
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="p-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : habits.length === 0 ? (
                <Card className="p-8 text-center bg-accent/5">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-serif font-semibold text-foreground mb-2">
                    Nenhum hábito ainda
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Comece criando seu primeiro hábito para transformar sua rotina
                  </p>
                </Card>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {habits.map((habit) => {
                    const Icon = HABIT_ICONS[habit.icon as keyof typeof HABIT_ICONS] || Droplet;
                    const isDone = habit.entry?.done || false;
                    const streak = habit.streak || 0;

                    return (
                      <Card
                        key={habit.id}
                        className={`p-3 sm:p-4 transition-all ${
                          isDone 
                            ? "bg-gradient-to-r from-pink-accent/10 to-primary/10 border-pink-accent/30 shadow-sm" 
                            : "hover-elevate border-border"
                        }`}
                        data-testid={`card-habit-${habit.id}`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              isDone
                                ? "bg-gradient-to-br from-pink-accent to-primary text-white shadow-md scale-105"
                                : "bg-accent/50 text-primary"
                            }`}
                          >
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className={`font-serif font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base truncate ${
                              isDone ? "text-foreground" : "text-foreground"
                            }`}>
                              {habit.title}
                            </h3>
                            {streak > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Flame className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                  streak >= 7 ? "text-orange-500 animate-pulse" : "text-orange-400"
                                }`} />
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {streak} dia{streak > 1 ? "s" : ""} seguidos
                                </span>
                                {streak >= 7 && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs ml-1 border-orange-500/30 text-orange-500">
                                    Em chamas!
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <Checkbox
                            checked={isDone}
                            onCheckedChange={(checked) => {
                              toggleHabitMutation.mutate({
                                habitId: habit.id,
                                done: checked as boolean,
                              });
                            }}
                            className="w-6 h-6 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-pink-accent data-[state=checked]:to-primary data-[state=checked]:border-pink-accent flex-shrink-0"
                            data-testid={`checkbox-habit-${habit.id}`}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Achievement Card */}
            {completedToday === totalHabits && totalHabits > 0 && (
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-pink-accent/20 via-accent/10 to-primary/10 text-center border-2 border-pink-accent/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-accent/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse delay-75"></div>
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-accent to-primary flex items-center justify-center shadow-lg">
                    <Award className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2">
                    Que conquista!
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    Você completou todos os hábitos de hoje!
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-pink-accent flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-pink-accent font-medium">
                      Você está cuidando de si mesma com carinho
                    </span>
                    <Heart className="w-4 h-4 text-pink-accent flex-shrink-0" />
                  </div>
                </div>
              </Card>
            )}

            {/* Motivational Tips */}
            {completedToday < totalHabits && totalHabits > 0 && (
              <Card className="p-4 sm:p-5 bg-accent/5 border-accent/30">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pink-accent/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-semibold text-foreground mb-1 text-sm sm:text-base">
                      Dica do dia
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Não se cobre tanto! Cada hábito completado é uma vitória. 
                      O importante é manter a consistência, não a perfeição.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
