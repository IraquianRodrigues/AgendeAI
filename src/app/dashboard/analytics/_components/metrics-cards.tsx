"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Percent, Users } from "lucide-react";
import type { GeneralMetrics } from "@/types/analytics";

interface MetricsCardsProps {
  metrics: GeneralMetrics;
  isLoading?: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const cards = [
    {
      title: "Total de Agendamentos",
      value: metrics.totalAppointments.toString(),
      icon: Calendar,
      color: "from-lime-500 to-emerald-600",
      bgColor: "bg-lime-50 dark:bg-lime-950/20",
      iconColor: "text-lime-600 dark:text-lime-400",
    },
    {
      title: "Taxa de Ocupação",
      value: `${metrics.occupancyRate.toFixed(1)}%`,
      icon: Percent,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Receita Total",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(metrics.averageTicket),
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="group relative overflow-hidden border-2 hover:border-lime-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/10 hover:-translate-y-1"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative p-6">
              {/* Icon */}
              <div className={`${card.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>

              {/* Title */}
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {card.title}
              </p>

              {/* Value */}
              <p className="text-3xl font-bold tracking-tight">
                {card.value}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
