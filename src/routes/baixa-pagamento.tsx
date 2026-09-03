import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { brl, centrosDeCusto, contasBancarias } from "@/lib/mock-data";

export const Route = createFileRoute("/baixa-pagamento")({
  validateSearch: (search: Record<string, unknown>): { titulo?: string } => ({
    ...(typeof search["titulo"] === "string" ? { titulo: search["titulo"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Baixa de pagamento — FinCore ERP" },
      {
        name: "description",
        content: "Liquide títulos informando juros, desconto, conta de saída e forma de pagamento.",
      },
      { property: "og:title", content: "Baixa de pagamento — FinCore ERP" },
      {
        property: "og:description",
        content: "Baixa total ou parcial com cálculo automático do valor devido.",
      },
    ],
  }),
  component: BaixaPagamento,
});

const FORMAS = ["PIX", "TED", "Boleto bancário", "Débito automático"];

const labelCls = "mb-1 block font-label-md text-label-md text-on-surface-variant";

function BaixaPagamento() {
  const router = useRouter();
  const { titulo: tituloId } = Route.useSearch();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { has } = useFeatures();
  const { titulos, baixarTitulo } = useDados();

  const abertos = useMemo(
    () => titulos.filter((t) => t.status !== "Pago" && t.status !== "Cancelado"),
    [titulos],
  );

  const [selecionado, setSelecionado] = useState<string>(
    tituloId && titulos.some((t) => t.id === tituloId) ? tituloId : (abertos[0]?.id ?? ""),
  );
  const [juros, setJuros] = useState("0");
  const [desconto, setDesconto] = useState("0");
  const [valorPago, setValorPago] = useState<string>("");
  const [conta, setConta] = useState(contasBancarias[0]!);
  const [forma, setForma] = useState(FORMAS[0]!);
  const [data, setData] = useState("2026-06-30");

  const titulo = titulos.find((t) => t.id === selecionado);
  const jurosNum = Number(juros.replace(",", ".")) || 0;
  const descontoNum = Number(desconto.replace(",", ".")) || 0;
  const totalCalculado = titulo ? titulo.valor + jurosNum - descontoNum : 0;
  const pagoNum = valorPago === "" ? totalCalculado : Number(valorPago.replace(",", ".")) || 0;
  const remanescente = +(totalCalculado - pagoNum).toFixed(2);
  const parcial = remanescente > 0.009;

  const confirmar = () => {
    if (!titulo || pagoNum <= 0) return;
    baixarTitulo(
      titulo.id,
      {
        data: data.split("-").reverse().join("/"),
        valorPago: pagoNum,
        juros: jurosNum,
        desconto: descontoNum,
        conta,
      },
      perfil.usuario,
    );
    registrar({
      tipo: "crud",
      entidade: "Título a pagar",
      operacao: "Baixa",
      detalhe: `${titulo.documento} liquidado por ${brl(pagoNum)} via ${forma} (${conta})${
        parcial ? ` · saldo remanescente ${brl(remanescente)}` : ""
      }`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Baixa registrada", {
      description: parcial
        ? `Saldo de ${brl(remanescente)} mantido em aberto.`
        : `${titulo.documento} liquidado integralmente.`,
    });
    void router.navigate({ to: "/contas-a-pagar" });
  };

  if (leitura) {
    return (
      <>
        <PageHeader
          titulo="Baixa de pagamento"
          descricao="Liquidação de títulos a pagar."
          variabilidade={[
            {
              o_que: "A tela inteira fica indisponível para perfis somente leitura.",
              por: "perfil Contador externo",
              pv: "PV4",
            },
          ]}
        />
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">lock</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            O perfil <strong>{perfil.nome}</strong> não executa baixas. Consulte o histórico de
            liquidações em Contas a pagar.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Baixa de pagamento"
        descricao="Registre a liquidação com juros, desconto e conta de saída."
        variabilidade={[
          {
            o_que:
              "O rateio exibido no resumo do título só aparece com centro de custo contratado.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "A lista de contas de saída vem do cadastro bancário definido no onboarding.",
            por: "adaptador bancário do tenant",
            pv: "PV2",
          },
          {
            o_que: "A tela é inacessível para perfis somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
      />

      {abertos.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-secondary">task_alt</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Nenhum título em aberto para liquidar.
          </p>
        </div>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          {/* Seletor de título */}
          <div className="flex flex-col gap-3 border-b border-outline-variant p-md sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className={labelCls} htmlFor="b-titulo">
                Título a liquidar
              </label>
              <select
                id="b-titulo"
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                value={selecionado}
                onChange={(e) => {
                  setSelecionado(e.target.value);
                  setValorPago("");
                  setJuros("0");
                  setDesconto("0");
                }}
              >
                {abertos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.documento} · {t.fornecedor} · {brl(t.valor)}
                  </option>
                ))}
              </select>
            </div>
            {titulo ? (
              <StatusBadge tone={titulo.status === "Atrasado" ? "erro" : "neutro"}>
                {titulo.status} · venc. {titulo.vencimento}
              </StatusBadge>
            ) : null}
          </div>

          {titulo ? (
            <>
              {/* Beneficiário */}
              <div className="flex flex-col justify-between gap-4 border-b border-outline-variant bg-surface p-md sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <span className="material-symbols-outlined filled">domain</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                      Beneficiário
                    </p>
                    <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                      {titulo.fornecedor}
                    </p>
                    <p className="font-data-mono text-body-sm text-on-surface-variant">
                      Documento {titulo.documento} · {titulo.categoria}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Valor original
                  </p>
                  <p className="font-data-mono text-display-lg tracking-tight text-primary">
                    {brl(titulo.valor)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-lg p-md lg:grid-cols-12 md:p-lg">
                {/* Acréscimos e deduções */}
                <section className="flex flex-col gap-md lg:col-span-5">
                  <h2 className="border-b border-outline-variant pb-2 font-label-md text-label-md uppercase tracking-wider text-primary">
                    Acréscimos e deduções
                  </h2>
                  <div className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
                    <div>
                      <label className={labelCls} htmlFor="b-juros">
                        Juros / multa (+)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-mono text-on-surface-variant">
                          R$
                        </span>
                        <input
                          id="b-juros"
                          inputMode="decimal"
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-3 font-data-mono text-data-mono transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                          value={juros}
                          onChange={(e) => setJuros(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="b-desc">
                        Desconto (−)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-mono text-on-surface-variant">
                          R$
                        </span>
                        <input
                          id="b-desc"
                          inputMode="decimal"
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-3 font-data-mono text-data-mono transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                          value={desconto}
                          onChange={(e) => setDesconto(e.target.value)}
                        />
                      </div>
                    </div>
                    <hr className="border-dashed border-outline-variant" />
                    <div className="flex items-center justify-between gap-3 rounded bg-surface-container p-3">
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        Total calculado
                      </span>
                      <span className="font-data-mono text-data-mono font-bold text-primary">
                        {brl(totalCalculado)}
                      </span>
                    </div>
                  </div>

                  {/* Rateio — só com centro de custo */}
                  {has("centro_custo") ? (
                    <div className="rounded-lg border border-outline-variant bg-surface p-md">
                      <h3 className="mb-2 flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">call_split</span>
                        Rateio do título
                      </h3>
                      <ul className="flex flex-col gap-1.5">
                        {titulo.rateio.map((r) => {
                          const c = centrosDeCusto.find((x) => x.id === r.centroId);
                          return (
                            <li
                              key={r.centroId}
                              className="flex items-center justify-between gap-2 font-body-sm text-body-sm"
                            >
                              <span className="text-on-surface">
                                <span className="font-data-mono text-on-surface-variant">
                                  {c?.codigo}
                                </span>{" "}
                                {c?.descricao}
                              </span>
                              <span className="font-data-mono text-on-surface-variant">
                                {r.percentual}% · {brl((pagoNum * r.percentual) / 100)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </section>

                {/* Dados da efetivação */}
                <section className="flex flex-col gap-md lg:col-span-7">
                  <h2 className="border-b border-outline-variant pb-2 font-label-md text-label-md uppercase tracking-wider text-primary">
                    Dados da efetivação
                  </h2>
                  <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls} htmlFor="b-data">
                          Data de pagamento *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                            calendar_today
                          </span>
                          <input
                            id="b-data"
                            type="date"
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-3 font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className={labelCls} htmlFor="b-pago">
                          Valor pago efetivamente *
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-data-mono text-[20px] font-medium text-on-surface-variant">
                            R$
                          </span>
                          <input
                            id="b-pago"
                            inputMode="decimal"
                            placeholder={totalCalculado.toFixed(2)}
                            className="block w-full rounded-lg border-2 border-outline bg-surface-container-lowest py-4 pl-14 pr-4 font-data-mono text-[24px] font-semibold text-on-surface shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
                            value={valorPago}
                            onChange={(e) => setValorPago(e.target.value)}
                          />
                        </div>
                        {parcial ? (
                          <div className="mt-3 flex items-start gap-2 rounded-lg border border-tertiary-fixed-dim bg-tertiary-fixed p-3">
                            <span className="material-symbols-outlined text-[20px] text-on-tertiary-fixed-variant">
                              info
                            </span>
                            <div>
                              <p className="font-label-md text-label-md text-on-tertiary-fixed-variant">
                                Pagamento parcial detectado
                              </p>
                              <p className="mt-0.5 font-body-sm text-body-sm text-on-tertiary-fixed-variant">
                                Um saldo remanescente de{" "}
                                <strong className="font-data-mono">{brl(remanescente)}</strong> será
                                mantido em aberto para este título.
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls} htmlFor="b-conta">
                          Conta de saída *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                            account_balance
                          </span>
                          <select
                            id="b-conta"
                            className="block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-10 font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                            value={conta}
                            onChange={(e) => setConta(e.target.value)}
                          >
                            {contasBancarias.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                            arrow_drop_down
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className={labelCls} htmlFor="b-forma">
                          Forma de pagamento *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                            payments
                          </span>
                          <select
                            id="b-forma"
                            className="block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-10 font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                            value={forma}
                            onChange={(e) => setForma(e.target.value)}
                          >
                            {FORMAS.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                            arrow_drop_down
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Rodapé */}
              <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-md py-4 md:px-lg">
                <span className="mr-auto hidden font-body-sm text-body-sm text-on-surface-variant sm:block">
                  Ações de baixa são irreversíveis após confirmação.
                </span>
                <button
                  type="button"
                  onClick={() => void router.navigate({ to: "/contas-a-pagar" })}
                  className="rounded-lg border border-primary px-6 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={pagoNum <= 0}
                  onClick={confirmar}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2 font-label-md text-label-md text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-container disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Confirmar baixa
                </button>
              </footer>
            </>
          ) : null}
        </div>
      )}
    </>
  );
}
