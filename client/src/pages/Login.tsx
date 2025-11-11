import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Bem-vinda de volta!",
        description: "Você está conectada à Nossa Maternidade",
      });
      setLocation("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header with Logo */}
      <div className="pt-12 pb-8 px-6 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Heart className="w-10 h-10 text-primary" fill="currentColor" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
          Nossa Maternidade
        </h1>
        <p className="text-muted-foreground text-base">
          Seu refúgio sem julgamento
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-8 flex flex-col justify-center max-w-md mx-auto w-full animate-fade-in-up">
        {/* Welcome Message */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-serif font-semibold mb-2">
            Bem-vinda de volta
          </h2>
          <p className="text-muted-foreground">
            Entre para continuar sua jornada
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 text-base"
                data-testid="input-email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12 text-base"
                data-testid="input-password"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input"
                data-testid="checkbox-remember"
              />
              <span className="text-muted-foreground">Lembrar de mim</span>
            </label>
            <button
              type="button"
              className="text-primary font-medium hover:underline"
              data-testid="link-forgot-password"
            >
              Esqueci a senha
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold group"
            disabled={isLoading}
            data-testid="button-login"
          >
            {isLoading ? (
              "Entrando..."
            ) : (
              <>
                Entrar
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground tracking-wider">
              Ou continue com
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            data-testid="button-google-login"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            data-testid="button-apple-login"
          >
            <svg
              className="w-5 h-5 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continuar com Apple
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Ainda não tem conta?{" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              data-testid="link-signup"
            >
              Criar conta gratuita
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 px-6 text-center text-sm text-muted-foreground">
        <p>
          Ao continuar, você concorda com nossos{" "}
          <button className="underline hover:text-foreground">
            Termos de Uso
          </button>{" "}
          e{" "}
          <button className="underline hover:text-foreground">
            Política de Privacidade
          </button>
        </p>
      </div>
    </div>
  );
}
