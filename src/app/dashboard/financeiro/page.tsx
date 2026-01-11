"use client";

import { useEffect, useState } from "react";
import { FinancialService } from "@/services/financial.service";
import type { Transaction, FinancialMetrics } from "@/types/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Clock, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { FinancialTable } from "./_components/financial-table";
import { AddTransactionModal } from "./_components/add-transaction-modal";

export default function FinanceiroPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load metrics
    const metricsResult = await FinancialService.getFinancialMetrics();
    if (metricsResult.success && metricsResult.data) {
      setMetrics(metricsResult.data);
    }

    // Load transactions
    const transactionsResult = await FinancialService.getTransactions();
    if (transactionsResult.success && transactionsResult.data) {
      setTransactions(transactionsResult.data);
    } else {
      toast.error("Erro ao carregar transações");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie receitas, despesas e fluxo de caixa
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total a Receber */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Receber
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics ? formatCurrency(metrics.totalPending) : "..."}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pendente de pagamento
            </p>
          </CardContent>
        </Card>

        {/* Total Recebido */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recebido no Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics ? formatCurrency(metrics.monthlyRevenue) : "..."}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas confirmadas
            </p>
          </CardContent>
        </Card>

        {/* Em Atraso */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Atraso
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {metrics ? formatCurrency(metrics.totalOverdue) : "..."}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagamentos vencidos
            </p>
          </CardContent>
        </Card>

        {/* Lucro Líquido */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics && metrics.netProfit >= 0 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {metrics ? formatCurrency(metrics.netProfit) : "..."}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialTable 
            transactions={transactions} 
            isLoading={isLoading}
            onRefresh={loadData}
          />
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadData();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
