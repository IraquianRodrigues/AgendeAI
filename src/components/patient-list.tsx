"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MedicalRecordsService, type PatientSummary } from "@/services/medical-records.service";
import { useUserRole } from "@/hooks/use-user-role";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PatientListProps {
  searchQuery: string;
  onPatientClick: (patientId: number) => void;
}

export function PatientList({ searchQuery, onPatientClick }: PatientListProps) {
  const { profile, isAdmin } = useUserRole();

  // Buscar clientes - todos para admin, apenas do profissional
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ["patients", profile?.id, isAdmin],
    queryFn: async () => {
      if (!profile?.id) return { success: false, data: [] };
      
      // Se for admin, buscar todos os clientes
      if (isAdmin) {
        return MedicalRecordsService.getAllPatients();
      }
      
      // Se for profissional, buscar apenas seus clientes
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: professionals } = await supabase
        .from("professionals")
        .select("id")
        .eq("email", profile.email)
        .single();
      
      if (!professionals) return { success: false, data: [] };
      
      return MedicalRecordsService.getPatientsByProfessional(professionals.id);
    },
    enabled: !!profile?.id,
  });

  const patients = patientsData?.data || [];

  // Filtrar clientes baseado na busca usando useMemo
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return patients;
    }

    const query = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.client_name.toLowerCase().includes(query) ||
        patient.client_phone.includes(query)
    );
  }, [searchQuery, patients]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredPatients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Nenhum cliente encontrado</h3>
        <p className="text-muted-foreground mt-2">
          {searchQuery
            ? "Tente ajustar sua busca"
            : "Você ainda não tem clientes agendados"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPatients.map((patient) => (
        <Card
          key={patient.client_id}
          className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-foreground/20 hover:-translate-y-1 overflow-hidden"
          onClick={() => onPatientClick(patient.client_id)}
        >
          <CardContent className="p-0">
            {/* Header com Avatar e Nome */}
            <div className="p-6 pb-4 border-b border-border/50">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-foreground/20 transition-all">
                  <AvatarFallback className="bg-foreground text-background font-bold text-lg">
                    {patient.client_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate group-hover:text-foreground transition-colors">
                    {patient.client_name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {patient.client_phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="p-6 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-1.5 rounded-md bg-background">
                    <Calendar className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Consultas</p>
                    <p className="text-sm font-bold">{patient.total_appointments}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-1.5 rounded-md bg-background">
                    <FileText className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Prontuários</p>
                    <p className="text-sm font-bold">{patient.total_records}</p>
                  </div>
                </div>
              </div>

              {/* Last Appointment */}
              {patient.last_appointment && (
                <div className="pt-2">
                  <Badge variant="outline" className="w-full justify-center text-xs font-medium py-1.5">
                    Último atendimento:{" "}
                    {format(new Date(patient.last_appointment), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
