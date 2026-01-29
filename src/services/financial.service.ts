import { createClient } from "@/lib/supabase/client";
import { getLocalDateString } from "@/lib/utils/date";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  FinancialMetrics,
} from "@/types/financial";

const supabase = createClient();

export class FinancialService {
  // ==================== TRANSACTIONS ====================
  
  static async getTransactions(filters?: {
    clientId?: string;
    status?: string;
    type?: string;
    professionalId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      console.log('🛠️ [FinancialService] getTransactions chamado com filtros:', filters);
      
      let query = supabase
        .from("transactions")
        .select(`
          *,
          client:clientes(id, nome, telefone),
          professional:professionals(id, name)
        `)
        .order("due_date", { ascending: false });

      if (filters?.clientId) {
        console.log('🔍 Aplicando filtro clientId:', filters.clientId);
        query = query.eq("client_id", filters.clientId);
      }
      if (filters?.status) {
        console.log('🔍 Aplicando filtro status:', filters.status);
        query = query.eq("status", filters.status);
      }
      if (filters?.type) {
        console.log('🔍 Aplicando filtro type:', filters.type);
        query = query.eq("type", filters.type);
      }
      if (filters?.professionalId) {
        console.log('🔍 Aplicando filtro professionalId:', filters.professionalId);
        query = query.eq("professional_id", filters.professionalId);
      }
      if (filters?.startDate) {
        console.log('📅 Aplicando filtro startDate (gte):', filters.startDate);
        query = query.gte("due_date", filters.startDate);
      }
      if (filters?.endDate) {
        console.log('📅 Aplicando filtro endDate (lte):', filters.endDate);
        query = query.lte("due_date", filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('✅ [FinancialService] Transações retornadas:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📆 Primeira transação - due_date:', data[0].due_date);
        console.log('📆 Última transação - due_date:', data[data.length - 1].due_date);
      }
      
      return { success: true, data: data as Transaction[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getTransactionById(id: string) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          client:clientes(id, nome, telefone),
          professional:professionals(id, name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data: data as Transaction };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async createTransaction(input: CreateTransactionInput) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async updateTransaction(id: string, input: UpdateTransactionInput) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async deleteTransaction(id: string) {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== METRICS ====================

  static async getDailyAppointmentsReceivable(): Promise<number> {
    try {
      const today = getLocalDateString();
      
      // Get today's appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id, start_time, service_code")
        .gte("start_time", `${today}T00:00:00`)
        .lt("start_time", `${today}T23:59:59`);

      if (appointmentsError) {
        console.error("Error fetching daily appointments:", {
          message: appointmentsError.message,
          details: appointmentsError.details,
          hint: appointmentsError.hint,
          code: appointmentsError.code,
        });
        // Return 0 instead of throwing to prevent blocking the financial page
        return 0;
      }

      if (!appointments || appointments.length === 0) {
        return 0;
      }

      // Get all services to match with appointments
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("id, price");

      if (servicesError) {
        console.error("Error fetching services:", {
          message: servicesError.message,
          details: servicesError.details,
          hint: servicesError.hint,
          code: servicesError.code,
        });
        return 0;
      }

      // Calculate total from service prices
      const total = appointments.reduce((sum, appointment: any) => {
        const service = services?.find(s => s.id === appointment.service_code);
        const price = service?.price || 0;
        return sum + parseFloat(price.toString());
      }, 0);

      return total;
    } catch (error: any) {
      console.error("Error calculating daily appointments receivable:", error);
      return 0;
    }
  }

  static async getFinancialMetrics(): Promise<{ success: boolean; data?: FinancialMetrics; error?: string }> {
    try {
      const now = new Date();
      const firstDayOfMonth = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
      const lastDayOfMonth = getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));

      // Get all transactions
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*");

      if (error) throw error;

      const today = getLocalDateString();

      // Calculate metrics
      const totalReceivable = transactions
        ?.filter(t => t.type === 'receita' && t.status === 'pendente')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const totalReceived = transactions
        ?.filter(t => t.type === 'receita' && t.status === 'pago')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const totalOverdue = transactions
        ?.filter(t => t.type === 'receita' && t.status === 'pendente' && t.due_date < today)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const totalPending = transactions
        ?.filter(t => t.type === 'receita' && t.status === 'pendente')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const monthlyRevenue = transactions
        ?.filter(t => 
          t.type === 'receita' && 
          t.status === 'pago' && 
          t.paid_date && 
          t.paid_date >= firstDayOfMonth && 
          t.paid_date <= lastDayOfMonth
        )
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const monthlyExpenses = transactions
        ?.filter(t => 
          t.type === 'despesa' && 
          t.status === 'pago' && 
          t.paid_date && 
          t.paid_date >= firstDayOfMonth && 
          t.paid_date <= lastDayOfMonth
        )
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const netProfit = monthlyRevenue - monthlyExpenses;

      // Get daily appointments receivable
      const dailyAppointmentsReceivable = await this.getDailyAppointmentsReceivable();

      return {
        success: true,
        data: {
          totalReceivable,
          totalReceived,
          totalOverdue,
          totalPending,
          monthlyRevenue,
          monthlyExpenses,
          netProfit,
          dailyAppointmentsReceivable,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== MARK AS PAID ====================

  static async markAsPaid(id: string, paymentMethod: string) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .update({
          status: "pago",
          paid_date: getLocalDateString(),
          payment_method: paymentMethod,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
