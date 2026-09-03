import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { brl, contasPorRegime, planoDeContas, type ContaPlano } from "@/lib/mock-data";

export const Route = createFileRoute("/plano-de-contas")({
  head: () => ({
    meta: [
      { title: "Plano de contas — FinCore ERP" },
      {
        name: "description",
        content: "Estrutura hierárquica contábil e gerencial com contas sintéticas e analíticas.",
      },
      { property: "og:title", content: "Plano de contas — FinCore ERP" },
      {
        property: "og:description",
        content: "Árvore de contas sugerida conforme o regime tributário do tenant.",
      },
    ],
  }),
  component: PlanoDeContas,
});

const GRUPOS = ["Ativo", "Passivo", "Receitas", "Despesas"] as const;

const corGrupo: Record<string, string> = {
  Ativo: "bg-primary-fixed-dim",
  Passivo: "bg-tertiary-fixed-dim",
  Receitas: "bg-secondary",
  Despesas: "bg-error",
};

const corCodigo: Record<string, string> = {
  Ativo: "text-primary",
  Passivo: "text-primary",
  Receitas: "text-secondary",
  Despesas: "text-error",
};

function PlanoDeContas() {
  const { leitura } = usePerfil();
  const { config } = useFeatures();

  const [busca, setBusca] = useState("");
  const [colapsados, setColapsados] = useState<string[]>([]);
  const [soAnaliticas, setSoAnaliticas] = useState(false);

  /** PV1: as contas tributárias do regime do tenant entram na árvore. */
  const extras = contasPorRegime[config.regime] ?? [];

  const todas = useMemo<ContaPlano[]>(() => {
    const juntas = [...planoDeContas, ...extras];
    return juntas.sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [extras]);

  const raizDe = (codigo: string) => codigo.split(".")[0] ?? "";

  const visiveis = useMemo(
    () =>
      todas.filter((c) => {
        if (busca && !`${c.codigo} ${c.descricao}`.toLowerCase().includes(busca.toLowerCase()))
          return false;
        if (soAnaliticas && c.tipo !== "ANALÍTICA") return false;
        if (!busca && c.nivel > 0 && colapsados.includes(raizDe(c.codigo))) return false;
        return true;
      }),
    [todas, busca, soAnaliticas, colapsados],
  );

  const alternarGrupo = (raiz: string) =>
    setColapsados((l) => (l.includes(raiz) ? l.filter((x) => x !== raiz) : [...l, raiz]));

  const totais = GRUPOS.map((g) => ({
    grupo: g,
    total: todas.filter((c) => c.grupo === g && c.nivel === 0).reduce((s, c) => s + c.saldo, 0),
    qtd: todas.filter((c) => c.grupo === g).length,
  }));

  return (
    <>
      <PageHeader
        titulo="Plano de contas"
        descricao={`Estrutura hierárquica contábil e gerencial · regime ${config.regime}.`}
        variabilidade={[
          {
            o_que: `As contas tributárias mudam com o regime: ${config.regime} adiciona ${extras.length} conta(s) específica(s).`,
            por: "regime tributário do tenant",
            pv: "PV1",
          },
          {
            o_que: "Ações de nova conta, editar e inativar somem no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
          {
            o_que: "Contas de rateio gerencial só fazem sentido com centro de custo contratado.",
            por: "feature centro_custo",
            pv: "PV7",
          },
        ]}
        acoes={
          <>
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                search
              </span>
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 font-body-md text-body-md text-primary transition-shadow placeholder:text-outline focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                placeholder="Buscar conta ou código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            {leitura ? (
              <StatusBadge tone="info">Somente leitura</StatusBadge>
            ) : (
              <button
                type="button"
                onClick={() =>
                  toast.success("Nova conta analítica criada", {
                    description: "No protótipo a conta é adicionada apenas à sessão atual.",
                  })
                }
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Nova conta
              </button>
            )}
          </>
        }
      />

      {/* Totais por grupo */}
      <div className="mb-md grid grid-cols-2 gap-md lg:grid-cols-4">
        {totais.map((t) => (
          <div
            key={t.grupo}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className={`size-2.5 rounded-sm ${corGrupo[t.grupo]}`} />
              <span className="font-label-md text-label-md text-on-surface-variant">{t.grupo}</span>
            </div>
            <p className="font-data-mono text-body-lg font-medium text-primary">{brl(t.total)}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t.qtd} contas</p>
          </div>
        ))}
      </div>

      {/* Árvore */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              {visiveis.length} contas exibidas
            </span>
            <label className="flex cursor-pointer items-center gap-2 font-label-md text-label-md text-on-surface-variant">
              <input
                type="checkbox"
                checked={soAnaliticas}
                onChange={(e) => setSoAnaliticas(e.target.checked)}
                className="size-4 rounded-sm accent-[var(--color-secondary)]"
              />
              Só analíticas
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setColapsados([])}
              className="rounded-lg border border-outline-variant px-3 py-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              Expandir tudo
            </button>
            <button
              type="button"
              onClick={() => setColapsados(["1", "2", "3", "4"])}
              className="rounded-lg border border-outline-variant px-3 py-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              Colapsar tudo
            </button>
          </div>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="hidden items-center border-b border-outline-variant bg-surface-container-low px-4 py-3 md:flex">
          <div className="w-8 shrink-0" />
          <div className="w-32 shrink-0 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Código
          </div>
          <div className="flex-1 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Descrição da conta
          </div>
          <div className="w-28 shrink-0 text-center font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Tipo
          </div>
          <div className="w-40 shrink-0 text-right font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Saldo atual
          </div>
          <div className="w-20 shrink-0" />
        </div>

        <div className="flex flex-col divide-y divide-surface-variant">
          {visiveis.map((c) => {
            const sintetica = c.tipo === "SINTÉTICA";
            const raiz = raizDe(c.codigo);
            const colapsado = colapsados.includes(raiz);
            const doRegime = extras.some((x) => x.codigo === c.codigo);
            return (
              <div
                key={c.codigo}
                className="group relative flex flex-wrap items-center gap-y-1 px-4 py-3 transition-colors hover:bg-surface-container md:flex-nowrap"
                style={{ paddingLeft: `${16 + c.nivel * 28}px` }}
              >
                {c.nivel === 0 ? (
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-r ${corGrupo[c.grupo]} opacity-60`}
                  />
                ) : null}

                {c.nivel === 0 ? (
                  <button
                    type="button"
                    onClick={() => alternarGrupo(raiz)}
                    aria-label={colapsado ? "Expandir grupo" : "Colapsar grupo"}
                    className="flex w-8 shrink-0 items-center justify-center text-outline transition-colors hover:text-primary"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${colapsado ? "-rotate-90" : ""}`}
                    >
                      expand_more
                    </span>
                  </button>
                ) : (
                  <div className="flex w-8 shrink-0 items-center justify-center">
                    {sintetica ? (
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        subdirectory_arrow_right
                      </span>
                    ) : (
                      <span className="size-1.5 rounded-full bg-outline-variant" />
                    )}
                  </div>
                )}

                <div
                  className={`w-32 shrink-0 font-data-mono text-data-mono ${
                    sintetica ? `font-semibold ${corCodigo[c.grupo]}` : "text-on-surface-variant"
                  }`}
                >
                  {c.codigo}
                </div>

                <div
                  className={`min-w-0 flex-1 pr-3 font-body-md text-body-md ${
                    sintetica ? "font-semibold text-primary" : "text-on-surface"
                  }`}
                >
                  {c.descricao}
                  {doRegime ? (
                    <span className="ml-2 rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[10px] text-secondary">
                      {config.regime} · PV1
                    </span>
                  ) : null}
                </div>

                <div className="w-28 shrink-0 text-center">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                      sintetica
                        ? "bg-surface-variant text-on-surface-variant"
                        : "border border-outline-variant text-on-surface-variant"
                    }`}
                  >
                    {c.tipo}
                  </span>
                </div>

                <div
                  className={`w-40 shrink-0 text-right font-data-mono text-data-mono ${
                    sintetica ? `font-semibold ${corCodigo[c.grupo]}` : "text-on-surface"
                  }`}
                >
                  {brl(c.saldo)}
                </div>

                <div className="flex w-20 shrink-0 items-center justify-end gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  {leitura ? null : (
                    <>
                      {sintetica ? (
                        <button
                          type="button"
                          title="Incluir subconta"
                          onClick={() => toast.success(`Subconta criada sob ${c.codigo}`)}
                          className="flex size-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      ) : null}
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => toast.info(`Editando conta ${c.codigo}`)}
                        className="flex size-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      {!sintetica ? (
                        <button
                          type="button"
                          title="Inativar"
                          onClick={() =>
                            toast.warning(`Conta ${c.codigo} inativada`, {
                              description: "Contas com saldo não podem ser excluídas.",
                            })
                          }
                          className="flex size-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                        >
                          <span className="material-symbols-outlined text-[18px]">block</span>
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {visiveis.length === 0 ? (
            <div className="p-8 text-center font-body-md text-body-md text-on-surface-variant">
              Nenhuma conta encontrada.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
