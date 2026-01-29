"use client";

import { Calendar, Users, UserCog, Briefcase, DollarSign, ChevronLeft, ChevronRight, Menu, X, CalendarDays, LogOut, User, Settings, Scissors } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Calendar,
    allowedRoles: ['admin', 'recepcionista', 'profissional'] as const,
  },
  {
    href: "/dashboard/agenda",
    label: "Agenda",
    icon: CalendarDays,
    allowedRoles: ['admin', 'recepcionista', 'profissional'] as const,
  },
  {
    href: "/dashboard/clientes",
    label: "Clientes",
    icon: Users,
    allowedRoles: ['admin', 'recepcionista', 'profissional'] as const,
  },
  {
    href: "/dashboard/profissionais",
    label: "Profissionais",
    icon: UserCog,
    allowedRoles: ['admin', 'profissional'] as const,
  },
  {
    href: "/dashboard/servicos",
    label: "Serviços",
    icon: Briefcase,
    allowedRoles: ['admin', 'profissional'] as const,
  },
  {
    href: "/dashboard/financeiro",
    label: "Financeiro",
    icon: DollarSign,
    allowedRoles: ['admin'] as const,
  },
  {
    href: "/dashboard/configuracoes",
    label: "Configurações",
    icon: Settings,
    allowedRoles: ['admin'] as const,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { hasFinancialAccess, hasMedicalRecordsAccess, profile, role } = useUserRole();
  const supabase = createClient();

  // Filtrar itens de navegação baseado em permissões de role
  const filteredNavItems = navItems.filter(item => {
    // Se não tem allowedRoles definido, mostra para todos
    if (!item.allowedRoles) return true;
    
    // Verifica se o role atual está na lista de permitidos
    return item.allowedRoles.includes(role as any);
  });

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Update body class when collapsed state changes
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [isCollapsed]);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Get role display name
  const getRoleDisplay = (userRole: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      profissional: "Profissional",
      recepcionista: "Recepcionista",
    };
    return roleMap[userRole] || userRole;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden h-12 w-12 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col",
          // Clean background with border (System Theme)
          "bg-background border-r border-border",
          "shadow-sm",
          // Desktop
          "hidden md:flex",
          isCollapsed ? "w-20" : "w-64",
          // Mobile
          "md:translate-x-0",
          isMobileOpen ? "flex translate-x-0 w-64" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "h-16 flex items-center border-b border-border px-4 transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "justify-start"
        )}>
          {isCollapsed ? (
            <div className="bg-foreground/5 rounded-xl p-2.5 flex items-center justify-center">
              <Scissors className="h-6 w-6 text-foreground" />
            </div>
          ) : (
            <div className="flex items-center gap-3 group px-2">
              <div className="bg-foreground/5 rounded-xl p-2 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-foreground leading-none tracking-tight">
                  {process.env.NEXT_PUBLIC_BUSINESS_NAME || "AgendeAI"}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {mounted && filteredNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setIsMobileOpen(false)}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-medium transition-all duration-300 min-h-[44px]",
                  "animate-in fade-in slide-in-from-left-2",
                  isActive
                    ? "bg-foreground text-background shadow-md shadow-foreground/10 translate-x-1"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:translate-x-1",
                  isCollapsed && "md:justify-center md:px-2"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-background rounded-r-full" />
                )}

                <Icon 
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all duration-300",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} 
                />
                <span
                  className={cn(
                    "truncate transition-all duration-300 font-medium",
                    isCollapsed ? "md:hidden" : "block"
                  )}
                >
                  {item.label}
                </span>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="hidden md:block absolute left-full ml-3 px-3 py-2 bg-popover text-popover-foreground text-xs font-medium rounded-lg shadow-lg border border-border opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className={cn(
          "border-t border-border p-3",
          "transition-all duration-300"
        )}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background font-bold shadow-sm">
                  {profile?.full_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background font-bold shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                    {profile?.full_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profile?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {getRoleDisplay(role)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button - Kept at bottom */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex absolute -right-3 bottom-8 z-50 h-7 w-7 rounded-full bg-foreground text-background shadow-md hover:shadow-lg transition-all duration-300 items-center justify-center hover:scale-110 border-2 border-background"
          title={isCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}
