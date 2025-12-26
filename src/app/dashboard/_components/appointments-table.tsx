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
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-8 space-y-6 border-b border-gray-50">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Agendamentos do Dia</h2>
            <p className="text-sm text-gray-400 font-medium">
              Visualize e gerencie os atendimentos agendados
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
              <Input
                placeholder="Buscar por nome do cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-gray-50/50 border-gray-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-gray-900/5 transition-all rounded-2xl font-medium text-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedProfessionalId}
                onValueChange={setSelectedProfessionalId}
                disabled={isLoadingProfessionals}
              >
                <SelectTrigger className="w-full sm:w-[250px] h-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-900/5 transition-all rounded-2xl font-medium text-gray-700">
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
                className="h-10 w-10 border-gray-200 hover:bg-gray-50 text-gray-500"
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
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="text-left p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Horário Início
                </th>
                <th className="text-left p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Horário Fim
                </th>
                <th className="text-left p-4 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-medium">Nenhum agendamento encontrado</p>
                      <p className="text-sm text-gray-400">
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
                      className={`group transition-colors hover:bg-gray-50/50 ${isCompleted ? "bg-green-50/30" : ""
                        }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium transition-colors ${isCompleted ? "text-green-700" : "text-gray-900 group-hover:text-blue-600"
                            }`}>
                            {appointment.customer_name}
                          </span>
                          {isCompleted && (
                            <Badge variant="outline" className="bg-green-100/50 text-green-700 border-green-200 text-[10px] px-1.5 py-0 h-5">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-500 font-mono">
                          {appointment.customer_phone}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 font-mono font-medium">
                          {formatTimeBR(appointment.start_time)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 font-mono font-medium">
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
                              className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs shadow-none border border-transparent"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
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
                              className="h-8 px-3 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                              Concluir
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment)}
                            className="h-8 px-3 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50"
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
      </div>

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
