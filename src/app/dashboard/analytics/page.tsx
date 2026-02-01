"use client";

import { useState, useEffect } from "react";
import { AnalyticsService } from "@/services/analytics.service";
import { AnalyticsFiltersComponent } from "./_components/analytics-filters";
import { MetricsCards } from "./_components/metrics-cards";
import { TopServicesChart } from "./_components/top-services-chart";
import { TopProfessionalsChart } from "./_components/top-professionals-chart";
import { WeekdayDistributionChart } from "./_components/weekday-distribution-chart";
import { PeakHoursChart } from "./_components/peak-hours-chart";
import { BarChart3, TrendingUp } from "lucide-react";
import type { AnalyticsFilters, AnalyticsData } from "@/types/analytics";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(() => {
    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    const startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split("T")[0];
    return { startDate, endDate };
  });

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await AnalyticsService.getAllAnalytics(filters);
      
      if (result.success && result.data) {
        setAnalyticsData(result.data);
      } else {
        toast.error("Erro ao carregar analytics");
      }
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const handleFilterChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Insights e métricas do seu negócio
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Filtros */}
      <AnalyticsFiltersComponent onFilterChange={handleFilterChange} />

      {/* Métricas Principais */}
      {analyticsData && (
        <MetricsCards metrics={analyticsData.generalMetrics} isLoading={isLoading} />
      )}

      {/* Gráficos - Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procedimentos Mais Usados */}
        {analyticsData && (
          <TopServicesChart data={analyticsData.topServices} isLoading={isLoading} />
        )}

        {/* Profissionais Mais Solicitados */}
        {analyticsData && (
          <TopProfessionalsChart data={analyticsData.topProfessionals} isLoading={isLoading} />
        )}

        {/* Distribuição por Dia da Semana */}
        {analyticsData && (
          <WeekdayDistributionChart data={analyticsData.weekdayDistribution} isLoading={isLoading} />
        )}

        {/* Horários de Pico */}
        {analyticsData && (
          <PeakHoursChart data={analyticsData.peakHours} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
