"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import type { AnalyticsFilters } from "@/types/analytics";

interface AnalyticsFiltersProps {
  onFilterChange: (filters: AnalyticsFilters) => void;
}

export function AnalyticsFiltersComponent({ onFilterChange }: AnalyticsFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");

  const getPeriodDates = (period: string): { startDate: string; endDate: string } => {
    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    let startDate: string;

    switch (period) {
      case "7days":
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split("T")[0];
        break;
      case "30days":
        startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split("T")[0];
        break;
      case "3months":
        startDate = new Date(now.setMonth(now.getMonth() - 3)).toISOString().split("T")[0];
        break;
      case "6months":
        startDate = new Date(now.setMonth(now.getMonth() - 6)).toISOString().split("T")[0];
        break;
      case "1year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split("T")[0];
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split("T")[0];
    }

    return { startDate, endDate };
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const dates = getPeriodDates(period);
    onFilterChange(dates);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card border-2 border-border rounded-lg">
      <Calendar className="h-5 w-5 text-muted-foreground" />
      
      <div className="flex-1">
        <Label htmlFor="period" className="text-sm font-medium mb-2 block">
          Período
        </Label>
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger id="period" className="w-full md:w-64">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="3months">Últimos 3 meses</SelectItem>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
            <SelectItem value="1year">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
