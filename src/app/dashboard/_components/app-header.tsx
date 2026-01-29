
"use client";

import { LogOut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AuthClientService } from "@/services/auth/client.service";
import { toast } from "sonner";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";

export function AppHeader() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "AgendeAI";

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const result = await AuthClientService.logout();

      if (result.success) {
        toast.success("Logout realizado com sucesso!");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao realizar logout");
      }
    } catch (error) {
      toast.error("Erro inesperado ao realizar logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/60 backdrop-blur-xl border-b border-border transition-all duration-300">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        {/* Page Title / Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
             {/* Mobile spacing for menu button area */}
             <div className="w-8"></div>
          </div>
          <div className="flex flex-col">
             <h2 className="text-sm font-semibold text-foreground tracking-tight">
              Visão Geral
            </h2>
            <p className="text-xs text-muted-foreground hidden md:block">
              {businessName} / Dashboard
            </p>
          </div>
        </div>

        {/* User/Action Section */}
        <div className="flex gap-3 items-center">
          <ModeToggle />
          <div className="h-4 w-px bg-border mx-1"></div>
          <Button
            size="sm"
            onClick={handleLogout}
            variant="ghost"
            className="h-11 gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 px-3"
            disabled={isLoggingOut}
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline font-medium text-sm">
              {isLoggingOut ? "Saindo..." : "Sair"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
