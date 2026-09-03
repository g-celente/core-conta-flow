import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "ok" | "atencao" | "erro" | "critico" | "neutro" | "info";

const tones: Record<Tone, string> = {
  ok: "bg-secondary/10 text-secondary",
  atencao: "bg-tertiary-fixed text-on-tertiary-fixed",
  erro: "bg-error-container text-on-error-container",
  critico: "bg-error text-on-error",
  neutro: "bg-surface-variant text-on-surface-variant border border-outline/30",
  info: "bg-primary-fixed text-on-primary-fixed-variant",
};

/** Pílula de status no padrão visual do FinCore (Material 3). */
export function StatusBadge({
  tone = "neutro",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-label-md text-[11px]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const porStatus: Record<string, Tone> = {
  "Em aberto": "neutro",
  "Aprovação pendente": "atencao",
  Agendado: "atencao",
  Pago: "ok",
  Atrasado: "erro",
  Cancelado: "neutro",
  "A vencer": "atencao",
  Recebido: "ok",
  "Em atraso": "erro",
  Ativo: "ok",
  Inativo: "neutro",
};

export const tomDoStatus = (status: string): Tone => porStatus[status] ?? "neutro";
