"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppointments } from "@/services/appointments/use-appointments";
import { CalendarGrid } from "./calendar-grid";
import { DayAppointmentsModal } from "./day-appointments-modal";
import { 
  startOfMonth, 
  endOfMonth, 
  format, 
  addMonths, 
  subMonths 
} from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate start and end of current month for fetching
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  // Fetch appointments for the entire month
  const {
    data: appointments = [],
    isLoading,
    error,
  } = useAppointments({
    startDate: monthStart,
    endDate: monthEnd,
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-4 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors flex items-center gap-3">
              <div className="bg-foreground rounded-xl p-2.5 flex items-center justify-center shadow-lg">
                <CalendarIcon className="h-6 w-6 text-background" />
              </div>
              Agenda
            </h1>
            <p className="text-sm text-muted-foreground font-medium transition-colors">
              Visualização mensal de agendamentos
            </p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-3 bg-card p-1 rounded-xl border border-border shadow-sm transition-colors">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-9 w-9 rounded-lg hover:bg-accent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="px-4 py-2 min-w-[200px] text-center">
              <p className="text-sm font-semibold text-foreground capitalize">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-9 w-9 rounded-lg hover:bg-accent"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-9 px-3 rounded-lg hover:bg-accent text-xs font-medium"
            >
              Hoje
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="p-6 border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-none">
          {error ? (
            <div className="text-center py-12 space-y-3">
              <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center transition-colors">
                <CalendarIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium transition-colors">
                Erro ao carregar agendamentos
              </p>
              <p className="text-sm text-muted-foreground transition-colors">
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          ) : (
            <CalendarGrid
              currentMonth={currentMonth}
              appointments={appointments}
              isLoading={isLoading}
              onDayClick={handleDayClick}
            />
          )}
        </Card>
      </div>

      {/* Day Appointments Modal */}
      {selectedDate && (
        <DayAppointmentsModal
          date={selectedDate}
          appointments={appointments}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
