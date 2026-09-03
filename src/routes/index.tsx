import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarX2,
  FileCheck2,
  Landmark,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useDados } from "@/components/app/DadosContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, centrosDeCusto, consolidado, dashboardPorEmpresa } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard financeiro — FinCore" },
      {
        name: "description",
        content:
          "Painel multiempresa do FinCore com contas a pagar, a receber, saldo e fluxo de caixa.",
      },
      { property: "og:title", content: "Dashboard financeiro — FinCore" },
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
        descricao={`Competência junho/2026 · ${nomeAtual} · perfil de produto ${config.perfilProduto}`}
        variabilidade={[
          {
            o_que:
              "A visão consolidada do grupo só é oferecida quando o tenant contrata multiempresa.",
            por: "feature multiempresa",
            pv: "PV7",
          },
          {
            o_que:
              "O bloco de inadimplência por centro de custo aparece só com centro de custo ativo.",
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
              <Button asChild className="gap-1.5">
                <Link to="/contas-a-pagar">
                  <Plus className="size-4" /> Novo lançamento
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/relatorios">Exportar</Link>
              </Button>
            </>
          )
        }
        selo={
          isConsolidado && has("multiempresa") ? (
            <StatusBadge tone="info">Visão consolidada do grupo</StatusBadge>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          rotulo="Saldo consolidado"
          icone={Landmark}
          valor={brl(dados.saldo)}
          {...(dados.saldo < 0 ? { corValor: "text-destructive" } : {})}
          rodape="Posição em 30/06/2026"
        />
        <KpiCard
          rotulo="Contas a pagar (mês)"
          icone={ArrowDownRight}
          corIcone="text-destructive"
          valor={brl(dados.aPagar)}
          rodape={`${atrasados.length} título(s) em atraso · ${brl(totalAtrasado)}`}
        />
        <KpiCard
          rotulo="Contas a receber (mês)"
          icone={ArrowUpRight}
          corIcone="text-success"
          valor={brl(dados.aReceber)}
          rodape="Competência junho/2026"
        />
        {has("alcada") ? (
          <KpiCard
            rotulo="Aguardando aprovação"
            icone={FileCheck2}
            corIcone="text-primary"
            valor={brl(totalAprovacao)}
            rodape={`${emAprovacao.length} título(s) acima da alçada`}
          />
        ) : (
          <KpiCard
            rotulo="Inadimplência"
            icone={AlertTriangle}
            corIcone="text-warning-foreground"
            valor={`${dados.inadimplencia}%`}
            destaque={
              <StatusBadge tone="danger">
                <TrendingUp className="size-3" /> +0,5%
              </StatusBadge>
            }
            rodape="Variação sobre maio/2026"
          />
        )}
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-5">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fluxo de caixa — últimos 3 meses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dados.fluxo.map((f) => (
              <div key={f.mes}>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{f.mes}/2026</span>
                  <span className="num">
                    {brl(f.entradas)} · {brl(f.saidas)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-success"
                      style={{ width: `${(f.entradas / maior) * 100}%` }}
                    />
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-warning"
                      style={{ width: `${(f.saidas / maior) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {has("centro_custo") ? (
              <div className="border-t border-border pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Inadimplência por centro de custo
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {porCentro.map((c) => (
                    <div key={c.id} className="rounded-lg border border-border p-2.5">
                      <p className="num text-xs text-muted-foreground">{c.codigo}</p>
                      <p className="truncate text-sm">{c.descricao}</p>
                      <p className="num mt-0.5 font-bold text-destructive">{c.inadimplente}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Avisos importantes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/contas-a-pagar"
                className="flex flex-col gap-1 rounded-lg border-l-4 border-destructive bg-destructive/8 p-3 transition-colors hover:bg-destructive/12"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  Vencimentos em atraso
                  <CalendarX2 className="size-4 shrink-0 text-destructive" />
                </span>
                <span className="text-xs text-muted-foreground">
                  {atrasados.length} conta(s) a pagar já venceram
                </span>
                <span className="num mt-1 font-bold text-destructive">{brl(totalAtrasado)}</span>
              </Link>

              {has("alcada") ? (
                <Link
                  to="/aprovacoes"
                  className="flex flex-col gap-1 rounded-lg border-l-4 border-primary bg-primary/8 p-3 transition-colors hover:bg-primary/12"
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    Aprovação pendente
                    <FileCheck2 className="size-4 shrink-0 text-primary" />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {emAprovacao.length} pagamento(s) aguardando aprovação
                  </span>
                  <span className="num mt-1 font-bold text-primary">{brl(totalAprovacao)}</span>
                </Link>
              ) : (
                <div className="flex flex-col gap-1 rounded-lg border-l-4 border-border bg-muted/50 p-3">
                  <span className="text-sm font-semibold">Aprovação por alçada desativada</span>
                  <span className="text-xs text-muted-foreground">
                    Todo título lançado entra direto como “Em aberto”.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Próximos vencimentos</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proximos.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.fornecedor}</TableCell>
                      <TableCell className="num text-sm text-muted-foreground">
                        {t.documento}
                      </TableCell>
                      <TableCell className="num text-sm">{t.vencimento}</TableCell>
                      <TableCell className="num text-right">{brl(t.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
