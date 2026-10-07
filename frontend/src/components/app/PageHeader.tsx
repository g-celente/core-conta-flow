import type { ReactNode } from "react";
import { VariabilidadeInfo, type LinhaVariabilidade } from "./VariabilidadeInfo";

export function PageHeader({
  titulo,
  descricao,
  acoes,
  variabilidade,
  selo,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  /** Explicação do que varia nesta tela (Parte III, ponto 4). */
  variabilidade?: LinhaVariabilidade[];
  selo?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-[1.7rem]">{titulo}</h1>
          {variabilidade ? <VariabilidadeInfo linhas={variabilidade} tela={titulo} /> : null}
          {selo}
        </div>
        {descricao ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{descricao}</p>
        ) : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </header>
  );
}
