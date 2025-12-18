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
import { User, Phone, Lock, MessageCircle } from "lucide-react";
import type { ClienteRow } from "@/types/database.types";
import { formatDateTimeBR } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  useClienteByTelefone,
  useUpdateClienteTrava,
} from "@/services/clientes/use-clientes";

interface ClienteDetailsModalProps {
  cliente: ClienteRow | null;
  onClose: () => void;
}

export function ClienteDetailsModal({
  cliente,
  onClose,
}: ClienteDetailsModalProps) {
  const updateClienteTravaMutation = useUpdateClienteTrava();

  // Busca o cliente atualizado em tempo real
  const { data: clienteAtualizado } = useClienteByTelefone(
    cliente?.telefone || null
  );

  if (!cliente) return null;

  // Usa o cliente atualizado se disponível, senão usa o prop
  const clienteAtual = clienteAtualizado || cliente;
  const isLocked = clienteAtual.trava;

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
      <DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[80vh] sm:max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-base sm:text-xl md:text-2xl">
            Detalhes do Cliente
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Informações completas sobre o cliente selecionado
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-3 sm:px-6">
          <div className="space-y-3 sm:space-y-6 pb-3 sm:pb-6 pr-2 sm:pr-4">
            {/* Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {isLocked ? (
                  <Badge variant="destructive" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Bloqueado
                  </Badge>
                ) : (
                  <Badge variant="default">Ativo</Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                ID: {clienteAtual.id}
              </span>
            </div>

            <Separator />

            {/* Informações do Cliente */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-lg flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Informações do Cliente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pl-0 sm:pl-7">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium break-words text-sm sm:text-base">{clienteAtual.nome}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium text-sm sm:text-base">{clienteAtual.telefone}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações Adicionais */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-lg flex items-center gap-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Informações Adicionais
              </h3>
              <div className="pl-0 sm:pl-7">
                <p className="text-xs sm:text-sm text-muted-foreground">Cadastrado em</p>
                <p className="font-medium text-sm sm:text-base">
                  {formatDateTimeBR(clienteAtual.created_at)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:gap-3 pt-2">
              <Button
                onClick={handleWhatsApp}
                variant="default"
                className="w-full gap-2"
                size="sm"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar WhatsApp
              </Button>
              <Button
                onClick={handleToggleLock}
                variant={isLocked ? "outline" : "destructive"}
                className="w-full gap-2"
                size="sm"
                disabled={updateClienteTravaMutation.isPending}
              >
                <Lock className="h-4 w-4" />
                {updateClienteTravaMutation.isPending
                  ? "Processando..."
                  : isLocked
                  ? "Desbloquear"
                  : "Bloquear"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
