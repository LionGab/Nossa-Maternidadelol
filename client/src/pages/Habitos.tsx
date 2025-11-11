import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Flame, Trophy, Star, Trash2, Sparkles, TrendingUp, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Habit, UserStats } from "@shared/schema";

interface HabitWithCompletion extends Habit {
  completedToday: boolean;
  entry?: { done: boolean; completedAt: Date };
  streak?: number;
}

interface AchievementWithStatus {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requirement: number;
  type: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

const GRADIENT_COLORS = [
  { label: "🔥 Fogo", value: "from-orange-500 to-red-500" },
  { label: "💜 Roxo", value: "from-purple-500 to-pink-500" },
  { label: "💙 Azul", value: "from-blue-500 to-cyan-500" },
  { label: "💚 Verde", value: "from-green-500 to-emerald-500" },
  { label: "💛 Dourado", value: "from-yellow-500 to-orange-500" },
  { label: "🌸 Rosa", value: "from-pink-500 to-rose-500" },
  { label: "⚡ Elétrico", value: "from-cyan-500 to-blue-500" },
  { label: "🌅 Sunset", value: "from-red-500 to-purple-500" },
];

export default function Habitos() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: "", emoji: "⭐", color: GRADIENT_COLORS[0].value });
  const [celebratingHabit, setCelebratingHabit] = useState<string | null>(null);

  const { data: habits = [] } = useQuery<HabitWithCompletion[]>({
    queryKey: ["/api/habits"],
  });

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: achievements = [] } = useQuery<AchievementWithStatus[]>({
    queryKey: ["/api/achievements"],
  });

  const createHabitMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/habits", newHabit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setShowCreateDialog(false);
      setNewHabit({ title: "", emoji: "⭐", color: GRADIENT_COLORS[0].value });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) => apiRequest("DELETE", `/api/habits/${habitId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, complete }: { habitId: string; complete: boolean }) => {
      if (complete) {
        return apiRequest("POST", `/api/habits/${habitId}/complete`, {});
      } else {
        return apiRequest("DELETE", `/api/habits/${habitId}/complete`, {});
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      
      if (variables.complete) {
        setCelebratingHabit(variables.habitId);
        setTimeout(() => setCelebratingHabit(null), 2000);
      }
    },
  });

  const handleCreateHabit = () => {
    if (!newHabit.title.trim()) return;
    createHabitMutation.mutate();
  };

  const handleToggleHabit = (habitId: string, currentState: boolean) => {
    toggleHabitMutation.mutate({ habitId, complete: !currentState });
  };

  const completedToday = habits.filter((h) => h.completedToday).length;
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const currentXP = stats?.xp ?? 0;
  const currentLevel = stats?.level ?? 1;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = currentXP % xpForNextLevel;
  const xpProgress = (xpInCurrentLevel / xpForNextLevel) * 100;
  const xpNeededForNext = xpForNextLevel - xpInCurrentLevel;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-purple-500/5 to-pink-500/5 pb-16">
      {/* Gamification Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4 sm:px-6 flex-shrink-0">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Level & XP */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground" data-testid="text-level">Nível {currentLevel}</h2>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 dark:text-purple-300" data-testid="badge-xp">
                    {currentXP} XP
                  </Badge>
                </div>
                <div className="mt-1.5">
                  <Progress value={xpProgress} className="h-2 bg-muted" data-testid="progress-xp" />
                  <p className="text-xs text-muted-foreground mt-1" data-testid="text-xp-needed">
                    {xpNeededForNext} XP para o próximo nível
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAchievements(true)}
              className="relative flex-shrink-0"
              data-testid="button-achievements"
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
              {unlockedCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-pink-accent text-white text-xs">
                  {unlockedCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Card className="p-3 text-center bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20" data-testid="card-streak">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Sequência</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground" data-testid="text-streak">{stats?.currentStreak ?? 0}</p>
            </Card>

            <Card className="p-3 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20" data-testid="card-today">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Hoje</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground" data-testid="text-today">
                {completedToday}/{habits.length}
              </p>
            </Card>

            <Card className="p-3 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20" data-testid="card-total">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground" data-testid="text-total">{stats?.totalCompletions ?? 0}</p>
            </Card>
          </div>

          {/* Progress Bar */}
          {habits.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso de Hoje</span>
                <span className="font-semibold text-foreground" data-testid="text-completion-rate">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-3 bg-muted" data-testid="progress-daily" />
            </div>
          )}
        </div>
      </header>

      {/* Habits List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-3">
            {habits.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-2">
                  Comece sua Jornada!
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  Crie seu primeiro hábito e comece a ganhar XP e conquistas
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  data-testid="button-create-first"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Hábito
                </Button>
              </Card>
            ) : (
              <>
                {habits.map((habit) => {
                  const isCelebrating = celebratingHabit === habit.id;
                  return (
                    <Card
                      key={habit.id}
                      className={`p-4 transition-all ${
                        isCelebrating ? "scale-105 shadow-2xl" : "hover-elevate active-elevate-2"
                      } ${habit.completedToday ? "bg-gradient-to-r opacity-80" : ""}`}
                      data-testid={`card-habit-${habit.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleHabit(habit.id, habit.completedToday)}
                          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 transition-all flex items-center justify-center text-2xl sm:text-3xl ${
                            habit.completedToday
                              ? `bg-gradient-to-br ${habit.color} border-transparent shadow-lg`
                              : "border-border bg-background hover:border-purple-500"
                          }`}
                          data-testid={`button-toggle-${habit.id}`}
                        >
                          {habit.completedToday ? "✓" : habit.emoji}
                        </button>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-base sm:text-lg ${
                              habit.completedToday ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                            data-testid={`text-habit-title-${habit.id}`}
                          >
                            {habit.title}
                          </h3>
                          {habit.completedToday ? (
                            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              +10 XP ganhos!
                            </p>
                          ) : (
                            habit.streak && habit.streak > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Flame className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                  habit.streak >= 7 ? "text-orange-500" : "text-orange-400"
                                }`} />
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {habit.streak} dia{habit.streak > 1 ? "s" : ""} seguidos
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHabitMutation.mutate(habit.id)}
                          className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                          data-testid={`button-delete-${habit.id}`}
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}

                {/* Add New Button */}
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  variant="outline"
                  className="w-full h-14 border-2 border-dashed border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5 text-purple-600 dark:text-purple-400"
                  data-testid="button-create-habit"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Novo Hábito
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Create Habit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Hábito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Nome do Hábito</label>
              <Input
                value={newHabit.title}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                placeholder="Ex: Meditar 10 minutos"
                className="text-base"
                data-testid="input-habit-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Emoji</label>
              <div className="grid grid-cols-6 gap-2">
                {["⭐", "💪", "🧘‍♀️", "📚", "💧", "🌸", "🎯", "✨", "🔥", "💝", "🌿", "☀️"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewHabit({ ...newHabit, emoji })}
                    className={`text-3xl p-2 rounded-lg transition-all hover-elevate ${
                      newHabit.emoji === emoji ? "bg-purple-500/20 ring-2 ring-purple-500" : "hover:bg-muted"
                    }`}
                    data-testid={`emoji-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Cor</label>
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewHabit({ ...newHabit, color: color.value })}
                    className={`p-3 rounded-lg flex items-center gap-2 transition-all hover-elevate ${
                      newHabit.color === color.value ? "ring-2 ring-purple-500" : ""
                    }`}
                    data-testid={`color-${color.value}`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color.value}`}></div>
                    <span className="text-sm text-foreground">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateHabit}
                disabled={!newHabit.title.trim() || createHabitMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                data-testid="button-save-habit"
              >
                {createHabitMutation.isPending ? "Criando..." : "Criar Hábito"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievements Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Conquistas
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3 py-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`p-4 ${
                    achievement.unlocked
                      ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                      : "opacity-50"
                  }`}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">{achievement.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        {achievement.title}
                        {achievement.unlocked && <Award className="w-4 h-4 text-yellow-500" />}
                      </h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Desbloqueada!
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
