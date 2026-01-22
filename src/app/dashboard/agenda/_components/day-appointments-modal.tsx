"use client";

import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppointmentWithRelations } from "@/types/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Tag, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AppointmentDetailsModal } from "@/components/appointment-details-modal";
import { useAppointments } from "@/services/appointments/use-appointments";

interface DayAppointmentsModalProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  onClose: () => void;
}

export function DayAppointmentsModal({
  date,
  appointments,
  onClose,
}: DayAppointmentsModalProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const { refetch } = useAppointments({ date });

  // Filter appointments for the selected date and sort by time
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((apt) => isSameDay(new Date(apt.start_time), date))
      .sort((a, b) => {
        const timeA = new Date(a.start_time).getTime();
        const timeB = new Date(b.start_time).getTime();
        return timeA - timeB;
      });
  }, [appointments, date]);

  const formattedDate = format(date, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const handleAppointmentClick = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseAppointmentDetails = () => {
    setSelectedAppointment(null);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-3">
              <div className="bg-foreground rounded-xl p-2 flex items-center justify-center shadow-lg">
                <Calendar className="h-5 w-5 text-background" />
              </div>
              <span className="capitalize">{formattedDate}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {dayAppointments.length === 0
                ? "Nenhum agendamento para este dia"
                : `${dayAppointments.length} agendamento${dayAppointments.length > 1 ? "s" : ""} neste dia`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 pb-4 sm:pb-6">
            {dayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Nenhum agendamento
                </p>
                <p className="text-sm text-muted-foreground">
                  Este dia está livre
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted text-foreground px-3 py-1.5 rounded-lg text-sm font-bold font-mono">
                            <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                            {format(new Date(appointment.start_time), "HH:mm")} - {format(new Date(appointment.end_time), "HH:mm")}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground border-border"
                        >
                          #{appointment.id}
                        </Badge>
                      </div>

                      {/* Main Info */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-foreground text-base">
                          {appointment.customer_name}
                        </h4>
                        
                        {appointment.service && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Tag className="w-4 h-4" />
                            <span>{appointment.service.code}</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Professional Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>
                          {appointment.professional
                            ? appointment.professional.name
                            : "Sem profissional"}
                        </span>
                      </div>

                      {/* Status Badge */}
                      {appointment.status && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {appointment.status === "pending" && "Agendado"}
                          {appointment.status === "confirmed" && "Confirmado"}
                          {appointment.status === "in_progress" && "Em Atendimento"}
                          {appointment.status === "completed" && "Finalizado"}
                          {appointment.status === "canceled" && "Cancelado"}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={handleCloseAppointmentDetails}
          onUpdate={() => {
            refetch();
            handleCloseAppointmentDetails();
          }}
        />
      )}
    </>
  );
}
