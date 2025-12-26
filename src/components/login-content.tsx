"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthClientService } from "@/services/auth/client.service";

export function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const clinicName =
    process.env.NEXT_PUBLIC_CLINIC_NAME || "OdontoVida";

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#FDFDFD]">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 blur-[120px] opacity-60 animate-pulse delay-75" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-purple-50/80 to-pink-50/80 blur-[120px] opacity-60 animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="relative group">
          {/* Subtle glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 rounded-[35px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

          <div className="relative bg-white/60 backdrop-blur-xl rounded-[32px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-white/50">
            <div className="text-center space-y-8 mb-10">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800 rounded-2xl rotate-6 opacity-20 blur-sm"></div>
                <div className="relative w-full h-full bg-gradient-to-tr from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg text-white">
                  <LogIn className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {clinicName}
                </h1>
                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase opacity-80">
                  Sistema de Gestão
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Email Corporativo
                  </Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within/input:text-gray-900 transition-colors duration-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-12 h-14 bg-gray-50/50 border-gray-100 hover:bg-gray-50/80 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-gray-900/5 focus-visible:border-gray-200 rounded-2xl transition-all duration-300 font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <Label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Senha
                    </Label>
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within/input:text-gray-900 transition-colors duration-300" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-12 h-14 bg-gray-50/50 border-gray-100 hover:bg-gray-50/80 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-gray-900/5 focus-visible:border-gray-200 rounded-2xl transition-all duration-300 font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold tracking-wide shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/20 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Acessar Sistema"
                )}
              </Button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-xs text-gray-400 font-medium">
                © {new Date().getFullYear()} {clinicName}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
