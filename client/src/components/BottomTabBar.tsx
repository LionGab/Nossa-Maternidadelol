import { Home, MessageCircle, Play, Heart, CheckCircle, Users } from "lucide-react";
import { Link, useLocation } from "wouter";

const tabs = [
  { name: "Home", path: "/dashboard", icon: Home, testId: "tab-home" },
  { name: "NathIA", path: "/nathia", icon: MessageCircle, testId: "tab-nathia" },
  { name: "MundoNath", path: "/mundo-nath", icon: Play, testId: "tab-mundo-nath" },
  { name: "MãeValente", path: "/mae-valente", icon: Heart, testId: "tab-mae-valente" },
  { name: "RefúgioNath", path: "/refugio-nath", icon: Users, testId: "tab-refugio-nath" },
  { name: "Hábitos", path: "/habitos", icon: CheckCircle, testId: "tab-habitos" },
];

export function BottomTabBar() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 safe-bottom">
      <div className="grid grid-cols-6 gap-0 h-16 max-w-3xl mx-auto">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              href={tab.path}
              data-testid={tab.testId}
              className="flex flex-col items-center justify-center h-full hover-elevate active-elevate-2 rounded-md transition-all min-w-0 px-1"
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-colors flex-shrink-0 ${
                  isActive ? "text-pink-accent" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[9px] font-medium transition-colors leading-tight text-center truncate w-full ${
                  isActive ? "text-pink-accent" : "text-muted-foreground"
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
