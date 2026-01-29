"use client";

import { useProfessionals } from "@/services/professionals/use-professionals";
import { Card } from "@/components/ui/card";
import { ProfessionalsTable } from "./professionals-table";
import { Users, Award, UserCheck, Sparkles } from "lucide-react";
import { useMemo } from "react";

export default function ProfessionalsContent() {
  const { data: professionals = [], isLoading, error } = useProfessionals();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProfessionals = professionals.length;
    const specialties = professionals.reduce((acc, p) => {
      const specialty = p.specialty || "Geral";
      acc[specialty] = (acc[specialty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonSpecialty = Object.entries(specialties).sort((a, b) => b[1] - a[1])[0];
    const uniqueSpecialties = Object.keys(specialties).length;

    return {
      totalProfessionals,
      mostCommonSpecialty: mostCommonSpecialty ? mostCommonSpecialty[0] : "N/A",
      mostCommonCount: mostCommonSpecialty ? mostCommonSpecialty[1] : 0,
      uniqueSpecialties,
    };
  }, [professionals]);

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-6 lg:p-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors">
            Profissionais
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1 transition-colors">
            Gerencie e organize a equipe de profissionais da empresa
          </p>
        </div>

        {/* Statistics Dashboard */}
        {!isLoading && !error && professionals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Professionals */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Total de Profissionais
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.totalProfessionals}
                  </p>
                </div>
              </div>
            </Card>

            {/* Unique Specialties */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Especialidades
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.uniqueSpecialties}
                  </p>
                </div>
              </div>
            </Card>

            {/* Most Common Specialty */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted flex-shrink-0">
                  <Award className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Mais Comum
                  </p>
                  <p className="text-base sm:text-lg font-bold text-foreground mt-1 break-words">
                    {stats.mostCommonSpecialty}
                  </p>
                </div>
              </div>
            </Card>

            {/* Active Count */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <UserCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Ativos
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.totalProfessionals}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {error ? (
          <Card className="p-12 border border-border shadow-sm rounded-2xl bg-card transition-colors">
            <div className="text-center space-y-3">
              <p className="text-red-600 dark:text-red-400 font-medium">
                Erro ao carregar profissionais. Por favor, tente novamente.
              </p>
            </div>
          </Card>
        ) : (
          <ProfessionalsTable
            professionals={professionals}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
