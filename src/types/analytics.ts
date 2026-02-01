// Types for Analytics Module

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  professionalId?: number;
}

export interface GeneralMetrics {
  totalAppointments: number;
  occupancyRate: number;
  totalRevenue: number;
  averageTicket: number;
}

export interface ServiceStats {
  serviceId: number;
  serviceName: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface ProfessionalStats {
  professionalId: number;
  professionalName: string;
  appointmentCount: number;
  revenue: number;
  percentage: number;
}

export interface WeekdayStats {
  dayOfWeek: number; // 0-6 (Dom-Sáb)
  dayName: string;
  count: number;
  percentage: number;
}

export interface HourStats {
  hour: number; // 0-23
  hourLabel: string; // "08:00", "09:00", etc
  count: number;
}

export interface MonthlyTrend {
  month: string; // "2026-01"
  monthLabel: string; // "Jan 2026"
  appointmentCount: number;
  revenue: number;
}

export interface ServiceRevenue {
  serviceId: number;
  serviceName: string;
  revenue: number;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  generalMetrics: GeneralMetrics;
  topServices: ServiceStats[];
  topProfessionals: ProfessionalStats[];
  weekdayDistribution: WeekdayStats[];
  peakHours: HourStats[];
  monthlyTrends: MonthlyTrend[];
  revenueByService: ServiceRevenue[];
}
