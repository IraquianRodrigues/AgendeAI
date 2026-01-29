import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, getBusinessHours } from "@/services/business-hours";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const durationParam = searchParams.get("duration");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Data é obrigatória. Use o parâmetro ?date=YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam + "T00:00:00");
    const duration = durationParam ? parseInt(durationParam) : 30;

    // Buscar horários de funcionamento do dia
    const dayOfWeek = date.getDay();
    const businessHours = await getBusinessHours();
    const dayHours = businessHours.find((h) => h.day_of_week === dayOfWeek);

    if (!dayHours || !dayHours.is_open) {
      // Fallback: Verificar se algum profissional trabalha neste dia
      const { ProfessionalSchedulesService } = await import(
        "@/services/professional-schedules/professional-schedules.service"
      );

      const professionalSchedules =
        await ProfessionalSchedulesService.getByDay(dayOfWeek);

      if (professionalSchedules.length > 0) {
        // Encontrar horário mais cedo e mais tarde entre os profissionais
        const startTimes = professionalSchedules.map((s) =>
          s.start_time.substring(0, 5)
        );
        const endTimes = professionalSchedules.map((s) =>
          s.end_time.substring(0, 5)
        );

        const earliestStart = startTimes.sort()[0];
        const latestEnd = endTimes.sort().reverse()[0];

        // Buscar slots disponíveis baseado nos horários dos profissionais
        const slots = await getAvailableSlots(date, duration);

        return NextResponse.json({
          date: dateParam,
          is_open: true,
          source: "professional_schedules",
          business_hours: {
            open: earliestStart,
            close: latestEnd,
          },
          available_professionals: professionalSchedules.length,
          available_slots: slots,
          duration_minutes: duration,
        });
      }

      // Nenhum profissional disponível
      return NextResponse.json({
        date: dateParam,
        is_open: false,
        available_slots: [],
        message: "Estabelecimento fechado neste dia",
      });
    }

    // Buscar slots disponíveis
    const slots = await getAvailableSlots(date, duration);

    return NextResponse.json({
      date: dateParam,
      is_open: true,
      business_hours: {
        open: dayHours.open_time,
        close: dayHours.close_time,
      },
      available_slots: slots,
      duration_minutes: duration,
    });
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar horários disponíveis" },
      { status: 500 }
    );
  }
}
