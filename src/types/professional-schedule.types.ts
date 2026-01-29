export interface ProfessionalSchedule {
  id: number;
  professional_id: number;
  day_of_week: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  start_time: string; // Formato: "HH:MM:SS"
  end_time: string; // Formato: "HH:MM:SS"
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProfessionalScheduleDto {
  professional_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface UpdateProfessionalScheduleDto {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface ProfessionalSchedulesByDay {
  [dayOfWeek: number]: ProfessionalSchedule[];
}

// Helper para converter dias da semana
export const DAYS_OF_WEEK = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
} as const;

export const DAYS_OF_WEEK_SHORT = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
} as const;
