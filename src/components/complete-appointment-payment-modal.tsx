"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FinancialService } from "@/services/financial.service";
import { toast } from "sonner";
import type { PaymentMethod } from "@/types/financial";
import type { AppointmentWithRelations } from "@/types/database.types";
import { useClienteByTelefone } from "@/services/clientes/use-clientes";
import { useDeleteAppointment } from "@/services/appointments/use-appointments";
import { formatDateBR } from "@/lib/date-utils";
import { getLocalDateString } from "@/lib/utils/date";
import { PaymentFeeDisplay } from "@/app/dashboard/financeiro/_components/payment-fee-display";

interface CompleteAppointmentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentWithRelations | null;
  onSuccess: () => void;
}

export function CompleteAppointmentPaymentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: CompleteAppointmentPaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("dinheiro");
  const [amount, setAmount] = useState<number>(0);

  // Buscar cliente pelo telefone
  const { data: cliente } = useClienteByTelefone(appointment?.customer_phone || null);
  
  // Hook para deletar agendamento
  const deleteAppointmentMutation = useDeleteAppointment();

  // Preencher valor automaticamente se disponível
  useEffect(() => {
    if (appointment?.service?.price && amount === 0) {
      setAmount(appointment.service.price);
    }
  }, [appointment, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointment) return;

    if (!cliente) {
      toast.error("Cliente não encontrado");
      return;
    }

    if (amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    setIsSubmitting(true);


    try {
      // Debug: ver dados do appointment
      console.log('📋 Appointment:', appointment);
      console.log('👨‍⚕️ Professional ID:', appointment.professional_id);
      console.log('👨‍⚕️ Professional Code:', appointment.professional_code);
      
      // Calcular taxa e valor total
      const PAYMENT_FEES: Record<string, number> = {
        'dinheiro': 0,
        'pix': 1,
        'cartao_debito': 2,
        'cartao_credito': 3,
        'boleto': 0,
        'transferencia': 0,
      };
      
      const feePercentage = PAYMENT_FEES[paymentMethod] || 0;
      const feeAmount = (amount * feePercentage) / 100;
      const totalAmount = amount + feeAmount; // Cliente paga: serviço + taxa
      
      console.log('💰 Cálculo:', { amount, feePercentage, feeAmount, totalAmount });
      
      // Criar transação financeira
      const result = await FinancialService.createTransaction({
        client_id: cliente.id.toString(),
        professional_id: appointment.professional_code, // Usar professional_code ao invés de professional_id
        type: "receita",
        category: appointment.service?.code || "Consulta",
        description: "",
        amount: totalAmount, // Salvar valor total (serviço + taxa)
        payment_method: paymentMethod,
        status: "pago",
        due_date: getLocalDateString(new Date(appointment.start_time)),
        paid_date: getLocalDateString(),
      });

      if (result.success) {
        // Deletar o agendamento após registrar o pagamento usando o hook
        try {
          await deleteAppointmentMutation.mutateAsync(appointment.id);
          toast.success("Pagamento registrado e agendamento concluído!");
        } catch (deleteError) {
          console.error('Erro ao deletar agendamento após pagamento:', deleteError);
          toast.warning('Pagamento registrado, mas o agendamento não foi removido. Por favor, remova manualmente.');
        }
        
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Erro ao registrar pagamento");
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error("Erro inesperado ao registrar pagamento");
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setAmount(0);
    setPaymentMethod("dinheiro");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Informações do Agendamento */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{appointment?.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Serviço:</span>
              <span className="font-medium">{appointment?.service?.code || "Atendimento"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">
                {appointment?.start_time ? formatDateBR(appointment.start_time) : ""}
              </span>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor Recebido (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              required
              autoFocus
            />
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de Pagamento *</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">💵 Dinheiro (0% taxa)</SelectItem>
                <SelectItem value="pix">🔷 PIX (1% taxa)</SelectItem>
                <SelectItem value="cartao_credito">💳 Cartão de Crédito (3% taxa)</SelectItem>
                <SelectItem value="cartao_debito">💳 Cartão de Débito (2% taxa)</SelectItem>
                <SelectItem value="boleto">📄 Boleto (0% taxa)</SelectItem>
                <SelectItem value="transferencia">🏦 Transferência (0% taxa)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exibir informações de taxa */}
          <PaymentFeeDisplay 
            paymentMethod={paymentMethod} 
            amount={amount} 
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={isSubmitting || !cliente}
            >
              {isSubmitting ? "Registrando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
