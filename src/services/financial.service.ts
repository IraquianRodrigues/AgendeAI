import { createClient } from "@/lib/supabase/client";
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
    startDate?: string;
    endDate?: string;
  }) {
    try {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          client:clientes(id, nome, telefone)
        `)
        .order("due_date", { ascending: false });

      if (filters?.clientId) {
        query = query.eq("client_id", filters.clientId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }
      if (filters?.startDate) {
        query = query.gte("due_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("due_date", filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
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
          client:clientes(id, nome, telefone)
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

  static async getFinancialMetrics(): Promise<{ success: boolean; data?: FinancialMetrics; error?: string }> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Get all transactions
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*");

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];

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
          paid_date: new Date().toISOString().split('T')[0],
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
