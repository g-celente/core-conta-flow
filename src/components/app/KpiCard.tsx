import type { ReactNode } from "react";

/** Card de KPI no padrão do FinCore: rótulo com ícone + número em mono grande. */
export function KpiCard({
  rotulo,
  valor,
  icone,
  corIcone = "text-on-surface-variant",
  corValor = "text-primary",
  rodape,
  destaque,
}: {
  rotulo: string;
  valor: string;
  icone: string;
  corIcone?: string;
  corValor?: string;
  rodape?: ReactNode;
  destaque?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <span className={`material-symbols-outlined text-[18px] ${corIcone}`}>{icone}</span>
          <span className="truncate">{rotulo}</span>
        </div>
        {destaque}
      </div>
      <div
        className={`font-data-mono text-[clamp(1.4rem,4vw,2rem)] leading-tight tracking-tight ${corValor}`}
      >
        {valor}
      </div>
      {rodape ? (
        <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{rodape}</div>
      ) : null}
    </div>
  );
}
