"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight, Plus, Briefcase } from "lucide-react";
import type { ProfessionalRow } from "@/types/database.types";
import { ProfessionalDetailsModal } from "@/components/professional-details-modal";
import { ProfessionalServicesModal } from "@/components/professional-services-modal";

interface ProfessionalsTableProps {
  professionals: ProfessionalRow[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 15;

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-100 text-red-600",
    "bg-orange-100 text-orange-600",
    "bg-amber-100 text-amber-600",
    "bg-green-100 text-green-600",
    "bg-emerald-100 text-emerald-600",
    "bg-teal-100 text-teal-600",
    "bg-cyan-100 text-cyan-600",
    "bg-blue-100 text-blue-600",
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
    "bg-purple-100 text-purple-600",
    "bg-fuchsia-100 text-fuchsia-600",
    "bg-pink-100 text-pink-600",
    "bg-rose-100 text-rose-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function ProfessionalsTable({
  professionals,
  isLoading = false,
}: ProfessionalsTableProps) {
  const [selectedProfessional, setSelectedProfessional] =
    useState<ProfessionalRow | null>(null);
  const [professionalForServices, setProfessionalForServices] =
    useState<ProfessionalRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProfessionals = useMemo(() => {
    if (!searchQuery.trim()) return professionals;

    return professionals.filter((professional) =>
      professional.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [professionals, searchQuery]);

  // Paginação
  const totalPages = Math.ceil(filteredProfessionals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProfessionals = filteredProfessionals.slice(
    startIndex,
    endIndex
  );

  // Reset para primeira página quando filtrar
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando profissionais...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-8 space-y-6 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">Lista de Profissionais</h2>
              <p className="text-sm text-gray-400 font-medium">
                Visualize e gerencie os profissionais cadastrados
              </p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-900/10 hover:shadow-xl hover:shadow-gray-900/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <Input
              placeholder="Buscar por nome do profissional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-gray-50/50 border-gray-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-gray-900/5 transition-all rounded-2xl font-medium text-gray-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="text-left p-6 font-medium text-xs text-gray-400 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="text-left p-6 font-medium text-xs text-gray-400 uppercase tracking-wider">
                  Especialidade
                </th>
                <th className="text-left p-6 font-medium text-xs text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="text-right p-6 font-medium text-xs text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {professionals.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-medium">Nenhum profissional cadastrado</p>
                      <p className="text-sm text-gray-400">Clique em "Novo Profissional" para adicionar.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProfessionals.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-medium">Nenhum profissional encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProfessionals.map((professional) => {
                  return (
                    <tr
                      key={professional.id}
                      className="group transition-colors hover:bg-gray-50/50"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${getAvatarColor(
                              professional.name
                            )}`}
                          >
                            {getInitials(professional.name)}
                          </div>
                          <div>
                            <span className="block font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {professional.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {professional.specialty || "Geral"}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 font-mono">
                          {professional.code}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProfessionalForServices(professional)}
                            className="h-9 px-4 text-xs font-medium border-gray-200 hover:bg-white hover:border-gray-300 hover:text-gray-900 rounded-lg transition-all"
                          >
                            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                            Serviços
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProfessional(professional)}
                            className="h-9 px-4 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Editar
                          </Button>
                        </div>
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
          <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 font-medium text-center sm:text-left">
              Mostrando <span className="font-bold text-gray-900">{startIndex + 1}</span> a{" "}
              <span className="font-bold text-gray-900">
                {Math.min(endIndex, filteredProfessionals.length)}
              </span>{" "}
              de <span className="font-bold text-gray-900">{filteredProfessionals.length}</span> profissionais
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 px-4 rounded-xl border-gray-200 hover:bg-white hover:border-gray-300 hover:text-gray-900 transition-all disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <div className="text-sm font-bold w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-xl">
                {currentPage}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="h-10 px-4 rounded-xl border-gray-200 hover:bg-white hover:border-gray-300 hover:text-gray-900 transition-all disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProfessionalDetailsModal
        professional={selectedProfessional}
        isCreating={isCreating}
        onClose={() => {
          setSelectedProfessional(null);
          setIsCreating(false);
        }}
      />

      <ProfessionalServicesModal
        professional={professionalForServices}
        onClose={() => setProfessionalForServices(null)}
      />
    </>
  );
}
