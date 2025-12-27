

"use client";

import { LogOut, Calendar, Users, UserCog, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { AuthClientService } from "@/services/auth/client.service";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Calendar,
  },
  {
    href: "/dashboard/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/dashboard/profissionais",
    label: "Profissionais",
    icon: UserCog,
  },
  {
    href: "/dashboard/servicos",
    label: "Serviços",
    icon: Briefcase,
  },
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME || "Clínica Médica";

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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/dashboard" className="flex items-center gap-3 w-48">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:scale-105">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {clinicName}
            </h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
              Agendamentos
            </p>
          </div>
        </Link>

        {/* Navigation Section */}
        <nav className="hidden md:flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-white text-blue-600 shadow-md shadow-gray-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User/Action Section */}
        <div className="w-48 flex justify-end">
          <Button
            size="sm"
            onClick={handleLogout}
            variant="ghost"
            className="gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">
              {isLoggingOut ? "Saindo..." : "Sair"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
