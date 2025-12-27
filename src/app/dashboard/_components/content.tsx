"use client";

import { useState, useMemo } from "react";
import { formatDateFullBR } from "@/lib/date-utils";
import { AppointmentsTable } from "./appointments-table";
import { DatePickerButton } from "./date-picker-button";
import { useAppointments } from "@/services/appointments/use-appointments";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
// import { AppointmentsKanban } from "./appointments-kanban";

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
    const completed = appointments.filter(apt => apt.completed_at !== null).length;
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
            {/* Total Card */}
            <div className="p-6 bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
                  <Calendar className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Total
                  </p>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed Card */}
            <div className="p-6 bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-green-50 text-green-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Concluídos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Card */}
            <div className="p-6 bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-orange-50 text-orange-600">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Pendentes
                  </p>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col gap-6">
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
    </div>
  );
}
