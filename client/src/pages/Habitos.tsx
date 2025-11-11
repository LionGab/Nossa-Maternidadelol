import { useQuery, useMutation } from "@tanstack/react-query";
import { Droplet, Wind, Move, BookHeart, BookOpen, Award, Flame } from "lucide-react";
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
      <header className="bg-gradient-to-br from-primary/10 via-accent/20 to-background p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Meus Hábitos
          </h1>
          <p className="text-muted-foreground">
            Pequenas vitórias diárias
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <Card className="p-6 bg-gradient-to-br from-pink-accent/10 to-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground mb-1">
                Hoje
              </h2>
              <p className="text-3xl font-bold text-foreground">
                {completedToday}/{totalHabits}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                hábitos completados
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-accent to-primary flex items-center justify-center">
              <Flame className="w-10 h-10 text-white" />
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
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
                      isDone ? "bg-accent/30 border-primary/30" : "hover-elevate"
                    }`}
                    data-testid={`card-habit-${habit.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDone
                            ? "bg-primary text-white"
                            : "bg-accent text-primary"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-serif font-semibold text-foreground mb-1">
                          {habit.title}
                        </h3>
                        {streak > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Flame className="w-3 h-3 text-pink-accent" />
                              <span>{streak} dia{streak > 1 ? "s" : ""} seguidos</span>
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
                        className="w-6 h-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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
          <Card className="p-6 bg-gradient-to-br from-pink-accent/20 to-primary/10 text-center">
            <Award className="w-16 h-16 text-pink-accent mx-auto mb-3" />
            <h3 className="text-xl font-serif font-bold text-foreground mb-2">
              Parabéns! 🎉
            </h3>
            <p className="text-muted-foreground">
              Você completou todos os hábitos de hoje!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
