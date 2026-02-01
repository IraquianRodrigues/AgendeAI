"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { HourStats } from "@/types/analytics";

interface PeakHoursChartProps {
  data: HourStats[];
  isLoading?: boolean;
}

export function PeakHoursChart({ data, isLoading }: PeakHoursChartProps) {
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
        <h3 className="text-lg font-semibold mb-6">Horários de Pico</h3>
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível
        </div>
      </Card>
    );
  }

  // Ordenar por hora
  const sortedData = [...data].sort((a, b) => a.hour - b.hour);
  const maxCount = Math.max(...sortedData.map(d => d.count));
  const peakHour = sortedData.find(d => d.count === maxCount);

  return (
    <Card className="p-6 border-2 hover:border-lime-500/30 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></span>
        Horários de Pico
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis 
            dataKey="hourLabel" 
            stroke="#6b7280"
            fontSize={11}
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
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#f97316" 
            strokeWidth={3}
            fill="url(#colorCount)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <p className="text-sm text-orange-900 dark:text-orange-100">
          <span className="font-semibold">Horário de pico:</span> {peakHour?.hourLabel} com {peakHour?.count} agendamentos
        </p>
      </div>
    </Card>
  );
}
