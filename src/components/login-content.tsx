"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LogIn,
  Loader2,
  Scissors,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { AuthClientService } from "@/services/auth/client.service";
import { ModeToggle } from "@/components/mode-toggle";

export function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "AgendeAI";
  const currentYear = new Date().getFullYear();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await AuthClientService.login({ email, password });

      if (result.success) {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao realizar login");
      }
    } catch (error) {
      toast.error("Erro inesperado ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Lado Esquerdo - Branding Clean e Profissional */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        
        {/* Header da Marca */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
            <Scissors className="h-6 w-6 text-zinc-900" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">{businessName}</span>
        </div>

        {/* Conteúdo Central */}
        <div className="relative z-10 max-w-lg space-y-8">
          <h1 className="text-4xl font-semibold tracking-tight text-white leading-tight">
            Gestão inteligente para o seu negócio de estética.
          </h1>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-zinc-400">Controle completo de agendamentos e agenda.</p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-zinc-400">Agendamentos automáticos via IA, otimizando sua agenda.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-zinc-400">Gestão financeira e relatórios detalhados.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-zinc-400">CRM integrado para fidelização de clientes.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-zinc-500 text-sm">
          <p>© {currentYear} AutomateAI - Excelência em gestão e automação.</p>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative bg-zinc-950 text-white">
        <div className="absolute top-6 right-6">
          <ModeToggle />
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2 text-center lg:text-left">
             <div className="lg:hidden flex justify-center mb-6">
               <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center">
                 <Scissors className="h-6 w-6 text-white" />
               </div>
             </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Acesse sua conta
            </h2>
            <p className="text-zinc-400 text-sm">
              Bem-vindo de volta. Por favor, insira seus dados.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-300">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                   className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                />
              </div>

               <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400"
                >
                  Lembrar-me por 30 dias
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-none hover:shadow-md transition-all bg-white text-black hover:bg-zinc-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <LogIn className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-8">
            Ao clicar em entrar, você concorda com nossos <br className="hidden sm:block" />
            <a href="#" className="underline hover:text-white">Termos de Uso</a> e <a href="#" className="underline hover:text-white">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
