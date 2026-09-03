import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "danger" | "neutral" | "info";

const tones: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/10 text-primary border-primary/25",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const porStatus: Record<string, Tone> = {
  "Em aberto": "neutral",
  "Aprovação pendente": "warning",
  Agendado: "warning",
  Pago: "success",
  Atrasado: "danger",
  Cancelado: "neutral",
  "A vencer": "warning",
  Recebido: "success",
  "Em atraso": "danger",
  Ativo: "success",
  Inativo: "neutral",
};

export const tomDoStatus = (status: string): Tone => porStatus[status] ?? "neutral";
