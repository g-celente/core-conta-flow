import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type LinhaVariabilidade = {
  /** O que muda nesta tela. */
  o_que: string;
  /** Por qual feature ou perfil. */
  por: string;
  /** Ponto de variação (PV1–PV7). */
  pv: string;
};

/**
 * Ícone de informação no canto do cabeçalho que abre um Popover explicando
 * o que varia na tela, por qual feature/perfil e qual o ponto de variação.
 */
export function VariabilidadeInfo({
  linhas,
  tela,
}: {
  linhas: LinhaVariabilidade[];
  tela: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`O que varia na tela ${tela}`}
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Info className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[22rem] p-0">
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">O que varia nesta tela</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Variabilidade aplicada a <strong>{tela}</strong>.
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {linhas.map((l) => (
            <li key={l.o_que} className="flex flex-col gap-1.5 px-4 py-3">
              <span className="text-sm text-foreground">{l.o_que}</span>
              <span className="flex flex-wrap items-center gap-2">
                <span className="num rounded bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground">
                  {l.por}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-semibold text-primary">
                  {l.pv}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
