import { Home, MessageCircle, Play, Search, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

const tabs = [
  { name: "Home", path: "/", icon: Home, testId: "tab-home" },
  { name: "NathIA", path: "/nathia", icon: MessageCircle, testId: "tab-nathia" },
  { name: "MundoNath", path: "/mundo-nath", icon: Play, testId: "tab-mundo-nath" },
  { name: "MãeValente", path: "/mae-valente", icon: Search, testId: "tab-mae-valente" },
  { name: "Hábitos", path: "/habitos", icon: CheckCircle, testId: "tab-habitos" },
];

export function BottomTabBar() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              href={tab.path}
              data-testid={tab.testId}
              className="flex flex-col items-center justify-center flex-1 h-full hover-elevate active-elevate-2 rounded-md transition-all"
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-colors ${
                  isActive ? "text-pink-accent" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
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
