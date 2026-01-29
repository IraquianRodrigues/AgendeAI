import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import type { Transaction } from "@/types/financial";

// Configurar fontes
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

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

export class PDFReportServicePdfMake {
  static generateFinancialReport(data: ReportData) {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };

    const reportDate = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Preparar dados da tabela
    const tableData = data.transactions.map((t) => [
      new Date(t.due_date).toLocaleDateString("pt-BR"),
      t.client?.nome || "N/A",
      t.professional?.name || "N/A",
      t.type === "receita" ? "Receita" : "Despesa",
      t.category,
      formatCurrency(t.amount),
      t.status === "pago" ? "Pago" : t.status === "pendente" ? "Pendente" : "Atrasado",
    ]);

    // Filtros
    const tipoLabel = data.filters.type === "receita" 
      ? "Receitas" 
      : data.filters.type === "despesa" 
      ? "Despesas" 
      : "Todas as Transações";

    const periodoText = data.filters.startDate || data.filters.endDate
      ? `Período: ${data.filters.startDate ? new Date(data.filters.startDate).toLocaleDateString("pt-BR") : "Início"} até ${data.filters.endDate ? new Date(data.filters.endDate).toLocaleDateString("pt-BR") : "Hoje"}`
      : "";

    const profissionalText = data.filters.professionalId && data.filters.professionalId !== "all"
      ? `Profissional: ${data.filters.professionalName || "N/A"}`
      : "";

    const isProfit = data.lucroLiquido >= 0;
    const margin = data.totalReceitas > 0 ? ((data.lucroLiquido / data.totalReceitas) * 100).toFixed(1) : "0.0";

    const docDefinition: TDocumentDefinitions = {
      pageSize: "A4",
      pageMargins: [40, 120, 40, 60],
      
      header: {
        margin: [0, 0, 0, 20],
        stack: [
          // Cabeçalho com gradiente (simulado com cor sólida)
          {
            canvas: [
              {
                type: "rect",
                x: 0,
                y: 0,
                w: 595,
                h: 100,
                color: "#2563eb", // Blue-600
              },
            ],
          },
          {
            text: "AgendeAI",
            style: "header",
            margin: [0, -85, 0, 0],
          },
          {
            text: "Relatório Financeiro Detalhado",
            style: "subheader",
            margin: [0, 5, 0, 0],
          },
          {
            text: `Gerado automaticamente em: ${reportDate}`,
            style: "headerDate",
            margin: [0, 8, 0, 0],
          },
        ],
      },

      footer: (currentPage, pageCount) => {
        return {
          margin: [40, 0, 40, 20],
          stack: [
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 0,
                  x2: 515,
                  y2: 0,
                  lineWidth: 1,
                  lineColor: "#3b82f6",
                },
              ],
            },
            {
              columns: [
                {
                  text: "Sistema AgendeAI - CRM com Automação e IA Integrada",
                  style: "footerText",
                  width: "*",
                },
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  style: "footerPage",
                  width: "auto",
                },
              ],
              margin: [0, 10, 0, 0],
            },
          ],
        };
      },

      content: [
        // Filtros Aplicados
        {
          text: "Filtros Aplicados",
          style: "sectionTitle",
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    { text: `Tipo: ${tipoLabel}`, style: "filterText" },
                    ...(profissionalText ? [{ text: profissionalText, style: "filterText", margin: [0, 3, 0, 0] as [number, number, number, number] }] : []),
                    ...(periodoText ? [{ text: periodoText, style: "filterText", margin: [0, 3, 0, 0] as [number, number, number, number] }] : []),
                  ],
                  border: [false, false, false, false] as [boolean, boolean, boolean, boolean],
                },
              ],
            ],
          },
          layout: {
            fillColor: "#f9fafb",
            paddingLeft: () => 10,
            paddingRight: () => 10,
            paddingTop: () => 10,
            paddingBottom: () => 10,
          },
          margin: [0, 0, 0, 20] as [number, number, number, number],
        },

        // Resumo Financeiro
        {
          text: "Resumo Financeiro",
          style: "sectionTitle",
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            // Card Receitas
            {
              width: "*",
              stack: [
                {
                  table: {
                    widths: ["*"],
                    body: [
                      [
                        {
                          stack: [
                            { text: "Receitas", style: "cardLabel", color: "#166534" },
                            { text: formatCurrency(data.totalReceitas), style: "cardValue", color: "#16a34a", margin: [0, 5, 0, 0] },
                            { text: `${data.transactions.filter(t => t.type === "receita").length} transações`, style: "cardSubtext", margin: [0, 3, 0, 0] },
                          ],
                          border: [true, true, true, true],
                          borderColor: ["#22c55e", "#22c55e", "#22c55e", "#22c55e"],
                        },
                      ],
                    ],
                  },
                  layout: {
                    fillColor: "#dcfce7",
                    paddingLeft: () => 10,
                    paddingRight: () => 10,
                    paddingTop: () => 10,
                    paddingBottom: () => 10,
                  },
                },
              ],
            },
            // Espaço
            { width: 10, text: "" },
            // Card Despesas
            {
              width: "*",
              stack: [
                {
                  table: {
                    widths: ["*"],
                    body: [
                      [
                        {
                          stack: [
                            { text: "Despesas", style: "cardLabel", color: "#7f1d1d" },
                            { text: formatCurrency(data.totalDespesas), style: "cardValue", color: "#dc2626", margin: [0, 5, 0, 0] },
                            { text: `${data.transactions.filter(t => t.type === "despesa").length} transações`, style: "cardSubtext", margin: [0, 3, 0, 0] },
                          ],
                          border: [true, true, true, true],
                          borderColor: ["#ef4444", "#ef4444", "#ef4444", "#ef4444"],
                        },
                      ],
                    ],
                  },
                  layout: {
                    fillColor: "#fee2e2",
                    paddingLeft: () => 10,
                    paddingRight: () => 10,
                    paddingTop: () => 10,
                    paddingBottom: () => 10,
                  },
                },
              ],
            },
            // Espaço
            { width: 10, text: "" },
            // Card Lucro
            {
              width: "*",
              stack: [
                {
                  table: {
                    widths: ["*"],
                    body: [
                      [
                        {
                          stack: [
                            { text: isProfit ? "Lucro Líquido" : "Prejuízo", style: "cardLabel", color: isProfit ? "#1e3a8a" : "#7f1d1d" },
                            { text: formatCurrency(Math.abs(data.lucroLiquido)), style: "cardValue", color: isProfit ? "#2563eb" : "#dc2626", margin: [0, 5, 0, 0] },
                            { text: `Margem: ${margin}%`, style: "cardSubtext", margin: [0, 3, 0, 0] },
                          ],
                          border: [true, true, true, true],
                          borderColor: isProfit ? ["#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6"] : ["#ef4444", "#ef4444", "#ef4444", "#ef4444"],
                        },
                      ],
                    ],
                  },
                  layout: {
                    fillColor: isProfit ? "#dbeafe" : "#fee2e2",
                    paddingLeft: () => 10,
                    paddingRight: () => 10,
                    paddingTop: () => 10,
                    paddingBottom: () => 10,
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Tabela de Transações
        {
          text: "Detalhamento de Transações",
          style: "sectionTitle",
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: [60, 80, 70, 50, "*", 60, 50],
            body: [
              [
                { text: "Data", style: "tableHeader" },
                { text: "Cliente", style: "tableHeader" },
                { text: "Profissional", style: "tableHeader" },
                { text: "Tipo", style: "tableHeader" },
                { text: "Categoria", style: "tableHeader" },
                { text: "Valor", style: "tableHeader" },
                { text: "Status", style: "tableHeader" },
              ],
              ...tableData.map((row) => 
                row.map((cell, index) => ({
                  text: cell,
                  style: index === 5 ? "tableValueCell" : index === 6 ? "tableStatusCell" : "tableCell",
                  color: index === 6 
                    ? (cell === "Pago" ? "#16a34a" : cell === "Atrasado" ? "#dc2626" : "#eab308")
                    : undefined,
                }))
              ),
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#2563eb" : rowIndex % 2 === 0 ? "#f9fafb" : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#e5e7eb",
            vLineColor: () => "#e5e7eb",
          },
        },
      ],

      styles: {
        header: {
          fontSize: 24,
          bold: true,
          color: "#ffffff",
          alignment: "center",
        },
        subheader: {
          fontSize: 14,
          color: "#ffffff",
          alignment: "center",
        },
        headerDate: {
          fontSize: 8,
          color: "#ffffff",
          alignment: "center",
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: "#1f2937",
        },
        filterText: {
          fontSize: 8,
          color: "#374151",
        },
        cardLabel: {
          fontSize: 8,
        },
        cardValue: {
          fontSize: 14,
          bold: true,
        },
        cardSubtext: {
          fontSize: 7,
          color: "#6b7280",
        },
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: "#ffffff",
          alignment: "center",
        },
        tableCell: {
          fontSize: 8,
          color: "#374151",
        },
        tableValueCell: {
          fontSize: 8,
          bold: true,
          alignment: "right",
          color: "#374151",
        },
        tableStatusCell: {
          fontSize: 8,
          bold: true,
          alignment: "center",
        },
        footerText: {
          fontSize: 7,
          color: "#6b7280",
        },
        footerPage: {
          fontSize: 7,
          bold: true,
          color: "#374151",
        },
      },
    };

    const fileName = `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
  }
}
