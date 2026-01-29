"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Calendar } from "lucide-react";
import { useProfessionals } from "@/services/professionals/use-professionals";
import type { TransactionType, TransactionStatus } from "@/types/financial";

interface FinancialFiltersProps {
  selectedType: TransactionType | "all";
  selectedProfessional: number | "all";
  selectedStatus: TransactionStatus | "all";
  selectedStartDate: string;
  selectedEndDate: string;
  onTypeChange: (type: TransactionType | "all") => void;
  onProfessionalChange: (professionalId: number | "all") => void;
  onStatusChange: (status: TransactionStatus | "all") => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearFilters: () => void;
}

export function FinancialFilters({
  selectedType,
  selectedProfessional,
  selectedStatus,
  selectedStartDate,
  selectedEndDate,
  onTypeChange,
  onProfessionalChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: FinancialFiltersProps) {
  const { data: professionals, isLoading: loadingProfessionals } = useProfessionals();

  const hasActiveFilters = 
    selectedType !== "all" || 
    selectedProfessional !== "all" || 
    selectedStatus !== "all" ||
    selectedStartDate !== "" ||
    selectedEndDate !== "";

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Filtro de Tipo */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tipo de Transação
          </label>
          <div className="flex gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange("all")}
              className="flex-1"
            >
              Todas
            </Button>
            <Button
              variant={selectedType === "receita" ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange("receita")}
              className="flex-1 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800"
            >
              Receitas
            </Button>
            <Button
              variant={selectedType === "despesa" ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange("despesa")}
              className="flex-1 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800"
            >
              Despesas
            </Button>
          </div>
        </div>

        {/* Filtro de Profissional */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Profissional
          </label>
          <Select
            value={selectedProfessional.toString()}
            onValueChange={(value) =>
              onProfessionalChange(value === "all" ? "all" : parseInt(value))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {loadingProfessionals ? (
                <SelectItem value="loading" disabled>
                  Carregando...
                </SelectItem>
              ) : (
                professionals?.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id.toString()}>
                    {prof.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Status */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              onStatusChange(value as TransactionStatus | "all")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Data */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Período
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="date"
                value={selectedStartDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                placeholder="Data inicial"
                className="h-9 text-xs"
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                value={selectedEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                placeholder="Data final"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
