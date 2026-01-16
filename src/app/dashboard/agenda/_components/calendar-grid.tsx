"use client";

import { useMemo } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithRelations } from "@/types/database.types";
import { CalendarDayCell } from "./calendar-day-cell";

interface CalendarGridProps {
  currentMonth: Date;
  appointments: AppointmentWithRelations[];
  isLoading: boolean;
  onDayClick: (date: Date) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarGrid({
  currentMonth,
  appointments,
  isLoading,
  onDayClick,
}: CalendarGridProps) {
  // Generate all days to display (including days from prev/next month)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group appointments by date for quick lookup
  const appointmentsByDate = useMemo(() => {
    const grouped = new Map<string, AppointmentWithRelations[]>();
    
    appointments.forEach((apt) => {
      const dateKey = format(new Date(apt.start_time), "yyyy-MM-dd");
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(apt);
    });

    return grouped;
  }, [appointments]);

  const getAppointmentsForDay = (date: Date): AppointmentWithRelations[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return appointmentsByDate.get(dateKey) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Weekday headers skeleton */}
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid skeleton */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          return (
            <CalendarDayCell
              key={day.toISOString()}
              date={day}
              appointments={dayAppointments}
              isCurrentMonth={isCurrentMonth}
              isToday={isCurrentDay}
              onClick={() => onDayClick(day)}
            />
          );
        })}
      </div>
    </div>
  );
}
