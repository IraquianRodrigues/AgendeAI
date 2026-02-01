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
    if (!currentUserId) return;

    const handleNewAppointment = async (appointment: any) => {
      // Criar notificação
      const { title, message } = NotificationService.formatNotificationMessage(
        "new_appointment",
        appointment
      );

      await NotificationService.createNotification({
        user_id: currentUserId,
        type: "new_appointment",
        title,
        message,
        appointment_id: appointment.id,
      });

      // Mostrar toast
      toast.success(title, {
        description: message,
        duration: 5000,
      });

      // Recarregar notificações
      await loadNotifications();
    };

    const handleCancelledAppointment = async (appointment: any) => {
      const { title, message } = NotificationService.formatNotificationMessage(
        "cancelled_appointment",
        appointment
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
      // Ignorar se for cancelamento (já tratado acima)
      if (appointment.status === "cancelado") return;

      const { title, message } = NotificationService.formatNotificationMessage(
        "updated_appointment",
        appointment
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
    const channel = NotificationService.subscribeToAppointments(
      handleNewAppointment,
      handleCancelledAppointment,
      handleUpdatedAppointment
    );

    // Cleanup
    return () => {
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
