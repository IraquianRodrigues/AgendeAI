"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      title="Novo Agendamento"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-foreground hover:bg-foreground/90 text-background shadow-[0_8px_24px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.16),0_6px_16px_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 z-50 animate-in fade-in slide-in-from-bottom-4"
    >
      <Plus className="h-6 w-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-90" />
      <span className="sr-only">Novo Agendamento</span>
      
      {/* Reduced motion support */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none !important;
          }
        }
      `}</style>
    </Button>
  );
}
