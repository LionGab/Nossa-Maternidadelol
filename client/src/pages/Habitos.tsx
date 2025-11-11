import { useQuery, useMutation } from "@tanstack/react-query";
import { Droplet, Wind, Move, BookHeart, BookOpen, Award, Flame, Sparkles, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-accent/20 to-primary/20 flex items-center justify-center flex-shrink-0 border-2 border-pink-accent/30">
              <Sparkles className="w-7 h-7 text-pink-accent" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
                Meus Hábitos
              </h1>
              <p className="text-muted-foreground">
                Pequenas vitórias, grandes transformações
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <Card className="p-6 bg-gradient-to-br from-pink-accent/10 via-accent/5 to-primary/5 border-pink-accent/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground mb-1">
                Hoje
              </h2>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-accent to-primary bg-clip-text text-transparent">
                {completedToday}/{totalHabits}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                hábitos completados
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-accent to-primary flex items-center justify-center shadow-lg">
              {completedToday === totalHabits && totalHabits > 0 ? (
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              ) : (
                <Flame className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {completedToday > 0 && (
            <p className="text-center text-sm text-pink-accent mt-3 font-medium">
              {completedToday === totalHabits
                ? "🎉 Incrível! Você completou tudo hoje!"
                : `Você está indo muito bem! Continue assim! 💪`}
            </p>
          )}
        </Card>

        {/* Week Stats */}
        {weekStats && (
          <div className="flex gap-3">
            <Card className="flex-1 p-4 text-center">
              <p className="text-2xl font-bold text-primary mb-1">
                {weekStats.completed}
              </p>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </Card>
            <Card className="flex-1 p-4 text-center">
              <p className="text-2xl font-bold text-pink-accent mb-1">
                {Math.max(...habits.map((h) => h.streak || 0))}
              </p>
              <p className="text-xs text-muted-foreground">
                Maior sequência
              </p>
            </Card>
          </div>
        )}

        {/* Habits List */}
        <div className="space-y-3">
          <h2 className="text-lg font-serif font-semibold text-foreground">
            Seus Hábitos
          </h2>

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
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const Icon = HABIT_ICONS[habit.icon as keyof typeof HABIT_ICONS] || Droplet;
                const isDone = habit.entry?.done || false;
                const streak = habit.streak || 0;

                return (
                  <Card
                    key={habit.id}
                    className={`p-4 transition-all ${
                      isDone 
                        ? "bg-gradient-to-r from-pink-accent/10 to-primary/10 border-pink-accent/30" 
                        : "hover-elevate"
                    }`}
                    data-testid={`card-habit-${habit.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isDone
                            ? "bg-gradient-to-br from-pink-accent to-primary text-white shadow-md"
                            : "bg-accent text-primary"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <h3 className={`font-serif font-semibold mb-1 ${isDone ? "text-foreground" : "text-foreground"}`}>
                          {habit.title}
                        </h3>
                        {streak > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs">
                              <Flame className={`w-3 h-3 ${streak >= 7 ? "text-pink-accent animate-pulse" : "text-pink-accent"}`} />
                              <span className="text-muted-foreground">
                                {streak} dia{streak > 1 ? "s" : ""} seguidos
                                {streak >= 7 && " 🔥"}
                              </span>
                            </div>
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
                        className="w-6 h-6 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-pink-accent data-[state=checked]:to-primary data-[state=checked]:border-pink-accent"
                        data-testid={`checkbox-habit-${habit.id}`}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievement Badges */}
        {completedToday === totalHabits && totalHabits > 0 && (
          <Card className="p-8 bg-gradient-to-br from-pink-accent/20 via-accent/10 to-primary/10 text-center border-2 border-pink-accent/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-accent/5 to-primary/5 animate-pulse"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-accent to-primary flex items-center justify-center shadow-lg">
                <Award className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                Que conquista! 🎉
              </h3>
              <p className="text-muted-foreground mb-4">
                Você completou todos os hábitos de hoje!
              </p>
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-pink-accent" />
                <span className="text-sm text-pink-accent font-medium">
                  Você está cuidando de si mesma com carinho
                </span>
                <Heart className="w-4 h-4 text-pink-accent" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
