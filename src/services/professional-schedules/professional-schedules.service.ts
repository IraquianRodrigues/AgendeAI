import { createClient } from "@/lib/supabase/client";
import type {
  ProfessionalSchedule,
  CreateProfessionalScheduleDto,
  UpdateProfessionalScheduleDto,
} from "@/types/professional-schedule.types";

const supabase = createClient();

export class ProfessionalSchedulesService {
  // Buscar todos os horários de um profissional
  static async getByProfessionalId(
    professionalId: number
  ): Promise<ProfessionalSchedule[]> {
    const { data, error } = await supabase
      .from("professional_schedules")
      .select("*")
      .eq("professional_id", professionalId)
      .eq("is_active", true)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Criar novo horário
  static async create(
    dto: CreateProfessionalScheduleDto
  ): Promise<ProfessionalSchedule> {
    const { data, error } = await supabase
      .from("professional_schedules")
      .insert(dto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Atualizar horário
  static async update(
    id: number,
    dto: UpdateProfessionalScheduleDto
  ): Promise<ProfessionalSchedule> {
    const { data, error } = await supabase
      .from("professional_schedules")
      .update(dto)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Deletar horário
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from("professional_schedules")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Deletar todos os horários de um profissional
  static async deleteAllByProfessional(professionalId: number): Promise<void> {
    const { error } = await supabase
      .from("professional_schedules")
      .delete()
      .eq("professional_id", professionalId);

    if (error) throw error;
  }

  // Criar múltiplos horários de uma vez
  static async createBulk(
    schedules: CreateProfessionalScheduleDto[]
  ): Promise<ProfessionalSchedule[]> {
    const { data, error } = await supabase
      .from("professional_schedules")
      .insert(schedules)
      .select();

    if (error) throw error;
    return data || [];
  }

  // Buscar todos os horários de um dia específico (todos os profissionais)
  static async getByDay(dayOfWeek: number): Promise<ProfessionalSchedule[]> {
    const { data, error } = await supabase
      .from("professional_schedules")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Buscar horário de um profissional específico em um dia
  static async getByProfessionalAndDay(
    professionalId: number,
    dayOfWeek: number
  ): Promise<ProfessionalSchedule | null> {
    const { data, error } = await supabase
      .from("professional_schedules")
      .select("*")
      .eq("professional_id", professionalId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
