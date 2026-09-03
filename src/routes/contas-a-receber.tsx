import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  History,
  OctagonAlert,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, tomDoStatus, type Tone } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { useFeatures } from "@/components/app/FeaturesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, faixasAging, titulosReceber } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contas-a-receber")({
  head: () => ({
    meta: [
      { title: "Contas a receber — FinCore" },
      {
        name: "description",
        content: "Análise de inadimplência com aging de carteira e detalhamento por cliente.",
      },
      { property: "og:title", content: "Contas a receber — FinCore" },
      {
        property: "og:description",
        content: "Contas a receber detalhadas por período de atraso.",
      },
    ],
  }),
  component: ContasAReceber,
});

const tomFaixa: Record<string, Tone> = {
  ok: "success",
  atencao: "warning",
  erro: "danger",
  critico: "danger",
};

const iconeFaixa: Record<string, typeof CalendarClock> = {
  ok: CalendarClock,
  atencao: TriangleAlert,
  erro: History,
  critico: OctagonAlert,
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
        return { ...f, total: itens.reduce((s, t) => s + t.valor, 0), qtd: itens.length };
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

  return (
    <>
      <PageHeader
        titulo="Contas a receber"
        descricao="Análise de inadimplência — contas a receber detalhadas por período de atraso."
        variabilidade={[
          {
            o_que:
              "Clicar num bloco de aging filtra a tabela; é o mesmo dado do KPI de inadimplência do dashboard.",
            por: "núcleo",
            pv: "núcleo",
          },
          {
            o_que: "A ação de registrar recebimento fica oculta no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
          {
            o_que: "A cobrança por push só é oferecida quando a feature está ativa.",
            por: "feature notificacoes_push",
            pv: "PV5",
          },
        ]}
        acoes={leitura ? <StatusBadge tone="info">Somente leitura</StatusBadge> : null}
      />

      {/* Aging */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {agregado.map((f) => {
          const ativo = faixa === f.id;
          const critico = f.tom === "critico";
          const Icone = iconeFaixa[f.tom] ?? CalendarClock;
          return (
            <button key={f.id} type="button" onClick={() => setFaixa(ativo ? null : f.id)}>
              <Card
                className={cn(
                  "h-full text-left shadow-card transition-all",
                  ativo && "ring-2 ring-primary",
                  critico && "border-destructive/40 bg-destructive/5",
                )}
              >
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        critico ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {f.rotulo}
                    </p>
                    <Icone
                      className={cn(
                        "size-4 shrink-0",
                        critico ? "text-destructive" : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <p className={cn("num text-xl font-bold", critico && "text-destructive")}>
                    {brl(f.total)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      critico ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {f.qtd} título{f.qtd === 1 ? "" : "s"}
                    {critico && f.qtd > 0 ? " críticos" : ""}
                  </p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          {/* Filtros */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Filtros:</span>
              {faixa ? (
                <button
                  type="button"
                  onClick={() => setFaixa(null)}
                  className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  Aging: {faixasAging.find((f) => f.id === faixa)?.rotulo}
                  <X className="size-3" />
                </button>
              ) : null}
              {(["A vencer", "Em atraso", "Recebido"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(status === s ? null : s)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    status === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar documento ou cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[46rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Vencimento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="w-32">Documento</TableHead>
                  <TableHead className="hidden w-40 lg:table-cell">Categoria</TableHead>
                  <TableHead className="w-32 text-right">Valor</TableHead>
                  <TableHead className="w-36 text-center">Aging</TableHead>
                  {leitura ? null : <TableHead className="w-24 text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((t) => {
                  const critico = t.atraso > 90;
                  const atrasado = t.status === "Em atraso";
                  return (
                    <TableRow key={t.id} className={cn(critico && "bg-destructive/5")}>
                      <TableCell
                        className={cn(
                          "num whitespace-nowrap",
                          atrasado && "font-medium text-destructive",
                        )}
                      >
                        {t.vencimento}
                      </TableCell>
                      <TableCell className={cn("font-medium", critico && "text-destructive")}>
                        {t.cliente}
                      </TableCell>
                      <TableCell className="num text-sm text-muted-foreground">
                        {t.documento}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {t.categoria}
                      </TableCell>
                      <TableCell
                        className={cn("num text-right font-medium", critico && "text-destructive")}
                      >
                        {brl(t.valor)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge tone={critico ? "danger" : tomDoStatus(t.status)}>
                          {t.status === "Recebido"
                            ? "Recebido"
                            : t.atraso > 0
                              ? `${t.atraso} dias atraso`
                              : "A vencer"}
                        </StatusBadge>
                      </TableCell>
                      {leitura ? null : (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Registrar recebimento"
                              disabled={t.status === "Recebido"}
                              className="hover:text-success"
                              onClick={() =>
                                toast.success(`Recebimento de ${t.documento} registrado`, {
                                  description: `${brl(t.valor)} baixados na conta corrente principal.`,
                                })
                              }
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                            {has("notificacoes_push") ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Enviar cobrança por push"
                                disabled={t.status !== "Em atraso"}
                                onClick={() =>
                                  toast.info(`Cobrança enviada a ${t.cliente}`, {
                                    description: "Notificação push + e-mail disparados (PV5).",
                                  })
                                }
                              >
                                <BellRing className="size-4" />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {lista.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={leitura ? 6 : 7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Nenhum título encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              Mostrando {lista.length} de {titulosReceber.length} títulos
            </span>
            <div className="flex items-center gap-5">
              <span className="flex flex-col text-right">
                <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
                  Em atraso
                </span>
                <span className="num font-bold text-destructive">{brl(totalAtraso)}</span>
              </span>
              <span className="flex flex-col text-right">
                <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
                  Total da visão
                </span>
                <span className="num text-lg font-bold">{brl(totalCarteira)}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
