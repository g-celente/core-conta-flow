import { useMemo, useState } from "react";
import { toast } from "sonner";
import { calcularComissoes, competencias, type LinhaComissao } from "./dados";
import type { PortaNucleo } from "./tipos";

/**
 * Tela do módulo exclusivo. Recebe a porta do núcleo por props — não importa
 * nenhum contexto nem tipo do núcleo, o que mantém a fronteira de isolamento.
 */

const moeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function TelaComissoes({ porta }: { porta: PortaNucleo }) {
  const [competencia, setCompetencia] = useState(competencias[0]!.id);
  const [linhas, setLinhas] = useState<LinhaComissao[]>(() =>
    calcularComissoes(competencias[0]!.id),
  );
  const [selecionadas, setSelecionadas] = useState<string[]>([]);

  const trocarCompetencia = (id: string) => {
    setCompetencia(id);
    setLinhas(calcularComissoes(id));
    setSelecionadas([]);
  };

  const rotuloCompetencia = competencias.find((c) => c.id === competencia)?.rotulo ?? competencia;

  const totais = useMemo(
    () => ({
      recebido: linhas.reduce((s, l) => s + l.recebido, 0),
      comissao: linhas.reduce((s, l) => s + l.comissao, 0),
      aprovadas: linhas.filter((l) => l.status !== "A aprovar").length,
    }),
    [linhas],
  );

  const aprovar = (ids: string[]) => {
    if (ids.length === 0) return;
    setLinhas((l) =>
      l.map((x) =>
        ids.includes(x.vendedorId) && x.status === "A aprovar" ? { ...x, status: "Aprovada" } : x,
      ),
    );
    porta.auditar(
      "Aprovar comissão",
      `${ids.length} comissão(ões) aprovada(s) na competência ${rotuloCompetencia}`,
    );
    toast.success(`${ids.length} comissão(ões) aprovada(s)`);
    setSelecionadas([]);
  };

  const gerarTitulo = () => {
    const aprovadas = linhas.filter((l) => l.status === "Aprovada" && l.comissao > 0);
    if (aprovadas.length === 0) {
      toast.error("Nenhuma comissão aprovada", {
        description: "Aprove ao menos uma linha antes de gerar o título.",
      });
      return;
    }
    const valor = +aprovadas.reduce((s, l) => s + l.comissao, 0).toFixed(2);
    const criado = porta.lancarTitulo({
      documento: `COM-${competencia.replace("-", "")}`,
      fornecedor: `Comissões de vendas — ${rotuloCompetencia}`,
      valor,
      vencimento: "10/07/2026",
      categoria: "Comissões",
      origem: "Módulo de comissões",
    });
    setLinhas((l) =>
      l.map((x) => (x.status === "Aprovada" ? { ...x, status: "Título gerado" } : x)),
    );
    porta.auditar(
      "Gerar título de comissão",
      `Título ${criado.documento} de ${moeda(valor)} criado a partir de ${aprovadas.length} comissão(ões)`,
    );
    toast.success(`Título ${criado.documento} criado em Contas a pagar`, {
      description: `${moeda(valor)} · vencimento 10/07/2026 · categoria Comissões.`,
    });
  };

  const todasSelecionaveis = linhas
    .filter((l) => l.status === "A aprovar")
    .map((l) => l.vendedorId);

  return (
    <>
      {/* Seletor de competência e regra */}
      <div className="mb-lg grid grid-cols-1 gap-md lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <label
            htmlFor="comp"
            className="mb-1.5 block font-label-md text-label-md text-on-surface-variant"
          >
            Competência
          </label>
          <select
            id="comp"
            value={competencia}
            onChange={(e) => trocarCompetencia(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          >
            {competencias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.rotulo}
              </option>
            ))}
          </select>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
            {linhas.length} vendedores comissionados nesta competência.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <p className="mb-1 flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">functions</span>
            Regra de cálculo
          </p>
          <p className="font-body-md text-body-md text-on-surface">
            Percentual contratado <strong>sobre o valor de títulos recebidos no mês</strong>.
            Títulos cancelados e não liquidados ficam fora da base.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <p className="mb-1 flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Total de comissões
          </p>
          <p className="font-data-mono text-[clamp(1.4rem,4vw,2rem)] leading-tight text-secondary">
            {moeda(totais.comissao)}
          </p>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Base recebida {moeda(totais.recebido)} · {totais.aprovadas} de {linhas.length} aprovadas
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-md py-3">
          <h3 className="font-headline-sm text-headline-sm text-primary">
            Comissões de {rotuloCompetencia}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={selecionadas.length === 0}
              onClick={() => aprovar(selecionadas)}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              Aprovar selecionadas ({selecionadas.length})
            </button>
            <button
              type="button"
              onClick={gerarTitulo}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-1.5 font-label-md text-label-md text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-container"
            >
              <span className="material-symbols-outlined text-[16px]">post_add</span>
              Gerar título a pagar (comissão)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="w-12 p-3 pl-4">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todas"
                    className="size-4 rounded-sm accent-[var(--color-secondary)]"
                    checked={
                      todasSelecionaveis.length > 0 &&
                      selecionadas.length === todasSelecionaveis.length
                    }
                    onChange={(e) => setSelecionadas(e.target.checked ? todasSelecionaveis : [])}
                  />
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                  Vendedor
                </th>
                <th className="p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Recebido
                </th>
                <th className="w-20 p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  %
                </th>
                <th className="p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Comissão
                </th>
                <th className="w-40 p-3 text-center font-label-md text-label-md text-on-surface-variant">
                  Status
                </th>
                <th className="w-28 p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
              {linhas.map((l) => {
                const podeAprovar = l.status === "A aprovar";
                return (
                  <tr
                    key={l.vendedorId}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="p-3 pl-4">
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${l.vendedor}`}
                        disabled={!podeAprovar}
                        className="size-4 rounded-sm accent-[var(--color-secondary)] disabled:opacity-30"
                        checked={selecionadas.includes(l.vendedorId)}
                        onChange={(e) =>
                          setSelecionadas((s) =>
                            e.target.checked
                              ? [...s, l.vendedorId]
                              : s.filter((x) => x !== l.vendedorId),
                          )
                        }
                      />
                    </td>
                    <td className="p-3">
                      <span className="block font-medium text-primary">{l.vendedor}</span>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant">
                        {l.equipe}
                      </span>
                    </td>
                    <td className="p-3 text-right font-data-mono text-data-mono text-on-surface">
                      {moeda(l.recebido)}
                    </td>
                    <td className="p-3 text-right font-data-mono text-data-mono text-on-surface-variant">
                      {l.percentual}%
                    </td>
                    <td className="p-3 text-right font-data-mono text-data-mono font-bold text-secondary">
                      {moeda(l.comissao)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 font-label-md text-[11px] ${
                          l.status === "A aprovar"
                            ? "bg-tertiary-fixed text-on-tertiary-fixed"
                            : l.status === "Aprovada"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-primary-fixed text-on-primary-fixed-variant"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {podeAprovar ? (
                        <button
                          type="button"
                          onClick={() => aprovar([l.vendedorId])}
                          className="rounded p-1 text-on-surface-variant transition-colors hover:bg-secondary/10 hover:text-secondary"
                          title="Aprovar comissão"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            check_circle
                          </span>
                        </button>
                      ) : (
                        <span className="font-body-sm text-body-sm text-outline">Finalizada</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low p-md">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {linhas.length} vendedores · competência {rotuloCompetencia}
          </span>
          <div className="flex items-center gap-6">
            <span className="flex flex-col text-right">
              <span className="font-body-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Base recebida
              </span>
              <span className="font-data-mono font-bold text-primary">
                {moeda(totais.recebido)}
              </span>
            </span>
            <span className="hidden h-8 w-px bg-outline-variant sm:block" />
            <span className="flex flex-col text-right">
              <span className="font-body-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Total de comissões
              </span>
              <span className="font-data-mono text-body-lg font-bold text-secondary">
                {moeda(totais.comissao)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Fronteiras de isolamento */}
      <div className="mt-lg overflow-hidden rounded-xl border-2 border-error-container bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-3 border-b border-outline-variant bg-error-container/20 px-md py-3">
          <span className="material-symbols-outlined text-error">workspace_premium</span>
          <h3 className="font-headline-sm text-headline-sm text-primary">
            Fronteiras de isolamento do módulo
          </h3>
        </div>
        <ul className="grid gap-md p-md sm:grid-cols-2">
          {[
            {
              icone: "folder_special",
              titulo: "Pacote separado",
              texto:
                "Todo o código vive em src/modules/comissoes/ — rota, componentes, dados e tipos. Nenhum arquivo do núcleo importa desta pasta.",
            },
            {
              icone: "table",
              titulo: "Tabela própria",
              texto:
                "O cadastro de vendedores, percentuais e recebimentos por competência está em modules/comissoes/dados.ts, fora de src/lib/mock-data.ts.",
            },
            {
              icone: "cable",
              titulo: "Leitura via interface do núcleo",
              texto:
                "O módulo declara a porta PortaNucleo em tipos.ts. A rota injeta a implementação; o módulo nunca conhece TituloPagar nem os contextos do núcleo.",
            },
            {
              icone: "toggle_on",
              titulo: "Rota condicional",
              texto:
                "A rota /comissoes só renderiza a tela quando a flag mod_comissoes está ativa. Em qualquer outro tenant, redireciona para o dashboard com aviso.",
            },
          ].map((c) => (
            <li
              key={c.titulo}
              className="flex gap-3 rounded-lg border border-outline-variant bg-surface p-3"
            >
              <span className="material-symbols-outlined text-secondary">{c.icone}</span>
              <span>
                <span className="block font-label-md text-label-md text-primary">{c.titulo}</span>
                <span className="mt-0.5 block font-body-sm text-body-sm text-on-surface-variant">
                  {c.texto}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
