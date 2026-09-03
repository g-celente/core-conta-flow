import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import { brl, centrosDeCusto, type RateioLinha } from "@/lib/mock-data";

export const Route = createFileRoute("/rateio")({
  head: () => ({
    meta: [
      { title: "Rateio de título — FinCore ERP" },
      {
        name: "description",
        content: "Distribua o valor de um título entre centros de custo validando a soma de 100%.",
      },
      { property: "og:title", content: "Rateio de título — FinCore ERP" },
      { property: "og:description", content: "Rateio por centro de custo com validação de 100%." },
    ],
  }),
  component: Rateio,
});

function Rateio() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { titulos, editarTitulo } = useDados();

  const elegiveis = titulos.filter((t) => t.status !== "Cancelado");
  const [tituloId, setTituloId] = useState(elegiveis[0]?.id ?? "");
  const titulo = titulos.find((t) => t.id === tituloId);
  const [linhas, setLinhas] = useState<RateioLinha[]>(titulo?.rateio ?? []);

  useEffect(() => {
    setLinhas(titulo?.rateio ?? [{ centroId: centrosDeCusto[0]!.id, percentual: 100 }]);
  }, [titulo]);

  if (!has("centro_custo")) {
    return (
      <>
        <PageHeader
          titulo="Rateio de título"
          descricao="Distribuição do valor de um título entre centros de custo."
          variabilidade={[
            {
              o_que: "A tela e o grupo Custos no menu só existem com a feature centro_custo.",
              por: "feature centro_custo",
              pv: "PV7",
            },
          ]}
        />
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">toggle_off</span>
          <div>
            <p className="font-label-md text-label-md text-primary">
              Centro de custo não contratado
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Ative a feature <code className="font-data-mono">centro_custo</code> em{" "}
              <Link to="/configuracoes" className="text-secondary underline decoration-dotted">
                Features do tenant
              </Link>{" "}
              (PV7) para ratear títulos.
            </p>
          </div>
        </div>
      </>
    );
  }

  const soma = linhas.reduce((s, l) => s + (Number(l.percentual) || 0), 0);
  const ok = soma === 100;
  const valor = titulo?.valor ?? 0;

  const distribuirIgualmente = () => {
    const base = Math.floor(100 / linhas.length);
    const resto = 100 - base * linhas.length;
    setLinhas((l) => l.map((x, i) => ({ ...x, percentual: base + (i === 0 ? resto : 0) })));
  };

  const usarPadrao = () =>
    setLinhas(centrosDeCusto.map((c) => ({ centroId: c.id, percentual: c.rateio })));

  const salvar = () => {
    if (!titulo || !ok) return;
    editarTitulo(
      titulo.id,
      {
        documento: titulo.documento,
        parceiroId: titulo.parceiroId,
        fornecedor: titulo.fornecedor,
        categoria: titulo.categoria,
        vencimento: titulo.vencimento,
        valor: titulo.valor,
        rateio: linhas.map((l) => ({ ...l, percentual: Number(l.percentual) })),
        ...(titulo.parcela ? { parcela: titulo.parcela } : {}),
        ...(titulo.recorrencia ? { recorrencia: titulo.recorrencia } : {}),
      },
      perfil.usuario,
    );
    registrar({
      tipo: "crud",
      entidade: "Rateio",
      operacao: "Salvar",
      detalhe: `${titulo.documento} rateado em ${linhas.length} centro(s): ${linhas
        .map((l) => `${centrosDeCusto.find((c) => c.id === l.centroId)?.codigo} ${l.percentual}%`)
        .join(" · ")}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Rateio salvo", { description: `${titulo.documento} · soma 100% validada.` });
  };

  return (
    <>
      <PageHeader
        titulo="Rateio de título"
        descricao="Distribua o valor entre centros de custo. O rateio só pode ser salvo quando a soma é exatamente 100%."
        variabilidade={[
          {
            o_que:
              "A tela e o grupo Custos no menu só existem com a feature centro_custo contratada.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "A lista de títulos elegíveis vem do tenant selecionado no topo.",
            por: "seletor de empresa",
            pv: "PV7",
          },
          {
            o_que: "O botão Salvar rateio fica oculto no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={<StatusBadge tone={ok ? "ok" : "erro"}>Soma atual: {soma}% de 100%</StatusBadge>}
      />

      {elegiveis.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Nenhum título disponível para rateio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          {/* Título */}
          <div className="flex flex-col gap-md xl:col-span-1">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <label
                htmlFor="r-titulo"
                className="mb-1.5 block font-label-md text-label-md text-on-surface-variant"
              >
                Título a ratear
              </label>
              <select
                id="r-titulo"
                value={tituloId}
                onChange={(e) => setTituloId(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                {elegiveis.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.documento} · {brl(t.valor)}
                  </option>
                ))}
              </select>
            </div>

            {titulo ? (
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
                <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Título selecionado
                </p>
                <p className="mt-1 font-body-lg text-body-lg font-semibold text-primary">
                  {titulo.fornecedor}
                </p>
                <p className="font-data-mono text-body-sm text-on-surface-variant">
                  {titulo.documento} · venc. {titulo.vencimento}
                </p>
                <p className="mt-3 font-data-mono text-display-lg leading-tight text-primary">
                  {brl(titulo.valor)}
                </p>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  {titulo.categoria} · {titulo.status}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface p-md">
              <p className="font-label-md text-label-md text-on-surface-variant">Atalhos</p>
              <button
                type="button"
                onClick={distribuirIgualmente}
                className="rounded-lg border border-outline-variant px-3 py-2 text-left font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
              >
                Distribuir igualmente entre as linhas
              </button>
              <button
                type="button"
                onClick={usarPadrao}
                className="rounded-lg border border-outline-variant px-3 py-2 text-left font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
              >
                Usar o rateio padrão dos centros
              </button>
            </div>
          </div>

          {/* Linhas */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-md py-3">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Distribuição por centro de custo
              </h3>
              <button
                type="button"
                disabled={linhas.length >= centrosDeCusto.length}
                onClick={() =>
                  setLinhas((l) => [
                    ...l,
                    {
                      centroId:
                        centrosDeCusto.find((c) => !l.some((x) => x.centroId === c.id))?.id ??
                        centrosDeCusto[0]!.id,
                      percentual: 0,
                    },
                  ])
                }
                className="flex items-center gap-1 rounded-lg border border-dashed border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Adicionar centro
              </button>
            </div>

            <div className="flex flex-col divide-y divide-outline-variant">
              {linhas.map((l, i) => {
                const centro = centrosDeCusto.find((c) => c.id === l.centroId);
                return (
                  <div key={i} className="flex flex-wrap items-center gap-3 p-md">
                    <select
                      value={l.centroId}
                      onChange={(e) =>
                        setLinhas((s) =>
                          s.map((x, idx) => (idx === i ? { ...x, centroId: e.target.value } : x)),
                        )
                      }
                      className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                    >
                      {centrosDeCusto.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.codigo} — {c.descricao}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={l.percentual}
                        onChange={(e) =>
                          setLinhas((s) =>
                            s.map((x, idx) =>
                              idx === i ? { ...x, percentual: Number(e.target.value) } : x,
                            ),
                          )
                        }
                        className="w-24 accent-[var(--color-secondary)] sm:w-32"
                        aria-label={`Percentual de ${centro?.descricao ?? ""}`}
                      />
                      <div className="relative w-24">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={l.percentual}
                          onChange={(e) =>
                            setLinhas((s) =>
                              s.map((x, idx) =>
                                idx === i ? { ...x, percentual: Number(e.target.value) } : x,
                              ),
                            )
                          }
                          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 pr-7 font-data-mono text-data-mono focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-data-mono text-on-surface-variant">
                          %
                        </span>
                      </div>
                    </div>

                    <span className="w-28 text-right font-data-mono text-data-mono text-on-surface">
                      {brl((valor * (Number(l.percentual) || 0)) / 100)}
                    </span>

                    <button
                      type="button"
                      aria-label="Remover linha"
                      disabled={linhas.length === 1}
                      onClick={() => setLinhas((s) => s.filter((_, idx) => idx !== i))}
                      className="rounded p-1 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Barra de validação */}
            <div className="border-t border-outline-variant bg-surface-container-low p-md">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Validação da soma
                </span>
                <span
                  className={`font-data-mono text-data-mono font-bold ${ok ? "text-secondary" : "text-error"}`}
                >
                  {soma}% · {brl((valor * soma) / 100)} de {brl(valor)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-variant">
                <div
                  className={`h-full rounded-full transition-all ${ok ? "bg-secondary" : soma > 100 ? "bg-error" : "bg-tertiary-fixed-dim"}`}
                  style={{ width: `${Math.min(soma, 100)}%` }}
                />
              </div>
              {!ok ? (
                <p className="mt-2 flex items-center gap-1 font-body-sm text-body-sm text-error">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {soma > 100
                    ? `Reduza ${soma - 100}% para fechar em 100%.`
                    : `Faltam ${100 - soma}% para fechar em 100%.`}
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-1 font-body-sm text-body-sm text-secondary">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Soma válida — o rateio pode ser salvo.
                </p>
              )}
            </div>

            {leitura ? null : (
              <div className="flex justify-end gap-3 border-t border-outline-variant p-md">
                <button
                  type="button"
                  onClick={() => setLinhas(titulo?.rateio ?? [])}
                  className="rounded-lg border border-outline px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
                >
                  Descartar alterações
                </button>
                <button
                  type="button"
                  disabled={!ok}
                  onClick={salvar}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2 font-label-md text-label-md text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-container disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Salvar rateio
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
