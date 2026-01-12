import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction } from "@/types/financial";

interface ReportFilters {
  type?: "receita" | "despesa" | "all";
  professionalId?: number | "all";
  professionalName?: string;
  startDate?: string;
  endDate?: string;
}

interface ReportData {
  transactions: Transaction[];
  filters: ReportFilters;
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
}

export class PDFReportService {
  static generateFinancialReport(data: ReportData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Configurações
    const primaryColor: [number, number, number] = [37, 99, 235]; // Blue-600
    const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
    
    let yPosition = 20;

    // ==================== CABEÇALHO ====================
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("OdontoVida", pageWidth / 2, 15, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Financeiro", pageWidth / 2, 25, { align: "center" });
    
    doc.setFontSize(9);
    const reportDate = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Gerado em: ${reportDate}`, pageWidth / 2, 33, { align: "center" });
    
    yPosition = 50;

    // ==================== FILTROS APLICADOS ====================
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Filtros Aplicados:", 14, yPosition);
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Tipo
    const tipoLabel = data.filters.type === "receita" 
      ? "Receitas" 
      : data.filters.type === "despesa" 
      ? "Despesas" 
      : "Todas as Transações";
    doc.text(`• Tipo: ${tipoLabel}`, 14, yPosition);
    yPosition += 5;
    
    // Profissional
    if (data.filters.professionalId && data.filters.professionalId !== "all") {
      doc.text(`• Profissional: ${data.filters.professionalName || "N/A"}`, 14, yPosition);
      yPosition += 5;
    }
    
    // Período
    if (data.filters.startDate || data.filters.endDate) {
      const start = data.filters.startDate 
        ? new Date(data.filters.startDate).toLocaleDateString("pt-BR")
        : "Início";
      const end = data.filters.endDate 
        ? new Date(data.filters.endDate).toLocaleDateString("pt-BR")
        : "Hoje";
      doc.text(`• Período: ${start} até ${end}`, 14, yPosition);
      yPosition += 5;
    }
    
    yPosition += 5;

    // ==================== RESUMO FINANCEIRO ====================
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Financeiro", 14, yPosition);
    yPosition += 7;
    
    // Box de resumo
    const boxHeight = 30;
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.setLineWidth(0.5);
    doc.rect(14, yPosition, pageWidth - 28, boxHeight);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };
    
    // Receitas
    doc.setTextColor(22, 163, 74); // Green-600
    doc.text("Receitas:", 20, yPosition + 8);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(data.totalReceitas), 20, yPosition + 14);
    
    // Despesas
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text("Despesas:", 80, yPosition + 8);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(data.totalDespesas), 80, yPosition + 14);
    
    // Lucro Líquido
    doc.setFont("helvetica", "normal");
    const lucroColor: [number, number, number] = data.lucroLiquido >= 0 
      ? [22, 163, 74] 
      : [220, 38, 38];
    doc.setTextColor(...lucroColor);
    doc.text("Lucro Líquido:", 140, yPosition + 8);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(data.lucroLiquido), 140, yPosition + 14);
    
    yPosition += boxHeight + 10;

    // ==================== TABELA DE TRANSAÇÕES ====================
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Transações", 14, yPosition);
    yPosition += 5;
    
    const tableData = data.transactions.map((t) => [
      new Date(t.due_date).toLocaleDateString("pt-BR"),
      t.client?.nome || "N/A",
      t.professional?.name || "N/A",
      t.type === "receita" ? "Receita" : "Despesa",
      t.category,
      formatCurrency(t.amount),
      t.status === "pago" ? "Pago" : t.status === "pendente" ? "Pendente" : "Atrasado",
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Cliente", "Profissional", "Tipo", "Categoria", "Valor", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Gray-50
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25, halign: "right" },
        6: { cellWidth: 20 },
      },
      margin: { left: 14, right: 14 },
    });
    
    // ==================== RODAPÉ ====================
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // Gray-400
      doc.setFont("helvetica", "normal");
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    
    // Salvar PDF
    const fileName = `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  }
}
