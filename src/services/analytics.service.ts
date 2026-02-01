import { createClient } from "@/lib/supabase/client";
import type {
  AnalyticsFilters,
  AnalyticsData,
  GeneralMetrics,
  ServiceStats,
  ProfessionalStats,
  WeekdayStats,
  HourStats,
  MonthlyTrend,
  ServiceRevenue,
} from "@/types/analytics";

const supabase = createClient();

export class AnalyticsService {
  // ==================== MÉTRICAS GERAIS ====================
  
  static async getGeneralMetrics(filters: AnalyticsFilters): Promise<{ success: boolean; data?: GeneralMetrics; error?: string }> {
    try {
      const { startDate, endDate, professionalId } = filters;

      // Query para agendamentos no período
      let appointmentsQuery = supabase
        .from("appointments")
        .select(`
          id,
          start_time,
          service_code,
          services (
            id,
            price
          )
        `)
        .gte("start_time", `${startDate}T00:00:00`)
        .lte("start_time", `${endDate}T23:59:59`);

      if (professionalId) {
        appointmentsQuery = appointmentsQuery.eq("professional_code", professionalId);
      }

      const { data: appointments, error } = await appointmentsQuery;

      if (error) throw error;

      const totalAppointments = appointments?.length || 0;
      
      // Calcular receita total
      const totalRevenue = appointments?.reduce((sum, apt: any) => {
        const price = apt.services?.price || 0;
        return sum + parseFloat(price.toString());
      }, 0) || 0;

      // Ticket médio
      const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

      // Taxa de ocupação (simplificada - pode ser melhorada)
      // Assumindo 10 horas de trabalho por dia, 6 dias por semana
      const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const workDays = Math.ceil(daysDiff * (6/7)); // Aproximação de dias úteis
      const availableSlots = workDays * 10; // 10 slots por dia
      const occupancyRate = availableSlots > 0 ? (totalAppointments / availableSlots) * 100 : 0;

      return {
        success: true,
        data: {
          totalAppointments,
          occupancyRate: Math.min(occupancyRate, 100), // Cap at 100%
          totalRevenue,
          averageTicket,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== PROCEDIMENTOS MAIS USADOS ====================
  
  static async getTopServices(filters: AnalyticsFilters): Promise<{ success: boolean; data?: ServiceStats[]; error?: string }> {
    try {
      const { startDate, endDate, professionalId } = filters;

      let query = supabase
        .from("appointments")
        .select(`
          service_code,
          services (
            id,
            name,
            price
          )
        `)
        .gte("start_time", `${startDate}T00:00:00`)
        .lte("start_time", `${endDate}T23:59:59`);

      if (professionalId) {
        query = query.eq("professional_code", professionalId);
      }

      const { data: appointments, error } = await query;

      if (error) throw error;

      // Agrupar por serviço
      const serviceMap = new Map<number, { name: string; count: number; revenue: number }>();
      
      appointments?.forEach((apt: any) => {
        const serviceId = apt.service_code;
        const serviceName = apt.services?.name || "Desconhecido";
        const price = parseFloat(apt.services?.price || 0);

        if (serviceMap.has(serviceId)) {
          const existing = serviceMap.get(serviceId)!;
          existing.count++;
          existing.revenue += price;
        } else {
          serviceMap.set(serviceId, { name: serviceName, count: 1, revenue: price });
        }
      });

      // Converter para array e ordenar
      const totalAppointments = appointments?.length || 1;
      const services: ServiceStats[] = Array.from(serviceMap.entries())
        .map(([id, data]) => ({
          serviceId: id,
          serviceName: data.name,
          count: data.count,
          revenue: data.revenue,
          percentage: (data.count / totalAppointments) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5

      return { success: true, data: services };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== PROFISSIONAIS MAIS SOLICITADOS ====================
  
  static async getTopProfessionals(filters: AnalyticsFilters): Promise<{ success: boolean; data?: ProfessionalStats[]; error?: string }> {
    try {
      const { startDate, endDate } = filters;

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(`
          professional_code,
          professionals (
            id,
            name
          ),
          services (
            price
          )
        `)
        .gte("start_time", `${startDate}T00:00:00`)
        .lte("start_time", `${endDate}T23:59:59`);

      if (error) throw error;

      // Agrupar por profissional
      const professionalMap = new Map<number, { name: string; count: number; revenue: number }>();
      
      appointments?.forEach((apt: any) => {
        const profId = apt.professional_code;
        const profName = apt.professionals?.name || "Desconhecido";
        const price = parseFloat(apt.services?.price || 0);

        if (professionalMap.has(profId)) {
          const existing = professionalMap.get(profId)!;
          existing.count++;
          existing.revenue += price;
        } else {
          professionalMap.set(profId, { name: profName, count: 1, revenue: price });
        }
      });

      const totalAppointments = appointments?.length || 1;
      const professionals: ProfessionalStats[] = Array.from(professionalMap.entries())
        .map(([id, data]) => ({
          professionalId: id,
          professionalName: data.name,
          appointmentCount: data.count,
          revenue: data.revenue,
          percentage: (data.count / totalAppointments) * 100,
        }))
        .sort((a, b) => b.appointmentCount - a.appointmentCount);

      return { success: true, data: professionals };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== DISTRIBUIÇÃO POR DIA DA SEMANA ====================
  
  static async getWeekdayDistribution(filters: AnalyticsFilters): Promise<{ success: boolean; data?: WeekdayStats[]; error?: string }> {
    try {
      const { startDate, endDate, professionalId } = filters;

      let query = supabase
        .from("appointments")
        .select("start_time")
        .gte("start_time", `${startDate}T00:00:00`)
        .lte("start_time", `${endDate}T23:59:59`);

      if (professionalId) {
        query = query.eq("professional_code", professionalId);
      }

      const { data: appointments, error } = await query;

      if (error) throw error;

      const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const dayCounts = new Array(7).fill(0);

      appointments?.forEach((apt: any) => {
        const date = new Date(apt.start_time);
        const dayOfWeek = date.getDay();
        dayCounts[dayOfWeek]++;
      });

      const totalAppointments = appointments?.length || 1;
      const weekdayStats: WeekdayStats[] = dayCounts.map((count, index) => ({
        dayOfWeek: index,
        dayName: dayNames[index],
        count,
        percentage: (count / totalAppointments) * 100,
      }));

      return { success: true, data: weekdayStats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== HORÁRIOS DE PICO ====================
  
  static async getPeakHours(filters: AnalyticsFilters): Promise<{ success: boolean; data?: HourStats[]; error?: string }> {
    try {
      const { startDate, endDate, professionalId } = filters;

      let query = supabase
        .from("appointments")
        .select("start_time")
        .gte("start_time", `${startDate}T00:00:00`)
        .lte("start_time", `${endDate}T23:59:59`);

      if (professionalId) {
        query = query.eq("professional_code", professionalId);
      }

      const { data: appointments, error } = await query;

      if (error) throw error;

      const hourCounts = new Array(24).fill(0);

      appointments?.forEach((apt: any) => {
        const date = new Date(apt.start_time);
        const hour = date.getHours();
        hourCounts[hour]++;
      });

      const peakHours: HourStats[] = hourCounts
        .map((count, hour) => ({
          hour,
          hourLabel: `${hour.toString().padStart(2, "0")}:00`,
          count,
        }))
        .filter((stat) => stat.count > 0); // Apenas horários com agendamentos

      return { success: true, data: peakHours };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== TENDÊNCIAS MENSAIS ====================
  
  static async getMonthlyTrends(filters: AnalyticsFilters): Promise<{ success: boolean; data?: MonthlyTrend[]; error?: string }> {
    try {
      const { startDate, endDate, professionalId } = filters;

      let query = supabase
        .from("appointments")
        .select(`
          start_time,
          services (
            price
          )
        `)
        .gte("start_time", `${startDate}T00:00:00`)
        .lte("start_time", `${endDate}T23:59:59`);

      if (professionalId) {
        query = query.eq("professional_code", professionalId);
      }

      const { data: appointments, error } = await query;

      if (error) throw error;

      const monthMap = new Map<string, { count: number; revenue: number }>();

      appointments?.forEach((apt: any) => {
        const date = new Date(apt.start_time);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        const price = parseFloat(apt.services?.price || 0);

        if (monthMap.has(monthKey)) {
          const existing = monthMap.get(monthKey)!;
          existing.count++;
          existing.revenue += price;
        } else {
          monthMap.set(monthKey, { count: 1, revenue: price });
        }
      });

      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const trends: MonthlyTrend[] = Array.from(monthMap.entries())
        .map(([month, data]) => {
          const [year, monthNum] = month.split("-");
          const monthIndex = parseInt(monthNum) - 1;
          return {
            month,
            monthLabel: `${monthNames[monthIndex]} ${year}`,
            appointmentCount: data.count,
            revenue: data.revenue,
          };
        })
        .sort((a, b) => a.month.localeCompare(b.month));

      return { success: true, data: trends };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== RECEITA POR SERVIÇO ====================
  
  static async getRevenueByService(filters: AnalyticsFilters): Promise<{ success: boolean; data?: ServiceRevenue[]; error?: string }> {
    try {
      const result = await this.getTopServices(filters);
      
      if (!result.success || !result.data) {
        return result;
      }

      const totalRevenue = result.data.reduce((sum, service) => sum + service.revenue, 0) || 1;
      
      const revenueData: ServiceRevenue[] = result.data.map((service) => ({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        revenue: service.revenue,
        count: service.count,
        percentage: (service.revenue / totalRevenue) * 100,
      }));

      return { success: true, data: revenueData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== BUSCAR TODOS OS DADOS ====================
  
  static async getAllAnalytics(filters: AnalyticsFilters): Promise<{ success: boolean; data?: AnalyticsData; error?: string }> {
    try {
      const [
        generalMetrics,
        topServices,
        topProfessionals,
        weekdayDistribution,
        peakHours,
        monthlyTrends,
        revenueByService,
      ] = await Promise.all([
        this.getGeneralMetrics(filters),
        this.getTopServices(filters),
        this.getTopProfessionals(filters),
        this.getWeekdayDistribution(filters),
        this.getPeakHours(filters),
        this.getMonthlyTrends(filters),
        this.getRevenueByService(filters),
      ]);

      if (!generalMetrics.success) throw new Error(generalMetrics.error);

      return {
        success: true,
        data: {
          generalMetrics: generalMetrics.data!,
          topServices: topServices.data || [],
          topProfessionals: topProfessionals.data || [],
          weekdayDistribution: weekdayDistribution.data || [],
          peakHours: peakHours.data || [],
          monthlyTrends: monthlyTrends.data || [],
          revenueByService: revenueByService.data || [],
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
