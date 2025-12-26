"use client";

import { useProfessionals } from "@/services/professionals/use-professionals";
import { Card } from "@/components/ui/card";
import { ProfessionalsTable } from "./professionals-table";

export default function ProfessionalsContent() {
  const { data: professionals = [], isLoading, error } = useProfessionals();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6 lg:p-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Profissionais
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Gerencie e organize a equipe de profissionais da clínica
          </p>
        </div>

        {error ? (
          <Card className="p-12 border border-gray-100 shadow-sm rounded-2xl bg-white">
            <div className="text-center space-y-3">
              <p className="text-red-600 font-medium">
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
