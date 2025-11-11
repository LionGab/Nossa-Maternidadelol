import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomTabBar } from "@/components/BottomTabBar";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Demo from "@/pages/Demo";
import NathIA from "@/pages/NathIA";
import MundoNath from "@/pages/MundoNath";
import MaeValente from "@/pages/MaeValente";
import Habitos from "@/pages/Habitos";
import NotFound from "@/pages/not-found";

function Router() {
  const [isLanding] = useRoute("/");
  const [isDemo] = useRoute("/demo");
  const showTabBar = !isLanding && !isDemo;

  return (
    <>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/demo" component={Demo} />
        <Route path="/nathia" component={NathIA} />
        <Route path="/mundo-nath" component={MundoNath} />
        <Route path="/mae-valente" component={MaeValente} />
        <Route path="/habitos" component={Habitos} />
        <Route component={NotFound} />
      </Switch>
      {showTabBar && <BottomTabBar />}
      {/* Floating Theme Toggle */}
      {!isLanding && !isDemo && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
