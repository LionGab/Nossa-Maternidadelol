import { lazy, Suspense } from "react";
import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomTabBar } from "@/components/BottomTabBar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Loader2, Menu } from "lucide-react";

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
  const showSidebar = !isLanding && !isDemo;
  const showTabBar = !isLanding && !isDemo;

  if (!showSidebar) {
    return (
      <>
        <main>
          <Suspense fallback={<LoadingFallback />}>
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/demo" component={Demo} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>
      </>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header com botão de menu */}
        <header className="sticky top-0 z-40 flex items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 h-14">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </SidebarTrigger>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1">
          <Suspense fallback={<LoadingFallback />}>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/nathia" component={NathIA} />
              <Route path="/mundo-nath" component={MundoNath} />
              <Route path="/mae-valente" component={MaeValente} />
              <Route path="/habitos" component={Habitos} />
              <Route path="/refugio-nath" component={RefugioNath} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>

        {/* Bottom tab bar mobile */}
        {showTabBar && <BottomTabBar />}
      </SidebarInset>
    </SidebarProvider>
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
