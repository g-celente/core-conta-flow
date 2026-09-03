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
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container hover:text-secondary"
        >
          <span className="material-symbols-outlined text-[20px]">info</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[22rem] border-outline-variant bg-surface-container-lowest p-0"
      >
        <div className="border-b border-outline-variant bg-surface px-4 py-3">
          <p className="font-label-md text-label-md text-primary">O que varia nesta tela</p>
          <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
            Variabilidade aplicada a <strong>{tela}</strong>.
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-outline-variant">
          {linhas.map((l) => (
            <li key={l.o_que} className="flex flex-col gap-1 px-4 py-3">
              <span className="font-body-md text-body-md text-on-surface">{l.o_que}</span>
              <span className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-surface-container px-1.5 py-0.5 font-data-mono text-[11px] text-on-surface-variant">
                  {l.por}
                </span>
                <span className="rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[11px] text-secondary">
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
