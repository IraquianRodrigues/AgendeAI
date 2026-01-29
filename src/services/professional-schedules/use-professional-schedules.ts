import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfessionalSchedulesService } from "./professional-schedules.service";
import type {
  CreateProfessionalScheduleDto,
  UpdateProfessionalScheduleDto,
} from "@/types/professional-schedule.types";

const QUERY_KEY = "professional-schedules";

export function useProfessionalSchedules(professionalId: number) {
  return useQuery({
    queryKey: [QUERY_KEY, professionalId],
    queryFn: () => ProfessionalSchedulesService.getByProfessionalId(professionalId),
    enabled: !!professionalId,
  });
}

export function useCreateProfessionalSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProfessionalScheduleDto) =>
      ProfessionalSchedulesService.create(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.professional_id],
      });
    },
  });
}

export function useUpdateProfessionalSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProfessionalScheduleDto }) =>
      ProfessionalSchedulesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteProfessionalSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ProfessionalSchedulesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useCreateBulkProfessionalSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedules: CreateProfessionalScheduleDto[]) =>
      ProfessionalSchedulesService.createBulk(schedules),
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, variables[0].professional_id],
        });
      }
    },
  });
}
