import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { brl, consolidado, dashboardPorEmpresa, titulosAPagar } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const dados = isConsolidado ? consolidado() : dashboardPorEmpresa[empresaId]!;
  const maior = Math.max(...dados.fluxo.map((f) => Math.max(f.entradas, f.saidas)));

  const cards = [
    { label: "Contas a pagar (mês)", valor: brl(dados.aPagar), tone: "warning" as const },
    { label: "Contas a receber (mês)", valor: brl(dados.aReceber), tone: "info" as const },
    {
      label: "Saldo consolidado",
      valor: brl(dados.saldo),
      tone: dados.saldo >= 0 ? ("success" as const) : ("danger" as const),
    },
    { label: "Inadimplência", valor: `${dados.inadimplencia}%`, tone: "neutral" as const },
  ];

  return (
    <>
      <PageHeader
        titulo="Dashboard"
        descricao={`Competência junho/2026 · ${nomeAtual}`}
        acoes={
          isConsolidado ? <StatusBadge tone="info">Visão consolidada do grupo</StatusBadge> : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="shadow-card">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <p className="num mt-2 text-2xl font-bold">{c.valor}</p>
              <StatusBadge tone={c.tone} className="mt-3">
                jun/2026
              </StatusBadge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
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
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Próximos vencimentos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {titulosAPagar.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.fornecedor}</TableCell>
                    <TableCell className="num text-sm">{t.vencimento}</TableCell>
                    <TableCell className="num text-right">{brl(t.valor)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
