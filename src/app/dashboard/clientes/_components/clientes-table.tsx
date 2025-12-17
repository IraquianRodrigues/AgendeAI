"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { ClienteRow } from "@/types/database.types";
import { ClienteDetailsModal } from "@/components/cliente-details-modal";

interface ClientesTableProps {
  clientes: ClienteRow[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;

export function ClientesTable({
  clientes,
  isLoading = false,
}: ClientesTableProps) {
  const [selectedCliente, setSelectedCliente] = useState<ClienteRow | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return clientes;

    return clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clientes, searchQuery]);

  // Paginação
  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClientes = filteredClientes.slice(startIndex, endIndex);

  // Reset para primeira página quando filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <Card className="p-12 border shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Carregando clientes...
          </p>
        </div>
      </Card>
    );
  }

  if (clientes.length === 0) {
    return (
      <Card className="p-12 border shadow-sm">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-muted-foreground">
            Nenhum cliente cadastrado
          </p>
          <p className="text-sm text-muted-foreground/70">
            Os clientes cadastrados aparecerão aqui
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-6 space-y-6 bg-gradient-to-br from-white to-muted/20">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Lista de Clientes
            </h2>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie os clientes cadastrados
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 shadow-sm focus-visible:ring-2"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Nome
                </th>
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Telefone
                </th>
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base">Nenhum cliente encontrado</p>
                      <p className="text-sm text-muted-foreground/70">
                        Tente ajustar a busca ou verificar os filtros
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClientes.map((cliente) => {
                  const isBlocked = cliente.trava;
                  return (
                    <tr
                      key={cliente.id}
                      className={`border-b transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/2 group ${
                        isBlocked ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="p-4">
                        <span
                          className={`font-semibold group-hover:text-primary transition-colors ${
                            isBlocked ? "text-red-700" : "text-foreground"
                          }`}
                        >
                          {cliente.nome}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground font-mono">
                          {cliente.telefone}
                        </span>
                      </td>
                      <td className="p-4">
                        {cliente.trava ? (
                          <Badge
                            variant="destructive"
                            className="font-semibold shadow-sm"
                          >
                            Bloqueado
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                          >
                            Ativo
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCliente(cliente)}
                          className="hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md"
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground font-medium">
              Mostrando <span className="font-semibold text-foreground">{startIndex + 1}</span> a{" "}
              <span className="font-semibold text-foreground">
                {Math.min(endIndex, filteredClientes.length)}
              </span>{" "}
              de <span className="font-semibold text-foreground">{filteredClientes.length}</span> clientes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="text-sm font-semibold px-3 py-1.5 bg-primary/10 text-primary rounded-md">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="shadow-sm hover:shadow-md transition-all"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ClienteDetailsModal
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
      />
    </>
  );
}
