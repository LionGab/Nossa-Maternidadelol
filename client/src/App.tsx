import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomTabBar } from "@/components/BottomTabBar";
import Home from "@/pages/Home";
import NathIA from "@/pages/NathIA";
import MundoNath from "@/pages/MundoNath";
import MaeValente from "@/pages/MaeValente";
import Habitos from "@/pages/Habitos";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/nathia" component={NathIA} />
        <Route path="/mundo-nath" component={MundoNath} />
        <Route path="/mae-valente" component={MaeValente} />
        <Route path="/habitos" component={Habitos} />
        <Route component={NotFound} />
      </Switch>
      <BottomTabBar />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
