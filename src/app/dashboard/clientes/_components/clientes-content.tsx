"use client";

import { ClientesTable } from "./clientes-table";
import { useClientes } from "@/services/clientes/use-clientes";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { Users, UserCheck, UserX, AlertCircle } from "lucide-react";

export default function ClientesContent() {
  const { data: clientes = [], isLoading, error } = useClientes();

  const stats = useMemo(() => {
    const total = clientes.length;
    const active = clientes.filter((cliente) => !cliente.trava).length;
    const blocked = clientes.filter((cliente) => cliente.trava).length;

    return { total, active, blocked };
  }, [clientes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Clientes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Gerencie os clientes cadastrados
          </p>
        </div>

        {/* Cards de Estatísticas */}
        {!isLoading && !error && (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="p-4 sm:p-6 border shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-primary/5">
              <div className="flex items-start justify-between">
                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total de Clientes
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">
                    clientes cadastrados
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 border shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-green-50">
              <div className="flex items-start justify-between">
                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Ativos
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {stats.active}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    clientes ativos
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-green-100 flex-shrink-0">
                  <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 border shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-red-50">
              <div className="flex items-start justify-between">
                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Bloqueados
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">
                    {stats.blocked}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    clientes bloqueados
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-red-100 flex-shrink-0">
                  <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {error ? (
          <Card className="p-12 border shadow-sm">
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-destructive font-medium">
                Erro ao carregar clientes
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          </Card>
        ) : (
          <ClientesTable clientes={clientes} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
