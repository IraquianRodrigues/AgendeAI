import React from 'react';

interface PaymentFeeDisplayProps {
  paymentMethod: string;
  amount: number;
}

export function PaymentFeeDisplay({ paymentMethod, amount }: PaymentFeeDisplayProps) {
  const fees: Record<string, number> = {
    'dinheiro': 0,
    'pix': 1,
    'cartao_debito': 2,
    'cartao_credito': 3,
    'boleto': 0,
    'transferencia': 0,
  };

  const feePercentage = fees[paymentMethod] || 0;
  const feeAmount = (amount * feePercentage) / 100;
  const totalAmount = amount + feeAmount; // Cliente paga: serviço + taxa

  if (feePercentage === 0 || amount <= 0) {
    return null;
  }

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Valor do serviço:</span>
        <span className="font-medium">R$ {amount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm text-amber-700 dark:text-amber-400">
        <span>Taxa da maquineta ({feePercentage}%):</span>
        <span>+ R$ {feeAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-bold pt-2 border-t border-amber-200 dark:border-amber-800">
        <span>Total a pagar:</span>
        <span className="text-lime-600 dark:text-lime-400">R$ {totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}
