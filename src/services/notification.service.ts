import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Notification {
  id: string;
  user_id: string;
  type: "new_appointment" | "cancelled_appointment" | "updated_appointment";
  title: string;
  message: string;
  appointment_id: string | null;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  user_id: string;
  type: Notification["type"];
  title: string;
  message: string;
  appointment_id?: string;
}

export class NotificationService {
  private static supabase = createClient();
  private static channel: RealtimeChannel | null = null;

  /**
   * Inscreve-se para escutar mudanças em agendamentos em tempo real
   */
  static subscribeToAppointments(
    onNewAppointment: (appointment: any) => void,
    onCancelledAppointment: (appointment: any) => void,
    onUpdatedAppointment: (appointment: any) => void
  ): RealtimeChannel {
    // Remove canal anterior se existir
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
    }

    // Cria novo canal
    this.channel = this.supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
        },
        (payload) => {
          console.log("📅 Novo agendamento:", payload.new);
          onNewAppointment(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "appointments",
          filter: "status=eq.cancelado",
        },
        (payload) => {
          console.log("❌ Agendamento cancelado:", payload.new);
          onCancelledAppointment(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "appointments",
        },
        (payload) => {
          console.log("🔄 Agendamento atualizado:", payload.new);
          onUpdatedAppointment(payload.new);
        }
      )
      .subscribe();

    return this.channel;
  }

  /**
   * Cancela inscrição do canal de tempo real
   */
  static unsubscribe(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  /**
   * Cria uma nova notificação
   */
  static async createNotification(
    input: CreateNotificationInput
  ): Promise<{ success: boolean; data?: Notification; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .insert({
          user_id: input.user_id,
          type: input.type,
          title: input.title,
          message: input.message,
          appointment_id: input.appointment_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error("Erro ao criar notificação:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca todas as notificações do usuário atual
   */
  static async getNotifications(
    limit: number = 50
  ): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Erro ao buscar notificações:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca apenas notificações não lidas
   */
  static async getUnreadNotifications(): Promise<{
    success: boolean;
    data?: Notification[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Erro ao buscar notificações não lidas:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Conta notificações não lidas
   */
  static async getUnreadCount(): Promise<{
    success: boolean;
    count?: number;
    error?: string;
  }> {
    try {
      const { count, error } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);

      if (error) throw error;

      return { success: true, count: count || 0 };
    } catch (error: any) {
      console.error("Erro ao contar notificações não lidas:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marca uma notificação como lida
   */
  static async markAsRead(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao marcar notificação como lida:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  static async markAllAsRead(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao marcar todas como lidas:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deleta uma notificação
   */
  static async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao deletar notificação:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Formata mensagem de notificação baseada no tipo e dados do agendamento
   */
  static formatNotificationMessage(
    type: Notification["type"],
    appointment: any
  ): { title: string; message: string } {
    const clientName = appointment.client_name || appointment.customer_name || "Cliente";
    const serviceName = appointment.service_name || "Serviço";
    
    // Formatar data e hora
    let dateStr = "data não definida";
    let timeStr = "horário não definido";
    
    if (appointment.start_time) {
      try {
        const date = new Date(appointment.start_time);
        
        // Formatar data: dd/MM/yyyy
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        dateStr = `${day}/${month}/${year}`;
        
        // Formatar hora: HH:mm (sem segundos, sem timezone)
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        timeStr = `${hours}:${minutes}`;
      } catch (e) {
        console.error("Erro ao formatar data:", e);
      }
    }

    switch (type) {
      case "new_appointment":
        return {
          title: "🎉 Novo Agendamento!",
          message: `${clientName} agendou ${serviceName} para ${dateStr} às ${timeStr}`,
        };

      case "cancelled_appointment":
        return {
          title: "❌ Agendamento Cancelado",
          message: `${clientName} cancelou ${serviceName} de ${dateStr} às ${timeStr}`,
        };

      case "updated_appointment":
        return {
          title: "🔄 Agendamento Atualizado",
          message: `${clientName} atualizou o agendamento de ${serviceName} para ${dateStr} às ${timeStr}`,
        };

      default:
        return {
          title: "📬 Nova Notificação",
          message: "Você tem uma nova notificação",
        };
    }
  }
}
