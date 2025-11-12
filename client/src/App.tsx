import { lazy, Suspense } from "react";
import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Loader2 } from "lucide-react";

// Lazy load all pages for code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Demo = lazy(() => import("@/pages/Demo"));
const NathIA = lazy(() => import("@/pages/NathIA"));
const MundoNath = lazy(() => import("@/pages/MundoNath"));
const MaeValente = lazy(() => import("@/pages/MaeValente"));
const Habitos = lazy(() => import("@/pages/Habitos"));
const RefugioNath = lazy(() => import("@/pages/RefugioNath"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  const [isLanding] = useRoute("/");
  const [isDemo] = useRoute("/demo");
  const showTabBar = !isLanding && !isDemo;

  return (
    <>
      <main>
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/demo" component={Demo} />
            <Route path="/nathia" component={NathIA} />
            <Route path="/mundo-nath" component={MundoNath} />
            <Route path="/mae-valente" component={MaeValente} />
            <Route path="/habitos" component={Habitos} />
            <Route path="/refugio-nath" component={RefugioNath} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
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
