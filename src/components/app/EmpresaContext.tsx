import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { empresas } from "@/lib/mock-data";

type Ctx = {
  empresaId: string;
  setEmpresaId: (id: string) => void;
  nomeAtual: string;
  consolidado: boolean;
};

const EmpresaCtx = createContext<Ctx | null>(null);

export const CONSOLIDADO = "consolidado";

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresaId, setEmpresaId] = useState<string>(empresas[0]!.id);
  const value = useMemo<Ctx>(
    () => ({
      empresaId,
      setEmpresaId,
      consolidado: empresaId === CONSOLIDADO,
      nomeAtual:
        empresaId === CONSOLIDADO
          ? "Visão consolidada do grupo"
          : (empresas.find((e) => e.id === empresaId)?.nome ?? ""),
    }),
    [empresaId],
  );
  return <EmpresaCtx.Provider value={value}>{children}</EmpresaCtx.Provider>;
}

export function useEmpresa() {
  const ctx = useContext(EmpresaCtx);
  if (!ctx) throw new Error("useEmpresa deve ser usado dentro de EmpresaProvider");
  return ctx;
}
