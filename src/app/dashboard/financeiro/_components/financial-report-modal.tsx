"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FileText, Download } from "lucide-react";
import { useProfessionals } from "@/services/professionals/use-professionals";
import { FinancialService } from "@/services/financial.service";
import { PDFReportServicePdfMake } from "@/services/pdf-report-pdfmake.service";
import type { TransactionType } from "@/types/financial";
import { toast } from "sonner";

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinancialReportModal({
  isOpen,
  onClose,
}: FinancialReportModalProps) {
  const [selectedType, setSelectedType] = useState<TransactionType | "all">("all");
  const [selectedProfessional, setSelectedProfessional] = useState<number | "all">("all");
  
  // Definir datas padrão: primeiro dia do mês até último dia do mês
  const getDefaultStartDate = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  };
  
  const getDefaultEndDate = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: professionals, isLoading: loadingProfessionals } = useProfessionals();

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
      // Buscar transações com filtros
      const filters: any = {};
      if (selectedType !== "all") filters.type = selectedType;
      if (selectedProfessional !== "all") filters.professionalId = selectedProfessional;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      console.log("🔍 [PDF Report] Filtros aplicados:", filters);
      console.log("📅 [PDF Report] Datas - Início:", startDate, "Fim:", endDate);

      const result = await FinancialService.getTransactions(filters);

      if (!result.success || !result.data) {
        toast.error("Erro ao buscar transações");
        return;
      }

      console.log("📊 [PDF Report] Transações retornadas:", result.data.length);
      console.log("📋 [PDF Report] Transações:", result.data);

      const transactions = result.data;

      // Calcular totais - incluindo TODAS as transações filtradas
      const totalReceitas = transactions
        .filter((t) => t.type === "receita")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const totalDespesas = transactions
        .filter((t) => t.type === "despesa")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const lucroLiquido = totalReceitas - totalDespesas;

      // Buscar nome do profissional
      const professionalName =
        selectedProfessional !== "all"
          ? professionals?.find((p) => p.id === selectedProfessional)?.name
          : undefined;

      // Gerar PDF
      PDFReportServicePdfMake.generateFinancialReport({
        transactions,
        filters: {
          type: selectedType,
          professionalId: selectedProfessional,
          professionalName,
          startDate,
          endDate,
        },
        totalReceitas,
        totalDespesas,
        lucroLiquido,
      });

      toast.success("Relatório gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerar Relatório Financeiro
          </DialogTitle>
          <DialogDescription>
            Configure os filtros para gerar o relatório em PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de Transação */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Transação</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as TransactionType | "all")}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Transações</SelectItem>
                <SelectItem value="receita">Apenas Receitas</SelectItem>
                <SelectItem value="despesa">Apenas Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profissional */}
          <div className="space-y-2">
            <Label htmlFor="professional">Profissional</Label>
            <Select
              value={selectedProfessional.toString()}
              onValueChange={(value) =>
                setSelectedProfessional(value === "all" ? "all" : parseInt(value))
              }
            >
              <SelectTrigger id="professional">
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

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>Gerando...</>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Gerar PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
