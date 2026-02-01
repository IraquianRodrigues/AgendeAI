"use client";

import { Card } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import type { ProfessionalStats } from "@/types/analytics";

interface TopProfessionalsChartProps {
  data: ProfessionalStats[];
  isLoading?: boolean;
}

export function TopProfessionalsChart({ data, isLoading }: TopProfessionalsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-6 bg-muted rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/30 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Profissionais Mais Solicitados</h3>
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível
        </div>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(p => p.appointmentCount));

  return (
    <Card className="p-6 border-2 hover:border-lime-500/30 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></span>
        Profissionais Mais Solicitados
      </h3>

      <div className="space-y-4">
        {data.map((professional, index) => {
          const percentage = (professional.appointmentCount / maxCount) * 100;
          const isTop = index === 0;

          return (
            <div
              key={professional.professionalId}
              className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-lime-500/50 transition-all duration-300 hover:shadow-md"
            >
              {/* Background gradient */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-lime-500/10 to-emerald-500/10 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />

              <div className="relative p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Ranking badge */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${isTop 
                        ? 'bg-gradient-to-br from-lime-500 to-emerald-600 text-white' 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {index + 1}
                    </div>

                    {/* Nome */}
                    <div>
                      <p className="font-semibold text-base">{professional.professionalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {professional.appointmentCount} agendamentos
                      </p>
                    </div>
                  </div>

                  {/* Receita */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(professional.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {professional.percentage.toFixed(1)}% do total
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-lime-500 to-emerald-600 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Total de profissionais</span>
          </div>
          <span className="font-semibold">{data.length}</span>
        </div>
      </div>
    </Card>
  );
}
