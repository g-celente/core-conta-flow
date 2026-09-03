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
    <header className="mb-lg flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="font-headline-md text-headline-md text-primary">{titulo}</h1>
          {variabilidade ? <VariabilidadeInfo linhas={variabilidade} tela={titulo} /> : null}
          {selo}
        </div>
        {descricao ? (
          <p className="mt-1 max-w-3xl font-body-md text-body-md text-on-surface-variant">
            {descricao}
          </p>
        ) : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-3">{acoes}</div> : null}
    </header>
  );
}
