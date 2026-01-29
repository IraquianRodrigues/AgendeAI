"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { cn } from "@/lib/utils";

export function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
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

  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 18
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Lado Esquerdo - Branding Clean e Profissional */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-700/40 via-zinc-900 to-zinc-950 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 contrast-150"></div>
        
        {/* Header da Marca */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/10">
            <Scissors className="h-6 w-6 text-zinc-900" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">{businessName}</span>
        </motion.div>

        {/* Conteúdo Central */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="relative z-10 max-w-lg space-y-8"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl font-semibold tracking-tight text-white leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            Sua barbearia no próximo nível. Gestão, agenda e IA integrada.
          </motion.h1>
          <motion.div variants={itemVariants} className="space-y-4">
            {[
              "Controle completo de agendamentos e agenda.",
              "Agendamentos automáticos via IA, otimizando sua agenda.",
              "Gestão financeira e relatórios detalhados.",
              "CRM integrado para fidelização de clientes."
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={featureVariants}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="flex items-start gap-3 group cursor-default"
              >
                <CheckCircle2 className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0 group-hover:text-zinc-300 transition-colors" />
                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors" style={{ lineHeight: '1.6' }}>
                  {feature}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative z-10 text-zinc-500 text-sm"
        >
          <p>© {currentYear} AgendeAI - Excelência em gestão e automação.</p>
        </motion.div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative bg-zinc-950 text-white">
        <div className="absolute top-6 right-6">
          <ModeToggle />
        </div>

        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="w-full max-w-[420px] space-y-8"
        >
          <motion.div variants={itemVariants} className="space-y-2 text-center lg:text-left">
             <div className="lg:hidden flex justify-center mb-6">
               <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                 <Scissors className="h-6 w-6 text-white" />
               </div>
             </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Acesse sua conta
            </h2>
            <p className="text-zinc-400 text-sm" style={{ lineHeight: '1.6' }}>
              Bem-vindo de volta. Por favor, insira seus dados.
            </p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div variants={itemVariants} className="space-y-4">
              {/* Email Input com Label Flutuante */}
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isLoading}
                  className={cn(
                    "peer h-12 pt-4 bg-zinc-900 border-zinc-800 text-white placeholder:text-transparent",
                    "transition-all duration-200 ease-out",
                    "focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:border-transparent",
                    "focus-visible:shadow-[0_0_0_3px_rgba(113,113,122,0.1)]"
                  )}
                />
                <Label
                  htmlFor="email"
                  className={cn(
                    "absolute left-3 transition-all duration-200 pointer-events-none font-medium",
                    focusedField === "email" || email
                      ? "top-1.5 text-xs text-zinc-400"
                      : "top-3.5 text-sm text-zinc-500"
                  )}
                >
                  Email
                </Label>
              </div>

              {/* Password Input com Label Flutuante */}
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isLoading}
                  className={cn(
                    "peer h-12 pt-4 bg-zinc-900 border-zinc-800 text-white placeholder:text-transparent",
                    "transition-all duration-200 ease-out",
                    "focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:border-transparent",
                    "focus-visible:shadow-[0_0_0_3px_rgba(113,113,122,0.1)]"
                  )}
                />
                <Label
                  htmlFor="password"
                  className={cn(
                    "absolute left-3 transition-all duration-200 pointer-events-none font-medium",
                    focusedField === "password" || password
                      ? "top-1.5 text-xs text-zinc-400"
                      : "top-3.5 text-sm text-zinc-500"
                  )}
                >
                  Senha
                </Label>
              </div>

               <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  className="h-6 w-6 border-2 border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=checked]:border-white transition-all duration-200" 
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400"
                >
                  Lembrar-me por 30 dias
                </label>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className={cn(
                  "w-full h-12 text-base font-medium",
                  "bg-white text-black",
                  "shadow-[0_1px_2px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)]",
                  "hover:shadow-[0_4px_8px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.25)]",
                  "hover:-translate-y-0.5 hover:bg-zinc-100",
                  "active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
                  "transition-all duration-200 ease-out",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
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
            </motion.div>
          </form>

          <motion.p 
            variants={itemVariants}
            className="text-center text-xs text-zinc-500 mt-8"
          >
            Ao clicar em entrar, você concorda com nossos <br className="hidden sm:block" />
            <a href="#" className="underline hover:text-white transition-colors">Termos de Uso</a> e <a href="#" className="underline hover:text-white transition-colors">Política de Privacidade</a>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
