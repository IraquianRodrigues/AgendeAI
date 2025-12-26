"use client";

import { useState, useMemo } from "react";
import { formatDateFullBR } from "@/lib/date-utils";
import { AppointmentsTable } from "./appointments-table";
import { DatePickerButton } from "./date-picker-button";
import { useAppointments } from "@/services/appointments/use-appointments";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";

export default function DashboardContent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    data: appointments = [],
    isLoading,
    error,
    refetch: refetchAppointments,
    isFetching: isFetchingAppointments,
  } = useAppointments({
    date: selectedDate,
  });

  const stats = useMemo(() => {
    const total = appointments.length;

    // Contar agendamentos concluídos (marcados manualmente)
    const completed = appointments.filter(apt => apt.completed_at !== null).length;

    // Contar agendamentos pendentes (não concluídos)
    const pending = appointments.filter(apt => apt.completed_at === null).length;

    return { total, completed, pending };
  }, [appointments]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Visão geral de {formatDateFullBR(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <DatePickerButton
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        {/* Cards de Estatísticas */}
        {!isLoading && !error && (
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-colors">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-gray-900 leading-none mb-1">
                      {stats.total}
                    </p>
                    <p className="text-sm font-medium text-gray-400">
                      Total de Agendamentos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 transition-colors">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-gray-900 leading-none mb-1">
                      {stats.completed}
                    </p>
                    <p className="text-sm font-medium text-gray-400">
                      Concluídos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 transition-colors">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-gray-900 leading-none mb-1">
                      {stats.pending}
                    </p>
                    <p className="text-sm font-medium text-gray-400">
                      Pendentes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error ? (
          <Card className="p-12 border border-gray-100 shadow-sm rounded-2xl bg-white">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">
                Erro ao carregar agendamentos
              </p>
              <p className="text-sm text-gray-500">
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
            <AppointmentsTable
              appointments={appointments}
              isLoading={isLoading}
              onRefresh={refetchAppointments}
              isRefreshing={isFetchingAppointments}
            />
          </div>
        )}
      </div>
    </div>
  );
}
