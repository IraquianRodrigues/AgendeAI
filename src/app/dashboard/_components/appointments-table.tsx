"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import { formatTimeBR } from "@/lib/date-utils";
import { AppointmentDetailsModal } from "@/components/appointment-details-modal";
import { useProfessionals } from "@/services/professionals/use-professionals";
import {
  useMarkAppointmentAsCompleted,
  useMarkAppointmentAsNotCompleted,
} from "@/services/appointments/use-appointments";
import { toast } from "sonner";

interface AppointmentsTableProps {
  appointments: AppointmentWithRelations[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AppointmentsTable({
  appointments,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: AppointmentsTableProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] =
    useState<string>("all");

  const { data: professionals = [], isLoading: isLoadingProfessionals } =
    useProfessionals();

  const markAsCompletedMutation = useMarkAppointmentAsCompleted();
  const markAsNotCompletedMutation = useMarkAppointmentAsNotCompleted();

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (selectedProfessionalId !== "all") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.professional_code.toString() === selectedProfessionalId
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((appointment) =>
        appointment.customer_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [appointments, searchQuery, selectedProfessionalId]);

  if (isLoading) {
    return (
      <Card className="p-12 border shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Carregando agendamentos...</p>
        </div>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-12 border shadow-sm">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-muted-foreground">
            Nenhum agendamento encontrado para esta data
          </p>
          <p className="text-sm text-muted-foreground/70">
            Tente selecionar outra data ou verifique os filtros aplicados
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-6 space-y-6 bg-gradient-to-br from-white to-muted/20">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Agendamentos do Dia</h2>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie os atendimentos agendados
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 shadow-sm focus-visible:ring-2"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedProfessionalId}
                onValueChange={setSelectedProfessionalId}
                disabled={isLoadingProfessionals}
              >
                <SelectTrigger className="w-full sm:w-[250px] h-10 shadow-sm">
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem
                      key={professional.id}
                      value={professional.id.toString()}
                    >
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing || !onRefresh}
                title="Atualizar agendamentos"
                className="h-10 w-10 shadow-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Telefone
                </th>
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Horário Início
                </th>
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Horário Fim
                </th>
                <th className="text-left p-4 font-semibold text-sm text-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base">Nenhum agendamento encontrado</p>
                      <p className="text-sm text-muted-foreground/70">
                        Tente ajustar os filtros ou selecionar outra data
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment, index) => {
                  const isCompleted = appointment.completed_at !== null;
                  return (
                    <tr
                      key={appointment.id}
                      className={`border-b transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/2 group ${
                        isCompleted ? "bg-green-50/50" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold group-hover:text-primary transition-colors ${
                            isCompleted ? "text-green-700" : "text-foreground"
                          }`}>
                            {appointment.customer_name}
                          </span>
                          {isCompleted && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground font-mono">
                          {appointment.customer_phone}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="font-mono font-semibold">
                          {formatTimeBR(appointment.start_time)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="font-mono font-semibold">
                          {formatTimeBR(appointment.end_time)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {appointment.completed_at ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await markAsNotCompletedMutation.mutateAsync(
                                    appointment.id
                                  );
                                  toast.success("Agendamento desmarcado como concluído");
                                } catch (error: any) {
                                  const errorMessage = error?.message || "Erro ao desmarcar agendamento";
                                  toast.error(errorMessage, {
                                    duration: 5000,
                                  });
                                }
                              }}
                              disabled={markAsNotCompletedMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white transition-all shadow-sm hover:shadow-md"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Concluído
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await markAsCompletedMutation.mutateAsync(
                                    appointment.id
                                  );
                                  toast.success("Agendamento marcado como concluído");
                                } catch (error: any) {
                                  const errorMessage = error?.message || "Erro ao marcar agendamento como concluído";
                                  toast.error(errorMessage, {
                                    duration: 5000,
                                  });
                                }
                              }}
                              disabled={markAsCompletedMutation.isPending}
                              className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all shadow-sm hover:shadow-md"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Concluir
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment)}
                            className="hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md"
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdate={() => {
          setSelectedAppointment(null);
        }}
      />
    </>
  );
}
