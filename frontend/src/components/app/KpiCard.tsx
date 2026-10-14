import type { ComponentType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Card de KPI: rótulo com ícone + número tabular em destaque. */
export function KpiCard({
  rotulo,
  valor,
  icone: Icone,
  corIcone = "text-muted-foreground",
  corValor,
  rodape,
  destaque,
}: {
  rotulo: string;
  valor: string;
  icone: ComponentType<{ className?: string }>;
  corIcone?: string;
  corValor?: string;
  rodape?: ReactNode;
  destaque?: ReactNode;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Icone className={cn("size-4 shrink-0", corIcone)} />
            <span className="truncate">{rotulo}</span>
          </p>
          {destaque}
        </div>
        <p className={cn("num text-2xl font-bold", corValor)}>{valor}</p>
        {rodape ? <p className="mt-2 text-xs text-muted-foreground">{rodape}</p> : null}
      </CardContent>
    </Card>
  );
}
