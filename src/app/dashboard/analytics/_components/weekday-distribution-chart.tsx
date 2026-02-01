"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { WeekdayStats } from "@/types/analytics";

interface WeekdayDistributionChartProps {
  data: WeekdayStats[];
  isLoading?: boolean;
}

export function WeekdayDistributionChart({ data, isLoading }: WeekdayDistributionChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-6 bg-muted rounded w-1/3 mb-6"></div>
        <div className="h-80 bg-muted/30 rounded animate-pulse"></div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Distribuição por Dia da Semana</h3>
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível
        </div>
      </Card>
    );
  }

  // Ordenar por dia da semana (Segunda a Domingo)
  const sortedData = [...data].sort((a, b) => {
    // Reordenar: Segunda (1) até Domingo (0)
    const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return orderA - orderB;
  });

  // Encontrar o dia com mais agendamentos
  const maxCount = Math.max(...sortedData.map(d => d.count));

  return (
    <Card className="p-6 border-2 hover:border-lime-500/30 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></span>
        Distribuição por Dia da Semana
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis 
            dataKey="dayName" 
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number | undefined) => [value ?? 0, "Agendamentos"]}
          />
          <Bar 
            dataKey="count" 
            fill="#84cc16"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-4 p-4 bg-lime-50 dark:bg-lime-950/20 rounded-lg border border-lime-200 dark:border-lime-800">
        <p className="text-sm text-lime-900 dark:text-lime-100">
          <span className="font-semibold">
            {sortedData.find(d => d.count === maxCount)?.dayName}
          </span>
          {" "}é o dia com mais movimento ({maxCount} agendamentos)
        </p>
      </div>
    </Card>
  );
}
