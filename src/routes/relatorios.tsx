import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { brl, dre, fluxoProjetado, relatorios } from "@/lib/mock-data";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios e exportação — FinCore ERP" },
      {
        name: "description",
        content: "Fluxo de caixa projetado, DRE gerencial e exportação de relatórios consolidados.",
      },
      { property: "og:title", content: "Relatórios e exportação — FinCore ERP" },
      {
        property: "og:description",
        content: "Selecione os relatórios desejados para gerar arquivos consolidados.",
      },
    ],
  }),
  component: Relatorios,
});

const FORMATOS = ["PDF", "XLSX", "CSV", "TXT (contabilidade)"] as const;
const PERIODOS = [
  "Mês atual (junho/2026)",
  "Mês anterior (maio/2026)",
  "Último trimestre",
  "Exercício 2026",
] as const;

const inputCls =
  "w-full appearance-none rounded-lg border border-outline-variant bg-surface px-4 py-2.5 pr-10 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";

function Relatorios() {
  const { has, config } = useFeatures();
  const { perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual, consolidado } = useEmpresa();

  const disponiveis = useMemo(
    () => relatorios.filter((r) => (r.requer ? has(r.requer) : true)),
    [has],
  );

  const [selecionados, setSelecionados] = useState<string[]>(["fluxo"]);
  const [formato, setFormato] = useState<string>(FORMATOS[0]);
  const [periodo, setPeriodo] = useState<string>(PERIODOS[0]);
  const [layoutContabil, setLayoutContabil] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [aba, setAba] = useState<"catalogo" | "fluxo" | "dre">("catalogo");

  const alternar = (id: string) =>
    setSelecionados((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const gerar = () => {
    if (selecionados.length === 0) return;
    setGerando(true);
    const nomes = disponiveis
      .filter((r) => selecionados.includes(r.id))
      .map((r) => r.nome)
      .join(", ");
    registrar({
      tipo: "crud",
      entidade: "Relatório",
      operacao: "Exportar",
      detalhe: `${nomes} · ${formato} · ${periodo}${layoutContabil ? " · layout contábil" : ""}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    window.setTimeout(() => {
      setGerando(false);
      toast.success(`${selecionados.length} relatório(s) gerado(s)`, {
        description: `${formato} · ${periodo}`,
      });
    }, 1200);
  };

  const maiorFluxo = Math.max(...fluxoProjetado.map((f) => Math.max(f.entradas, f.saidas)));

  return (
    <>
      <PageHeader
        titulo="Relatórios e exportação"
        descricao="Selecione os relatórios desejados para gerar arquivos consolidados."
        variabilidade={[
          {
            o_que: "O relatório Contas por centro de custo aparece só com a feature centro_custo.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "O relatório Consolidado do grupo aparece só com multiempresa contratada.",
            por: "feature multiempresa",
            pv: "PV7",
          },
          {
            o_que:
              "O layout de exportação para contabilidade só é oferecido com portal do contador.",
            por: "feature portal_contador",
            pv: "PV4",
          },
          {
            o_que: "O relatório Extrato conciliado exige o módulo de conciliação bancária.",
            por: "feature conciliacao",
            pv: "PV6",
          },
        ]}
        acoes={
          <StatusBadge tone="info">
            {disponiveis.length} de {relatorios.length} relatórios contratados
          </StatusBadge>
        }
      />

      {/* Abas */}
      <div className="mb-lg flex border-b border-outline-variant">
        {(
          [
            { id: "catalogo", label: "Catálogo" },
            { id: "fluxo", label: "Fluxo projetado" },
            { id: "dre", label: "DRE gerencial" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAba(t.id)}
            className={`border-b-2 px-4 py-3 font-label-md text-label-md transition-colors sm:px-6 ${
              aba === t.id
                ? "border-secondary font-bold text-primary"
                : "border-transparent text-on-surface-variant hover:border-outline-variant hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === "catalogo" ? (
        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          {/* Cards de relatório */}
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:col-span-2">
            {disponiveis.map((r) => {
              const ativo = selecionados.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => alternar(r.id)}
                  className={`group relative flex flex-col gap-sm rounded-xl border p-md text-left shadow-sm transition-all ${
                    ativo
                      ? "border-2 border-secondary bg-secondary/5"
                      : "border-outline-variant bg-surface-container-lowest hover:border-secondary/50"
                  }`}
                >
                  <span
                    className={`absolute right-4 top-4 flex size-5 items-center justify-center rounded border-2 transition-colors ${
                      ativo
                        ? "border-secondary bg-secondary"
                        : "border-outline-variant group-hover:border-secondary/50"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[14px] font-bold text-white ${ativo ? "opacity-100" : "opacity-0"}`}
                    >
                      check
                    </span>
                  </span>

                  <span className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                    <span className="material-symbols-outlined">{r.icone}</span>
                  </span>

                  <span className="flex flex-col gap-0.5 pr-8">
                    <span className="font-label-md text-label-md text-primary">{r.nome}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {r.descricao}
                    </span>
                  </span>

                  {r.requer ? (
                    <span className="mt-auto inline-flex w-fit rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[10px] text-secondary">
                      requer {r.requer}
                    </span>
                  ) : (
                    <span className="mt-auto inline-flex w-fit rounded-full bg-surface-container px-2 py-0.5 font-label-md text-[10px] text-on-surface-variant">
                      núcleo
                    </span>
                  )}
                </button>
              );
            })}

            {/* Relatórios não contratados */}
            {relatorios
              .filter((r) => r.requer && !has(r.requer))
              .map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-sm rounded-xl border border-dashed border-outline-variant p-md opacity-60"
                >
                  <span className="mb-1 flex size-10 items-center justify-center rounded-lg bg-surface-container text-outline">
                    <span className="material-symbols-outlined">lock</span>
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {r.nome}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Não contratado neste tenant — depende da feature{" "}
                    <code className="font-data-mono">{r.requer}</code>.
                  </span>
                </div>
              ))}
          </div>

          {/* Painel de exportação */}
          <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              Configurar exportação
            </h3>

            <div>
              <label
                className="mb-1.5 block font-label-md text-label-md text-primary"
                htmlFor="r-per"
              >
                Período de referência
              </label>
              <div className="relative">
                <select
                  id="r-per"
                  className={inputCls}
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  {PERIODOS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <span className="mb-1.5 block font-label-md text-label-md text-primary">
                Formato de arquivo
              </span>
              <div className="grid grid-cols-2 gap-2">
                {FORMATOS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormato(f)}
                    className={`rounded-lg border px-3 py-2 font-label-md text-label-md transition-colors ${
                      formato === f
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout contábil — só com portal do contador (PV4) */}
            {has("portal_contador") ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant p-3 transition-colors hover:bg-surface-container">
                <input
                  type="checkbox"
                  checked={layoutContabil}
                  onChange={(e) => setLayoutContabil(e.target.checked)}
                  className="mt-0.5 size-4 rounded-sm accent-[var(--color-secondary)]"
                />
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary">
                    Arquivo para contabilidade
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Inclui metadados de conciliação no padrão FEBRABAN e o plano de contas
                    correspondente.
                  </span>
                </span>
              </label>
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-dashed border-outline-variant p-3">
                <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  O layout de exportação para contabilidade requer a feature{" "}
                  <code className="font-data-mono">portal_contador</code> (PV4).
                </span>
              </div>
            )}

            <div className="rounded-lg border border-outline-variant bg-surface p-3">
              <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                Escopo
              </p>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface">
                {consolidado && has("multiempresa")
                  ? "Todas as empresas do grupo (visão consolidada)"
                  : nomeAtual}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Perfil de produto {config.perfilProduto} · regime {config.regime}
              </p>
            </div>

            {gerando ? (
              <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
                <p className="mb-2 flex items-center gap-2 font-label-md text-label-md text-primary">
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Exportação em andamento...
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-variant">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-secondary" />
                </div>
              </div>
            ) : null}

            <button
              type="button"
              disabled={selecionados.length === 0 || gerando}
              onClick={gerar}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Gerar {selecionados.length || ""} relatório{selecionados.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      ) : null}

      {aba === "fluxo" ? (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-md py-3">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              Fluxo de caixa projetado — 6 meses
            </h3>
            <div className="flex items-center gap-4 font-body-sm text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="size-3 rounded-sm bg-secondary" /> Entradas
              </span>
              <span className="flex items-center gap-1">
                <span className="size-3 rounded-sm bg-error" /> Saídas
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-md p-md">
            {fluxoProjetado.map((f) => {
              const saldo = f.entradas - f.saidas;
              return (
                <div key={f.mes}>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 font-body-sm text-body-sm">
                    <span className="font-label-md text-label-md text-on-surface">{f.mes}</span>
                    <span className="font-data-mono text-on-surface-variant">
                      {brl(f.entradas)} <span className="text-outline">−</span>{" "}
                      <span className="text-error">{brl(f.saidas)}</span>{" "}
                      <span className="text-outline">=</span>{" "}
                      <span
                        className={saldo >= 0 ? "font-bold text-secondary" : "font-bold text-error"}
                      >
                        {brl(saldo)}
                      </span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 rounded-full bg-surface-variant">
                      <div
                        className="h-2.5 rounded-full bg-secondary"
                        style={{ width: `${(f.entradas / maiorFluxo) * 100}%` }}
                      />
                    </div>
                    <div className="h-2.5 rounded-full bg-surface-variant">
                      <div
                        className="h-2.5 rounded-full bg-error"
                        style={{ width: `${(f.saidas / maiorFluxo) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-low p-md">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Projeção baseada em recorrências, parcelamentos e histórico de recebimento.
            </span>
            <span className="font-data-mono font-bold text-primary">
              {brl(fluxoProjetado.reduce((s, f) => s + f.entradas - f.saidas, 0))}
            </span>
          </div>
        </div>
      ) : null}

      {aba === "dre" ? (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
            DRE gerencial — junho/2026
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Conta</th>
                  <th className="p-3 text-right font-label-md text-label-md text-on-surface-variant">
                    Valor
                  </th>
                  <th className="hidden p-3 text-right font-label-md text-label-md text-on-surface-variant sm:table-cell">
                    % da receita
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {dre.map((l) => {
                  const total = l.tipo === "total";
                  const subtotal = l.tipo === "subtotal";
                  const receita = dre[0]!.valor;
                  return (
                    <tr
                      key={l.conta}
                      className={
                        total
                          ? "bg-secondary/5"
                          : subtotal
                            ? "bg-surface-container-low"
                            : "hover:bg-surface-container"
                      }
                    >
                      <td
                        className={`p-3 font-body-md text-body-md ${
                          total || subtotal ? "font-bold text-primary" : "text-on-surface"
                        }`}
                      >
                        {l.conta}
                      </td>
                      <td
                        className={`p-3 text-right font-data-mono text-data-mono ${
                          l.valor < 0
                            ? "text-error"
                            : total || subtotal
                              ? "font-bold text-secondary"
                              : "text-on-surface"
                        }`}
                      >
                        {brl(l.valor)}
                      </td>
                      <td className="hidden p-3 text-right font-data-mono text-body-sm text-on-surface-variant sm:table-cell">
                        {((Math.abs(l.valor) / receita) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-outline-variant bg-surface-container-low p-md font-body-sm text-body-sm text-on-surface-variant">
            Margem líquida de{" "}
            <strong className="font-data-mono text-secondary">
              {((dre[8]!.valor / dre[0]!.valor) * 100).toFixed(1)}%
            </strong>{" "}
            no período. Estrutura de contas conforme regime {config.regime} (PV1).
          </div>
        </div>
      ) : null}
    </>
  );
}
