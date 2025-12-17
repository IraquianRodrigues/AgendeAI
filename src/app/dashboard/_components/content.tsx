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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              {formatDateFullBR(selectedDate)}
            </p>
          </div>
          <DatePickerButton
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Cards de Estatísticas */}
        {!isLoading && !error && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-primary/5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total de Agendamentos
                  </p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">
                    para esta data
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-green-50">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Concluídos
                  </p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">
                    agendamentos realizados
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-orange-50">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pendentes
                  </p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">
                    aguardando conclusão
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {error ? (
          <Card className="p-12 border shadow-sm">
            <div className="text-center space-y-2">
              <p className="text-destructive font-medium">
                Erro ao carregar agendamentos
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          </Card>
        ) : (
          <AppointmentsTable
            appointments={appointments}
            isLoading={isLoading}
            onRefresh={refetchAppointments}
            isRefreshing={isFetchingAppointments}
          />
        )}
      </div>
    </div>
  );
}
