"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/use-user-role";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

export function ProtectedRoute({ children, requiresAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { hasFinancialAccess } = useUserRole();

  useEffect(() => {
    if (requiresAdmin && !hasFinancialAccess) {
      router.push("/dashboard");
    }
  }, [requiresAdmin, hasFinancialAccess, router]);

  // Se requer admin e não tem acesso, não renderiza nada (vai redirecionar)
  if (requiresAdmin && !hasFinancialAccess) {
    return null;
  }

  return <>{children}</>;
}
