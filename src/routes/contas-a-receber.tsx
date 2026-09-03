import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, tomDoStatus, type Tone } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { brl, faixasAging, titulosReceber } from "@/lib/mock-data";

export const Route = createFileRoute("/contas-a-receber")({
  head: () => ({
    meta: [
      { title: "Contas a receber — FinCore ERP" },
      {
        name: "description",
        content: "Análise de inadimplência com aging de carteira e detalhamento por cliente.",
      },
      { property: "og:title", content: "Contas a receber — FinCore ERP" },
      {
        property: "og:description",
        content: "Contas a receber detalhadas por período de atraso.",
      },
    ],
  }),
  component: ContasAReceber,
});

const tomFaixa: Record<string, Tone> = {
  ok: "ok",
  atencao: "atencao",
  erro: "erro",
  critico: "critico",
};

const corIconeFaixa: Record<string, string> = {
  ok: "text-secondary",
  atencao: "text-on-tertiary-container",
  erro: "text-error",
  critico: "text-error",
};

function ContasAReceber() {
  const { leitura } = usePerfil();
  const { has } = useFeatures();

  const [busca, setBusca] = useState("");
  const [faixa, setFaixa] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const naFaixa = (atraso: number, id: string) => {
    const f = faixasAging.find((x) => x.id === id);
    if (!f) return true;
    return atraso >= f.min && atraso <= f.max;
  };

  const agregado = useMemo(
    () =>
      faixasAging.map((f) => {
        const itens = titulosReceber.filter(
          (t) => t.status !== "Recebido" && t.atraso >= f.min && t.atraso <= f.max,
        );
        return {
          ...f,
          total: itens.reduce((s, t) => s + t.valor, 0),
          qtd: itens.length,
        };
      }),
    [],
  );

  const lista = useMemo(
    () =>
      titulosReceber.filter((t) => {
        if (
          busca &&
          !`${t.cliente} ${t.documento} ${t.categoria}`.toLowerCase().includes(busca.toLowerCase())
        )
          return false;
        if (status && t.status !== status) return false;
        if (faixa && (t.status === "Recebido" || !naFaixa(t.atraso, faixa))) return false;
        return true;
      }),
    [busca, status, faixa],
  );

  const totalCarteira = lista.reduce((s, t) => s + t.valor, 0);
  const totalAtraso = lista
    .filter((t) => t.status === "Em atraso")
    .reduce((s, t) => s + t.valor, 0);

  const filtros = [
    status ? { id: "st", rotulo: "Status", valor: status, limpar: () => setStatus(null) } : null,
    faixa
      ? {
          id: "fx",
          rotulo: "Aging",
          valor: faixasAging.find((f) => f.id === faixa)?.rotulo ?? "",
          limpar: () => setFaixa(null),
        }
      : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  return (
    <>
      <PageHeader
        titulo="Contas a receber"
        descricao="Análise de inadimplência — contas a receber detalhadas por período de atraso."
        variabilidade={[
          {
            o_que:
              "Clicar num bloco de aging filtra a tabela; os blocos são o mesmo dado do KPI de inadimplência do dashboard.",
            por: "núcleo",
            pv: "núcleo",
          },
          {
            o_que: "A ação Cobrar/registrar recebimento fica oculta no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
          {
            o_que:
              "Notificações de cobrança por push só são oferecidas quando a feature está ativa.",
            por: "feature notificacoes_push",
            pv: "PV5",
          },
        ]}
        acoes={leitura ? <StatusBadge tone="info">Somente leitura</StatusBadge> : null}
      />

      {/* Blocos de aging */}
      <div className="mb-lg grid grid-cols-2 gap-md md:grid-cols-3 xl:grid-cols-5">
        {agregado.map((f) => {
          const ativo = faixa === f.id;
          const critico = f.tom === "critico";
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFaixa(ativo ? null : f.id)}
              className={`rounded-xl border p-md text-left shadow-sm transition-all ${
                critico
                  ? "border-error-container bg-error-container/20"
                  : "border-outline-variant bg-surface-container-lowest"
              } ${ativo ? "ring-2 ring-secondary" : "hover:border-secondary/50"}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3
                  className={`font-label-md text-label-md ${critico ? "text-error" : "text-on-surface-variant"}`}
                >
                  {f.rotulo}
                </h3>
                <span
                  className={`material-symbols-outlined opacity-80 ${corIconeFaixa[f.tom] ?? ""}`}
                >
                  {f.icone}
                </span>
              </div>
              <div
                className={`mb-1 font-data-mono text-[clamp(1.2rem,3.5vw,1.75rem)] leading-tight ${critico ? "text-error" : "text-primary"}`}
              >
                {brl(f.total)}
              </div>
              <div
                className={`font-body-sm text-body-sm ${critico ? "text-error" : "text-on-surface-variant"}`}
              >
                {f.qtd} título{f.qtd === 1 ? "" : "s"}
                {critico && f.qtd > 0 ? " críticos" : ""}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-md border-b border-outline-variant bg-surface-container-low p-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 self-center font-label-md text-label-md text-on-surface-variant">
              Filtros:
            </span>
            {filtros.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={f.limpar}
                className="flex items-center gap-1 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 font-label-md text-label-md text-secondary transition-colors hover:bg-secondary/20"
              >
                {f.rotulo}: {f.valor}
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            ))}
            {(["A vencer", "Em atraso", "Recebido"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(status === s ? null : s)}
                className={`rounded-full border px-3 py-1 font-label-md text-label-md transition-colors ${
                  status === s
                    ? "border-secondary bg-secondary text-on-secondary"
                    : "border-outline-variant bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-1.5 pl-8 pr-3 font-body-sm text-body-sm transition-all focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              placeholder="Buscar documento ou cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
              <tr>
                <th className="w-28 whitespace-nowrap p-3 font-semibold">Vencimento</th>
                <th className="p-3 font-semibold">Cliente</th>
                <th className="w-32 p-3 font-semibold">Documento</th>
                <th className="hidden w-40 p-3 font-semibold lg:table-cell">Categoria</th>
                <th className="w-32 p-3 text-right font-semibold">Valor</th>
                <th className="w-36 p-3 text-center font-semibold">Aging</th>
                {leitura ? null : <th className="w-24 p-3 text-right font-semibold">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-body-md text-on-surface">
              {lista.map((t) => {
                const critico = t.atraso > 90;
                const atrasado = t.status === "Em atraso";
                return (
                  <tr
                    key={t.id}
                    className={`group transition-colors hover:bg-surface-container ${critico ? "bg-error-container/10" : ""}`}
                  >
                    <td
                      className={`whitespace-nowrap p-3 font-data-mono ${
                        atrasado
                          ? critico
                            ? "font-bold text-error"
                            : "font-medium text-error"
                          : ""
                      }`}
                    >
                      {t.vencimento}
                    </td>
                    <td
                      className={`p-3 font-medium ${critico ? "font-bold text-error" : "text-primary"}`}
                    >
                      {t.cliente}
                    </td>
                    <td className="p-3 font-data-mono text-on-surface-variant">{t.documento}</td>
                    <td className="hidden p-3 text-on-surface-variant lg:table-cell">
                      {t.categoria}
                    </td>
                    <td
                      className={`p-3 text-right font-data-mono font-medium ${critico ? "font-bold text-error" : ""}`}
                    >
                      {brl(t.valor)}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge tone={critico ? "critico" : tomDoStatus(t.status)}>
                        {t.status === "Recebido"
                          ? "Recebido"
                          : t.atraso > 0
                            ? `${t.atraso} dias atraso`
                            : "A vencer"}
                      </StatusBadge>
                    </td>
                    {leitura ? null : (
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Registrar recebimento"
                            disabled={t.status === "Recebido"}
                            onClick={() =>
                              toast.success(`Recebimento de ${t.documento} registrado`, {
                                description: `${brl(t.valor)} baixados na conta corrente principal.`,
                              })
                            }
                            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-secondary/10 hover:text-secondary disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              check_circle
                            </span>
                          </button>
                          {has("notificacoes_push") ? (
                            <button
                              type="button"
                              title="Enviar cobrança por push"
                              disabled={t.status !== "Em atraso"}
                              onClick={() =>
                                toast.info(`Cobrança enviada a ${t.cliente}`, {
                                  description: "Notificação push + e-mail disparados (PV5).",
                                })
                              }
                              className="rounded p-1 text-on-surface-variant transition-colors hover:bg-primary-fixed hover:text-primary disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                notifications_active
                              </span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {lista.length === 0 ? (
                <tr>
                  <td
                    colSpan={leitura ? 6 : 7}
                    className="p-8 text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    Nenhum título encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low p-3 font-body-sm text-body-sm text-on-surface-variant">
          <span>
            Mostrando {lista.length} de {titulosReceber.length} títulos
          </span>
          <div className="flex items-center gap-6">
            <span className="flex flex-col text-right">
              <span className="text-[11px] uppercase tracking-wider">Em atraso</span>
              <span className="font-data-mono font-bold text-error">{brl(totalAtraso)}</span>
            </span>
            <span className="hidden h-8 w-px bg-outline-variant sm:block" />
            <span className="flex flex-col text-right">
              <span className="text-[11px] uppercase tracking-wider">Total da visão</span>
              <span className="font-data-mono text-body-lg font-bold text-primary">
                {brl(totalCarteira)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
