"use client";

import { format } from "date-fns";
import { AppointmentWithRelations } from "@/types/database.types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CalendarDayCellProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: () => void;
}

export function CalendarDayCell({
  date,
  appointments,
  isCurrentMonth,
  isToday,
  onClick,
}: CalendarDayCellProps) {
  const dayNumber = format(date, "d");
  const hasAppointments = appointments.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative aspect-square rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:scale-105 hover:z-10",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        // Current month vs other months
        isCurrentMonth
          ? "bg-card border-border"
          : "bg-muted/30 border-muted",
        // Today highlight
        isToday && "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-950/20",
        // Has appointments
        hasAppointments && isCurrentMonth && "border-blue-200 dark:border-blue-800"
      )}
    >
      <div className="absolute inset-0 p-2 flex flex-col">
        {/* Day Number */}
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "text-sm font-semibold transition-colors",
              isCurrentMonth
                ? "text-foreground"
                : "text-muted-foreground",
              isToday && "text-blue-600 dark:text-blue-400"
            )}
          >
            {dayNumber}
          </span>

          {/* Appointment Count Badge */}
          {hasAppointments && (
            <Badge
              variant="secondary"
              className={cn(
                "h-5 min-w-5 px-1.5 text-[10px] font-bold rounded-full",
                "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
                "group-hover:scale-110 transition-transform"
              )}
            >
              {appointments.length}
            </Badge>
          )}
        </div>

        {/* Appointment Indicators */}
        {hasAppointments && (
          <div className="flex-1 flex flex-col items-center justify-end pb-1 gap-1">
            {/* Visual bar indicator */}
            <div 
              className={cn(
                "w-full h-1 rounded-full",
                "bg-gradient-to-r from-blue-600 to-indigo-600",
                "group-hover:h-1.5 transition-all duration-200",
                "shadow-sm shadow-blue-500/50"
              )}
              style={{ 
                opacity: Math.min(0.4 + (appointments.length * 0.15), 1)
              }}
            />
            {/* Dots for up to 3 appointments */}
            {appointments.length <= 3 && (
              <div className="flex gap-1">
                {appointments.slice(0, 3).map((apt, idx) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      "bg-gradient-to-r from-blue-600 to-indigo-600",
                      "group-hover:scale-125 transition-transform",
                      "shadow-sm shadow-blue-500/50"
                    )}
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none" />
      </div>
    </button>
  );
}
