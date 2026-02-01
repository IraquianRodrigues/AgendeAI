"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ServiceStats } from "@/types/analytics";

interface TopServicesChartProps {
  data: ServiceStats[];
  isLoading?: boolean;
}

export function TopServicesChart({ data, isLoading }: TopServicesChartProps) {
  // Cores vibrantes para cada barra
  const colors = [
    "#84cc16", // lime-500
    "#22c55e", // green-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
  ];

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
        <h3 className="text-lg font-semibold mb-6">Procedimentos Mais Usados</h3>
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 hover:border-lime-500/30 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-lime-500 to-emerald-600 rounded-full"></span>
        Procedimentos Mais Usados
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis type="number" stroke="#6b7280" fontSize={12} />
          <YAxis 
            dataKey="serviceName" 
            type="category" 
            width={150}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number | undefined, name: string | undefined) => {
              if (name === "count") return [value ?? 0, "Agendamentos"];
              return [value ?? 0, name ?? ""];
            }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda com percentuais */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        {data.map((service, index) => (
          <div key={service.serviceId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-muted-foreground">{service.serviceName}</span>
            </div>
            <span className="font-medium">{service.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
