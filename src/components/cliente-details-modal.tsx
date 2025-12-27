"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Phone, Lock, MessageCircle, DollarSign, CalendarClock, Star } from "lucide-react";
import type { ClienteRow } from "@/types/database.types";
import { formatDateTimeBR } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  useClienteByTelefone,
  useUpdateClienteTrava,
} from "@/services/clientes/use-clientes";
import { useAppointmentsByPhone } from "@/services/appointments/use-appointments";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import { useUpdateClienteNotes } from "@/services/clientes/use-clientes";

interface ClienteDetailsModalProps {
  cliente: ClienteRow | null;
  onClose: () => void;
}

export function ClienteDetailsModal({
  cliente,
  onClose,
}: ClienteDetailsModalProps) {
  const updateClienteTravaMutation = useUpdateClienteTrava();
  const updateClienteNotesMutation = useUpdateClienteNotes();

  // Busca o cliente atualizado em tempo real
  const { data: clienteAtualizado } = useClienteByTelefone(
    cliente?.telefone || null
  );

  const { data: appointmentsHistory = [], isLoading: isLoadingHistory } = useAppointmentsByPhone(cliente?.telefone || null);

  const totalInvestido = useMemo(() => {
    return appointmentsHistory.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);
  }, [appointmentsHistory]);

  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState(cliente?.notes || "");

  // Update local notes state when client data updates from server
  useMemo(() => {
    if (clienteAtualizado?.notes !== undefined) {
      setNotes(clienteAtualizado.notes || "");
    } else if (cliente?.notes) {
      setNotes(cliente.notes);
    }
  }, [clienteAtualizado, cliente]);

  if (!cliente) return null;

  // Usa o cliente atualizado se disponível, senão usa o prop
  const clienteAtual = clienteAtualizado || cliente;
  const isLocked = clienteAtual.trava;

  const handleNotesBlur = async () => {
    if (notes !== (clienteAtual.notes || "")) {
      try {
        await updateClienteNotesMutation.mutateAsync({
          telefone: clienteAtual.telefone,
          notes: notes
        });
        toast.success("Anotações salvas com sucesso");
      } catch (error) {
        toast.error("Erro ao salvar anotações");
      }
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = clienteAtual.telefone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${clienteAtual.nome}, tudo bem? Aqui é da clínica. Estamos entrando em contato.`
    );
    window.open(
      `https://web.whatsapp.com/send?phone=55${phoneNumber}&text=${message}`,
      "_blank"
    );
  };

  const handleToggleLock = async () => {
    try {
      const newTravaValue = !isLocked;

      await updateClienteTravaMutation.mutateAsync({
        telefone: clienteAtual.telefone,
        trava: newTravaValue,
      });

      toast.success(
        newTravaValue
          ? "Cliente bloqueado com sucesso"
          : "Cliente desbloqueado com sucesso"
      );
    } catch (error) {
      toast.error("Erro ao atualizar bloqueio do cliente");
    }
  };

  return (
    <Dialog open={!!cliente} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-3xl max-h-[85vh] p-0 flex flex-col bg-white overflow-hidden shadow-2xl border-0">
        {/* Header com Gradiente e Design Premium */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 sm:px-8 pt-8 pb-16 flex-shrink-0 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <User className="w-64 h-64 -mr-16 -mt-16 rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl">
              {clienteAtual.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
                {clienteAtual.nome}
              </DialogTitle>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-blue-50">
                <span className="flex items-center gap-1.5 bg-blue-700/50 px-2.5 py-0.5 rounded-full text-sm font-medium backdrop-blur-md border border-white/10">
                  <Phone className="w-3.5 h-3.5" />
                  {clienteAtual.telefone}
                </span>
                {isLocked && (
                  <span className="flex items-center gap-1.5 bg-red-500/90 text-white px-2.5 py-0.5 rounded-full text-sm font-bold shadow-sm">
                    <Lock className="w-3.5 h-3.5" />
                    Bloqueado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats - Sobrepõem o Header */}
        <div className="px-6 sm:px-8 -mt-8 relative z-20 flex-shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 transition-transform hover:scale-[1.02]">
              <div className="p-3 rounded-xl bg-green-50 text-green-600 mb-2 sm:mb-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-gray-400">Total Investido</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvestido)}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 transition-transform hover:scale-[1.02]">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mb-2 sm:mb-0">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-gray-400">Total Visitas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {appointmentsHistory.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogHeader className="sr-only">
          <DialogTitle>{clienteAtual.nome}</DialogTitle>
        </DialogHeader>

        {/* Content Area com Tabs Modernas */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          {/* Custom Tabs */}
          <div className="px-6 sm:px-8 mb-2 flex justify-center sm:justify-start">
            <div className="inline-flex bg-gray-100/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                  }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                  }`}
              >
                Histórico
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 sm:px-8 space-y-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Informações Pessoais Card */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                    <div className="hidden sm:flex h-12 w-12 rounded-xl bg-white border border-gray-100 items-center justify-center text-gray-400 shadow-sm shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 sm:hidden text-gray-500" />
                        Informações da Conta
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Status da Conta</p>
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${isLocked ? 'bg-red-500' : 'bg-green-500'}`} />
                            <span className="font-medium text-gray-700">{isLocked ? 'Bloqueado' : 'Ativo e Regular'}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Membro Desde</p>
                          <p className="font-medium text-gray-700">{formatDateTimeBR(clienteAtual.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Anotações Section */}
                  <div className="flex flex-col gap-3 pt-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      Anotações & Observações
                    </h3>
                    <div className="relative group">
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Clique aqui para adicionar notas sobre este paciente (ex: preferências, histórico médico relevante, etc)..."
                        className="min-h-[120px] bg-[#FEFCFBF0] border-[#F2E8E0] hover:border-amber-200 focus:bg-white focus:border-amber-300 focus:ring-4 focus:ring-amber-100/50 resize-none placeholder:text-gray-400 text-gray-700 leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5 rounded-2xl text-sm transition-all duration-300"
                      />
                      <div className="absolute bottom-4 right-4 pointer-events-none">
                        {updateClienteNotesMutation.isPending ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100/50 shadow-sm animate-pulse">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Salvando
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-300 group-hover:text-gray-400 transition-colors bg-white/50 backdrop-blur-sm px-2 py-1 rounded-md">
                            Salvo autom.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Espaço extra no final */}
                  <div className="h-8"></div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mb-2" />
                      <p>Carregando histórico...</p>
                    </div>
                  ) : appointmentsHistory.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-900 font-medium">Nenhum histórico encontrado</p>
                      <p className="text-sm text-gray-500">Este cliente ainda não realizou consultas.</p>
                    </div>
                  ) : (
                    appointmentsHistory.slice(0, 5).map((apt: any) => (
                      <div key={apt.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 font-bold text-lg ${apt.status === 'completed' || apt.completed_at
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {new Date(apt.created_at).getDate()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="font-bold text-gray-900 truncate pr-2">
                              {apt.service?.name || apt.service?.code || "Serviço não identificado"}
                            </h4>
                            {apt.service?.price && (
                              <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(apt.service.price)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {apt.professional?.name || "N/A"}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${apt.status === 'completed' || apt.completed_at
                              ? 'bg-green-50 text-green-600'
                              : 'bg-blue-50 text-blue-600'
                              }`}>
                              {apt.status === 'completed' || apt.completed_at ? 'Concluído' : 'Agendado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-8 sm:py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 flex-shrink-0 z-20">
          <Button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white border-0 h-11 sm:h-12 text-base font-semibold shadow-lg shadow-green-500/20 rounded-xl">
            <MessageCircle className="h-5 w-5 mr-2" />
            WhatsApp
          </Button>
          <div className="flex flex-1 gap-3">
            <Button onClick={handleToggleLock} variant={isLocked ? "secondary" : "destructive"} className={`flex-1 h-11 sm:h-12 rounded-xl font-semibold ${isLocked ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'shadow-lg shadow-red-500/20'}`}>
              <Lock className="h-4 w-4 mr-2" />
              {isLocked ? "Desbloquear" : "Bloquear"}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-24 h-11 sm:h-12 border-gray-200 hover:bg-white hover:text-gray-900 rounded-xl font-semibold">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
