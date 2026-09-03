import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useDados } from "@/components/app/DadosContext";
import { brl, centrosDeCusto, consolidado, dashboardPorEmpresa } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard financeiro — FinCore ERP" },
      {
        name: "description",
        content:
          "Visão geral do fluxo de caixa, saldo consolidado, contas a pagar e a receber da sua empresa.",
      },
      { property: "og:title", content: "Dashboard financeiro — FinCore ERP" },
      {
        property: "og:description",
        content: "Acompanhe o caixa de cada empresa do grupo ou a visão consolidada.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { consolidado: isConsolidado, empresaId, nomeAtual } = useEmpresa();
  const { has, config } = useFeatures();
  const { leitura } = usePerfil();
  const { titulos } = useDados();

  const dados =
    isConsolidado && has("multiempresa")
      ? consolidado()
      : (dashboardPorEmpresa[empresaId] ?? dashboardPorEmpresa["emp-1"]!);

  const maior = Math.max(...dados.fluxo.map((f) => Math.max(f.entradas, f.saidas)));

  const proximos = titulos
    .filter((t) => t.status !== "Pago" && t.status !== "Cancelado")
    .slice(0, 6);

  const emAprovacao = titulos.filter((t) => t.status === "Aprovação pendente");
  const totalAprovacao = emAprovacao.reduce((s, t) => s + t.valor, 0);
  const atrasados = titulos.filter((t) => t.status === "Atrasado");
  const totalAtrasado = atrasados.reduce((s, t) => s + t.valor, 0);

  // Inadimplência por centro de custo — só existe com a feature centro_custo.
  const porCentro = centrosDeCusto.map((c) => ({
    ...c,
    inadimplente: +(dados.inadimplencia * (c.rateio / 25)).toFixed(1),
  }));

  return (
    <>
      <PageHeader
        titulo="Dashboard"
        descricao={`Competência junho/2026 · ${nomeAtual} · Perfil de produto ${config.perfilProduto}`}
        variabilidade={[
          {
            o_que:
              "A visão consolidada do grupo só é oferecida quando o tenant contrata multiempresa.",
            por: "feature multiempresa",
            pv: "PV7",
          },
          {
            o_que:
              "O card de inadimplência por centro de custo aparece só com centro de custo ativo.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "O card de aprovações pendentes some quando não há alçada configurada.",
            por: "feature alcada",
            pv: "PV3",
          },
          {
            o_que: "Botões de novo lançamento ficam ocultos no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          leitura ? null : (
            <>
              <Link
                to="/contas-a-pagar"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Novo lançamento
              </Link>
              <Link
                to="/relatorios"
                className="hidden items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container sm:flex"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Exportar
              </Link>
            </>
          )
        }
        selo={
          isConsolidado && has("multiempresa") ? (
            <StatusBadge tone="info">Visão consolidada</StatusBadge>
          ) : null
        }
      />

      {/* KPIs */}
      <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          rotulo="Saldo consolidado"
          icone="account_balance"
          valor={brl(dados.saldo)}
          corValor={dados.saldo >= 0 ? "text-primary" : "text-error"}
          rodape="Posição em 30/06/2026"
        />
        <KpiCard
          rotulo="A pagar (mês)"
          icone="money_off"
          corIcone="text-error"
          valor={brl(dados.aPagar)}
          rodape={`${atrasados.length} título(s) em atraso · ${brl(totalAtrasado)}`}
        />
        <KpiCard
          rotulo="A receber (mês)"
          icone="attach_money"
          corIcone="text-secondary"
          valor={brl(dados.aReceber)}
          rodape="Competência junho/2026"
        />
        {has("alcada") ? (
          <KpiCard
            rotulo="Aguardando aprovação"
            icone="fact_check"
            corIcone="text-secondary"
            valor={brl(totalAprovacao)}
            rodape={`${emAprovacao.length} título(s) acima da alçada`}
          />
        ) : (
          <KpiCard
            rotulo="Inadimplência"
            icone="warning"
            valor={`${dados.inadimplencia}%`}
            destaque={
              <StatusBadge tone="erro">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +0,5%
              </StatusBadge>
            }
            rodape="Variação sobre maio/2026"
          />
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-lg lg:grid-cols-3">
        {/* Fluxo de caixa */}
        <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              Fluxo de caixa (realizado)
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

          <div className="flex flex-col gap-4">
            {dados.fluxo.map((f) => (
              <div key={f.mes}>
                <div className="mb-1.5 flex items-center justify-between font-body-sm text-body-sm">
                  <span className="font-label-md text-label-md text-on-surface">{f.mes}/2026</span>
                  <span className="font-data-mono text-on-surface-variant">
                    {brl(f.entradas)} <span className="text-outline">·</span>{" "}
                    <span className="text-error">{brl(f.saidas)}</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 rounded-full bg-surface-variant">
                    <div
                      className="h-2.5 rounded-full bg-secondary"
                      style={{ width: `${(f.entradas / maior) * 100}%` }}
                    />
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-variant">
                    <div
                      className="h-2.5 rounded-full bg-error"
                      style={{ width: `${(f.saidas / maior) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {has("centro_custo") ? (
            <div className="mt-lg border-t border-outline-variant pt-md">
              <h4 className="mb-3 flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                Inadimplência por centro de custo
              </h4>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {porCentro.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-outline-variant bg-surface p-3"
                  >
                    <p className="font-data-mono text-body-sm text-on-surface-variant">
                      {c.codigo}
                    </p>
                    <p className="truncate font-body-md text-body-md text-on-surface">
                      {c.descricao}
                    </p>
                    <p className="mt-1 font-data-mono text-body-lg font-medium text-error">
                      {c.inadimplente}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Avisos + próximos vencimentos */}
        <div className="flex flex-col gap-lg">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-headline-sm text-headline-sm text-primary">
              <span className="material-symbols-outlined text-on-surface-variant">
                notifications_active
              </span>
              Avisos importantes
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/contas-a-pagar"
                className="flex flex-col gap-1 rounded-r-lg border-l-4 border-error bg-error-container/20 p-3 transition-colors hover:bg-error-container/30"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-label-md text-label-md text-on-surface">
                    Vencimentos em atraso
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-error">
                    event_busy
                  </span>
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {atrasados.length} conta(s) a pagar já venceram
                </span>
                <span className="mt-1 font-data-mono text-body-lg font-medium text-error">
                  {brl(totalAtrasado)}
                </span>
              </Link>

              {has("alcada") ? (
                <Link
                  to="/aprovacoes"
                  className="flex flex-col gap-1 rounded-r-lg border-l-4 border-secondary bg-secondary-container/20 p-3 transition-colors hover:bg-secondary-container/30"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-label-md text-label-md text-on-surface">
                      Aprovação pendente
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      fact_check
                    </span>
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {emAprovacao.length} pagamento(s) aguardando aprovação
                  </span>
                  <span className="mt-1 font-data-mono text-body-lg font-medium text-primary">
                    {brl(totalAprovacao)}
                  </span>
                </Link>
              ) : (
                <div className="flex flex-col gap-1 rounded-r-lg border-l-4 border-outline-variant bg-surface-container p-3">
                  <span className="font-label-md text-label-md text-on-surface">
                    Aprovação por alçada desativada
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Todo título lançado entra direto como “Em aberto”.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
              Próximos vencimentos
            </h3>
            <ul className="divide-y divide-outline-variant">
              {proximos.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-md py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate font-body-md text-body-md text-primary">
                      {t.fornecedor}
                    </span>
                    <span className="block font-data-mono text-body-sm text-on-surface-variant">
                      {t.documento} · {t.vencimento}
                    </span>
                  </span>
                  <span className="shrink-0 font-data-mono text-data-mono text-on-surface">
                    {brl(t.valor)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
