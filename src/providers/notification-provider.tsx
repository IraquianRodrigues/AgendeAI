"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { NotificationService, type Notification } from "@/services/notification.service";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Buscar usuário atual
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Carregar notificações iniciais
  const loadNotifications = async () => {
    setIsLoading(true);
    const result = await NotificationService.getNotifications(20);
    if (result.success && result.data) {
      setNotifications(result.data);
      setUnreadCount(result.data.filter((n) => !n.read).length);
    }
    setIsLoading(false);
  };

  // Atualizar contador de não lidas
  const updateUnreadCount = async () => {
    const result = await NotificationService.getUnreadCount();
    if (result.success && result.count !== undefined) {
      setUnreadCount(result.count);
    }
  };

  // Carregar notificações ao montar
  useEffect(() => {
    loadNotifications();
  }, []);

  // Inscrever-se para mudanças em agendamentos
  useEffect(() => {
    if (!currentUserId) {
      console.log("⚠️ NotificationProvider: Aguardando currentUserId...");
      return;
    }

    console.log("✅ NotificationProvider: Iniciando subscription com userId:", currentUserId);

    const handleNewAppointment = async (appointment: any) => {
      console.log("🎉 NOVO AGENDAMENTO DETECTADO:", appointment);
      
      try {
        const supabase = createClient();
        
        // Buscar dados básicos do agendamento
        const { data: fullAppointment, error: appointmentError } = await supabase
          .from("appointments")
          .select("*")
          .eq("id", appointment.id)
          .single();

        if (appointmentError || !fullAppointment) {
          console.error("❌ Erro ao buscar agendamento:", appointmentError);
          return;
        }

        console.log("📦 Dados do agendamento:", fullAppointment);

        // Buscar service separadamente
        const { data: service } = await supabase
          .from("services")
          .select("code")
          .eq("id", fullAppointment.service_code)
          .single();

        // Buscar professional separadamente
        const { data: professional } = await supabase
          .from("professionals")
          .select("name")
          .eq("id", fullAppointment.professional_code)
          .single();

        console.log("🔍 Service:", service);
        console.log("👤 Professional:", professional);

        // Formatar dados para a notificação
        const appointmentData = {
          ...fullAppointment,
          client_name: fullAppointment.customer_name || "Cliente",
          service_name: service?.code || "Serviço",
          professional_name: professional?.name || "Profissional",
          // start_time já está presente em fullAppointment
        };
        
        console.log("📝 Dados formatados:", appointmentData);

        // Criar notificação
        const { title, message } = NotificationService.formatNotificationMessage(
          "new_appointment",
          appointmentData
        );

        console.log("💬 Mensagem:", { title, message });

        const result = await NotificationService.createNotification({
          user_id: currentUserId,
          type: "new_appointment",
          title,
          message,
          appointment_id: appointment.id,
        });

        console.log("💾 Resultado da criação:", result);

        // Mostrar toast
        toast.success(title, {
          description: message,
          duration: 5000,
        });

        // Recarregar notificações
        await loadNotifications();
      } catch (err) {
        console.error("❌ Erro geral:", err);
      }
    };

    const handleCancelledAppointment = async (appointment: any) => {
      console.log("❌ CANCELAMENTO DETECTADO:", appointment);
      
      // Buscar dados completos do agendamento
      const supabase = createClient();
      const { data: fullAppointment, error } = await supabase
        .from("appointments")
        .select(`
          *,
          service:services!appointments_service_code_fkey(id, code, duration_minutes, price),
          professional:professionals!appointments_professional_code_fkey(id, name, code)
        `)
        .eq("id", appointment.id)
        .single();

      if (error) {
        console.error("❌ Erro ao buscar dados do agendamento:", error);
        return;
      }

      const appointmentData = {
        ...fullAppointment,
        client_name: fullAppointment.customer_name || "Cliente",
        service_name: fullAppointment.service?.code || "Serviço",
        professional_name: fullAppointment.professional?.name || "Profissional",
        date: fullAppointment.start_time,
        time: fullAppointment.start_time,
      };
      
      const { title, message } = NotificationService.formatNotificationMessage(
        "cancelled_appointment",
        appointmentData
      );

      await NotificationService.createNotification({
        user_id: currentUserId,
        type: "cancelled_appointment",
        title,
        message,
        appointment_id: appointment.id,
      });

      toast.error(title, {
        description: message,
        duration: 5000,
      });

      await loadNotifications();
    };

    const handleUpdatedAppointment = async (appointment: any) => {
      console.log("🔄 ATUALIZAÇÃO DETECTADA:", appointment);
      
      // Ignorar se for cancelamento (já tratado acima)
      if (appointment.status === "cancelado") {
        console.log("⏭️ Ignorando - é cancelamento");
        return;
      }

      // Buscar dados completos do agendamento
      const supabase = createClient();
      const { data: fullAppointment, error } = await supabase
        .from("appointments")
        .select(`
          *,
          service:services!appointments_service_code_fkey(id, code, duration_minutes, price),
          professional:professionals!appointments_professional_code_fkey(id, name, code)
        `)
        .eq("id", appointment.id)
        .single();

      if (error) {
        console.error("❌ Erro ao buscar dados do agendamento:", error);
        return;
      }

      const appointmentData = {
        ...fullAppointment,
        client_name: fullAppointment.customer_name || "Cliente",
        service_name: fullAppointment.service?.code || "Serviço",
        professional_name: fullAppointment.professional?.name || "Profissional",
        date: fullAppointment.start_time,
        time: fullAppointment.start_time,
      };

      const { title, message } = NotificationService.formatNotificationMessage(
        "updated_appointment",
        appointmentData
      );

      await NotificationService.createNotification({
        user_id: currentUserId,
        type: "updated_appointment",
        title,
        message,
        appointment_id: appointment.id,
      });

      toast.info(title, {
        description: message,
        duration: 5000,
      });

      await loadNotifications();
    };

    // Inscrever-se
    console.log("🔌 Conectando ao Supabase Realtime...");
    const channel = NotificationService.subscribeToAppointments(
      handleNewAppointment,
      handleCancelledAppointment,
      handleUpdatedAppointment
    );

    console.log("✅ Subscription ativa:", channel);

    // Cleanup
    return () => {
      console.log("🔌 Desconectando do Realtime...");
      NotificationService.unsubscribe();
    };
  }, [currentUserId]);

  // Marcar como lida
  const markAsRead = async (id: string) => {
    const result = await NotificationService.markAsRead(id);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      await updateUnreadCount();
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    const result = await NotificationService.markAllAsRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // Deletar notificação
  const deleteNotification = async (id: string) => {
    const result = await NotificationService.deleteNotification(id);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await updateUnreadCount();
    }
  };

  // Refresh manual
  const refreshNotifications = async () => {
    await loadNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
