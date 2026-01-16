import { redirect } from "next/navigation";
import { AuthServerService } from "@/services/auth/server.service";
import CalendarView from "./_components/calendar-view";

export default async function AgendaPage() {
  const user = await AuthServerService.getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <CalendarView />;
}
