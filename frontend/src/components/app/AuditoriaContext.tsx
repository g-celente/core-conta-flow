import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type TipoEvento = "crud" | "aprovacao" | "feature" | "acesso" | "modulo";

export type EventoAuditoria = {
  id: string;
  hora: string;
  tipo: TipoEvento;
  entidade: string;
  operacao: string;
  detalhe: string;
  usuario: string;
  empresa: string;
};

type Ctx = {
  eventos: EventoAuditoria[];
  registrar: (e: Omit<EventoAuditoria, "id" | "hora">) => void;
};

const AuditoriaCtx = createContext<Ctx | null>(null);

let seq = 0;

export function AuditoriaProvider({ children }: { children: ReactNode }) {
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);

  const registrar = useCallback((e: Omit<EventoAuditoria, "id" | "hora">) => {
    seq += 1;
    const hora = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setEventos((l) => [{ ...e, id: `ev-${seq}`, hora }, ...l]);
  }, []);

  const value = useMemo<Ctx>(() => ({ eventos, registrar }), [eventos, registrar]);
  return <AuditoriaCtx.Provider value={value}>{children}</AuditoriaCtx.Provider>;
}

export function useAuditoria() {
  const ctx = useContext(AuditoriaCtx);
  if (!ctx) throw new Error("useAuditoria deve ser usado dentro de AuditoriaProvider");
  return ctx;
}
