"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Loader2 } from "lucide-react";
import type { ProfessionalRow } from "@/types/database.types";
import type { CreateProfessionalScheduleDto } from "@/types/professional-schedule.types";
import { DAYS_OF_WEEK } from "@/types/professional-schedule.types";
import {
  useProfessionalSchedules,
  useCreateBulkProfessionalSchedules,
  useDeleteProfessionalSchedule,
} from "@/services/professional-schedules/use-professional-schedules";
import { toast } from "sonner";

interface ProfessionalScheduleModalProps {
  professional: ProfessionalRow | null;
  onClose: () => void;
}

interface DaySchedule {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

type WeekSchedule = {
  [key: number]: DaySchedule;
};

export function ProfessionalScheduleModal({
  professional,
  onClose,
}: ProfessionalScheduleModalProps) {
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({
    0: { enabled: false, start_time: "09:00", end_time: "18:00" },
    1: { enabled: false, start_time: "09:00", end_time: "18:00" },
    2: { enabled: false, start_time: "09:00", end_time: "18:00" },
    3: { enabled: false, start_time: "09:00", end_time: "18:00" },
    4: { enabled: false, start_time: "09:00", end_time: "18:00" },
    5: { enabled: false, start_time: "09:00", end_time: "18:00" },
    6: { enabled: false, start_time: "09:00", end_time: "18:00" },
  });

  const { data: existingSchedules, isLoading } = useProfessionalSchedules(
    professional?.id || 0
  );
  const createBulkMutation = useCreateBulkProfessionalSchedules();
  const deleteMutation = useDeleteProfessionalSchedule();

  // Carregar horários existentes quando o modal abrir
  useEffect(() => {
    if (existingSchedules && existingSchedules.length > 0) {
      const newSchedule: WeekSchedule = {
        0: { enabled: false, start_time: "09:00", end_time: "18:00" },
        1: { enabled: false, start_time: "09:00", end_time: "18:00" },
        2: { enabled: false, start_time: "09:00", end_time: "18:00" },
        3: { enabled: false, start_time: "09:00", end_time: "18:00" },
        4: { enabled: false, start_time: "09:00", end_time: "18:00" },
        5: { enabled: false, start_time: "09:00", end_time: "18:00" },
        6: { enabled: false, start_time: "09:00", end_time: "18:00" },
      };

      // Agrupar por dia (pegar o primeiro horário de cada dia)
      existingSchedules.forEach((schedule) => {
        if (!newSchedule[schedule.day_of_week].enabled) {
          newSchedule[schedule.day_of_week] = {
            enabled: true,
            start_time: schedule.start_time.substring(0, 5),
            end_time: schedule.end_time.substring(0, 5),
          };
        }
      });

      setWeekSchedule(newSchedule);
    }
  }, [existingSchedules]);

  const handleToggleDay = (day: number) => {
    setWeekSchedule({
      ...weekSchedule,
      [day]: {
        ...weekSchedule[day],
        enabled: !weekSchedule[day].enabled,
      },
    });
  };

  const handleTimeChange = (
    day: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setWeekSchedule({
      ...weekSchedule,
      [day]: {
        ...weekSchedule[day],
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!professional) return;

    try {
      // Deletar todos os horários existentes
      if (existingSchedules && existingSchedules.length > 0) {
        await Promise.all(
          existingSchedules.map((s) => deleteMutation.mutateAsync(s.id))
        );
      }

      // Criar novos horários apenas para dias habilitados
      const schedulesToCreate: CreateProfessionalScheduleDto[] = [];
      
      Object.entries(weekSchedule).forEach(([day, schedule]) => {
        if (schedule.enabled) {
          // Validação
          if (schedule.start_time >= schedule.end_time) {
            throw new Error(
              `Horário inválido para ${DAYS_OF_WEEK[parseInt(day) as keyof typeof DAYS_OF_WEEK]}: início deve ser menor que fim`
            );
          }

          schedulesToCreate.push({
            professional_id: professional.id,
            day_of_week: parseInt(day),
            start_time: `${schedule.start_time}:00`,
            end_time: `${schedule.end_time}:00`,
          });
        }
      });

      if (schedulesToCreate.length > 0) {
        await createBulkMutation.mutateAsync(schedulesToCreate);
      }

      toast.success("Agenda salva com sucesso!");
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar agenda");
    }
  };

  const isOpen = !!professional;
  const isSaving = createBulkMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-5 w-5 text-foreground" />
            Agenda de {professional?.name}
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure os dias e horários em que este profissional trabalha
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-6">
            <div className="space-y-3 py-4 pr-2">
            {/* Lista de dias da semana */}
            {Object.entries(DAYS_OF_WEEK).map(([dayKey, dayName]) => {
              const day = parseInt(dayKey);
              const schedule = weekSchedule[day];

              return (
                <div
                  key={day}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border bg-card"
                >
                  {/* Toggle e nome do dia */}
                  <div className="flex items-center gap-3 sm:min-w-[140px]">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={() => handleToggleDay(day)}
                      className="data-[state=checked]:bg-primary"
                    />
                    <Label
                      htmlFor={`day-${day}`}
                      className={`text-sm font-medium cursor-pointer ${
                        schedule.enabled
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {dayName}
                    </Label>
                  </div>

                  {/* Horários */}
                  {schedule.enabled ? (
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className="space-y-1 flex-1">
                        <Label
                          htmlFor={`start-${day}`}
                          className="text-xs text-muted-foreground"
                        >
                          Início
                        </Label>
                        <Input
                          id={`start-${day}`}
                          type="time"
                          value={schedule.start_time}
                          onChange={(e) =>
                            handleTimeChange(day, "start_time", e.target.value)
                          }
                          className="h-10 w-full sm:w-[100px]"
                        />
                      </div>

                      <div className="space-y-1 flex-1">
                        <Label
                          htmlFor={`end-${day}`}
                          className="text-xs text-muted-foreground"
                        >
                          Fim
                        </Label>
                        <Input
                          id={`end-${day}`}
                          type="time"
                          value={schedule.end_time}
                          onChange={(e) =>
                            handleTimeChange(day, "end_time", e.target.value)
                          }
                          className="h-10 w-full sm:w-[100px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-sm text-muted-foreground">
                      Não trabalha
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 px-5 sm:px-6 py-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="min-w-[100px] w-full sm:w-auto order-2 sm:order-1"
          >
            Fechar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[140px] w-full sm:w-auto order-1 sm:order-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Agenda"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
