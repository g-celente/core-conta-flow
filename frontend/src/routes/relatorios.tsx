import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  Building2,
  Check,
  Download,
  Landmark,
  Loader2,
  Lock,
  PieChart,
  Receipt,
  TrendingDown,
  LineChart,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, dre, fluxoProjetado, relatorios } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios e exportação — FinCore" },
      {
        name: "description",
        content: "Fluxo de caixa projetado, DRE gerencial e exportação de relatórios consolidados.",
      },
      { property: "og:title", content: "Relatórios e exportação — FinCore" },
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

const ICONES: Record<string, typeof BarChart3> = {
  waterfall_chart: LineChart,
  stacked_bar_chart: BarChart3,
  pie_chart: PieChart,
  trending_down: TrendingDown,
  receipt_long: Receipt,
  domain: Building2,
  account_balance: Landmark,
};

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

      <div className="mb-6 flex border-b border-border">
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
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6",
              aba === t.id
                ? "border-primary font-semibold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === "catalogo" ? (
        <div className="grid items-start gap-4 xl:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2">
            {disponiveis.map((r) => {
              const ativo = selecionados.includes(r.id);
              const Icone = ICONES[r.icone] ?? BarChart3;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => alternar(r.id)}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      "h-full shadow-card transition-all",
                      ativo ? "border-primary ring-1 ring-primary" : "hover:border-primary/40",
                    )}
                  >
                    <CardContent className="relative flex h-full flex-col gap-2 pt-6">
                      <span
                        className={cn(
                          "absolute right-4 top-4 grid size-5 place-items-center rounded border-2 transition-colors",
                          ativo ? "border-primary bg-primary" : "border-border",
                        )}
                      >
                        {ativo ? (
                          <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                        ) : null}
                      </span>

                      <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                        <Icone className="size-5" />
                      </span>

                      <span className="block pr-8 text-sm font-semibold">{r.nome}</span>
                      <span className="block text-xs text-muted-foreground">{r.descricao}</span>

                      <span className="mt-auto pt-2">
                        <StatusBadge tone={r.requer ? "info" : "neutral"}>
                          {r.requer ? `requer ${r.requer}` : "núcleo"}
                        </StatusBadge>
                      </span>
                    </CardContent>
                  </Card>
                </button>
              );
            })}

            {relatorios
              .filter((r) => r.requer && !has(r.requer))
              .map((r) => (
                <Card key={r.id} className="border-dashed opacity-60">
                  <CardContent className="flex h-full flex-col gap-2 pt-6">
                    <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <Lock className="size-5" />
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">{r.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      Não contratado neste tenant — depende da feature{" "}
                      <code className="num">{r.requer}</code>.
                    </span>
                  </CardContent>
                </Card>
              ))}
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Configurar exportação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="r-per">Período de referência</Label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger id="r-per">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODOS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Formato de arquivo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMATOS.map((f) => (
                    <Button
                      key={f}
                      variant={formato === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormato(f)}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {has("portal_contador") ? (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={layoutContabil}
                    onChange={(e) => setLayoutContabil(e.target.checked)}
                    className="mt-0.5 size-4 rounded accent-[var(--primary)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">Arquivo para contabilidade</span>
                    <span className="block text-xs text-muted-foreground">
                      Inclui metadados de conciliação no padrão FEBRABAN e o plano de contas
                      correspondente.
                    </span>
                  </span>
                </label>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-dashed border-border p-3">
                  <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    O layout de exportação para contabilidade requer a feature{" "}
                    <code className="num">portal_contador</code> (PV4).
                  </span>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Escopo
                </p>
                <p className="mt-1 text-sm">
                  {consolidado && has("multiempresa")
                    ? "Todas as empresas do grupo (visão consolidada)"
                    : nomeAtual}
                </p>
                <p className="text-xs text-muted-foreground">
                  Perfil de produto {config.perfilProduto} · regime {config.regime}
                </p>
              </div>

              <Button
                className="w-full gap-1.5"
                disabled={selecionados.length === 0 || gerando}
                onClick={gerar}
              >
                {gerando ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Gerar {selecionados.length || ""} relatório{selecionados.length === 1 ? "" : "s"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {aba === "fluxo" ? (
        <Card className="shadow-card">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Fluxo de caixa projetado — 6 meses</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-success" /> Entradas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-destructive" /> Saídas
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fluxoProjetado.map((f) => {
              const saldo = f.entradas - f.saidas;
              return (
                <div key={f.mes}>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold">{f.mes}</span>
                    <span className="num text-muted-foreground">
                      {brl(f.entradas)} − <span className="text-destructive">{brl(f.saidas)}</span>{" "}
                      ={" "}
                      <span
                        className={cn(
                          "font-bold",
                          saldo >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {brl(saldo)}
                      </span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-success"
                        style={{ width: `${(f.entradas / maiorFluxo) * 100}%` }}
                      />
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-destructive"
                        style={{ width: `${(f.saidas / maiorFluxo) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                Projeção baseada em recorrências, parcelamentos e histórico de recebimento.
              </span>
              <span className="num font-bold">
                {brl(fluxoProjetado.reduce((s, f) => s + f.entradas - f.saidas, 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {aba === "dre" ? (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">DRE gerencial — junho/2026</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[32rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">% da receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dre.map((l) => {
                  const total = l.tipo === "total";
                  const subtotal = l.tipo === "subtotal";
                  const receita = dre[0]!.valor;
                  return (
                    <TableRow
                      key={l.conta}
                      className={cn(total && "bg-success/8", subtotal && "bg-muted/50")}
                    >
                      <TableCell className={cn((total || subtotal) && "font-bold")}>
                        {l.conta}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "num text-right",
                          l.valor < 0 && "text-destructive",
                          (total || subtotal) && l.valor >= 0 && "font-bold text-success",
                        )}
                      >
                        {brl(l.valor)}
                      </TableCell>
                      <TableCell className="num hidden text-right text-xs text-muted-foreground sm:table-cell">
                        {((Math.abs(l.valor) / receita) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
              Margem líquida de{" "}
              <strong className="num text-success">
                {((dre[8]!.valor / dre[0]!.valor) * 100).toFixed(1)}%
              </strong>{" "}
              no período. Estrutura de contas conforme regime {config.regime} (PV1).
            </p>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
